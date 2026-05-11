import { Curve, MathUtils, PerspectiveCamera, Spherical, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { CameraId } from "../../constants/experiences/CameraId";
import { DebugGuiTitle } from "../../constants/experiences/DebugGuiTitle";
import { THREE_WORLD_CONFIG } from "../../constants/experiences/ThreeWorldConfig";
import DebugManager from "../../managers/DebugManager";
import { MediapipeHandsSnapshot } from "../../managers/MediapipeManager";
import TimelineExperienceManager from "../../managers/TimelineExperienceManager";
import { ThreeCameraOptions, ThreeCameraType } from "../../types/cameraTypes";
import ThreeCameraControllerBase from "./bases/ThreeCameraControllerBase";

interface PathPlayback {
    duration: number;
    elapsed: number;
    onComplete?: () => void;
}

interface PathState {
    curve: Curve<Vector3>;
    t: number;
    playback?: PathPlayback;
    // When set, the look-at target is blended from the curve look-ahead toward
    // this point over the last segment of the path — avoids the look-ahead
    // collapsing onto the current position as t → 1 (which causes a snap).
    fallbackLookAt?: Vector3;
}

interface IdleTransitionState {
    duration: number;
    elapsed: number;
    fromPos: Vector3;
    fromLookAt: Vector3;
    onComplete?: () => void;
}

export default class MainThreeCameraController extends ThreeCameraControllerBase<OrbitControls> {

    private static _MAIN_CAMERA_OPTIONS: ThreeCameraOptions = {
        type: ThreeCameraType.PERSPECTIVE,
        fov: THREE_WORLD_CONFIG.camera.fov,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 100,
    };

    private static readonly _ROTATE_SPEED: number = 6;
    private static readonly _DAMPING: number = 10;
    private static readonly _DEFAULT_FRICTION: number = 3;
    private static readonly _VELOCITY_SMOOTHING: number = 0.4;
    private static readonly _IDLE_TRANSITION_DURATION_S: number = 5;
    // Forward sample distance on the curve (normalized arc length) used as the
    // raw look-at target. Larger = more anticipative, less reactive to local
    // curvature; smaller = follows the path more literally but jitters in tight turns.
    private static readonly _PATH_LOOK_AHEAD: number = 0.015;
    // Critical-damping rate (1/s) for the look-at filter. Higher = snappier,
    // lower = smoother but with more lag behind the curve.
    private static readonly _PATH_LOOKAT_DAMPING: number = 4;
    // Fraction of t over which the look-at blends from the curve toward the
    // optional fallback target at the end of the run.
    private static readonly _PATH_FALLBACK_BLEND_RANGE: number = 0.08;

    private readonly _target: Vector3 = new Vector3(...THREE_WORLD_CONFIG.camera.target);
    private readonly _spherical: Spherical = new Spherical();
    private readonly _sphericalTarget: Spherical = new Spherical();
    private readonly _tmpPos: Vector3 = new Vector3();
    private readonly _tmpToPos: Vector3 = new Vector3();
    private readonly _tmpLookAheadPos: Vector3 = new Vector3();
    private readonly _tmpLookAt: Vector3 = new Vector3();
    private readonly _pathLookAt: Vector3 = new Vector3();

    private _friction: number = MainThreeCameraController._DEFAULT_FRICTION;
    private _previousFistX: number | null = null;
    private _previousEventTime: number = 0;
    private _angularVelocity: number = 0;
    private _pathState: PathState | null = null;
    private _idleTransition: IdleTransitionState | null = null;

    constructor() {
        super(CameraId.THREE_MAIN, MainThreeCameraController._MAIN_CAMERA_OPTIONS);

        this._sphericalTarget.set(
            THREE_WORLD_CONFIG.camera.radius,
            MathUtils.degToRad(THREE_WORLD_CONFIG.camera.phiDeg),
            MathUtils.degToRad(THREE_WORLD_CONFIG.camera.thetaDeg)
        );
        this._spherical.copy(this._sphericalTarget);
        this._container.position.setFromSpherical(this._spherical).add(this._target);

        TimelineExperienceManager.onEnterInteract1.add(this._onEnterInteract1);
        TimelineExperienceManager.onLeaveInteract1.add(this._onLeaveInteract1);

        if (DebugManager.isActive) this._setupDebugGui();
    }

    public get sphericalTheta(): number {
        return this._spherical.theta;
    }

    private _onEnterInteract1 = (): void => {
        window.addEventListener('hand:update', this._onHandUpdate);
    }

    private _onLeaveInteract1 = (): void => {
        window.removeEventListener('hand:update', this._onHandUpdate);
    }

    private _onHandUpdate = (e: CustomEvent<MediapipeHandsSnapshot>): void => {
        const leftHand = e.detail.left;
        const fist = leftHand?.isFist ? leftHand.fist : undefined;

        // Fist released: keep _angularVelocity so the camera glides on,
        // friction in update() will bring it to rest.
        if (!fist) {
            this._previousFistX = null;
            return;
        }

        const now = performance.now();

        // First frame of a new gesture: anchor the position/time and kill any
        // residual inertia so a re-grab feels like a fresh handle, not a throw.
        if (this._previousFistX === null) {
            this._previousFistX = fist.x;
            this._previousEventTime = now;
            this._angularVelocity = 0;
            return;
        }

        const eventDt = (now - this._previousEventTime) / 1000;
        if (eventDt > 0) {
            const dx = fist.x - this._previousFistX;
            const instantVelocity = -dx * MainThreeCameraController._ROTATE_SPEED / eventDt;
            // EMA on raw velocity: smooths MediaPipe jitter so the value at
            // release reflects the gesture, not the last hand twitch.
            this._angularVelocity = MathUtils.lerp(
                this._angularVelocity,
                instantVelocity,
                MainThreeCameraController._VELOCITY_SMOOTHING
            );
        }

        this._previousFistX = fist.x;
        this._previousEventTime = now;
    };

    public override update(dt: number): void {
        super.update(dt);

        if (this._pathState) {
            this._updatePathState(dt);
            return;
        }


        if (this._idleTransition) {
            this._updateIdleTransition(dt);
            return;
        }

        this._integrateInertia(dt);
        this._smoothSphericalTowardTarget(dt);
        this._applySphericalToCamera();
    }

    public anchorOnPath(curve: Curve<Vector3>, t: number = 0): void {
        this._resetHandInputState();
        this._idleTransition = null;
        this._pathState = { curve, t: MathUtils.clamp(t, 0, 1) };
        this._primePathLookAt();
        this._applyPathStateToCamera(0);
    }

    public playPath(
        curve: Curve<Vector3>,
        duration: number,
        onComplete?: () => void,
        fallbackLookAt?: Vector3,
    ): void {
        if (duration <= 0) throw new Error('MainThreeCameraController.playPath: duration must be > 0');
        this._resetHandInputState();
        this._idleTransition = null;
        this._pathState = {
            curve,
            t: 0,
            playback: { duration, elapsed: 0, onComplete },
            fallbackLookAt: fallbackLookAt?.clone(),
        };
        this._primePathLookAt();
    }

    // Seed the damped look-at with the first frame's target so the camera does
    // not snap from a stale orientation when path mode starts.
    private _primePathLookAt(): void {
        const state = this._pathState!;
        this._computeRawPathLookAt(state, this._tmpLookAheadPos);
        this._pathLookAt.copy(this._tmpLookAheadPos);
    }

    // Raw, un-damped look-at target for the current t: curve look-ahead point,
    // blended toward the fallback target on the final segment if one is set.
    // Writes into `out` and returns it.
    private _computeRawPathLookAt(state: PathState, out: Vector3): Vector3 {
        const lookT = Math.min(state.t + MainThreeCameraController._PATH_LOOK_AHEAD, 1);
        state.curve.getPointAt(lookT, out);

        const fallback = state.fallbackLookAt;
        if (fallback) {
            const start = 1 - MainThreeCameraController._PATH_FALLBACK_BLEND_RANGE;
            const k = MathUtils.smoothstep(state.t, start, 1);
            if (k > 0) out.lerp(fallback, k);
        }
        return out;
    }

    private _resetHandInputState(): void {
        // Drop residual hand inertia so resuming free mode after the path
        // doesn't carry a phantom velocity from before the ride.
        this._angularVelocity = 0;
        this._previousFistX = null;
    }

    private _updatePathState(dt: number): void {
        const state = this._pathState!;
        if (state.playback) {
            state.playback.elapsed += dt;
            state.t = Math.min(state.playback.elapsed / state.playback.duration, 1);
        }

        this._applyPathStateToCamera(dt);

        if (state.playback && state.t >= 1) this._endPathPlayback();
    }

    private _applyPathStateToCamera(dt: number): void {
        const state = this._pathState!;
        state.curve.getPointAt(state.t, this._tmpPos);
        this._container.position.copy(this._tmpPos);

        // Look-ahead point on the curve averages local curvature, giving a far
        // smoother look-at than the raw tangent at sharp turns. Near the end
        // of the run, the look-ahead collapses onto the position; the fallback
        // blend preserves a stable target.
        this._computeRawPathLookAt(state, this._tmpLookAheadPos);

        if (dt > 0) {
            const damping = MainThreeCameraController._PATH_LOOKAT_DAMPING;
            this._pathLookAt.x = MathUtils.damp(this._pathLookAt.x, this._tmpLookAheadPos.x, damping, dt);
            this._pathLookAt.y = MathUtils.damp(this._pathLookAt.y, this._tmpLookAheadPos.y, damping, dt);
            this._pathLookAt.z = MathUtils.damp(this._pathLookAt.z, this._tmpLookAheadPos.z, damping, dt);
        } else {
            this._pathLookAt.copy(this._tmpLookAheadPos);
        }

        // Mirror into _tmpLookAt so _endPathPlayback hands off the actual
        // (damped) orientation to the idle transition, not the raw curve target.
        this._tmpLookAt.copy(this._pathLookAt);
        this._camera.lookAt(this._pathLookAt);
    }

    private _endPathPlayback(): void {
        // Hand off to a bounded lerp transition: smooths both position and
        // lookAt from the path tangent pose to the spherical preset pose,
        // avoiding the orientation pop that would happen if we returned
        // straight to spherical mode.
        const onComplete = this._pathState!.playback?.onComplete;
        this._idleTransition = {
            duration: MainThreeCameraController._IDLE_TRANSITION_DURATION_S,
            elapsed: 0,
            fromPos: this._container.position.clone(),
            fromLookAt: this._tmpLookAt.clone(),
            onComplete,
        };
        this._pathState = null;
    }

    private _updateIdleTransition(dt: number): void {
        const transition = this._idleTransition!;
        transition.elapsed += dt;
        const u = Math.min(transition.elapsed / transition.duration, 1);
        const e = MathUtils.smootherstep(u, 0, 1);

        this._tmpToPos.setFromSpherical(this._sphericalTarget).add(this._target);
        this._container.position.lerpVectors(transition.fromPos, this._tmpToPos, e);

        this._tmpLookAt.lerpVectors(transition.fromLookAt, this._target, e);
        this._camera.lookAt(this._tmpLookAt);

        if (u >= 1) {
            // Spherical mode resumes already at preset → no further movement.
            this._spherical.copy(this._sphericalTarget);
            const onComplete = transition.onComplete;
            this._idleTransition = null;
            onComplete?.();
        }
    }

    private _integrateInertia(dt: number): void {
        this._sphericalTarget.theta += this._angularVelocity * dt;
        this._angularVelocity *= Math.exp(-this._friction * dt);
    }

    private _smoothSphericalTowardTarget(dt: number): void {
        const damping = MainThreeCameraController._DAMPING;
        this._spherical.theta = MathUtils.damp(this._spherical.theta, this._sphericalTarget.theta, damping, dt);
        this._spherical.phi = MathUtils.damp(this._spherical.phi, this._sphericalTarget.phi, damping, dt);
        this._spherical.radius = MathUtils.damp(this._spherical.radius, this._sphericalTarget.radius, damping, dt);
    }

    private _applySphericalToCamera(): void {
        this._tmpPos.setFromSpherical(this._spherical).add(this._target);
        this._container.position.copy(this._tmpPos);
        this._camera.lookAt(this._target);
    }

    private _savedSpherical: Spherical | null = null;

    public saveSpherical(): void {
        this._savedSpherical = this._spherical.clone();
    }

    public restoreSpherical(duration: number = 3): void {
        if (!this._savedSpherical) return;

        // Met à jour la cible sphérique vers la position sauvegardée
        this._sphericalTarget.copy(this._savedSpherical);

        // Lance la transition depuis la position actuelle
        this._idleTransition = {
            duration,
            elapsed: 0,
            fromPos: this._container.position.clone(),
            fromLookAt: this._target.clone(),
        };

        this._pathState = null;
    }

    private _setupDebugGui(): void {
        const folder = DebugManager.getGuiFolder(DebugGuiTitle.THREE_CAMERAS).addFolder('Main Camera');

        let fovCtrl: ReturnType<typeof folder.add> | undefined;
        if (this._camera instanceof PerspectiveCamera) {
            const perspective = this._camera;
            fovCtrl = folder
                .add(perspective, 'fov', 1, 179, 0.1)
                .name('fov')
                .onChange(() => {
                    perspective.updateProjectionMatrix();
                });
        }

        const sphericalProxy = {
            radius: this._sphericalTarget.radius,
            phiDeg: MathUtils.radToDeg(this._sphericalTarget.phi),
            thetaDeg: MathUtils.radToDeg(this._sphericalTarget.theta),
        };
        const applySpherical = (): void => {
            this._sphericalTarget.radius = MathUtils.clamp(
                sphericalProxy.radius,
                1,
                10
            );
            this._sphericalTarget.phi = MathUtils.degToRad(MathUtils.clamp(sphericalProxy.phiDeg, 0.01, 179.99));
            this._sphericalTarget.theta = MathUtils.degToRad(sphericalProxy.thetaDeg);
        };
        const positionFolder = folder.addFolder('Position');
        const radiusCtrl = positionFolder
            .add(sphericalProxy, 'radius', 1, 10, 0.001)
            .name('distance')
            .onChange(applySpherical);
        const phiCtrl = positionFolder
            .add(sphericalProxy, 'phiDeg', 0.01, 179.99, 0.1)
            .name('elevation (phi°)')
            .onChange(applySpherical);
        const thetaCtrl = positionFolder
            .add(sphericalProxy, 'thetaDeg', -180, 180, 0.1)
            .name('azimuth (theta°)')
            .onChange(applySpherical);

        const targetFolder = folder.addFolder('Target');
        const targetXCtrl = targetFolder.add(this._target, 'x', -10, 10, 0.01).name('x');
        const targetYCtrl = targetFolder.add(this._target, 'y', -10, 10, 0.01).name('y');
        const targetZCtrl = targetFolder.add(this._target, 'z', -10, 10, 0.01).name('z');

        const inertiaProxy = { friction: this._friction };
        const inertiaFolder = folder.addFolder('Inertia');
        inertiaFolder
            .add(inertiaProxy, 'friction', 0, 10, 0.1)
            .name('friction (1/s)')
            .onChange((v: number) => { this._friction = v; });

        DebugManager.registerConfigGetter('camera.fov', () => (
            this._camera instanceof PerspectiveCamera ? this._camera.fov : THREE_WORLD_CONFIG.camera.fov
        ));
        DebugManager.registerConfigGetter('camera.target', () => [this._target.x, this._target.y, this._target.z]);
        DebugManager.registerConfigGetter('camera.radius', () => this._sphericalTarget.radius);
        DebugManager.registerConfigGetter('camera.phiDeg', () => MathUtils.radToDeg(this._sphericalTarget.phi));
        DebugManager.registerConfigGetter('camera.thetaDeg', () => MathUtils.radToDeg(this._sphericalTarget.theta));

        if (fovCtrl) DebugManager.registerConfigSetter('camera.fov', (v) => fovCtrl!.setValue(v));
        DebugManager.registerConfigSetter('camera.target', (v) => {
            const [x, y, z] = v as [number, number, number];
            targetXCtrl.setValue(x);
            targetYCtrl.setValue(y);
            targetZCtrl.setValue(z);
        });
        DebugManager.registerConfigSetter('camera.radius', (v) => radiusCtrl.setValue(v));
        DebugManager.registerConfigSetter('camera.phiDeg', (v) => phiCtrl.setValue(v));
        DebugManager.registerConfigSetter('camera.thetaDeg', (v) => thetaCtrl.setValue(v));
    }

    //#region getter
    //
    public get rotateSpeed(): number {
        return MainThreeCameraController._ROTATE_SPEED;
    }
    //
    //#endregion
}

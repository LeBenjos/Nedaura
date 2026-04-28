import { MathUtils, PerspectiveCamera, Spherical, Vector3 } from 'three';
import { CameraId } from '../../constants/experiences/CameraId';
import { DebugGuiTitle } from '../../constants/experiences/DebugGuiTitle';
import { THREE_WORLD_CONFIG } from '../../constants/experiences/ThreeWorldConfig';
import DebugManager from '../../managers/DebugManager';
import { ThreeCameraType, type ThreeCameraOptions } from '../../types/cameraTypes';
import ThreeCameraControllerBase from './bases/ThreeCameraControllerBase';

export default class MainThreeCameraController extends ThreeCameraControllerBase {
    private static readonly _NEAR: number = 0.1;
    private static readonly _FAR: number = 100;

    private static _buildCameraOptions(): ThreeCameraOptions {
        return {
            type: ThreeCameraType.PERSPECTIVE,
            fov: THREE_WORLD_CONFIG.camera.fov,
            aspect: window.innerWidth / window.innerHeight,
            near: MainThreeCameraController._NEAR,
            far: MainThreeCameraController._FAR,
        };
    }

    private static readonly _MIN_RADIUS: number = 1;
    private static readonly _MAX_RADIUS: number = 10;

    private static readonly _ROTATE_SPEED: number = 6;
    private static readonly _DAMPING: number = 12;

    private readonly _target: Vector3 = new Vector3(...THREE_WORLD_CONFIG.camera.target);
    private readonly _spherical: Spherical = new Spherical();
    private readonly _sphericalTarget: Spherical = new Spherical();
    private readonly _tmpPos: Vector3 = new Vector3();

    private _lastX: number | null = null;

    constructor() {
        super(CameraId.THREE_MAIN, MainThreeCameraController._buildCameraOptions());

        this._sphericalTarget.set(
            THREE_WORLD_CONFIG.camera.radius,
            MathUtils.degToRad(THREE_WORLD_CONFIG.camera.phiDeg),
            MathUtils.degToRad(THREE_WORLD_CONFIG.camera.thetaDeg)
        );
        this._spherical.copy(this._sphericalTarget);
        this._container.position.setFromSpherical(this._spherical).add(this._target);

        // Camera movement Mediapipe
        window.addEventListener('hand:update', (e) => {
            const fist = e.detail.left?.fist;
            const isFist = e.detail.left?.isFist;
            if (!isFist || !fist) {
                this._lastX = null;
                return;
            }

            const x = fist.x;

            if (this._lastX === null) {
                this._lastX = x;
                return;
            }

            const dx = x - this._lastX;
            this._sphericalTarget.theta -= dx * MainThreeCameraController._ROTATE_SPEED;

            this._lastX = x;
        });

        if (DebugManager.isActive) this._setupDebugGui();
    }

    private _setupDebugGui(): void {
        const folder = DebugManager.getGuiFolder(DebugGuiTitle.THREE_CAMERAS).addFolder('Main Camera');

        let fovCtrl: ReturnType<typeof folder.add> | undefined;
        if (this._camera instanceof PerspectiveCamera) {
            const perspective = this._camera;
            fovCtrl = folder.add(perspective, 'fov', 1, 179, 0.1).name('fov').onChange(() => {
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
                MainThreeCameraController._MIN_RADIUS,
                MainThreeCameraController._MAX_RADIUS
            );
            this._sphericalTarget.phi = MathUtils.degToRad(MathUtils.clamp(sphericalProxy.phiDeg, 0.01, 179.99));
            this._sphericalTarget.theta = MathUtils.degToRad(sphericalProxy.thetaDeg);
        };
        const positionFolder = folder.addFolder('Position');
        const radiusCtrl = positionFolder
            .add(sphericalProxy, 'radius', MainThreeCameraController._MIN_RADIUS, MainThreeCameraController._MAX_RADIUS, 0.001)
            .name('distance')
            .onChange(applySpherical);
        const phiCtrl = positionFolder.add(sphericalProxy, 'phiDeg', 0.01, 179.99, 0.1).name('elevation (phi°)').onChange(applySpherical);
        const thetaCtrl = positionFolder.add(sphericalProxy, 'thetaDeg', -180, 180, 0.1).name('azimuth (theta°)').onChange(applySpherical);

        const targetFolder = folder.addFolder('Target');
        const targetXCtrl = targetFolder.add(this._target, 'x', -10, 10, 0.01).name('x');
        const targetYCtrl = targetFolder.add(this._target, 'y', -10, 10, 0.01).name('y');
        const targetZCtrl = targetFolder.add(this._target, 'z', -10, 10, 0.01).name('z');

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

    public override update(dt: number): void {
        super.update(dt);

        this._spherical.theta = MathUtils.damp(
            this._spherical.theta,
            this._sphericalTarget.theta,
            MainThreeCameraController._DAMPING,
            dt
        );
        this._spherical.phi = MathUtils.damp(
            this._spherical.phi,
            this._sphericalTarget.phi,
            MainThreeCameraController._DAMPING,
            dt
        );
        this._spherical.radius = MathUtils.damp(
            this._spherical.radius,
            this._sphericalTarget.radius,
            MainThreeCameraController._DAMPING,
            dt
        );

        this._tmpPos.setFromSpherical(this._spherical).add(this._target);
        this._container.position.copy(this._tmpPos);
        this._camera.lookAt(this._target);
    }
}

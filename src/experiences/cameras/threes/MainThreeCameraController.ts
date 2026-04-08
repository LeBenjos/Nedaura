import { MathUtils, Spherical, Vector3 } from 'three';
import { CameraId } from '../../constants/experiences/CameraId';
import { ThreeCameraType, type ThreeCameraOptions } from '../../types/cameraTypes';
import ThreeCameraControllerBase from './bases/ThreeCameraControllerBase';

export default class MainThreeCameraController extends ThreeCameraControllerBase {
    private static readonly _MAIN_CAMERA_OPTIONS: ThreeCameraOptions = {
        type: ThreeCameraType.PERSPECTIVE,
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1000,
    };
    private static readonly _DEFAULT_CONTAINER_POSITION: Vector3 = new Vector3(0, 1.5, 3);

    private static readonly _DEFAULT_TARGET: Vector3 = new Vector3(0, 1, 0);

    private static readonly _MAX_POLAR_ANGLE: number = Math.PI / 2;
    private static readonly _MIN_POLAR_ANGLE: number = Math.PI / 2;
    private static readonly _MIN_RADIUS: number = 1;
    private static readonly _MAX_RADIUS: number = 10;

    private static readonly _ROTATE_SPEED: number = 6;
    private static readonly _ZOOM_SPEED: number = 8;
    private static readonly _DAMPING: number = 12;

    private readonly _target: Vector3 = MainThreeCameraController._DEFAULT_TARGET.clone();
    private readonly _spherical: Spherical = new Spherical();
    private readonly _sphericalTarget: Spherical = new Spherical();
    private readonly _tmpPos: Vector3 = new Vector3();

    private _lastX: number | null = null;
    private _lastY: number | null = null;
    private _lastZ: number | null = null;

    constructor() {
        super(CameraId.THREE_MAIN, MainThreeCameraController._MAIN_CAMERA_OPTIONS);
        this._container.position.copy(MainThreeCameraController._DEFAULT_CONTAINER_POSITION);

        this._spherical.setFromVector3(this._container.position.clone().sub(this._target));
        this._sphericalTarget.copy(this._spherical);

        // Camera movement Mediapipe    
        window.addEventListener('hand:update', (e) => {
            const fist = e.detail.left?.fist;
            const isFist = e.detail.left?.isFist;
            if (!isFist || !fist) {
                this._lastX = null;
                this._lastY = null;
                this._lastZ = null;
                return;
            }

            const x = fist.x;
            const y = fist.y;
            const z = fist.z;

            if (this._lastX === null || this._lastY === null || this._lastZ === null) {
                this._lastX = x;
                this._lastY = y;
                this._lastZ = z;
                return;
            }

            if (this._lastX !== null && this._lastY !== null && this._lastZ !== null) {
                const dx = x - this._lastX;
                const dy = y - this._lastY;
                const dz = z - this._lastZ;

                this._sphericalTarget.theta -= dx * MainThreeCameraController._ROTATE_SPEED;
                this._sphericalTarget.phi += dy * MainThreeCameraController._ROTATE_SPEED;
                this._sphericalTarget.radius += dz * MainThreeCameraController._ZOOM_SPEED;

                this._sphericalTarget.phi = MathUtils.clamp(
                    this._sphericalTarget.phi,
                    MainThreeCameraController._MIN_POLAR_ANGLE,
                    MainThreeCameraController._MAX_POLAR_ANGLE
                );

                this._sphericalTarget.radius = MathUtils.clamp(
                    this._sphericalTarget.radius,
                    MainThreeCameraController._MIN_RADIUS,
                    MainThreeCameraController._MAX_RADIUS
                );
            }

            this._lastX = x;
            this._lastY = y;
            this._lastZ = z;
        });
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

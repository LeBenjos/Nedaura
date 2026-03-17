import { Vector3 } from 'three';
import { CameraId } from '../../constants/experiences/CameraId';
import { ThreeCameraOptions, ThreeCameraType } from '../../types/cameraTypes';
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

    constructor() {
        super(CameraId.THREE_MAIN, MainThreeCameraController._MAIN_CAMERA_OPTIONS);
        this._container.position.copy(MainThreeCameraController._DEFAULT_CONTAINER_POSITION);
    }

    public override update(dt: number): void {
        super.update(dt);
    }
}

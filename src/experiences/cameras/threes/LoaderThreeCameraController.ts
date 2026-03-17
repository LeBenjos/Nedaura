import { Vector3 } from 'three';
import { CameraId } from '../../constants/experiences/CameraId';
import LoaderThreeApp from '../../engines/threes/app/LoaderThreeApp';
import { ThreeCameraOptions, ThreeCameraType } from '../../types/cameraTypes';
import ThreeCameraControllerBase from './bases/ThreeCameraControllerBase';

export default class LoaderThreeCameraController extends ThreeCameraControllerBase {
    private static readonly _LOADER_CAMERA_OPTIONS: ThreeCameraOptions = {
        type: ThreeCameraType.PERSPECTIVE,
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1,
    };
    private static readonly _DEFAULT_CONTAINER_POSITION: Vector3 = new Vector3(0, 0, 0);

    constructor() {
        super(CameraId.THREE_LOADER, LoaderThreeCameraController._LOADER_CAMERA_OPTIONS, LoaderThreeApp.scene);
        this._container.position.copy(LoaderThreeCameraController._DEFAULT_CONTAINER_POSITION);
    }

    public override update(dt: number): void {
        super.update(dt);
    }
}

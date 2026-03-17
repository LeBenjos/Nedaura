import { DomResizeManager } from '@benjos/cookware';
import { Object3D, OrthographicCamera, PerspectiveCamera, Scene } from 'three';
import type { CameraId } from '../../../constants/experiences/CameraId';
import MainThreeApp from '../../../engines/threes/app/MainThreeApp';
import { ThreeCameraOptions, ThreeCameraType, ThreeControls } from '../../../types/cameraTypes';

export default abstract class ThreeCameraControllerBase<T extends ThreeControls = ThreeControls> extends Object3D {
    private static readonly _DEFAULT_CAMERA_OPTIONS: ThreeCameraOptions = {
        type: ThreeCameraType.PERSPECTIVE,
        fov: 75,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1000,
    };

    protected readonly _cameraId: CameraId;
    declare protected _camera: PerspectiveCamera | OrthographicCamera;
    declare protected _container: Object3D;
    declare protected _controls: T;

    constructor(
        cameraId: CameraId,
        cameraOptions: ThreeCameraOptions = ThreeCameraControllerBase._DEFAULT_CAMERA_OPTIONS,
        scene: Scene = MainThreeApp.scene
    ) {
        super();
        this._cameraId = cameraId;

        this._generateContainer();
        this._generateCamera(cameraOptions);

        scene.add(this);
    }

    private _generateContainer(): void {
        this._container = new Object3D();
        this.add(this._container);
    }

    private _generateCamera(cameraOptions: ThreeCameraOptions): void {
        if (cameraOptions.type === ThreeCameraType.PERSPECTIVE) {
            this._camera = new PerspectiveCamera(
                cameraOptions.fov,
                cameraOptions.aspect,
                cameraOptions.near,
                cameraOptions.far
            );
        } else {
            this._camera = new OrthographicCamera(
                cameraOptions.left,
                cameraOptions.right,
                cameraOptions.top,
                cameraOptions.bottom,
                cameraOptions.near,
                cameraOptions.far
            );
        }
        this._container.add(this._camera);
    }

    public enable(): void {
        if (this._controls) this._controls.enabled = true;
    }

    public disable(): void {
        if (this._controls) this._controls.enabled = false;
    }

    public resize(): void {
        if (this._camera instanceof PerspectiveCamera) {
            this._camera.aspect = DomResizeManager.width / DomResizeManager.height;
        }
        this._camera.updateProjectionMatrix();
    }

    public update(_dt: number): void {
        if (this._controls) this._controls.update();
    }

    //#region Getters
    //
    public get cameraId(): CameraId {
        return this._cameraId;
    }
    public get camera(): PerspectiveCamera | OrthographicCamera {
        return this._camera;
    }
    //
    //#endregion
}

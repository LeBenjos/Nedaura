import { DomUtils } from '@benjos/cookware';
import { Scene } from 'three';
import LoaderThreeCameraController from '../../../cameras/threes/LoaderThreeCameraController';
import { CameraId } from '../../../constants/experiences/CameraId';
import LoaderManager from '../../../managers/LoaderManager';
import ThreeCameraControllerManager from '../../../managers/threes/ThreeCameraControllerManager';
import LoaderThreeWebGLRenderer from '../../../renderers/threes/LoaderThreeWebGLRenderer';
import LoaderThreeView from '../../../views/threes/loaders/LoaderThreeView';
import ThreeAppBase from './bases/ThreeAppBase';

class LoaderThreeApp extends ThreeAppBase {
    constructor() {
        super();
    }

    protected override _setDomElementContainer(): void {
        this._domElementContainer = DomUtils.GetLoader();
    }

    protected override _generateScenes(): void {
        this._scene = new Scene();
    }

    protected override _generateCameras(): void {
        ThreeCameraControllerManager.add(new LoaderThreeCameraController());
        this._cameraController = ThreeCameraControllerManager.get(CameraId.THREE_LOADER);
    }

    protected override _generateRenderers(): void {
        this._renderer = new LoaderThreeWebGLRenderer(
            this._scene,
            ThreeCameraControllerManager.get(CameraId.THREE_LOADER).camera
        );
        this._domElementContainer.appendChild(this._renderer.domElement);
    }

    protected override _declareViews(): void {
        const loaderThreeView = new LoaderThreeView();
        this._views.push(loaderThreeView);
        this._currentView = loaderThreeView;
        loaderThreeView.init();
        this._scene.add(loaderThreeView);

        LoaderManager.setShowTransition(loaderThreeView.show);
        LoaderManager.setHideTransition(loaderThreeView.hide);
    }
}

export default new LoaderThreeApp();

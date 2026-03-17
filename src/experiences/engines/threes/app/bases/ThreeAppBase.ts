import { DomResizeManager, TickerManager } from '@benjos/cookware';
import { Scene } from 'three';
import ThreeCameraControllerBase from '../../../../cameras/threes/bases/ThreeCameraControllerBase';
import { ViewId } from '../../../../constants/experiences/ViewId';
import LoaderManager from '../../../../managers/LoaderManager';
import WebGLRendererBase from '../../../../renderers/threes/bases/WebGLRendererBase';
import ThreeViewBase from '../../../../views/threes/bases/ThreeViewBase';

export default abstract class ThreeAppBase {
    declare protected _domElementContainer: HTMLElement;
    declare protected _scene: Scene;
    declare protected _cameraController: ThreeCameraControllerBase;
    declare protected _renderer: WebGLRendererBase;
    protected readonly _views: ThreeViewBase[];
    protected readonly _viewBuilder: Map<ViewId, new () => ThreeViewBase>;
    declare protected _currentView: ThreeViewBase;

    constructor() {
        this._views = [];
        this._viewBuilder = new Map();
    }

    public init(): void {
        TickerManager.add(this._update);

        this._setDomElementContainer();
        this._generateScenes();
        this._generateCameras();
        this._generateRenderers();
        this._declareViews();

        this._onResize();
        DomResizeManager.onResize.add(this._onResize);
    }

    protected _setDomElementContainer(): void {
        //
    }

    protected _generateScenes(): void {
        //
    }

    protected _generateCameras(): void {
        //
    }

    protected _generateRenderers(): void {
        //
    }

    protected _declareViews(): void {
        //
    }

    protected _generateView(viewId: ViewId): ThreeViewBase {
        const ViewConstructor = this._viewBuilder.get(viewId);
        if (!ViewConstructor) {
            throw new Error(`View constructor for ID '${viewId}' not found.`);
        }
        const view = new ViewConstructor();
        this._views.push(view);
        return view;
    }

    public async setCurrentView(viewId: ViewId): Promise<void> {
        if (this._currentView?.viewId === viewId) return;

        let view = this._getViewById(viewId);
        if (!view) view = this._generateView(viewId);

        view.declareAssets();

        await LoaderManager.loadAssetsWithTransition(this._swapView.bind(this, view));
    }

    private readonly _swapView = (view: ThreeViewBase): void => {
        if (this._currentView) this._removeOldView(this._currentView);
        this._currentView = view;
        view.init();
        this.scene.add(this._currentView);
    }

    private _getViewById(viewId: ViewId): ThreeViewBase | null {
        let view;
        for (const v of this._views) {
            if (v.viewId === viewId) view = v;
        }
        return view || null;
    }

    private _removeOldView(view: ThreeViewBase): void {
        this.scene.remove(view);
        view.dispose();
        view.reset();
    }

    protected _onResize = (): void => {
        this._renderer.domElement.width = window.innerWidth;
        this._renderer.domElement.height = window.innerHeight;

        this._cameraController.resize();
        this._renderer.resize();
    };

    private _update = (dt: number): void => {
        this._cameraController.update(dt);
        this._currentView?.update(dt);
        this._renderer.update(dt);
    };

    //#region Getters
    //
    public get domElementContainer(): HTMLElement {
        return this._domElementContainer;
    }
    public get scene(): Scene {
        return this._scene;
    }
    public get renderer(): WebGLRendererBase {
        return this._renderer;
    }
    public get cameraController(): ThreeCameraControllerBase {
        return this._cameraController;
    }
    //
    //#endregion
}

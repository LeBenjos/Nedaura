import { DomKeyboardManager, DomUtils } from '@benjos/cookware';
import { KeyboardConstant } from '@benjos/spices';
import { MeshStandardMaterial, Scene } from 'three';
import DebugThreeCameraController from '../../../cameras/threes/DebugThreeCameraController';
import MainThreeCameraController from '../../../cameras/threes/MainThreeCameraController';
import { CameraId } from '../../../constants/experiences/CameraId';
import { DebugGuiTitle } from '../../../constants/experiences/DebugGuiTitle';
import { ViewId } from '../../../constants/experiences/ViewId';
import DebugManager from '../../../managers/DebugManager';
import ThreeCameraControllerManager from '../../../managers/threes/ThreeCameraControllerManager';
import Renderer from '../../../renderers/threes/Renderer';
import World2ThreeView from '../../../views/threes/worlds/World2ThreeView';
import WorldThreeView from '../../../views/threes/worlds/WorldThreeView';
import ThreeAppBase from './bases/ThreeAppBase';

class MainThreeApp extends ThreeAppBase {
    private static readonly _DEBUG_WIREFRAME_MATERIAL_COLOR: number = 0x3f79f3;
    private static readonly _TOGGLE_SWITCH_TO_DEBUG_CAMERA_KEYS: string[] = [
        KeyboardConstant.CODES.SHIFT_LEFT,
        KeyboardConstant.CODES.KEY_C,
    ];
    private static readonly _TOGGLE_WIREFRAME_KEYS: string[] = [
        KeyboardConstant.CODES.SHIFT_LEFT,
        KeyboardConstant.CODES.KEY_W,
    ];

    declare private _debugWireframeMaterial: MeshStandardMaterial;

    constructor() {
        super();
    }

    public override init(): void {
        super.init();

        if (DebugManager.isActive) {
            window.mainThreeApp = this;
            DomKeyboardManager.onKeyDown.add(this._onKeyDown);
        }
    }

    protected override _setDomElementContainer(): void {
        this._domElementContainer = DomUtils.GetApp();
    }

    protected override _generateScenes(): void {
        this._scene = new Scene();

        if (DebugManager.isActive) {
            this._debugWireframeMaterial = new MeshStandardMaterial({
                wireframe: true,
                color: MainThreeApp._DEBUG_WIREFRAME_MATERIAL_COLOR,
            });
        }
    }

    protected override _generateCameras(): void {
        ThreeCameraControllerManager.add(new MainThreeCameraController(), true);
        this._cameraController = ThreeCameraControllerManager.get(CameraId.THREE_MAIN);

        if (DebugManager.isActive) {
            ThreeCameraControllerManager.add(new DebugThreeCameraController());
        }

        ThreeCameraControllerManager.onActiveThreeCameraControllerChange.add(this._onActiveCameraControllerChange);
    }

    protected override _generateRenderers(): void {
        this._renderer = new Renderer(this._scene, this._cameraController.camera, { antialias: true });
        this._domElementContainer.appendChild(this._renderer.domElement);
    }

    protected override _declareViews(): void {
        this._viewBuilder.set(ViewId.THREE_VIEW_WORLD_1, WorldThreeView);
        this._viewBuilder.set(ViewId.THREE_VIEW_WORLD_2, World2ThreeView);

        if (DebugManager.isActive) {
            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS)
            viewsDebug.add({ resetCurrentView: () => this._currentView.reset() }, 'resetCurrentView');
            viewsDebug.add({ createWorld1: () => this.setCurrentView(ViewId.THREE_VIEW_WORLD_1) }, 'createWorld1');
            viewsDebug.add({ createWorld2: () => this.setCurrentView(ViewId.THREE_VIEW_WORLD_2) }, 'createWorld2');
        }
    }

    private _onActiveCameraControllerChange = (): void => {
        this._cameraController = ThreeCameraControllerManager.activeThreeCameraController;
        this._renderer.setCamera(this._cameraController.camera);
        this._onResize();
    };

    private readonly _onKeyDown = (_e: KeyboardEvent): void => {
        if (DebugManager.isActive) {
            if (DomKeyboardManager.areAllKeysDown(MainThreeApp._TOGGLE_SWITCH_TO_DEBUG_CAMERA_KEYS)) {
                ThreeCameraControllerManager.setActiveCamera(
                    this._cameraController.cameraId === CameraId.THREE_MAIN ? CameraId.THREE_DEBUG : CameraId.THREE_MAIN
                );
            } else if (DomKeyboardManager.areAllKeysDown(MainThreeApp._TOGGLE_WIREFRAME_KEYS)) {
                if (this._scene.overrideMaterial === null) {
                    this._scene.overrideMaterial = this._debugWireframeMaterial;
                } else {
                    this._scene.overrideMaterial = null;
                }
            }
        }
    };
}

export type { MainThreeApp };
export default new MainThreeApp();

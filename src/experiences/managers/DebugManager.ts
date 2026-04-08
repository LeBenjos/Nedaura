import { DomKeyboardManager } from '@benjos/cookware';
import { KeyboardConstant } from '@benjos/spices';
import GUI from 'lil-gui';
import Stats from 'stats.js';
import { ThreePerf } from 'three-perf';
import type { DebugGuiTitle } from '../constants/experiences/DebugGuiTitle';
import MainThreeApp from '../engines/threes/app/MainThreeApp';

class DebugManager {
    private static readonly _IS_ACTIVE_STRING: string = '#debug';
    private static readonly _GUI_WIDTH: number = 300;
    private static readonly _GUI_TITLE: string = 'Debug Panel';
    private static readonly _THREE_PERF_ANCHOR_X: 'left' | 'right' = 'left';
    private static readonly _THREE_PERF_ANCHOR_Y: 'top' | 'bottom' = 'bottom';
    private static readonly _TOGGLE_HIDDEN_KEYS: string[] = [
        KeyboardConstant.CODES.SHIFT_LEFT,
        KeyboardConstant.CODES.KEY_H,
    ];

    private _isDebugVisible: boolean = true;
    declare private _gui: GUI;
    declare private _threePerf: ThreePerf;
    declare private _stats: Stats;

    public init(): void {
        if (this.isActive) {
            this._initGui();
        }
    }

    private _initGui(): void {
        this._gui = new GUI({
            width: DebugManager._GUI_WIDTH,
            title: DebugManager._GUI_TITLE,
            closeFolders: true,
        });
        this._gui.close();
        DomKeyboardManager.onKeyDown.remove(this._onKeyDown);
        DomKeyboardManager.onKeyDown.add(this._onKeyDown);
    }

    private _initThreePerf = (): void => {
        this._threePerf = new ThreePerf({
            anchorX: DebugManager._THREE_PERF_ANCHOR_X,
            anchorY: DebugManager._THREE_PERF_ANCHOR_Y,
            domElement: document.body,
            renderer: MainThreeApp.renderer,
            showGraph: false,
        });
    };

    private _initStats = (): void => {
        this._stats = new Stats();
        this._stats.showPanel(0);
        document.body.appendChild(this._stats.dom);
    };

    private _addGuiFolder(title: DebugGuiTitle): GUI {
        return this._gui.addFolder(title);
    }

    public getGuiFolder(title: DebugGuiTitle): GUI {
        let gui = this._gui.folders.find(gui => gui._title === title);
        if (!gui) gui = this._addGuiFolder(title);
        return gui;
    }

    public beginPerf(): void {
        if (!this._threePerf) this._initThreePerf();
        if (!this._stats) this._initStats();
        this._stats.begin();
        this._threePerf.begin();
    }

    public endPerf(): void {
        this._stats.end();
        this._threePerf.end();
    }

    private readonly _onKeyDown = (_e: KeyboardEvent): void => {
        if (DomKeyboardManager.areAllKeysDown(DebugManager._TOGGLE_HIDDEN_KEYS)) {
            this._isDebugVisible = !this._isDebugVisible;
            this._gui.show(this._isDebugVisible);
            if (this._threePerf) this._threePerf.visible = this._isDebugVisible;
            if (this._stats) this._stats.dom.style.display = this._isDebugVisible ? 'block' : 'none';
        }
    };

    //#region Getters
    //
    public get isActive(): boolean {
        return window.location.hash === DebugManager._IS_ACTIVE_STRING;
    }
    public get gui(): GUI {
        return this._gui;
    }
    //
    //#endregion
}

export default new DebugManager();

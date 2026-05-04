import { Action, DomKeyboardManager } from '@benjos/cookware';
import { KeyboardConstant } from '@benjos/spices';
import GUI from 'lil-gui';
import Stats from 'stats.js';
import { ThreePerf } from 'three-perf';
import { DebugGuiTitle } from '../constants/experiences/DebugGuiTitle';
import { THREE_WORLD_PRESETS, type ThreeWorldPresetId } from '../constants/experiences/ThreeWorldPresets';
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
    private static readonly _SHORTCUTS: { keys: string[]; label: string }[] = [
        { keys: ['Shift', 'H'], label: 'Toggle debug visibility' },
        { keys: ['Shift', 'C'], label: 'Toggle debug camera mode' },
        { keys: ['Shift', 'W'], label: 'Toggle wireframe' },
        { keys: ['Ctrl', 'Click'], label: 'Center camera on object' },
    ];

    private _isDebugVisible: boolean = true;
    private _configGetters = new Map<string, () => unknown>();
    private _configSetters = new Map<string, (value: unknown) => void>();
    declare private _gui: GUI;
    declare private _threePerf: ThreePerf;
    declare private _stats: Stats;

    public readonly onVisibilityChange = new Action();

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
        this._injectHeader();
        this._preRegisterFolders();
        DomKeyboardManager.onKeyDown.remove(this._onKeyDown);
        DomKeyboardManager.onKeyDown.add(this._onKeyDown);
    }

    private _preRegisterFolders(): void {
        for (const title of Object.values(DebugGuiTitle)) {
            this._addGuiFolder(title);
        }
    }

    private _injectHeader(): void {
        const container = document.createElement('div');
        container.style.cssText =
            'padding:8px 12px;font-size:11px;line-height:1.5;color:#ccc;border-bottom:1px solid #444;';
        container.style.display = this._gui._closed ? 'none' : 'block';
        this._gui.onOpenClose((gui) => {
            if (gui !== this._gui) return;
            container.style.display = gui._closed ? 'none' : 'block';
        });

        const title = document.createElement('div');
        title.textContent = 'Shortcuts';
        title.style.cssText = 'font-weight:600;color:#fff;margin-bottom:4px;';
        container.appendChild(title);

        for (const shortcut of DebugManager._SHORTCUTS) {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;gap:8px;';

            const keys = document.createElement('span');
            keys.textContent = shortcut.keys.join(' + ');
            keys.style.cssText =
                'font-family:monospace;background:#2c2c2c;padding:1px 6px;border-radius:3px;color:#fff;';

            const label = document.createElement('span');
            label.textContent = shortcut.label;
            label.style.cssText = 'flex:1;text-align:right;';

            row.appendChild(keys);
            row.appendChild(label);
            container.appendChild(row);
        }

        container.appendChild(this._buildExportButton());
        container.appendChild(this._buildPresetButtons());

        const titleBar = this._gui.domElement.children[0];
        if (titleBar) this._gui.domElement.insertBefore(container, titleBar.nextSibling);
        else this._gui.domElement.prepend(container);
    }

    private _buildExportButton(): HTMLButtonElement {
        const button = document.createElement('button');
        const defaultLabel = 'Export settings (copy JSON)';
        button.textContent = defaultLabel;
        button.style.cssText =
            'width:100%;margin-top:8px;padding:6px 8px;font-size:11px;font-weight:600;color:#fff;' +
            'background:#2c5aa0;border:none;border-radius:3px;cursor:pointer;font-family:inherit;';
        button.onmouseenter = () => (button.style.background = '#3a72c9');
        button.onmouseleave = () => (button.style.background = '#2c5aa0');

        let resetTimeout: number | undefined;
        const flash = (label: string, color: string): void => {
            button.textContent = label;
            button.style.background = color;
            if (resetTimeout) window.clearTimeout(resetTimeout);
            resetTimeout = window.setTimeout(() => {
                button.textContent = defaultLabel;
                button.style.background = '#2c5aa0';
            }, 1500);
        };

        button.onclick = async () => {
            const json = JSON.stringify(this._exportSceneConfig(), null, 2);
            const payload = '```json\n' + json + '\n```';
            const ok = await DebugManager._copyToClipboard(payload);
            if (ok) {
                flash('Copied! Send it to the dev', '#2e7d32');
            } else {
                flash('Copy failed — check console', '#b71c1c');
                console.warn('[DebugManager] Export payload:\n' + payload);
            }
        };

        return button;
    }

    public registerConfigGetter(path: string, getter: () => unknown): void {
        this._configGetters.set(path, getter);
    }

    public registerConfigSetter(path: string, setter: (value: unknown) => void): void {
        this._configSetters.set(path, setter);
    }

    private static readonly _PRESET_IDS: readonly ThreeWorldPresetId[] = ['base', 'wind', 'rain', 'sun'];

    private _buildPresetButtons(): HTMLDivElement {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;gap:4px;margin-top:8px;';
        for (const id of DebugManager._PRESET_IDS) {
            const btn = document.createElement('button');
            btn.textContent = id.charAt(0).toUpperCase() + id.slice(1);
            btn.style.cssText =
                'flex:1;padding:6px 4px;font-size:11px;font-weight:600;color:#fff;' +
                'background:#5a5a5a;border:none;border-radius:3px;cursor:pointer;font-family:inherit;';
            btn.onmouseenter = () => (btn.style.background = '#777');
            btn.onmouseleave = () => (btn.style.background = '#5a5a5a');
            btn.onclick = () => this._applyPreset(id);
            wrap.appendChild(btn);
        }
        return wrap;
    }

    private _applyPreset(id: ThreeWorldPresetId): void {
        const preset = THREE_WORLD_PRESETS[id];
        if (!preset) {
            console.warn(`[DebugManager] Unknown preset "${id}"`);
            return;
        }
        for (const [section, fields] of Object.entries(preset)) {
            if (!fields || typeof fields !== 'object') continue;
            for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
                const setter = this._configSetters.get(`${section}.${key}`);
                if (setter) setter(value);
            }
        }
    }

    private _exportSceneConfig(): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        for (const [path, getter] of this._configGetters) {
            const parts = path.split('.');
            let obj = result;
            for (let i = 0; i < parts.length - 1; i++) {
                obj[parts[i]] ??= {};
                obj = obj[parts[i]] as Record<string, unknown>;
            }
            obj[parts[parts.length - 1]] = getter();
        }
        return result;
    }

    private static async _copyToClipboard(text: string): Promise<boolean> {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch {
            //
        }
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.cssText = 'position:fixed;top:-1000px;left:-1000px;opacity:0;';
            document.body.appendChild(textarea);
            textarea.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(textarea);
            return ok;
        } catch {
            return false;
        }
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
            this.onVisibilityChange.execute();
        }
    };

    //#region Getters
    //
    public get isActive(): boolean {
        return window.location.hash === DebugManager._IS_ACTIVE_STRING;
    }
    public get isVisible(): boolean {
        return this._isDebugVisible;
    }
    public get gui(): GUI {
        return this._gui;
    }
    //
    //#endregion
}

export default new DebugManager();

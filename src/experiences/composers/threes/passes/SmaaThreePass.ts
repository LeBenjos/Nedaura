import { SMAAPass } from 'three/examples/jsm/Addons.js';
import { DebugGuiTitle } from '../../../constants/experiences/DebugGuiTitle';
import { THREE_WORLD_CONFIG } from '../../../constants/experiences/ThreeWorldConfig';
import DebugManager from '../../../managers/DebugManager';

export default class SmaaThreePass extends SMAAPass {
    private static readonly _FOLDER_TITLE: string = 'SMAA';

    constructor() {
        super();
        this.enabled = THREE_WORLD_CONFIG.smaa.enabled;

        if (DebugManager.isActive) this._initDebug();
    }

    private _initDebug(): void {
        const composersFolder = DebugManager.getGuiFolder(DebugGuiTitle.THREE_COMPOSERS);
        const folder = composersFolder.addFolder(SmaaThreePass._FOLDER_TITLE);
        const enabledCtrl = folder.add(this, 'enabled').name('enabled');

        DebugManager.registerConfigGetter('smaa.enabled', () => this.enabled);
        DebugManager.registerConfigSetter('smaa.enabled', (v) => enabledCtrl.setValue(v));
    }
}

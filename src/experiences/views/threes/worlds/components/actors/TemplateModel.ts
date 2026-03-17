import { Vector3 } from 'three';
import { AssetId } from '../../../../../constants/experiences/AssetId';
import { DebugGuiTitle } from '../../../../../constants/experiences/DebugGuiTitle';
import DebugManager from '../../../../../managers/DebugManager';
import ThreeModelBase from './bases/ThreeModelBase';

export default class TemplateModel extends ThreeModelBase {
    private static readonly _DEFAULT_POSITION: Vector3 = new Vector3(0, 1, 0);
    private static readonly _ROTATION_Y = 0.25;

    constructor() {
        super(AssetId.THREE_GLTF_TEMPLATE, {
            castShadow: true,
            receiveShadow: true,
        });
        this.position.copy(TemplateModel._DEFAULT_POSITION);

        if (DebugManager.isActive) {
            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS)
            const templateModelFolder = viewsDebug.addFolder('Template Model');
            templateModelFolder.add(this.position, 'y', -1, 1, 0.01);
        }
    }

    public override reset(): void {
        this.rotation.y = 0;
    }

    public update(dt: number): void {
        super.update(dt);
        this.rotation.y += dt * TemplateModel._ROTATION_Y;
    }
}

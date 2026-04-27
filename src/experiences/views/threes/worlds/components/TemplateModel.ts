import { Vector3 } from 'three';
import { AssetId } from '../../../../constants/experiences/AssetId';
import ThreeModelBase from '../../bases/components/ThreeModelBase';

export default class TemplateModel extends ThreeModelBase {
    private static readonly _DEFAULT_POSITION: Vector3 = new Vector3(0, 1, 0);

    constructor() {
        super(AssetId.THREE_GLTF_TEMPLATE, {
            castShadow: true,
            receiveShadow: true,
        });
        this.position.copy(TemplateModel._DEFAULT_POSITION);
    }

    public override reset(): void {
        this.rotation.y = 0;
    }

    public update(dt: number): void {
        super.update(dt);
    }
}

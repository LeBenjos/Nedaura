import { Color, Mesh, RepeatWrapping } from "three";
import { AssetId } from "../../../../constants/experiences/AssetId";
import { DebugGuiTitle } from "../../../../constants/experiences/DebugGuiTitle";
import { Object3DId } from "../../../../constants/experiences/Object3dId";
import DebugManager from "../../../../managers/DebugManager";
import ThreeAssetsManager from "../../../../managers/threes/ThreeAssetsManager";
import ThreeModelBase from "../../bases/components/ThreeModelBase";

export default class Statue extends ThreeModelBase {

    constructor() {
        super(AssetId.THREE_GLTF_DUNES, {
            object3DId: Object3DId.STATUE,
            castShadow: true,
            receiveShadow: true,
        });
    }

    public override reset(): void {
        //
    }

    public update(dt: number): void {
        super.update(dt);
    }
}

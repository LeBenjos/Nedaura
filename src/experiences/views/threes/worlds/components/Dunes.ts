import { Color, Mesh, RepeatWrapping } from "three";
import { AssetId } from "../../../../constants/experiences/AssetId";
import { DebugGuiTitle } from "../../../../constants/experiences/DebugGuiTitle";
import { Object3DId } from "../../../../constants/experiences/Object3dId";
import DebugManager from "../../../../managers/DebugManager";
import ThreeAssetsManager from "../../../../managers/threes/ThreeAssetsManager";
import ThreeModelBase from "../../bases/components/ThreeModelBase";

export default class Dunes extends ThreeModelBase {
    private static readonly _DEFAULT_TEXTURE_REPEAT: number = 50;
    private static readonly _DEFAULT_COLOR: number = 0x8C2120;

    constructor() {
        super(AssetId.THREE_GLTF_DUNES, {
            object3DId: Object3DId.DESERT,
            castShadow: false,
            receiveShadow: true,
        });

        for (const child of this._model.children) {
            if (child.name === Object3DId.DESERT_DUNES && child instanceof Mesh) {
                child.material = child.material.clone();

                const normalMap = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_DUNES_NORMAL);
                normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
                normalMap.repeat.set(Dunes._DEFAULT_TEXTURE_REPEAT, Dunes._DEFAULT_TEXTURE_REPEAT);
                child.material.normalMap = normalMap;

                const armMap = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_DUNES_ARM);
                armMap.wrapS = armMap.wrapT = RepeatWrapping;
                armMap.repeat.set(Dunes._DEFAULT_TEXTURE_REPEAT, Dunes._DEFAULT_TEXTURE_REPEAT);
                child.material.armMap = armMap;

                child.material.color = new Color(Dunes._DEFAULT_COLOR);

                if (DebugManager.isActive) {
                    const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS);
                    const dunesFolder = viewsDebug.addFolder('Dunes');

                    dunesFolder.addColor(child.material, 'color').name('color');
                    dunesFolder.add(child.material, 'roughness', 0, 1, 0.001).name('roughness');
                    dunesFolder.add(child.material, 'metalness', 0, 1, 0.001).name('metalness');

                    if (child.material.normalScale) {
                        dunesFolder.add(child.material.normalScale, 'x', -3, 3, 0.001).name('normal scale X');
                        dunesFolder.add(child.material.normalScale, 'y', -3, 3, 0.001).name('normal scale Y');
                    }

                    const repeatProxy = { value: Dunes._DEFAULT_TEXTURE_REPEAT };
                    dunesFolder.add(repeatProxy, 'value', 1, 200, 0.1).name('texture repeat').onChange((v: number) => {
                        child.material.normalMap?.repeat.set(v, v);
                        child.material.armMap?.repeat.set(v, v);
                    });
                }
            }
        }
    }

    public override reset(): void {
        //
    }

    public update(dt: number): void {
        super.update(dt);
    }
}

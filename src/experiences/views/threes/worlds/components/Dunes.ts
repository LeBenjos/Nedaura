import { Color, MathUtils, Mesh, RepeatWrapping } from "three";
import { AssetId } from "../../../../constants/experiences/AssetId";
import { DebugGuiTitle } from "../../../../constants/experiences/DebugGuiTitle";
import { THREE_WORLD_CONFIG } from "../../../../constants/experiences/ThreeWorldConfig";
import { Object3DId } from "../../../../constants/experiences/Object3dId";
import DebugManager from "../../../../managers/DebugManager";
import ThreeAssetsManager from "../../../../managers/threes/ThreeAssetsManager";
import ThreeModelBase from "../../bases/components/ThreeModelBase";

export default class Dunes extends ThreeModelBase {
    constructor() {
        super(AssetId.THREE_GLTF_DUNES, {
            object3DId: Object3DId.DESERT,
            castShadow: false,
            receiveShadow: true,
        });

        for (const child of this._model.children) {
            if (child.name === Object3DId.DESERT_DUNES && child instanceof Mesh) {
                child.material = child.material.clone();

                const textureRotationRad = MathUtils.degToRad(THREE_WORLD_CONFIG.dunes.textureRotation);

                const normalMap = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_DUNES_NORMAL);
                normalMap.wrapS = normalMap.wrapT = RepeatWrapping;
                normalMap.repeat.set(THREE_WORLD_CONFIG.dunes.textureRepeat, THREE_WORLD_CONFIG.dunes.textureRepeat);
                normalMap.center.set(0.5, 0.5);
                normalMap.rotation = textureRotationRad;
                child.material.normalMap = normalMap;

                const armMap = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_DUNES_ARM);
                armMap.wrapS = armMap.wrapT = RepeatWrapping;
                armMap.repeat.set(THREE_WORLD_CONFIG.dunes.textureRepeat, THREE_WORLD_CONFIG.dunes.textureRepeat);
                armMap.center.set(0.5, 0.5);
                armMap.rotation = textureRotationRad;
                child.material.armMap = armMap;

                child.material.color = new Color(THREE_WORLD_CONFIG.dunes.color);
                child.material.roughness = THREE_WORLD_CONFIG.dunes.roughness;
                child.material.metalness = THREE_WORLD_CONFIG.dunes.metalness;
                if (child.material.normalScale) {
                    child.material.normalScale.set(THREE_WORLD_CONFIG.dunes.normalScaleX, THREE_WORLD_CONFIG.dunes.normalScaleY);
                }

                if (DebugManager.isActive) {
                    const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS);
                    const dunesFolder = viewsDebug.addFolder('Dunes');

                    const colorCtrl = dunesFolder.addColor(child.material, 'color').name('color');
                    const roughnessCtrl = dunesFolder.add(child.material, 'roughness', 0, 1, 0.001).name('roughness');
                    const metalnessCtrl = dunesFolder.add(child.material, 'metalness', 0, 1, 0.001).name('metalness');

                    let normalScaleXCtrl: ReturnType<typeof dunesFolder.add> | undefined;
                    let normalScaleYCtrl: ReturnType<typeof dunesFolder.add> | undefined;
                    if (child.material.normalScale) {
                        normalScaleXCtrl = dunesFolder.add(child.material.normalScale, 'x', -3, 3, 0.001).name('normal scale X');
                        normalScaleYCtrl = dunesFolder.add(child.material.normalScale, 'y', -3, 3, 0.001).name('normal scale Y');
                    }

                    const repeatProxy = { value: THREE_WORLD_CONFIG.dunes.textureRepeat };
                    const repeatCtrl = dunesFolder.add(repeatProxy, 'value', 1, 200, 0.1).name('texture repeat').onChange((v: number) => {
                        child.material.normalMap?.repeat.set(v, v);
                        child.material.armMap?.repeat.set(v, v);
                    });

                    const rotationProxy = { value: THREE_WORLD_CONFIG.dunes.textureRotation };
                    const rotationCtrl = dunesFolder.add(rotationProxy, 'value', 0, 360, 0.1).name('texture rotation').onChange((v: number) => {
                        const rad = MathUtils.degToRad(v);
                        if (child.material.normalMap) child.material.normalMap.rotation = rad;
                        if (child.material.armMap) child.material.armMap.rotation = rad;
                    });

                    DebugManager.registerConfigGetter('dunes.textureRepeat', () => repeatProxy.value);
                    DebugManager.registerConfigGetter('dunes.textureRotation', () => rotationProxy.value);
                    DebugManager.registerConfigGetter('dunes.color', () => '#' + child.material.color.getHexString());
                    DebugManager.registerConfigGetter('dunes.roughness', () => child.material.roughness);
                    DebugManager.registerConfigGetter('dunes.metalness', () => child.material.metalness);
                    DebugManager.registerConfigGetter('dunes.normalScaleX', () => child.material.normalScale?.x ?? 1);
                    DebugManager.registerConfigGetter('dunes.normalScaleY', () => child.material.normalScale?.y ?? 1);

                    DebugManager.registerConfigSetter('dunes.textureRepeat', (v) => repeatCtrl.setValue(v));
                    DebugManager.registerConfigSetter('dunes.textureRotation', (v) => rotationCtrl.setValue(v));
                    DebugManager.registerConfigSetter('dunes.color', (v) => {
                        child.material.color.set(v as string);
                        colorCtrl.updateDisplay();
                    });
                    DebugManager.registerConfigSetter('dunes.roughness', (v) => roughnessCtrl.setValue(v));
                    DebugManager.registerConfigSetter('dunes.metalness', (v) => metalnessCtrl.setValue(v));
                    if (normalScaleXCtrl) DebugManager.registerConfigSetter('dunes.normalScaleX', (v) => normalScaleXCtrl!.setValue(v));
                    if (normalScaleYCtrl) DebugManager.registerConfigSetter('dunes.normalScaleY', (v) => normalScaleYCtrl!.setValue(v));
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

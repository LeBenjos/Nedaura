import { Vector2 } from 'three';
import { DebugGuiTitle } from '../../../constants/experiences/DebugGuiTitle';
import { THREE_WORLD_CONFIG } from '../../../constants/experiences/ThreeWorldConfig';
import MainThreeApp from '../../../engines/threes/app/MainThreeApp';
import DebugManager from '../../../managers/DebugManager';
import KuwaharaPassFragmentShader from '../../../shaders/threes/composers/kuwahara/KuwaharaPassFragmentShader.glsl';
import KuwaharaPassVertexShader from '../../../shaders/threes/composers/kuwahara/KuwaharaPassVertexShader.glsl';
import ThreePassBase from '../bases/passes/ThreePassBase';

export default class KuwaharaThreePass extends ThreePassBase {
    private static readonly _FOLDER_TITLE: string = 'Kuwahara';
    private static readonly _MIN_DOWNSCALE: number = 1;
    private static readonly _MAX_DOWNSCALE: number = 8;

    constructor() {
        super({
            uniforms: {
                tDiffuse: { value: null },
                uTexelSize: { value: new Vector2(1 / window.innerWidth, 1 / window.innerHeight) },
            },
            vertexShader: KuwaharaPassVertexShader,
            fragmentShader: KuwaharaPassFragmentShader,
        });

        if (DebugManager.isActive) this._initDebug();
    }

    public override setSize(width: number, height: number): void {
        super.setSize(width, height);
        (this.uniforms.uTexelSize.value as Vector2).set(1 / width, 1 / height);
    }

    private _initDebug(): void {
        const composersFolder = DebugManager.getGuiFolder(DebugGuiTitle.THREE_COMPOSERS);
        const folder = composersFolder.addFolder(KuwaharaThreePass._FOLDER_TITLE);
        this.enabled = THREE_WORLD_CONFIG.kuwahara.enabled;
        const enabledCtrl = folder.add(this, 'enabled').name('enabled');

        const downscaleProxy = { value: THREE_WORLD_CONFIG.kuwahara.downscale };
        const downscaleCtrl = folder
            .add(
                downscaleProxy,
                'value',
                KuwaharaThreePass._MIN_DOWNSCALE,
                KuwaharaThreePass._MAX_DOWNSCALE,
                1,
            )
            .name('downscale')
            .onChange((value: number) => MainThreeApp.renderer.setDownscale(value));

        DebugManager.registerConfigGetter('kuwahara.enabled', () => this.enabled);
        DebugManager.registerConfigGetter('kuwahara.downscale', () => downscaleProxy.value);

        DebugManager.registerConfigSetter('kuwahara.enabled', (v) => enabledCtrl.setValue(v));
        DebugManager.registerConfigSetter('kuwahara.downscale', (v) => downscaleCtrl.setValue(v));
    }
}

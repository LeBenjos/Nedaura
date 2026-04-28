import {
    ACESFilmicToneMapping,
    AgXToneMapping,
    CineonToneMapping,
    Color,
    CustomToneMapping,
    LinearSRGBColorSpace,
    LinearToneMapping,
    NeutralToneMapping,
    NoToneMapping,
    PCFShadowMap,
    ReinhardToneMapping,
    SRGBColorSpace,
    type Camera,
    type ColorSpace,
    type Scene,
    type ToneMapping,
    type WebGLRendererParameters
} from 'three';
import MainThreeEffectComposer from '../../composers/threes/MainThreeEffectComposer';
import { DebugGuiTitle } from '../../constants/experiences/DebugGuiTitle';
import { THREE_WORLD_CONFIG } from '../../constants/experiences/ThreeWorldConfig';
import DebugManager from '../../managers/DebugManager';
import ThreeWebGLRendererBase from './bases/ThreeWebGLRendererBase';

export default class MainThreeWebGLRenderer extends ThreeWebGLRendererBase {
    private static readonly _DEFAULT_SHADOW_MAP_TYPE = PCFShadowMap;
    private static readonly _CLEAR_COLOR: string = '#fafafa';
    private static readonly _CLEAR_ALPHA: number = 0;

    constructor(scene: Scene, camera: Camera, parameters: WebGLRendererParameters = {}) {
        super(scene, camera, parameters);
        this.toneMapping = THREE_WORLD_CONFIG.renderer.toneMapping;
        this.toneMappingExposure = THREE_WORLD_CONFIG.renderer.toneMappingExposure;
        this.outputColorSpace = THREE_WORLD_CONFIG.renderer.outputColorSpace;
        this.shadowMap.enabled = true;
        this.shadowMap.type = MainThreeWebGLRenderer._DEFAULT_SHADOW_MAP_TYPE;
        this.setClearColor(new Color(MainThreeWebGLRenderer._CLEAR_COLOR), MainThreeWebGLRenderer._CLEAR_ALPHA);

        if (DebugManager.isActive) {
            const rendererFolder = DebugManager.getGuiFolder(DebugGuiTitle.THREE_RENDERER)
            rendererFolder
                .add(this, 'toneMapping', {
                    NoToneMapping,
                    LinearToneMapping,
                    ReinhardToneMapping,
                    CineonToneMapping,
                    ACESFilmicToneMapping,
                    CustomToneMapping,
                    AgXToneMapping,
                    NeutralToneMapping,
                })
                .onChange((value: ToneMapping) => {
                    this.toneMapping = value;
                });
            rendererFolder.add(this, 'toneMappingExposure', 0, 10, 0.001);
            rendererFolder
                .add(this, 'outputColorSpace', { SRGBColorSpace, LinearSRGBColorSpace })
                .onChange((value: ColorSpace) => {
                    this.outputColorSpace = value;
                });
            const postProcProxy = { active: THREE_WORLD_CONFIG.renderer.postProcessing };
            this.setIsPostProcessingActive(THREE_WORLD_CONFIG.renderer.postProcessing);
            rendererFolder
                .add(postProcProxy, 'active')
                .name('post-processing')
                .onChange((value: boolean) => this.setIsPostProcessingActive(value));

            DebugManager.registerConfigGetter('renderer.postProcessing', () => postProcProxy.active);
            DebugManager.registerConfigGetter('renderer.toneMapping', () => this.toneMapping);
            DebugManager.registerConfigGetter('renderer.outputColorSpace', () => this.outputColorSpace);
            DebugManager.registerConfigGetter('renderer.toneMappingExposure', () => this.toneMappingExposure);
        }
    }

    protected override _generateComposers(): void {
        this._composer = new MainThreeEffectComposer(this, this._scene, this._camera);
    }

    public override update(dt: number): void {
        const isDebug = DebugManager.isActive;
        if (isDebug) DebugManager.beginPerf();
        super.update(dt);
        if (isDebug) DebugManager.endPerf();
    }
}

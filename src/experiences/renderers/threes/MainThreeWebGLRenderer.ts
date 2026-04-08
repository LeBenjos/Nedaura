import {
    ACESFilmicToneMapping,
    AgXToneMapping,
    CineonToneMapping,
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
import DebugManager from '../../managers/DebugManager';
import ThreeWebGLRendererBase from './bases/ThreeWebGLRendererBase';

export default class MainThreeWebGLRenderer extends ThreeWebGLRendererBase {
    private static readonly _DEFAULT_TONE_MAPPING = CineonToneMapping;
    private static readonly _DEFAULT_OUTPUT_COLOR_SPACE = SRGBColorSpace;
    private static readonly _DEFAULT_SHADOW_MAP_TYPE = PCFShadowMap;
    private static readonly _DEFAULT_TONE_MAPPING_EXPOSURE = 1;
    private static readonly _DEFAULT_CLEAR_COLOR = 0xfafafa;
    private static readonly _DEFAULT_CLEAR_ALPHA = 0;

    constructor(scene: Scene, camera: Camera, parameters: WebGLRendererParameters = {}) {
        super(scene, camera, parameters);
        this.toneMapping = MainThreeWebGLRenderer._DEFAULT_TONE_MAPPING;
        this.toneMappingExposure = MainThreeWebGLRenderer._DEFAULT_TONE_MAPPING_EXPOSURE;
        this.outputColorSpace = MainThreeWebGLRenderer._DEFAULT_OUTPUT_COLOR_SPACE;
        this.shadowMap.enabled = true;
        this.shadowMap.type = MainThreeWebGLRenderer._DEFAULT_SHADOW_MAP_TYPE;
        this.setClearColor(MainThreeWebGLRenderer._DEFAULT_CLEAR_COLOR, MainThreeWebGLRenderer._DEFAULT_CLEAR_ALPHA);

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
            const postProcProxy = { active: this._isPostProcessingActive };
            rendererFolder
                .add(postProcProxy, 'active')
                .name('post-processing')
                .onChange((value: boolean) => this.setIsPostProcessingActive(value));
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

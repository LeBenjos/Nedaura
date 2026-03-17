import {
    ACESFilmicToneMapping,
    AgXToneMapping,
    Camera,
    CineonToneMapping,
    CustomToneMapping,
    LinearSRGBColorSpace,
    LinearToneMapping,
    NeutralToneMapping,
    NoToneMapping,
    PCFSoftShadowMap,
    ReinhardToneMapping,
    Scene,
    SRGBColorSpace,
    type ColorSpace,
    type ToneMapping,
    type WebGLRendererParameters,
} from 'three';
import { DebugGuiTitle } from '../../constants/experiences/DebugGuiTitle';
import DebugManager from '../../managers/DebugManager';
import WebGLRendererBase from './bases/WebGLRendererBase';

export default class Renderer extends WebGLRendererBase {
    private static readonly _DEFAULT_TONE_MAPPING = CineonToneMapping;
    private static readonly _DEFAULT_OUTPUT_COLOR_SPACE = SRGBColorSpace;
    private static readonly _DEFAULT_SHADOW_MAP_TYPE = PCFSoftShadowMap;
    private static readonly _DEFAULT_TONE_MAPPING_EXPOSURE = 1;
    private static readonly _DEFAULT_CLEAR_COLOR = 0xfafafa;
    private static readonly _DEFAULT_CLEAR_ALPHA = 0;

    constructor(scene: Scene, camera: Camera, parameters: WebGLRendererParameters = {}) {
        super(scene, camera, parameters);
        this.toneMapping = Renderer._DEFAULT_TONE_MAPPING;
        this.toneMappingExposure = Renderer._DEFAULT_TONE_MAPPING_EXPOSURE;
        this.outputColorSpace = Renderer._DEFAULT_OUTPUT_COLOR_SPACE;
        this.shadowMap.enabled = true;
        this.shadowMap.type = Renderer._DEFAULT_SHADOW_MAP_TYPE;
        this.setClearColor(Renderer._DEFAULT_CLEAR_COLOR, Renderer._DEFAULT_CLEAR_ALPHA);

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
        }
    }

    public override update(dt: number): void {
        const isDebug = DebugManager.isActive;
        if (isDebug) DebugManager.beginThreePerf();
        super.update(dt);
        if (isDebug) DebugManager.endThreePerf();
    }
}

import { NoToneMapping, SRGBColorSpace, type Camera, type Scene, type WebGLRendererParameters } from 'three';
import ThreeWebGLRendererBase from './bases/ThreeWebGLRendererBase';

export default class LoaderThreeWebGLRenderer extends ThreeWebGLRendererBase {
    private static readonly _DEFAULT_TONE_MAPPING = NoToneMapping;
    private static readonly _DEFAULT_OUTPUT_COLOR_SPACE = SRGBColorSpace;
    private static readonly _DEFAULT_TONE_MAPPING_EXPOSURE = 1;
    private static readonly _DEFAULT_CLEAR_COLOR = 0x000000;
    private static readonly _DEFAULT_CLEAR_ALPHA = 0;

    constructor(scene: Scene, camera: Camera, parameters: WebGLRendererParameters = {}) {
        super(scene, camera, parameters);
        this.toneMapping = LoaderThreeWebGLRenderer._DEFAULT_TONE_MAPPING;
        this.toneMappingExposure = LoaderThreeWebGLRenderer._DEFAULT_TONE_MAPPING_EXPOSURE;
        this.outputColorSpace = LoaderThreeWebGLRenderer._DEFAULT_OUTPUT_COLOR_SPACE;
        this.setClearColor(LoaderThreeWebGLRenderer._DEFAULT_CLEAR_COLOR, LoaderThreeWebGLRenderer._DEFAULT_CLEAR_ALPHA);
    }
}

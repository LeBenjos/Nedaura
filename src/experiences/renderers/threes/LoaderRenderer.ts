import { Camera, NoToneMapping, Scene, SRGBColorSpace, type WebGLRendererParameters } from 'three';
import WebGLRendererBase from './bases/WebGLRendererBase';

export default class LoaderRenderer extends WebGLRendererBase {
    private static readonly _DEFAULT_TONE_MAPPING = NoToneMapping;
    private static readonly _DEFAULT_OUTPUT_COLOR_SPACE = SRGBColorSpace;
    private static readonly _DEFAULT_TONE_MAPPING_EXPOSURE = 1;
    private static readonly _DEFAULT_CLEAR_COLOR = 0x000000;
    private static readonly _DEFAULT_CLEAR_ALPHA = 0;

    constructor(scene: Scene, camera: Camera, parameters: WebGLRendererParameters = {}) {
        super(scene, camera, parameters);
        this.toneMapping = LoaderRenderer._DEFAULT_TONE_MAPPING;
        this.toneMappingExposure = LoaderRenderer._DEFAULT_TONE_MAPPING_EXPOSURE;
        this.outputColorSpace = LoaderRenderer._DEFAULT_OUTPUT_COLOR_SPACE;
        this.setClearColor(LoaderRenderer._DEFAULT_CLEAR_COLOR, LoaderRenderer._DEFAULT_CLEAR_ALPHA);
    }
}

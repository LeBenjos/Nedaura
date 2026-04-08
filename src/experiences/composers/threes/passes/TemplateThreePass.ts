import TemplatePassFragmentShader from '../../../shaders/threes/composers/templates/TemplatePassFragmentShader.glsl';
import TemplatePassVertexShader from '../../../shaders/threes/composers/templates/TemplatePassVertexShader.glsl';
import ThreePassBase from "../bases/passes/ThreePassBase";

export default class TemplateThreePass extends ThreePassBase {
    constructor() {
        super({
            uniforms: {
                tDiffuse: { value: null },
                uTime: { value: null },
            },
            vertexShader: TemplatePassVertexShader,
            fragmentShader: TemplatePassFragmentShader,
        });

        this.uniforms.uTime.value = 0;
    }

    public update(dt: number): void {
        this.uniforms.uTime.value += dt;
    }
}

import gsap from 'gsap';
import { Color, ShaderMaterial } from 'three';
import LoaderFragmentShader from '../../../shaders/threes/loaders/LoaderFragmentShader.glsl';
import LoaderVertexShader from '../../../shaders/threes/loaders/LoaderVertexShader.glsl';

export default class LoaderMaterial extends ShaderMaterial {
    private static readonly _DEFAULT_UNIFORMS_ALPHA: number = 1;
    private static readonly _DEFAULT_UNIFORMS_COLOR: number = 0x3f79f3;
    private static readonly _GSAP_DURATION_FADE_IN: number = 0.5;
    private static readonly _GSAP_EASE_FADE_IN: string = 'power2.out';
    private static readonly _GSAP_DURATION_FADE_OUT: number = 1.5;
    private static readonly _GSAP_EASE_FADE_OUT: string = 'power2.in';

    constructor() {
        super({
            transparent: true,
            uniforms: {
                uAlpha: { value: LoaderMaterial._DEFAULT_UNIFORMS_ALPHA },
                uColor: { value: new Color(LoaderMaterial._DEFAULT_UNIFORMS_COLOR) },
            },
            vertexShader: LoaderVertexShader,
            fragmentShader: LoaderFragmentShader,
        });
    }

    public async show(): Promise<void> {
        gsap.killTweensOf(this.uniforms.uAlpha);
        await gsap.to(this.uniforms.uAlpha, {
            value: 1,
            duration: LoaderMaterial._GSAP_DURATION_FADE_IN,
            ease: LoaderMaterial._GSAP_EASE_FADE_IN,
        });
    }

    public async hide(): Promise<void> {
        gsap.killTweensOf(this.uniforms.uAlpha);
        this.uniforms.uAlpha.value = 1;
        await gsap.to(this.uniforms.uAlpha, {
            value: 0,
            duration: LoaderMaterial._GSAP_DURATION_FADE_OUT,
            ease: LoaderMaterial._GSAP_EASE_FADE_OUT,
        });
    }
}

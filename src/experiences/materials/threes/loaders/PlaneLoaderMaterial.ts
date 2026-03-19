import gsap from 'gsap';
import { Color, ShaderMaterial, Uniform } from 'three';
import LoaderFragmentShader from '../../../shaders/threes/loaders/LoaderFragmentShader.glsl';
import LoaderVertexShader from '../../../shaders/threes/loaders/LoaderVertexShader.glsl';

export default class PlaneLoaderMaterial extends ShaderMaterial {
    private static readonly _DEFAULT_UNIFORMS_COLOR: number = 0xBF5D5C;
    private static readonly _GSAP_DURATION_FADE_IN: number = 2.5;
    private static readonly _GSAP_EASE_FADE_IN: string = 'power1.inOut';
    private static readonly _GSAP_DURATION_FADE_OUT: number = 3.5;
    private static readonly _GSAP_EASE_FADE_OUT: string = 'power1.inOut';

    private _firstLoad: boolean = true;

    constructor() {
        super({
            transparent: true,
            uniforms: {
                uTime: new Uniform(0),
                uProgress: new Uniform(0),
                uColor: new Uniform(new Color(PlaneLoaderMaterial._DEFAULT_UNIFORMS_COLOR)),
            },
            vertexShader: LoaderVertexShader,
            fragmentShader: LoaderFragmentShader,
        });
    }

    public async show(): Promise<void> {
        gsap.killTweensOf(this.uniforms.uProgress);
        this.uniforms.uProgress.value = this._firstLoad ? 1 : 0;
        await gsap.to(this.uniforms.uProgress, {
            value: 1,
            duration: this._firstLoad ? 0 : PlaneLoaderMaterial._GSAP_DURATION_FADE_IN,
            ease: PlaneLoaderMaterial._GSAP_EASE_FADE_IN,
        });
        this._firstLoad = false;
    }

    public async hide(): Promise<void> {
        gsap.killTweensOf(this.uniforms.uProgress);
        this.uniforms.uProgress.value = 1;
        await gsap.to(this.uniforms.uProgress, {
            value: 0,
            duration: PlaneLoaderMaterial._GSAP_DURATION_FADE_OUT,
            ease: PlaneLoaderMaterial._GSAP_EASE_FADE_OUT,
        });
    }

    public update(dt: number): void {
        this.uniforms.uTime.value += dt;
    }
}

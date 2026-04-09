import { DomResizeManager } from '@benjos/cookware';
import { WebGLRenderer, type Camera, type Scene, type WebGLRendererParameters } from 'three';
import ThreeEffectComposerBase from '../../../composers/threes/bases/ThreeEffectComposerBase';

export default abstract class ThreeWebGLRendererBase extends WebGLRenderer {
    protected _composer?: ThreeEffectComposerBase;
    protected _isPostProcessingActive: boolean = false;
    protected _downscale: number = 1;
    protected readonly _scene: Scene;
    protected _camera: Camera;

    constructor(scene: Scene, camera: Camera, parameters: WebGLRendererParameters = {}) {
        super(parameters);

        this._scene = scene;
        this._camera = camera;

        this._generateComposers();
        this.resize();
    }

    protected _generateComposers(): void {
        //
    }

    public setCamera(camera: Camera): void {
        this._camera = camera;
        if (this._composer) {
            this._composer.setCamera(camera);
        }
    }

    public setIsPostProcessingActive(enabled: boolean): void {
        this._isPostProcessingActive = enabled && !!this._composer;
        this.resize();
    }

    public setDownscale(factor: number): void {
        this._downscale = Math.max(1, factor);
        this.resize();
    }

    public resize(): void {
        const useDownscale = this._isPostProcessingActive && this._downscale > 1;
        const pixelRatio = useDownscale
            ? DomResizeManager.pixelRatio / this._downscale
            : DomResizeManager.pixelRatio;
        this.domElement.style.imageRendering = useDownscale ? 'pixelated' : '';
        this.setSize(DomResizeManager.width, DomResizeManager.height);
        this.setPixelRatio(pixelRatio);
        if (this._composer) this._composer.resize();
    }

    public update(dt: number): void {
        if (this._composer && this._isPostProcessingActive) {
            this._composer.update(dt);
        } else {
            this.render(this._scene, this._camera);
        }
    }

    //#region Getters
    //
    public get composer(): ThreeEffectComposerBase {
        return this._composer!;
    }
    public get isPostProcessingActive(): boolean {
        return this._isPostProcessingActive;
    }
    public get downscale(): number {
        return this._downscale;
    }
    //
    //#endregion
}

import { DomResizeManager } from "@benjos/cookware";
import { HalfFloatType, WebGLRenderTarget, type Camera, type Scene, type TextureDataType, type WebGLRenderer } from "three";
import { EffectComposer, OutputPass, RenderPass, type Pass } from "three/examples/jsm/Addons.js";
import ThreePassBase from "./passes/ThreePassBase";

export default abstract class ThreeEffectComposerBase extends EffectComposer {
    protected static readonly _DEFAULT_RENDER_TARGET_SAMPLES = 4;
    protected static readonly _DEFAULT_RENDER_TARGET_TYPE = HalfFloatType;

    protected readonly _passes: Pass[];
    private declare _renderPass: RenderPass;

    constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera, options: { samples?: number, type?: TextureDataType } = {}) {
        const samples = options.samples ?? ThreeEffectComposerBase._DEFAULT_RENDER_TARGET_SAMPLES;
        const type = options.type ?? ThreeEffectComposerBase._DEFAULT_RENDER_TARGET_TYPE;
        super(renderer, new WebGLRenderTarget(DomResizeManager.width, DomResizeManager.height, { samples, type }));

        this._createRenderPass(scene, camera);
        this._passes = [];
        this._addPasses();
        this._addPass(new OutputPass());
        this.resize();
    }

    public setCamera(camera: Camera): void {
        this._renderPass.camera = camera;
    }

    public resize(): void {
        this.setSize(DomResizeManager.width, DomResizeManager.height);
        this.setPixelRatio(DomResizeManager.pixelRatio);
    }

    private _createRenderPass(scene: Scene, camera: Camera): void {
        this._renderPass = new RenderPass(scene, camera);
        this.addPass(this._renderPass);
    }

    protected _addPasses(): void {
        //
    }

    protected _addPass(pass: Pass): void {
        this.addPass(pass);
        this._passes.push(pass);
    }

    public update(dt: number): void {
        for (const pass of this._passes) {
            if (pass instanceof ThreePassBase) pass.update(dt);
        }
        this.render(dt);
    }
}

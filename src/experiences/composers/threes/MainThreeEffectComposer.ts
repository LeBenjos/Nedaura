import type { Camera, Scene, WebGLRenderer } from "three";
import { GlitchPass } from "three/examples/jsm/Addons.js";
import ThreeEffectComposerBase from "./bases/ThreeEffectComposerBase";
import TemplateThreePass from "./passes/TemplateThreePass";

export default class MainThreeEffectComposer extends ThreeEffectComposerBase {
    constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
        super(renderer, scene, camera);
    }

    protected override _addPasses(): void {
        super._addPasses();
        this._addPass(new TemplateThreePass());
        this._addPass(new GlitchPass());
    }

    public override update(dt: number): void {
        super.update(dt);
    }
}

import type { Camera, Scene, WebGLRenderer } from "three";
import ThreeEffectComposerBase from "./bases/ThreeEffectComposerBase";
import KuwaharaThreePass from "./passes/KuwaharaThreePass";
import SmaaThreePass from "./passes/SmaaThreePass";

export default class MainThreeEffectComposer extends ThreeEffectComposerBase {
    private static readonly _SAMPLES: number = 0;

    constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
        super(renderer, scene, camera, { samples: MainThreeEffectComposer._SAMPLES });
    }

    protected override _addPasses(): void {
        super._addPasses();
        this._addPass(new KuwaharaThreePass());
        this._addPass(new SmaaThreePass());
    }

    public override update(dt: number): void {
        super.update(dt);
    }
}

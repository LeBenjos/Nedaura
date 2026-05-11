import type { Camera } from "three";
import { ShaderPass } from "three/examples/jsm/Addons.js";

export default abstract class ThreePassBase extends ShaderPass {
    constructor(shader: any) {
        super(shader);
    }

    public update(_dt: number): void {

    }

    public setCamera(_camera: Camera): void {

    }
}

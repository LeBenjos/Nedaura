import {
    BufferAttribute,
    BufferGeometry,
    Color,
    MathUtils,
    Mesh,
    ShaderMaterial,
    UniformsLib,
    UniformsUtils,
} from "three";
import ThreeActorBase from "../../bases/components/ThreeActorBase";

export default class Clouds extends ThreeActorBase {
    private static readonly _COUNT: number = 70;
    private static readonly _RADIUS: number = 16;
    private static readonly _HEIGHT: number = 3.2;
    private static readonly _HEIGHT_VARIATION: number = 1.6;
    private static readonly _SIZE: number = 5;
    private static readonly _SIZE_VARIATION: number = 1.8;
    private static readonly _COLOR: string = "#e6d8c4";
    private static readonly _DRIFT: readonly [number, number, number] = [0.7, 0, 0.18];
    private static readonly _FADE_RATE: number = 0.35;

    private declare _geometry: BufferGeometry;
    private declare _material: ShaderMaterial;
    private declare _mesh: Mesh;

    private _targetIntensity: number = 0;
    private _intensity: number = 0;

    constructor() {
        super();
        this._generateGeometry();
        this._generateMaterial();
        this._generateMesh();
        this.visible = false;
    }

    public setIntensity(target: number): void {
        const clamped = Math.max(0, Math.min(target, 1));
        if (clamped === this._targetIntensity) return;
        this._targetIntensity = clamped;
        if (this._targetIntensity > 0) this.visible = true;
    }

    public setCount(count: number): void {
        this.setIntensity(count > 0 ? 1 : 0);
    }

    public get intensity(): number {
        return this._intensity;
    }

    private _generateGeometry(): void {
        const count = Clouds._COUNT;
        const positions = new Float32Array(count * 4 * 3);
        const corners = new Float32Array(count * 4 * 2);
        const sizes = new Float32Array(count * 4);
        const seeds = new Float32Array(count * 4);
        const indices = new Uint16Array(count * 6);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * Clouds._RADIUS;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Clouds._HEIGHT + (Math.random() - 0.5) * Clouds._HEIGHT_VARIATION;
            const size = Clouds._SIZE + (Math.random() - 0.5) * Clouds._SIZE_VARIATION;
            const seed = Math.random();

            for (let c = 0; c < 4; c++) {
                positions[(i * 4 + c) * 3 + 0] = x;
                positions[(i * 4 + c) * 3 + 1] = y;
                positions[(i * 4 + c) * 3 + 2] = z;
                sizes[i * 4 + c] = size;
                seeds[i * 4 + c] = seed;
            }

            corners[(i * 4 + 0) * 2 + 0] = -1; corners[(i * 4 + 0) * 2 + 1] = -1;
            corners[(i * 4 + 1) * 2 + 0] = 1; corners[(i * 4 + 1) * 2 + 1] = -1;
            corners[(i * 4 + 2) * 2 + 0] = 1; corners[(i * 4 + 2) * 2 + 1] = 1;
            corners[(i * 4 + 3) * 2 + 0] = -1; corners[(i * 4 + 3) * 2 + 1] = 1;

            const vi = i * 4;
            indices[i * 6 + 0] = vi + 0;
            indices[i * 6 + 1] = vi + 1;
            indices[i * 6 + 2] = vi + 2;
            indices[i * 6 + 3] = vi + 0;
            indices[i * 6 + 4] = vi + 2;
            indices[i * 6 + 5] = vi + 3;
        }

        this._geometry = new BufferGeometry();
        this._geometry.setAttribute("position", new BufferAttribute(positions, 3));
        this._geometry.setAttribute("aCorner", new BufferAttribute(corners, 2));
        this._geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
        this._geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
        this._geometry.setIndex(new BufferAttribute(indices, 1));
    }

    private _generateMaterial(): void {
        this._material = new ShaderMaterial({
            transparent: true,
            depthWrite: false,
            fog: true,
            uniforms: UniformsUtils.merge([
                UniformsLib.fog,
                {
                    uTime: { value: 0 },
                    uIntensity: { value: 0 },
                    uColor: { value: new Color(Clouds._COLOR) },
                    uDrift: { value: [...Clouds._DRIFT] },
                    uRadius: { value: Clouds._RADIUS },
                },
            ]),
            vertexShader: `
                attribute vec2 aCorner;
                attribute float aSize;
                attribute float aSeed;

                uniform float uTime;
                uniform vec3 uDrift;
                uniform float uRadius;

                varying vec2 vUv;
                varying float vSeed;

                #include <fog_pars_vertex>

                void main() {
                    float speed = 0.6 + 0.8 * aSeed;
                    vec3 drift = uDrift * uTime * speed;

                    vec3 wrappedPos = position;
                    vec2 box = vec2(uRadius * 2.0);
                    vec2 horiz = wrappedPos.xz + drift.xz - cameraPosition.xz + uRadius;
                    horiz = mod(horiz, box) - uRadius + cameraPosition.xz;
                    wrappedPos.x = horiz.x;
                    wrappedPos.z = horiz.y;

                    vec4 mvPosition = modelViewMatrix * vec4(wrappedPos, 1.0);
                    mvPosition.xy += aCorner * aSize;

                    gl_Position = projectionMatrix * mvPosition;

                    vUv = aCorner * 0.5 + 0.5;
                    vSeed = aSeed;

                    #include <fog_vertex>
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uIntensity;
                uniform float uTime;

                varying vec2 vUv;
                varying float vSeed;

                #include <fog_pars_fragment>

                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                }

                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                        u.y
                    );
                }

                float fbm(vec2 p) {
                    float v = 0.0;
                    float amp = 0.5;
                    for (int i = 0; i < 4; i++) {
                        v += amp * noise(p);
                        p *= 2.0;
                        amp *= 0.5;
                    }
                    return v;
                }

                void main() {
                    vec2 centered = vUv - 0.5;
                    float dist = length(centered);
                    float disc = smoothstep(0.5, 0.05, dist);

                    vec2 noiseUv = vUv * 2.5 + vec2(vSeed * 17.3, uTime * 0.05);
                    float n = fbm(noiseUv);
                    float density = disc * smoothstep(0.15, 0.75, n);

                    float alpha = density * uIntensity;
                    if (alpha < 0.001) discard;

                    gl_FragColor = vec4(uColor, alpha);

                    #include <fog_fragment>
                }
            `,
        });
    }

    private _generateMesh(): void {
        this._mesh = new Mesh(this._geometry, this._material);
        this._mesh.frustumCulled = false;
        this.add(this._mesh);
    }

    public override update(dt: number): void {
        super.update(dt);
        this._material.uniforms.uTime.value += dt;

        const k = 1 - Math.exp(-Clouds._FADE_RATE * dt);
        this._intensity = MathUtils.lerp(this._intensity, this._targetIntensity, k);
        this._material.uniforms.uIntensity.value = this._intensity;

        if (this._targetIntensity === 0 && this._intensity < 0.002) {
            this._intensity = 0;
            this.visible = false;
        }
    }

    public override reset(): void {
        this._targetIntensity = 0;
        this._intensity = 0;
        this._material.uniforms.uIntensity.value = 0;
        this.visible = false;
    }
}

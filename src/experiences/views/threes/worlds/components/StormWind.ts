import {
    BufferAttribute,
    BufferGeometry,
    Color,
    LineSegments,
    MathUtils,
    ShaderMaterial,
    UniformsLib,
    UniformsUtils,
} from "three";
import ThreeActorBase from "../../bases/components/ThreeActorBase";

export default class StormWind extends ThreeActorBase {
    private static readonly _MAX_COUNT: number = 10000;
    private static readonly _RADIUS: number = 18;
    private static readonly _STREAK_LENGTH: number = 0.6;
    private static readonly _COLOR: string = "#dccab8";
    private static readonly _WIND: readonly [number, number, number] = [12, -1.5, 0];
    private static readonly _FADE_RATE: number = 1.8;

    private declare _geometry: BufferGeometry;
    private declare _material: ShaderMaterial;
    private declare _lines: LineSegments;

    private _count: number = 0;
    private _targetIntensity: number = 0;
    private _intensity: number = 0;

    constructor() {
        super();
        this._generateGeometry();
        this._generateMaterial();
        this._generateLines();
        this.visible = false;
    }

    public setCount(count: number): void {
        const clamped = Math.max(0, Math.min(Math.floor(count), StormWind._MAX_COUNT));
        if (clamped === this._count) return;
        this._count = clamped;
        this._geometry.setDrawRange(0, this._count * 2);
        this._targetIntensity = this._count > 0 ? 1 : 0;
        if (this._count > 0) this.visible = true;
    }

    public get count(): number {
        return this._count;
    }

    private _generateGeometry(): void {
        const count = StormWind._MAX_COUNT;
        const positions = new Float32Array(count * 2 * 3);
        const seeds = new Float32Array(count * 2);
        const tails = new Float32Array(count * 2);

        const size = StormWind._RADIUS * 2;
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * size;
            const y = (Math.random() - 0.5) * size;
            const z = (Math.random() - 0.5) * size;
            const seed = Math.random();

            positions[i * 6 + 0] = x;
            positions[i * 6 + 1] = y;
            positions[i * 6 + 2] = z;
            positions[i * 6 + 3] = x;
            positions[i * 6 + 4] = y;
            positions[i * 6 + 5] = z;

            seeds[i * 2 + 0] = seed;
            seeds[i * 2 + 1] = seed;

            tails[i * 2 + 0] = 0;
            tails[i * 2 + 1] = 1;
        }

        this._geometry = new BufferGeometry();
        this._geometry.setAttribute("position", new BufferAttribute(positions, 3));
        this._geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
        this._geometry.setAttribute("aTail", new BufferAttribute(tails, 1));
        this._geometry.setDrawRange(0, 0);
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
                    uRadius: { value: StormWind._RADIUS },
                    uWind: { value: [...StormWind._WIND] },
                    uLength: { value: StormWind._STREAK_LENGTH },
                    uIntensity: { value: 0 },
                    uColor: { value: new Color(StormWind._COLOR) },
                },
            ]),
            vertexShader: `
                attribute float aSeed;
                attribute float aTail;

                uniform float uTime;
                uniform float uRadius;
                uniform vec3 uWind;
                uniform float uLength;

                varying float vTail;

                #include <fog_pars_vertex>

                void main() {
                    float speedFactor = 0.6 + 0.8 * aSeed;
                    vec3 drift = uWind * uTime * speedFactor;

                    vec3 boxSize = vec3(uRadius * 2.0);
                    vec3 worldPos = mod(position + drift - cameraPosition + uRadius, boxSize) - uRadius + cameraPosition;

                    vec3 windDir = normalize(uWind + vec3(1e-5));
                    worldPos -= windDir * aTail * uLength * (0.7 + 0.6 * aSeed);

                    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    vTail = aTail;

                    #include <fog_vertex>
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uIntensity;

                varying float vTail;

                #include <fog_pars_fragment>

                void main() {
                    float alpha = (1.0 - vTail) * uIntensity;
                    if (alpha < 0.01) discard;
                    gl_FragColor = vec4(uColor, alpha);

                    #include <fog_fragment>
                }
            `,
        });
    }

    private _generateLines(): void {
        this._lines = new LineSegments(this._geometry, this._material);
        this._lines.frustumCulled = false;
        this.add(this._lines);
    }

    public override update(dt: number): void {
        super.update(dt);
        this._material.uniforms.uTime.value += dt;

        const k = 1 - Math.exp(-StormWind._FADE_RATE * dt);
        this._intensity = MathUtils.lerp(this._intensity, this._targetIntensity, k);
        this._material.uniforms.uIntensity.value = this._intensity;

        if (this._targetIntensity === 0 && this._intensity < 0.002) {
            this._intensity = 0;
            this.visible = false;
        }
    }

    public override reset(): void { }
}

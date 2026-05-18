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

export default class StormWind extends ThreeActorBase {
    private static readonly _MAX_COUNT: number = 10000;
    private static readonly _RADIUS: number = 18;
    private static readonly _STREAK_LENGTH: number = 0.6;
    private static readonly _THICKNESS: number = 0.05;
    private static readonly _COLOR: string = "#dccab8";
    private static readonly _WIND: readonly [number, number, number] = [12, -1.5, 0];
    private static readonly _FADE_RATE: number = 1.8;

    private declare _geometry: BufferGeometry;
    private declare _material: ShaderMaterial;
    private declare _mesh: Mesh;

    private _count: number = 0;
    private _targetIntensity: number = 0;
    private _intensity: number = 0;

    constructor() {
        super();
        this._generateGeometry();
        this._generateMaterial();
        this._generateMesh();
        this.visible = false;
    }

    public setCount(count: number): void {
        const clamped = Math.max(0, Math.min(Math.floor(count), StormWind._MAX_COUNT));
        if (clamped === this._count) return;
        this._count = clamped;
        this._geometry.setDrawRange(0, this._count * 6);
        this._targetIntensity = this._count > 0 ? 1 : 0;
        if (this._count > 0) this.visible = true;
    }

    public get count(): number {
        return this._count;
    }

    private _generateGeometry(): void {
        const count = StormWind._MAX_COUNT;
        const positions = new Float32Array(count * 4 * 3);
        const seeds = new Float32Array(count * 4);
        const tails = new Float32Array(count * 4);
        const sides = new Float32Array(count * 4);
        const indices = new Uint32Array(count * 6);

        const size = StormWind._RADIUS * 2;
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * size;
            const y = (Math.random() - 0.5) * size;
            const z = (Math.random() - 0.5) * size;
            const seed = Math.random();

            for (let v = 0; v < 4; v++) {
                positions[(i * 4 + v) * 3 + 0] = x;
                positions[(i * 4 + v) * 3 + 1] = y;
                positions[(i * 4 + v) * 3 + 2] = z;
                seeds[i * 4 + v] = seed;
            }

            tails[i * 4 + 0] = 0; sides[i * 4 + 0] = -1;
            tails[i * 4 + 1] = 1; sides[i * 4 + 1] = -1;
            tails[i * 4 + 2] = 1; sides[i * 4 + 2] = 1;
            tails[i * 4 + 3] = 0; sides[i * 4 + 3] = 1;

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
        this._geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
        this._geometry.setAttribute("aTail", new BufferAttribute(tails, 1));
        this._geometry.setAttribute("aSide", new BufferAttribute(sides, 1));
        this._geometry.setIndex(new BufferAttribute(indices, 1));
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
                    uThickness: { value: StormWind._THICKNESS },
                    uIntensity: { value: 0 },
                    uColor: { value: new Color(StormWind._COLOR) },
                },
            ]),
            vertexShader: `
                attribute float aSeed;
                attribute float aTail;
                attribute float aSide;

                uniform float uTime;
                uniform float uRadius;
                uniform vec3 uWind;
                uniform float uLength;
                uniform float uThickness;

                varying float vTail;
                varying float vSide;

                #include <fog_pars_vertex>

                void main() {
                    float speedFactor = 0.6 + 0.8 * aSeed;
                    vec3 drift = uWind * uTime * speedFactor;

                    vec3 boxSize = vec3(uRadius * 2.0);
                    vec3 worldPos = mod(position + drift - cameraPosition + uRadius, boxSize) - uRadius + cameraPosition;

                    vec3 windDir = normalize(uWind + vec3(1e-5));
                    worldPos -= windDir * aTail * uLength * (0.7 + 0.6 * aSeed);

                    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);

                    vec3 windView = normalize((viewMatrix * vec4(uWind, 0.0)).xyz);
                    vec3 perp = cross(windView, vec3(0.0, 0.0, 1.0));
                    float perpLen = length(perp);
                    perp = perpLen > 1e-4 ? perp / perpLen : vec3(1.0, 0.0, 0.0);
                    mvPosition.xyz += perp * aSide * uThickness * 0.5;

                    gl_Position = projectionMatrix * mvPosition;

                    vTail = aTail;
                    vSide = aSide;

                    #include <fog_vertex>
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uIntensity;

                varying float vTail;
                varying float vSide;

                #include <fog_pars_fragment>

                void main() {
                    float edge = 1.0 - abs(vSide);
                    float alpha = (1.0 - vTail) * edge * uIntensity;
                    if (alpha < 0.01) discard;
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

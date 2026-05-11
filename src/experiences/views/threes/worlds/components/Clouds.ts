import {
    BufferAttribute,
    BufferGeometry,
    Color,
    MathUtils,
    Mesh,
    ShaderMaterial,
    UniformsLib,
    UniformsUtils,
    Vector2,
} from "three";
import { DebugGuiTitle } from "../../../../constants/experiences/DebugGuiTitle";
import { THREE_WORLD_CONFIG } from "../../../../constants/experiences/ThreeWorldConfig";
import DebugManager from "../../../../managers/DebugManager";
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
    private static readonly _DEBUG_INIT_KEY: string = "__cloudsDebugInit";

    private declare _geometry: BufferGeometry;
    private declare _material: ShaderMaterial;
    private declare _mesh: Mesh;

    private _targetIntensity: number = 0;
    private _intensity: number = 0;

    private readonly _settings = { ...THREE_WORLD_CONFIG.clouds };

    constructor() {
        super();
        this._generateGeometry();
        this._generateMaterial();
        this._generateMesh();
        this.visible = false;
        this._initDebug();
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

    public setEdgeFade(start: number, end: number): void {
        const s = Math.max(0, Math.min(start, 1));
        const e = Math.max(s + 1e-4, Math.min(end, 1));
        this._settings.edgeFadeStart = s;
        this._settings.edgeFadeEnd = e;
        this._material.uniforms.uEdgeFade.value.set(s, e);
    }

    public setGroundFade(start: number, end: number): void {
        const e = Math.max(start + 1e-4, end);
        this._settings.groundFadeStart = start;
        this._settings.groundFadeEnd = e;
        this._material.uniforms.uGroundFade.value.set(start, e);
    }

    public setGroundFadeJitter(amount: number): void {
        const v = Math.max(0, amount);
        this._settings.groundFadeJitter = v;
        this._material.uniforms.uGroundFadeJitter.value = v;
    }

    public setEdgeSizeShrink(amount: number): void {
        const v = Math.max(0, Math.min(amount, 1));
        this._settings.edgeSizeShrink = v;
        this._material.uniforms.uEdgeSizeShrink.value = v;
    }

    public setNearFade(min: number, max: number): void {
        const m = Math.max(0, min);
        const mx = Math.max(m + 1e-4, max);
        this._settings.nearFadeMin = m;
        this._settings.nearFadeMax = mx;
        this._material.uniforms.uNearFade.value.set(m, mx);
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
                    uEdgeFade: { value: new Vector2(this._settings.edgeFadeStart, this._settings.edgeFadeEnd) },
                    uGroundFade: { value: new Vector2(this._settings.groundFadeStart, this._settings.groundFadeEnd) },
                    uGroundFadeJitter: { value: this._settings.groundFadeJitter },
                    uEdgeSizeShrink: { value: this._settings.edgeSizeShrink },
                    uNearFade: { value: new Vector2(this._settings.nearFadeMin, this._settings.nearFadeMax) },
                },
            ]),
            vertexShader: `
                attribute vec2 aCorner;
                attribute float aSize;
                attribute float aSeed;

                uniform float uTime;
                uniform vec3 uDrift;
                uniform float uRadius;
                uniform vec2 uEdgeFade;
                uniform vec2 uGroundFade;
                uniform float uGroundFadeJitter;
                uniform float uEdgeSizeShrink;
                uniform vec2 uNearFade;

                varying vec2 vUv;
                varying float vSeed;
                varying float vFade;

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

                    vec2 toCam = abs(wrappedPos.xz - cameraPosition.xz);
                    float boxDist = max(toCam.x, toCam.y);
                    float edgeFade = 1.0 - smoothstep(uRadius * uEdgeFade.x, uRadius * uEdgeFade.y, boxDist);

                    float radialDist = length(wrappedPos.xz - cameraPosition.xz);
                    float nearFade = smoothstep(uNearFade.x, uNearFade.y, radialDist);

                    float sizeFactor = mix(uEdgeSizeShrink, 1.0, edgeFade);
                    float scaledSize = aSize * sizeFactor;

                    vec4 mvPosition = modelViewMatrix * vec4(wrappedPos, 1.0);
                    mvPosition.xy += aCorner * scaledSize;

                    vec3 camUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
                    float worldY = wrappedPos.y + aCorner.y * scaledSize * camUp.y;
                    float jitter = (aSeed - 0.5) * uGroundFadeJitter;
                    float groundFade = smoothstep(uGroundFade.x + jitter, uGroundFade.y + jitter, worldY);

                    vFade = edgeFade * groundFade * nearFade;

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
                varying float vFade;

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

                    float alpha = density * uIntensity * vFade;
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

    private _initDebug(): void {
        if (!DebugManager.isActive) return;

        const viewsFolder = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS);
        const anyFolder = viewsFolder as unknown as Record<string, unknown>;
        if (anyFolder[Clouds._DEBUG_INIT_KEY]) return;
        anyFolder[Clouds._DEBUG_INIT_KEY] = true;

        const folder = viewsFolder.addFolder("Clouds");

        type Ctrl = ReturnType<typeof folder.add>;
        const controllers: Partial<Record<keyof typeof THREE_WORLD_CONFIG.clouds, Ctrl>> = {};

        controllers.edgeFadeStart = folder
            .add(this._settings, "edgeFadeStart", 0, 1, 0.01)
            .name("edge fade start")
            .onChange(() => this.setEdgeFade(this._settings.edgeFadeStart, this._settings.edgeFadeEnd));

        controllers.edgeFadeEnd = folder
            .add(this._settings, "edgeFadeEnd", 0, 1, 0.01)
            .name("edge fade end")
            .onChange(() => this.setEdgeFade(this._settings.edgeFadeStart, this._settings.edgeFadeEnd));

        controllers.edgeSizeShrink = folder
            .add(this._settings, "edgeSizeShrink", 0, 1, 0.01)
            .name("edge size shrink")
            .onChange((v: number) => this.setEdgeSizeShrink(v));

        controllers.groundFadeStart = folder
            .add(this._settings, "groundFadeStart", -4, 6, 0.05)
            .name("ground fade start")
            .onChange(() => this.setGroundFade(this._settings.groundFadeStart, this._settings.groundFadeEnd));

        controllers.groundFadeEnd = folder
            .add(this._settings, "groundFadeEnd", -4, 10, 0.05)
            .name("ground fade end")
            .onChange(() => this.setGroundFade(this._settings.groundFadeStart, this._settings.groundFadeEnd));

        controllers.groundFadeJitter = folder
            .add(this._settings, "groundFadeJitter", 0, 4, 0.05)
            .name("ground fade jitter")
            .onChange((v: number) => this.setGroundFadeJitter(v));

        controllers.nearFadeMin = folder
            .add(this._settings, "nearFadeMin", 0, 20, 0.1)
            .name("near fade min")
            .onChange(() => this.setNearFade(this._settings.nearFadeMin, this._settings.nearFadeMax));

        controllers.nearFadeMax = folder
            .add(this._settings, "nearFadeMax", 0, 20, 0.1)
            .name("near fade max")
            .onChange(() => this.setNearFade(this._settings.nearFadeMin, this._settings.nearFadeMax));

        for (const key of Object.keys(THREE_WORLD_CONFIG.clouds) as (keyof typeof THREE_WORLD_CONFIG.clouds)[]) {
            DebugManager.registerConfigGetter(`clouds.${key}`, () => this._settings[key]);
            const ctrl = controllers[key];
            if (ctrl) {
                DebugManager.registerConfigSetter(`clouds.${key}`, (v) => ctrl.setValue(v));
            }
        }
    }
}

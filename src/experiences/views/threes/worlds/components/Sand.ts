import { DomResizeManager } from "@benjos/cookware";
import { BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial, UniformsLib, UniformsUtils } from "three";
import { THREE_WORLD_CONFIG } from "../../../../constants/experiences/ThreeWorldConfig";
import ThreeActorBase from "../../bases/components/ThreeActorBase";

export default class Sand extends ThreeActorBase {
    private static readonly _COUNT: number = 10000;
    private static readonly _RADIUS: number = 20;
    private static readonly _POINT_SIZE: number = 0.02;
    private static readonly _SPEED: number = 0.5;

    declare private _geometry: BufferGeometry;
    declare private _material: ShaderMaterial;
    declare private _points: Points;

    constructor() {
        super();
        this._generateGeometry();
        this._generateMaterial();
        this._generatePoints();

        DomResizeManager.onResize.add(this._onResize);
    }

    private _generateGeometry(): void {
        const positions = new Float32Array(Sand._COUNT * 3);
        const random = new Float32Array(Sand._COUNT);
        const sizes = new Float32Array(Sand._COUNT);

        const size = Sand._RADIUS * 2;
        for (let i = 0; i < Sand._COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * size;
            positions[i * 3 + 1] = (Math.random() - 0.5) * size;
            positions[i * 3 + 2] = (Math.random() - 0.5) * size;

            random[i] = Math.random();
            sizes[i] = 0.2 + Math.pow(Math.random(), 3.0) * 5.0;
        }

        this._geometry = new BufferGeometry();
        this._geometry.setAttribute("position", new BufferAttribute(positions, 3));
        this._geometry.setAttribute("aRandom", new BufferAttribute(random, 1));
        this._geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
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
                    uSize: { value: Sand._POINT_SIZE },
                    uScale: { value: Sand._computeScale() },
                    uRadius: { value: Sand._RADIUS },
                    uSpeed: { value: Sand._SPEED },
                    uWind: { value: [0.5, 0.0, 0.0] },
                    uColor: { value: new Color(THREE_WORLD_CONFIG.dunes.color) },
                },
            ]),
            vertexShader: `
                attribute float aRandom;
                attribute float aSize;

                uniform float uTime;
                uniform float uSize;
                uniform float uScale;
                uniform float uRadius;
                uniform float uSpeed;
                uniform vec3 uWind;

                varying float vRandom;

                #include <fog_pars_vertex>

                void main() {
                    float phase = aRandom * 6.2831853;
                    vec3 drift = uWind * uTime + vec3(
                        cos(uTime * 0.4 + phase) * 0.1,
                        sin(uTime * 0.6 + phase) * 0.15,
                        sin(uTime * 0.5 + phase) * 0.1
                    ) * uSpeed * (1.0 - aRandom);

                    vec3 boxSize = vec3(uRadius * 2.0);
                    vec3 worldPos = mod(position + drift - cameraPosition + uRadius, boxSize) - uRadius + cameraPosition;

                    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    gl_PointSize = uSize * aSize * (uScale / -mvPosition.z);

                    vRandom = aRandom;

                    #include <fog_vertex>
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;

                varying float vRandom;

                #include <fog_pars_fragment>

                void main() {
                    vec2 uv = gl_PointCoord - vec2(0.5);
                    float dist = length(uv);
                    if (dist > 0.5) discard;

                    float falloff = 1.0 - dist * 2.0;
                    float alpha = falloff * falloff;

                    vec3 color = uColor * (0.7 + 0.3 * vRandom);

                    gl_FragColor = vec4(color, alpha);

                    #include <fog_fragment>
                }
            `,
        });
    }

    private _generatePoints(): void {
        this._points = new Points(this._geometry, this._material);
        this._points.frustumCulled = false;
        this.add(this._points);
    }

    public override reset(): void {
        //
    }

    public update(dt: number): void {
        super.update(dt);

        this._material.uniforms.uTime.value += dt;
    }

    public override dispose(): void {
        DomResizeManager.onResize.remove(this._onResize);
        super.dispose();
    }

    private static _computeScale(): number {
        return DomResizeManager.height * DomResizeManager.pixelRatio * 0.5;
    }

    private readonly _onResize = (): void => {
        this._material.uniforms.uScale.value = Sand._computeScale();
    };
}
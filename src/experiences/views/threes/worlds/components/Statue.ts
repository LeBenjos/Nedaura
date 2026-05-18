import {
    CanvasTexture,
    ClampToEdgeWrapping,
    DoubleSide,
    Mesh,
    MeshStandardMaterial,
    NoColorSpace,
    Vector3,
    type WebGLProgramParametersWithUniforms,
} from "three";
import { AssetId } from "../../../../constants/experiences/AssetId";
import { Object3DId } from "../../../../constants/experiences/Object3dId";
import ThreeModelBase from "../../bases/components/ThreeModelBase";
import ThreeAssetsManager from '../../../../managers/threes/ThreeAssetsManager';
import TimelineExperienceManager from "../../../../managers/TimelineExperienceManager";
import { TimelineExperienceState } from "../../../../constants/experiences/TimelineExperienceState";
import ThreeCameraControllerManager from "../../../../managers/threes/ThreeCameraControllerManager";
import MainThreeCameraController from "../../../../cameras/threes/MainThreeCameraController";
import { CameraId } from "../../../../constants/experiences/CameraId";

export interface HitMaskPainter {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    texture: CanvasTexture;
    size: number;
    paint: (uvX: number, uvY: number, radius?: number) => void;
    reset: () => void;
}

export default class Statue extends ThreeModelBase {
    private static readonly _HIT_MASK_SIZE = 1024;

    private readonly _hitMaskCanvas: HTMLCanvasElement;
    private readonly _hitMaskCtx: CanvasRenderingContext2D;
    private readonly _hitMaskTexture: CanvasTexture;

    private readonly _activeShaders = new Set<WebGLProgramParametersWithUniforms>();

    private _textureDirty = false;
    private _canInteract = false;

    // tracking seuil peinture statue pour next phase 
    private _paintedPixels: number = 0;
    private static readonly _MAX_PAINTED_PIXELS = Statue._HIT_MASK_SIZE * Statue._HIT_MASK_SIZE * 0.7; // 70% du canvas

    private _camera = this._getCamera();
    private _initialCameraPosition: Vector3 | null = null;

    constructor() {
        super(AssetId.THREE_GLTF_DUNES, {
            object3DId: Object3DId.STATUE,
            castShadow: true,
            receiveShadow: true,
        });

        this._hitMaskCanvas = document.createElement("canvas");
        this._hitMaskCanvas.width = Statue._HIT_MASK_SIZE;
        this._hitMaskCanvas.height = Statue._HIT_MASK_SIZE;

        const ctx = this._hitMaskCanvas.getContext("2d");
        if (!ctx) throw new Error("[Statue] Impossible d'obtenir le contexte 2D du hitMask canvas");
        this._hitMaskCtx = ctx;

        this._hitMaskTexture = new CanvasTexture(this._hitMaskCanvas);

        this._clearCanvas();
        this._setupMaterials();
        this._exposePainter();
    }

    public init(): void {
        super.init();
        TimelineExperienceManager.onEnterInteract1.add(this._updateInteractiveState, this);
        TimelineExperienceManager.onLeaveInteract1.add(this._updateInteractiveState, this);
    }

    private _getCamera(): MainThreeCameraController {
        return ThreeCameraControllerManager.get(CameraId.THREE_MAIN) as MainThreeCameraController;
    }   

    private _clearCanvas(): void {
        this._hitMaskCtx.fillStyle = "black";
        this._hitMaskCtx.fillRect(0, 0, Statue._HIT_MASK_SIZE, Statue._HIT_MASK_SIZE);
    }

    private _setupMaterials(): void {
        const normalMap = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_STATUE_BASE_NORMAL);
        const textureMat = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_STATUE_BASE_TEXTURE);
        const normalErodedWindMat = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_STATUE_ERODED_WIND_NORMAL);
        const textureErodedWindMat = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_STATUE_ERODED_WIND_TEXTURE);

        textureMat.wrapS = ClampToEdgeWrapping;
        textureMat.wrapT = ClampToEdgeWrapping;
        textureErodedWindMat.wrapS = ClampToEdgeWrapping;
        textureErodedWindMat.wrapT = ClampToEdgeWrapping;

        textureMat.flipY = false;
        normalMap.flipY = false;
        textureErodedWindMat.flipY = false;
        normalErodedWindMat.flipY = false;

        normalMap.colorSpace = NoColorSpace;
        normalErodedWindMat.colorSpace = NoColorSpace;

        this._model.traverse((child) => {
            if (!(child instanceof Mesh)) return;

            // Génère les tangentes si absentes (nécessaire pour tbn)
            if (!child.geometry.attributes.tangent) {
                child.geometry.computeTangents();
            }

            const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

            for (const material of materials) {
                if (!(material instanceof MeshStandardMaterial)) continue;

                if (!child.geometry.attributes.uv) {
                    console.warn(`[Statue] Mesh "${child.name}" sans UVs, shader patch ignoré`);
                    continue;
                }

                // Assigne la normalMap de base pour que Three.js génère NORMALMAP_UV et tbn
                material.normalMap = normalMap;
                material.normalMap.colorSpace = NoColorSpace;

                material.side = DoubleSide;

                material.defines = {
                    ...(material.defines ?? {}),
                    USE_UV: '',
                    USE_TANGENT: '',
                };

                material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
                    // Uniforms
                    shader.uniforms.uHitMask            = { value: this._hitMaskTexture };
                    shader.uniforms.uBaseTexture         = { value: textureMat };
                    shader.uniforms.uErodedTexture       = { value: textureErodedWindMat };
                    shader.uniforms.uBaseNormal          = { value: normalMap };
                    shader.uniforms.uErodedNormal        = { value: normalErodedWindMat };
                    shader.uniforms.uDisplacementStrength = { value: 0.5 };
                    shader.uniforms.canInteract = { value: this._canInteract };

                    this._activeShaders.add(shader);

                    // -------------------------
                    // VERTEX SHADER — displacement GPU
                    // -------------------------
                    shader.vertexShader = `
                        uniform sampler2D uHitMask;
                        uniform float     uDisplacementStrength;
                        uniform bool      canInteract;
                    ` + shader.vertexShader;

                    shader.vertexShader = shader.vertexShader.replace(
                        `#include <displacementmap_vertex>`,
                        `
                        #ifdef USE_DISPLACEMENTMAP
                            transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
                        #endif

                        // Displacement GPU selon le hitMask
                        vec2  maskUv   = uv;
                        float hitD     = texture2D( uHitMask, maskUv ).r;

                        // Bruit organique Value Noise
                        vec2  nUv      = maskUv * 6.0;
                        vec2  nI       = floor( nUv );
                        vec2  nF       = fract( nUv );
                        vec2  nU       = nF * nF * ( 3.0 - 2.0 * nF );
                        float na       = fract( sin( dot( nI,             vec2(127.1, 311.7) ) ) * 43758.5453 );
                        float nb       = fract( sin( dot( nI + vec2(1,0), vec2(127.1, 311.7) ) ) * 43758.5453 );
                        float nc       = fract( sin( dot( nI + vec2(0,1), vec2(127.1, 311.7) ) ) * 43758.5453 );
                        float nd       = fract( sin( dot( nI + vec2(1,1), vec2(127.1, 311.7) ) ) * 43758.5453 );
                        float noiseVal = mix( mix(na,nb,nU.x), mix(nc,nd,nU.x), nU.y );

                        // Déplace le long de la normale, modulé par le mask et le bruit
                        transformed   -= objectNormal * hitD * noiseVal * uDisplacementStrength * (canInteract ? 1.0 : 0.0);
                        `
                    );

                    // -------------------------
                    // FRAGMENT SHADER
                    // -------------------------
                    shader.fragmentShader = `
                        uniform sampler2D uHitMask;
                        uniform sampler2D uBaseTexture;
                        uniform sampler2D uErodedTexture;
                        uniform sampler2D uBaseNormal;
                        uniform sampler2D uErodedNormal;
                        uniform bool      canInteract;
                    ` + shader.fragmentShader;

                    // Blend des textures diffuse
                    shader.fragmentShader = shader.fragmentShader.replace(
                        `#include <map_fragment>`,
                        `
                        #ifdef USE_MAP
                            vec4 texelColor = texture2D( map, vMapUv );
                        #else
                            vec4 texelColor = vec4( 1.0 );
                        #endif

                        float hitStrength = texture2D( uHitMask,      vUv ).r;
                        vec4  baseColor   = texture2D( uBaseTexture,   vUv );
                        vec4  erodedColor = texture2D( uErodedTexture, vUv );
                        
                        baseColor.rgb   = pow( baseColor.rgb, vec3( 0.4 ) );
                        erodedColor.rgb   = pow( erodedColor.rgb, vec3( 3.0 ) );

                        float mask        = clamp( hitStrength, 0.0, 1.0 );
                        diffuseColor *= canInteract ? mix( baseColor, erodedColor, mask ) : baseColor;
                        `
                    );

                    // Blend des normal maps
                    shader.fragmentShader = shader.fragmentShader.replace(
                        `#include <normal_fragment_maps>`,
                        `
                        #ifdef USE_NORMALMAP
                            float maskN        = clamp( texture2D( uHitMask, vUv ).r, 0.0, 1.0 );

                            vec3 normalBase    = texture2D( uBaseNormal,   vUv ).xyz * 2.0 - 1.0;
                            vec3 normalEroded  = texture2D( uErodedNormal, vUv ).xyz * 2.0 - 1.0;

                            vec3 blendedNormal = normalize( mix( normalBase, normalEroded, maskN ) );
                            normal = normalize( tbn * (canInteract ? blendedNormal : normalBase) );
                        #endif
                        `
                    );

                    material.needsUpdate = true;
                };
            }
        });
    }

    private _updateInteractiveState = (): void => {
        this._canInteract = TimelineExperienceManager.state === TimelineExperienceState.INTERACT_1;

        if (this._canInteract) {
            this._camera.saveSpherical();
        }

        for (const shader of this._activeShaders) {
            shader.uniforms.canInteract.value = this._canInteract;
        }
    }

    private _exposePainter(): void {
        const painter: HitMaskPainter = {
            canvas: this._hitMaskCanvas,
            ctx: this._hitMaskCtx,
            texture: this._hitMaskTexture,
            size: Statue._HIT_MASK_SIZE,
            paint: (uvX, uvY, radius) => this._paint(uvX, uvY, radius),
            reset: () => this.reset(),
        };

        this._model.userData.hitMaskPainter = painter;
        this._model.traverse((obj) => {
            obj.userData.hitMaskPainter = painter;
        });
    }

    private _paint(uvX: number, uvY: number, radius = 30): void {
        // si nous ne sommes pas en interaction, on n'affiche pas les effets de peinture
        if (!this._canInteract) return;
        if (this._paintedPixels >= Statue._MAX_PAINTED_PIXELS) return;
        
        const { _hitMaskCtx: ctx } = this;
        const size = Statue._HIT_MASK_SIZE;

        const x = Math.max(0, Math.min(size, uvX * size));
        const y = Math.max(0, Math.min(size, (1 - uvY) * size));
        const clampedRadius = Math.max(1, radius);

        const grd = ctx.createRadialGradient(x, y, 0, x, y, clampedRadius);
        grd.addColorStop(0, "rgba(255,255,255,0.12)");
        grd.addColorStop(1, "rgba(255,255,255,0.0)");

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, clampedRadius, 0, Math.PI * 2);
        ctx.fill();

        this._textureDirty = true;

        this._paintedPixels += Math.PI * radius * radius;
        this._textureDirty = true;

        // Dispatch de l'event de mise à jour de la jauge
        const percentage = Math.min(1, this._paintedPixels / Statue._MAX_PAINTED_PIXELS);
        this._updateJaugeInteraction(percentage);

        if (this._paintedPixels >= Statue._MAX_PAINTED_PIXELS) {
            this.launchNextPhase();
        }
    }

    _updateJaugeInteraction(percentage: number): void {
        // ici on fait dispatch un event custom pour que le composant Vue de la jauge puisse écouter et mettre à jour son affichage en conséquence
        const event = new CustomEvent('jauge:update', { detail: { percentage } });
        window.dispatchEvent(event);
    }

    private launchNextPhase(): void {
        this._camera.restoreSpherical(3); // retour a la position de base
        TimelineExperienceManager.setState(TimelineExperienceState.VERSE_2);
    }

    public override reset(): void {
        this._clearCanvas();
        this._hitMaskTexture.needsUpdate = true;
        this._textureDirty = false;
        this._paintedPixels = 0;

        for (const shader of this._activeShaders) {
            shader.uniforms.uHitMask.value = this._hitMaskTexture;
        }
    }

    public override update(dt: number): void {
        super.update(dt);

        if (this._textureDirty) {
            this._hitMaskTexture.needsUpdate = true;
            this._textureDirty = false;
        }
    }
}
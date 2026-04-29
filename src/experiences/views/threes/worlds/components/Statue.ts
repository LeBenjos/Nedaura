import {
    CanvasTexture,
    Mesh,
    MeshStandardMaterial,
    type WebGLProgramParametersWithUniforms,
} from "three";
import { AssetId } from "../../../../constants/experiences/AssetId";
import { Object3DId } from "../../../../constants/experiences/Object3dId";
import ThreeModelBase from "../../bases/components/ThreeModelBase";
import ThreeAssetsManager from '../../../../managers/threes/ThreeAssetsManager';

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

    private _clearCanvas(): void {
        this._hitMaskCtx.fillStyle = "black";
        this._hitMaskCtx.fillRect(0, 0, Statue._HIT_MASK_SIZE, Statue._HIT_MASK_SIZE);
    }

    private _setupMaterials(): void {
        const normalMat = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_TEMPLATE);

        this._model.traverse((child) => {
            if (!(child instanceof Mesh)) return;

            const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

            for (const material of materials) {
                if (!(material instanceof MeshStandardMaterial)) continue;
                // Force UV support so the shader has access to vUv.
                material.defines = { ...(material.defines ?? {}), USE_UV: '' };
                material.needsUpdate = true;

                // Vérifie que le mesh a bien des UVs avant de patcher le shader
                if (!child.geometry.attributes.uv) {
                    console.warn(`[Statue] Mesh "${child.name}" sans UVs, shader patch ignoré`);
                    continue;
                }

                material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
                    shader.uniforms.uHitMask = { value: this._hitMaskTexture };
                    shader.uniforms.uTexture = { value: normalMat };

                    this._activeShaders.add(shader);

                    shader.fragmentShader = `
                        uniform sampler2D uHitMask;
                        uniform sampler2D uTexture;
                        ${shader.fragmentShader}
                    `.replace(
                        `#include <dithering_fragment>`,
                        `
                        float hitStrength = texture2D(uHitMask, vUv).r;
                        vec4  overlayColor = texture2D(uTexture, vUv);
                        gl_FragColor.rgb = mix(gl_FragColor.rgb, overlayColor.rgb, clamp(hitStrength, 0.0, 1.0));
                        gl_FragColor.a   = mix(gl_FragColor.a,   overlayColor.a,   clamp(hitStrength, 0.0, 1.0));
                        #include <dithering_fragment>
                        `,
                    );
                };

                material.needsUpdate = true;
            }
        });
    }

    private _exposePainter(): void {
        const painter: HitMaskPainter = {
            canvas:  this._hitMaskCanvas,
            ctx:     this._hitMaskCtx,
            texture: this._hitMaskTexture,
            size:    Statue._HIT_MASK_SIZE,
            paint:   (uvX, uvY, radius) => this._paint(uvX, uvY, radius),
            reset:   () => this.reset(),
        };

        this._model.userData.hitMaskPainter = painter;
        this._model.traverse((obj) => {
            obj.userData.hitMaskPainter = painter;
        });
    }

    private _paint(uvX: number, uvY: number, radius = 30): void {
        const { _hitMaskCtx: ctx, _hitMaskCanvas: canvas } = this;
        const size = Statue._HIT_MASK_SIZE;

        // Clamp en coordonnées canvas pour éviter de déborder
        const x = Math.max(0, Math.min(size, uvX * size));
        const y = Math.max(0, Math.min(size, (1 - uvY) * size));
        const clampedRadius = Math.max(1, radius);

        const grd = ctx.createRadialGradient(x, y, 0, x, y, clampedRadius);
        grd.addColorStop(0, "rgba(255,255,255,0.9)");
        grd.addColorStop(1, "rgba(255,255,255,0.0)");

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, clampedRadius, 0, Math.PI * 2);
        ctx.fill();

        // On marque dirty mais on ne touche pas needsUpdate ici
        this._textureDirty = true;
    }

    public override reset(): void {
        this._clearCanvas();
        this._hitMaskTexture.needsUpdate = true;
        this._textureDirty = false;

        // Re-synchronise tous les shaders actifs avec la nouvelle texture
        for (const shader of this._activeShaders) {
            shader.uniforms.uHitMask.value = this._hitMaskTexture;
        }
    }

    public override update(dt: number): void {
        super.update(dt);

        // needsUpdate une seule fois par frame, même si plusieurs paint() ont eu lieu
        if (this._textureDirty) {
            this._hitMaskTexture.needsUpdate = true;
            this._textureDirty = false;
        }
    }
}
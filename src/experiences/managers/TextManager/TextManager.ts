import { DomResizeManager, TickerManager } from '@benjos/cookware';
import gsap from 'gsap';
import * as THREE from 'three';
import type { Controller } from 'lil-gui';
import DebugManager from '../DebugManager';
import { TextId } from '../../constants/experiences/Text/TextId';
import { TEXTS } from '../../constants/experiences/Text/Texts';
import { DebugGuiTitle } from '../../constants/experiences/DebugGuiTitle';

type TextAnchor = 'center' | 'top-left' | 'center-right';

type TextShaderDebugState = {
    enabled: boolean;
    overrideProgress: boolean;
    progress: number;
};

export type TextShowOptions = {
    text: string;
    maxWidthPx: number;
    maxWidthPercent?: number;
    fontFamily: string;
    fontSizePx: number;
    fontWeight: string;
    lineHeightPx: number;
    textAlign: CanvasTextAlign;
    color: string;
    anchor: TextAnchor;
    duration: number;
    ease: string;
    hideDuration: number;
    hideEase: string;
};

type TextInstance = {
    id: TextId;
    text: string;
    options: TextShowOptions;
    xPx: number | null;
    yPx: number | null;
    canvas2d: HTMLCanvasElement;
    ctx2d: CanvasRenderingContext2D;
    texture: THREE.CanvasTexture;
    material: THREE.ShaderMaterial;
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
    widthPx: number;
    heightPx: number;
    isOpen: boolean;
};

class TextManager {
    private _isInitialized = false;
    private _overlayEl: HTMLDivElement | null = null;
    private _canvasEl: HTMLCanvasElement | null = null;

    private _renderer: THREE.WebGLRenderer | null = null;
    private _scene: THREE.Scene | null = null;
    private _camera: THREE.OrthographicCamera | null = null;

    private _time = 0;

    private _texts = new Map<TextId, TextInstance>();

    private _debug: TextShaderDebugState = {
        enabled: false,
        overrideProgress: false,
        progress: 0,
    };

    private _debugControllers: Controller[] = [];

    init() {
        if (this._isInitialized) return;
        this._isInitialized = true;

        this._ensureOverlay();
        this._ensureThree();
        this._resize();
        this._renderOnce();

        this._initDebugGuiIfNeeded();

        requestAnimationFrame(() => this._resize());

        DomResizeManager.onResize.add(this._onResize);
        TickerManager.add(this._onTick);
    }

    private readonly _onResize = (): void => {
        this._resize();
    };

    private readonly _onTick = (dt: number): void => {
        this.update(dt);
    };

    showText(id: TextId, x?: number, y?: number, options?: Partial<TextShowOptions>) {
        this.init();
        if (!this._scene || !this._camera) return;

        const baseText = TEXTS[id] ?? '';
        const merged = this._mergeOptions({ text: baseText }, options);

        const instance = this._texts.get(id);
        if (instance) {
            instance.text = merged.text;
            instance.options = merged;
            this._redraw(instance);
            this._position(instance, x, y);
            this._animateOpen(instance); // _renderOnce() géré par GSAP onUpdate
            return;
        }

        const created = this._createInstance(id, merged);
        this._texts.set(id, created);
        this._scene.add(created.mesh);
        this._position(created, x, y);
        this._animateOpen(created); // _renderOnce() géré par GSAP onUpdate
    }

    hideText(id: TextId) {
        const instance = this._texts.get(id);
        if (!instance) return;
        this._animateClose(instance);
        this._renderOnce();
    }

    toggleText(id: TextId, x?: number, y?: number, options?: Partial<TextShowOptions>) {
        const instance = this._texts.get(id);
        if (instance?.isOpen) this.hideText(id);
        else this.showText(id, x, y, options);
    }

    setText(id: TextId, text: string) {
        const instance = this._texts.get(id);
        if (instance) {
            instance.text = text;
            instance.options = { ...instance.options, text };
            this._redraw(instance);
            return;
        }

        this.showText(id, undefined, undefined, { text });
    }

    disposeText(id: TextId) {
        const instance = this._texts.get(id);
        if (!instance) return;
        this._texts.delete(id);
        this._scene?.remove(instance.mesh);
        instance.mesh.geometry.dispose();
        instance.material.dispose();
        instance.texture.dispose();
    }

    update(dt: number) {
        if (!this._renderer || !this._scene || !this._camera) return;
        this._time += dt;

        for (const instance of this._texts.values()) {
            instance.material.uniforms.uTime.value = this._time;

            if (this._debug.enabled && this._debug.overrideProgress) {
                instance.material.uniforms.uProgress.value = this._debug.progress;
            }
        }

        this._renderer.render(this._scene, this._camera);
    }

    private _getMaxWidthFromPercent(percent: number): number {
        const w = this._canvasEl?.clientWidth ?? window.innerWidth;
        return Math.max(1, Math.floor(w * percent));
    }

    private _initDebugGuiIfNeeded(): void {
        if (!DebugManager.isActive) return;

        // Prevent duplicate controllers if init() is called more than once (hot reload, etc.)
        if (this._debugControllers.length > 0) return;

        this._debug.enabled = true;
        const folder = DebugManager.getGuiFolder(DebugGuiTitle.TEXT).addFolder('Text Reveal');

        const onAnyChange = (): void => {
            this._renderOnce();
        };

        this._debugControllers.push(
            folder.add(this._debug, 'overrideProgress').name('Override progress').onChange(onAnyChange),
        );
        this._debugControllers.push(
            folder.add(this._debug, 'progress', 0, 1, 0.001).name('Progress (0-1)').onChange(() => {
                if (this._debug.overrideProgress) onAnyChange();
            }),
        );

        onAnyChange();
    }

    private _ensureOverlay() {
        if (this._overlayEl && this._canvasEl) return;

        const overlay = document.createElement('div');
        overlay.id = 'text-manager-overlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.display = 'block';
        overlay.style.pointerEvents = 'none';
        // Must stay above the loader (which uses z-index: 999999)
        overlay.style.zIndex = '1000000';

        const canvas = document.createElement('canvas');
        canvas.id = 'text-manager-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        overlay.appendChild(canvas);

        document.body.appendChild(overlay);

        this._overlayEl = overlay;
        this._canvasEl = canvas;

        // Give the browser a frame to compute layout sizes.
        requestAnimationFrame(() => this._resize());
    }

    private _ensureThree() {
        if (!this._canvasEl) return;

        const dpr = this._getDpr();
        this._renderer = new THREE.WebGLRenderer({ canvas: this._canvasEl, alpha: true, antialias: true });
        this._renderer.setPixelRatio(dpr);
        this._renderer.setClearColor(0x000000, 0);
        this._renderer.outputColorSpace = THREE.SRGBColorSpace;

        this._scene = new THREE.Scene();
        this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 10);
        this._camera.position.z = 1;
    }

    private _resize() {
        if (!this._renderer || !this._camera || !this._canvasEl) return;

        const w = this._canvasEl.clientWidth;
        const h = this._canvasEl.clientHeight;

        // If we're called before layout, retry next frame.
        if (w === 0 || h === 0) {
            requestAnimationFrame(() => this._resize());
            return;
        }

        this._renderer.setSize(w, h, false);

        this._camera.left = 0;
        this._camera.right = w;
        this._camera.top = h;
        this._camera.bottom = 0;
        this._camera.updateProjectionMatrix();

        for (const instance of this._texts.values()) {
            this._position(instance);
        }

        this._renderOnce();
    }

    private _renderOnce() {
        if (!this._renderer || !this._scene || !this._camera) return;
        this._renderer.render(this._scene, this._camera);
    }

    private _position(instance: TextInstance, x?: number, y?: number) {
        if (!this._canvasEl) return;

        const w = this._canvasEl.clientWidth;
        const h = this._canvasEl.clientHeight;

        if (typeof x === 'number') instance.xPx = x;
        if (typeof y === 'number') instance.yPx = y;

        const px = instance.xPx ?? w * 0.5;
        const py = instance.yPx ?? h * 0.5;

        if (instance.options.anchor === 'top-left') {
            instance.mesh.position.x = px + instance.widthPx * 0.5;
            instance.mesh.position.y = h - (py + instance.heightPx * 0.5);
        } else if(instance.options.anchor === 'center-right') {
            instance.mesh.position.x = px + instance.widthPx * 0.5;
            instance.mesh.position.y = h - (py + instance.heightPx * 0.5);
        } else {
            instance.mesh.position.x = px;
            instance.mesh.position.y = h - py;
        }
    }

    private _createInstance(id: TextId, options: TextShowOptions): TextInstance {
        const canvas2d = document.createElement('canvas');
        const ctx2d = canvas2d.getContext('2d');
        if (!ctx2d) throw new Error('[TextManager] Could not create 2D context');

        const { widthPx, heightPx } = this._computeTextBounds(ctx2d, options.text, options);
        this._renderToCanvas(canvas2d, ctx2d, options.text, options, widthPx, heightPx);

        const texture = new THREE.CanvasTexture(canvas2d);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;

        const material = this._createMaterial(texture);
        const geo = new THREE.PlaneGeometry(widthPx, heightPx);
        const mesh = new THREE.Mesh(geo, material);
        mesh.position.z = 0;

        const instance: TextInstance = {
            id,
            text: options.text,
            options,
            xPx: null,
            yPx: null,
            canvas2d,
            ctx2d,
            texture,
            material,
            mesh,
            widthPx,
            heightPx,
            isOpen: false,
        };

        return instance;
    }

    private _redraw(instance: TextInstance) {
        const { widthPx, heightPx } = this._computeTextBounds(instance.ctx2d, instance.options.text, instance.options);
        instance.widthPx = widthPx;
        instance.heightPx = heightPx;

        instance.mesh.geometry.dispose();
        instance.mesh.geometry = new THREE.PlaneGeometry(widthPx, heightPx);

        this._renderToCanvas(instance.canvas2d, instance.ctx2d, instance.options.text, instance.options, widthPx, heightPx);
        instance.texture.needsUpdate = true;
    }

    private _renderToCanvas(
        canvas2d: HTMLCanvasElement,
        ctx2d: CanvasRenderingContext2D,
        text: string,
        options: TextShowOptions,
        widthPx: number,
        heightPx: number,
    ) {
        const dpr = this._getDpr();

        canvas2d.width = Math.max(1, Math.floor(widthPx * dpr));
        canvas2d.height = Math.max(1, Math.floor(heightPx * dpr));
        canvas2d.style.width = `${widthPx}px`;
        canvas2d.style.height = `${heightPx}px`;

        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2d.clearRect(0, 0, widthPx, heightPx);

        ctx2d.font = `${options.fontWeight} ${options.fontSizePx}px ${options.fontFamily}`;
        ctx2d.fillStyle = options.color;
        ctx2d.textBaseline = 'top';

        const lines = this._wrapText(ctx2d, text, options.maxWidthPx);
        const y0 = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const metrics = ctx2d.measureText(line);
            const lineWidth = metrics.width;

            let x = 0;
            if (options.textAlign === 'center') x = (widthPx - lineWidth) * 0.5;
            else if (options.textAlign === 'right' || options.textAlign === 'end') x = widthPx - lineWidth;
            else x = 0;

            const y = y0 + i * options.lineHeightPx;
            ctx2d.fillText(line, x, y);
        }
    }

    private _computeTextBounds(ctx2d: CanvasRenderingContext2D, text: string, options: TextShowOptions) {
        ctx2d.font = `${options.fontWeight} ${options.fontSizePx}px ${options.fontFamily}`;
        ctx2d.textBaseline = 'top';

        const lines = this._wrapText(ctx2d, text, options.maxWidthPx);
        const widthPx = Math.max(1, Math.ceil(options.maxWidthPx));
        const heightPx = Math.max(1, Math.ceil(lines.length * options.lineHeightPx));
        return { widthPx, heightPx };
    }

    private _wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
        const lines: string[] = [];

        // On découpe d'abord sur les \n explicites
        for (const paragraph of text.split('\n')) {
            const normalized = paragraph.replace(/\s+/g, ' ').trim();
            if (!normalized) {
                lines.push(''); // ligne vide intentionnelle
                continue;
            }

            const words = normalized.split(' ');
            let line = '';

            for (const word of words) {
                const testLine = line ? `${line} ${word}` : word;
                if (ctx.measureText(testLine).width > maxWidth && line) {
                    lines.push(line);
                    line = word;
                } else {
                    line = testLine;
                }
            }

            if (line) lines.push(line);
        }

        return lines.length ? lines : [''];
    }

    private _createMaterial(texture: THREE.Texture) {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false,
            uniforms: {
                uTexture: { value: texture },
                uProgress: { value: 0.0 },
                uTime: { value: 0.0 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uTexture;
                uniform float uProgress;
                uniform float uTime;
                varying vec2 vUv;

                float random (in vec2 st) {
                    return fract(sin(dot(st.xy,
                        vec2(12.9898,78.233)))*
                        43758.5453123);
                }

                // Based on Morgan McGuire @morgan3d
                // https://www.shadertoy.com/view/4dS3Wd
                float noise (in vec2 st) {
                    vec2 i = floor(st);
                    vec2 f = fract(st);

                    // Four corners in 2D of a tile
                    float a = random(i);
                    float b = random(i + vec2(1.0, 0.0));
                    float c = random(i + vec2(0.0, 1.0));
                    float d = random(i + vec2(1.0, 1.0));

                    vec2 u = f * f * (3.0 - 2.0 * f);

                    return mix(a, b, u.x) +
                            (c - a)* u.y * (1.0 - u.x) +
                            (d - b) * u.x * u.y;
                }

                #define OCTAVES 10
                float fbm (in vec2 st) {
                    // Initial values
                    float value = 0.0;
                    float amplitude = .5;
                    float frequency = 0.;
                    //
                    // Loop of octaves
                    for (int i = 0; i < OCTAVES; i++) {
                        value += amplitude * noise(st);
                        st *= 2.;
                        amplitude *= .5;
                    }
                    return value;
                }

                // Deux fonctions fbm distinctes avec des paramètres différents
                // pour créer des fréquences contrastées
                float fbmBase(in vec2 st) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    for (int i = 0; i < 6; i++) {
                        value += amplitude * noise(st);
                        st *= 2.1;         // légère asymétrie évite les artefacts de répétition
                        amplitude *= 0.5;
                    }
                    return value;
                }

                float fbmFine(in vec2 st) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    for (int i = 0; i < 8; i++) {
                        value += amplitude * noise(st);
                        st *= 4.0;         // fréquence plus haute → grain plus serré
                        amplitude *= 0.45; // persistance plus faible → grain plus "sec"
                    }
                    return value;
                }

                void main() {
                    vec2 uv = vUv;

                    // Couche 1 : structure de base
                    vec2 q = vec2(
                        fbmBase(uv * 5.0 + uTime * 0.3),
                        fbmBase(uv * 5.0 + vec2(1.7, 9.2) + uTime * 0.3)
                    );

                    // Couche 2 : grain fin alimenté par q (domain warping)
                    vec2 r = vec2(
                        fbmFine(uv * 12.0 + 4.0 * q + uTime * 0.15),
                        fbmFine(uv * 12.0 + 4.0 * q + vec2(8.3, 2.8) + uTime * 0.15)
                    );

                    // Couche 3 : valeur finale, fbm de r (grain ultra-fin, effet sable)
                    float n = fbmBase(uv * 20.0 + 5.0 * r);

                    // displacement
                    float dispStrength = 0.1;
                    float displacement = n * dispStrength * (1.0 - uProgress);
                    uv.x -= displacement;
                    uv.y -= displacement;

                    vec4 texColor = texture2D(uTexture, uv);

                    // reveal
                    float threshold = clamp(uProgress, 0.0, 1.0);
                    float reveal = smoothstep(threshold - 0.1, threshold + 0.1, n);

                    texColor.a *= 1.0 - reveal;
                    gl_FragColor = texColor;
                }
            `,
        });
    }

    private _animateOpen(instance: TextInstance) {
        // isOpen ne bloque plus l'animation — on peut re-show un texte déjà visible
        instance.isOpen = true;

        if (this._debug.enabled && this._debug.overrideProgress) {
            instance.material.uniforms.uProgress.value = this._debug.progress;
            this._renderOnce();
            return;
        }

        gsap.killTweensOf(instance.material.uniforms.uProgress);
        gsap.fromTo(
            instance.material.uniforms.uProgress,
            { value: instance.material.uniforms.uProgress.value }, // repart de la valeur courante
            {
                value: 1.0,
                duration: instance.options.duration,
                ease: instance.options.ease,
                onUpdate: () => this._renderOnce(),
                onComplete: () => this._renderOnce(),
            },
        );
    }

    private _animateClose(instance: TextInstance) {
        if (!instance.isOpen) return;
        instance.isOpen = false;

        if (this._debug.enabled && this._debug.overrideProgress) {
            instance.material.uniforms.uProgress.value = 0.0;
            this._renderOnce();
            return;
        }

        gsap.killTweensOf(instance.material.uniforms.uProgress);
        gsap.to(instance.material.uniforms.uProgress, {
            value: 0.0,
            duration: instance.options.hideDuration,
            ease: instance.options.hideEase,
            onUpdate: () => this._renderOnce(),
            onComplete: () => {
                this.disposeText(instance.id);
                this._renderOnce();
            },
        });
    }

    private _mergeOptions(required: Pick<TextShowOptions, 'text'>, options?: Partial<TextShowOptions>): TextShowOptions {
        const fontSizePx = options?.fontSizePx ?? 32;
        const lineHeightPx = options?.lineHeightPx ?? fontSizePx * 1.2;

        return {
            text: options?.text ?? required.text,
            maxWidthPx: options?.maxWidthPercent != null
                ? this._getMaxWidthFromPercent(options.maxWidthPercent)
                : (options?.maxWidthPx ?? 680),
            fontFamily: options?.fontFamily ?? '"Montserrat Alternates", sans-serif',
            fontSizePx,
            fontWeight: options?.fontWeight ?? '400',
            lineHeightPx,
            textAlign: options?.textAlign ?? 'center',
            color: options?.color ?? '#ffffff',
            anchor: options?.anchor ?? 'center',
            duration: options?.duration ?? 1.2,
            ease: options?.ease ?? 'power2.out',
            hideDuration: options?.hideDuration ?? 0.8,
            hideEase: options?.hideEase ?? 'power2.in',
        };
    }

    private _getDpr() {
        return Math.min(window.devicePixelRatio || 1, 2);
    }
}

export default new TextManager();
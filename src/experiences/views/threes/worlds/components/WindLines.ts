import type { Controller } from 'lil-gui';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import {
    CanvasTexture,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    NormalBlending,
    Plane,
    Raycaster,
    Texture,
    Vector2,
    Vector3,
} from 'three';
import ThreeCameraControllerBase from '../../../../cameras/threes/bases/ThreeCameraControllerBase';
import { CameraId } from '../../../../constants/experiences/CameraId';
import { DebugGuiTitle } from '../../../../constants/experiences/DebugGuiTitle';
import { Object3DId } from '../../../../constants/experiences/Object3dId';
import { THREE_WORLD_CONFIG } from '../../../../constants/experiences/ThreeWorldConfig';
import MainThreeApp from '../../../../engines/threes/app/MainThreeApp';
import DebugManager from '../../../../managers/DebugManager';
import { type MediapipeHandsSnapshot } from '../../../../managers/MediapipeManager';
import SoundManager from '../../../../managers/SoundManager';
import ThreeCameraControllerManager from '../../../../managers/threes/ThreeCameraControllerManager';
import ThreeRaycasterManager from '../../../../managers/threes/ThreeRaycasterManager';
import TimelineExperienceManager from '../../../../managers/TimelineExperienceManager';
import ThreeActorBase from '../../bases/components/ThreeActorBase';
import { HitMaskPainter } from './Statue';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trail {
    mesh: Mesh;
    geometry: MeshLineGeometry;
    material: MeshLineMaterial;
    points: Vector3[];
    offset: Vector3;
    phase: number;
    speed: number;
    smoothedTarget: Vector3;
}

// ─── Class ────────────────────────────────────────────────────────────────────
export default class WindLines extends ThreeActorBase {
    private static readonly _DEBUG_INIT_KEY: string = '__windLinesDebugInit';

    private _sharedAlphaTexture: Texture | null = null;

    private _trails: Trail[] = [];
    private _time = 0;
    private _target3D: Vector3 = new Vector3();
    private _cameraController: ThreeCameraControllerBase;

    private _debugRaycastPoint: Mesh | null = null;

    private readonly _settings = { ...THREE_WORLD_CONFIG.windLines };

    // Reusable ray + plane for stable NDC→world mapping (no allocations in hot path)
    private readonly _raycaster = new Raycaster();
    private readonly _ndc = new Vector2();
    private readonly _fallbackPlane = new Plane();
    private readonly _tmpIntersection = new Vector3();
    private readonly _tmpStatueCenter = new Vector3();
    private readonly _fallbackPlanePoint = new Vector3();
    private _hasFallbackPlanePoint = false;

    // Reusable vectors — allocated once, never inside the hot path
    private readonly _right = new Vector3();
    private readonly _up = new Vector3();
    private readonly _forward = new Vector3();
    private readonly _tmpWave = new Vector3();

    private readonly _canInteract: boolean = false;

    private _isHandVisible = false;

    constructor() {
        super();
        this._cameraController = ThreeCameraControllerManager.get(CameraId.THREE_MAIN);
        this._initMesh();
        window.addEventListener('hand:update', this._onHandUpdate);
        this.visible = false;
        this._initDebug();
    }

    public override init(): void {
        super.init();

        TimelineExperienceManager.onEnterInteract1.add(this._show);
        TimelineExperienceManager.onLeaveInteract1.add(this._hide);
    }

    private _show = (): void => {
        this.visible = true;
        // Reset l'état pour que le premier hand:update reçu serve de point d'origine
        // aux trails (sinon ils dessinent depuis une position périmée).
        this._isHandVisible = false;
        this._hasFallbackPlanePoint = false;
    };

    private _hide = (): void => {
        this.visible = false;
        this._isHandVisible = false;
    };

    private _initDebug(): void {
        if (!DebugManager.isActive) return;

        const folder = DebugManager.getGuiFolder(DebugGuiTitle.WINDLINES);
        const anyFolder = folder as unknown as Record<string, unknown>;
        if (anyFolder[WindLines._DEBUG_INIT_KEY]) return;
        anyFolder[WindLines._DEBUG_INIT_KEY] = true;

        const controllers: Partial<Record<keyof typeof THREE_WORLD_CONFIG.windLines, Controller>> = {};

        controllers.enabled = folder.add(this._settings, 'enabled').name('enabled');
        controllers.handDepth = folder.add(this._settings, 'handDepth', -10, 10, 0.01).name('handDepth');
        controllers.handSpread = folder.add(this._settings, 'handSpread', 0, 10, 0.01).name('handSpread');
        controllers.smoothing = folder.add(this._settings, 'smoothing', 0.01, 0.5, 0.01).name('smoothing');

        controllers.lineWidth = folder
            .add(this._settings, 'lineWidth', 0.01, 2, 0.01)
            .name('lineWidth')
            .onChange(() => this._applyLineWidth());

        controllers.trailSpread = folder
            .add(this._settings, 'trailSpread', 0, 1, 0.01)
            .name('trailSpread')
            .onChange(() => this._applyTrailSpread());
        controllers.amplitudeXY = folder.add(this._settings, 'amplitudeXY', 0, 1, 0.01).name('amplitudeXY');
        controllers.amplitudeZ = folder.add(this._settings, 'amplitudeZ', 0, 1, 0.01).name('amplitudeZ');
        controllers.minHeight = folder.add(this._settings, 'minHeight', -5, 5, 0.01).name('minHeight');
        controllers.trailLength = folder
            .add(this._settings, 'trailLength', 5, 300, 1)
            .name('trailLength')
            .onChange(() => this._applyTrailLength());

        controllers.color0 = folder
            .addColor(this._settings, 'color0')
            .name('color0')
            .onChange(() => this._applyColors());
        controllers.color1 = folder
            .addColor(this._settings, 'color1')
            .name('color1')
            .onChange(() => this._applyColors());
        controllers.color2 = folder
            .addColor(this._settings, 'color2')
            .name('color2')
            .onChange(() => this._applyColors());
        controllers.color3 = folder
            .addColor(this._settings, 'color3')
            .name('color3')
            .onChange(() => this._applyColors());

        controllers.numTrails = folder
            .add(this._settings, 'numTrails', 1, 10, 1)
            .name('numTrails')
            .onChange((value: number) => {
                this._settings.numTrails = value;
                if (this._trails.length > value) {
                    const toRemove = this._trails.splice(value);
                    toRemove.forEach((tr) => {
                        this.remove(tr.mesh);
                        tr.geometry.dispose();
                        tr.material.dispose();
                    });
                } else {
                    const toAdd = value - this._trails.length;
                    for (let i = 0; i < toAdd; i++) {
                        this._generateMesh(i);
                    }
                }
            });

        for (const key of Object.keys(THREE_WORLD_CONFIG.windLines) as (keyof typeof THREE_WORLD_CONFIG.windLines)[]) {
            DebugManager.registerConfigGetter(`windLines.${key}`, () => this._settings[key]);
            const ctrl = controllers[key];
            if (ctrl) {
                DebugManager.registerConfigSetter(`windLines.${key}`, (v) => ctrl.setValue(v));
            }
        }
    }

    private _getTrailColor(index: number): string {
        const palette = [this._settings.color0, this._settings.color1, this._settings.color2, this._settings.color3];
        return palette[index % palette.length];
    }

    private _applyColors(): void {
        for (let i = 0; i < this._trails.length; i++) {
            this._trails[i].material.color.set(this._getTrailColor(i));
        }
    }

    private _applyLineWidth(): void {
        for (const tr of this._trails) {
            tr.material.lineWidth = this._settings.lineWidth;
        }
    }

    private _applyTrailSpread(): void {
        const spread = this._settings.trailSpread;
        for (const tr of this._trails) {
            tr.offset.set(
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread
            );
        }
    }

    private _applyTrailLength(): void {
        const target = this._settings.trailLength;
        for (const tr of this._trails) {
            const current = tr.points.length;
            if (current === target) continue;

            if (current < target) {
                // Grow: clone the current tail so new slots don't introduce a (0,0,0) line back to origin.
                const tail = tr.points[current - 1] ?? tr.smoothedTarget;
                for (let i = current; i < target; i++) tr.points.push(tail.clone());
            } else {
                // Shrink: drop oldest points from the tail.
                tr.points.length = target;
            }
        }
    }

    // ── Setup ─────────────────────────────────────────────────────────────────

    private _initMesh(): void {
        for (let t = 0; t < this._settings.numTrails; t++) {
            this._generateMesh(t);
        }
    }

    private _generateMesh(t: number): void {
        const points: Vector3[] = Array(this._settings.trailLength)
            .fill(0)
            .map(() => new Vector3());

        const geometry = new MeshLineGeometry();
        geometry.setPoints(points.map((p) => p.clone()));

        const mat = new MeshLineMaterial({
            color: this._getTrailColor(t),
            sizeAttenuation: 1,
            resolution: new Vector2(window.innerWidth, window.innerHeight),
            lineWidth: this._settings.lineWidth,
            useAlphaMap: 1,
            alphaTest: 0.1,
            alphaMap: this._getSharedAlphaTexture(),
        });

        mat.blending = NormalBlending;
        mat.transparent = true;

        const mesh = new Mesh(geometry, mat);
        mesh.frustumCulled = false;
        this.add(mesh);

        this._trails.push({
            mesh,
            geometry,
            material: mat,
            points,
            offset: new Vector3(
                (Math.random() - 0.5) * this._settings.trailSpread,
                (Math.random() - 0.5) * this._settings.trailSpread,
                (Math.random() - 0.5) * this._settings.trailSpread
            ),
            phase: Math.random() * Math.PI * 2,
            speed: 0.8 + Math.random() * 0.6,
            smoothedTarget: new Vector3(),
        });
    }

    private _getSharedAlphaTexture(): Texture {
        if (this._sharedAlphaTexture) return this._sharedAlphaTexture;

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 1;
        const ctx = canvas.getContext('2d')!;

        const gradient = ctx.createLinearGradient(0, 0, 256, 0);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.9, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 1);

        const texture = new CanvasTexture(canvas);
        texture.needsUpdate = true;
        this._sharedAlphaTexture = texture;
        return texture;
    }

    /**
     * Converts a mediapipe [0..1] tip into a world-space position locked
     * in front of the camera, using the camera's own right/up/forward axes.
     *
     * extractBasis pulls the three columns of the camera's world matrix:
     *   col 0 → right, col 1 → up, col 2 → camera's local +Z (backwards),
     * so we negate col 2 to get the true look-forward direction.
     */
    private _handToWorld(x: number, y: number): void {
        const camera = this._cameraController.camera;

        // Remap mediapipe [0..1] → [-1..1], mirror x so left = left on screen
        const nx = (x - 0.5) * -2;
        const ny = (0.5 - y) * 2;

        camera.matrixWorld.extractBasis(this._right, this._up, this._forward);
        this._forward.negate(); // col 2 is +Z (behind camera), flip to look direction

        this._target3D
            .copy(camera.position)
            .addScaledVector(this._forward, this._settings.handDepth)
            .addScaledVector(this._right, nx * this._settings.handSpread)
            .addScaledVector(this._up, ny * this._settings.handSpread);
    }

    private _ndcToWorldOnPlane(ndcX: number, ndcY: number, planePoint: Vector3): Vector3 | null {
        const camera = this._cameraController.camera;

        // raycast depuis la camera
        this._ndc.set(ndcX, ndcY);
        this._raycaster.setFromCamera(this._ndc, camera);

        // Construit un plan
        camera.matrixWorld.extractBasis(this._right, this._up, this._forward);
        this._forward.negate();
        this._fallbackPlane.setFromNormalAndCoplanarPoint(this._forward, planePoint);

        const hit = this._raycaster.ray.intersectPlane(this._fallbackPlane, this._tmpIntersection);
        return hit ? this._tmpIntersection : null;
    }

    private _onHandUpdate = (e: CustomEvent<MediapipeHandsSnapshot>): void => {
        // Gate sur la visibilité : on ne consomme la main que pendant interact1,
        // sinon le target s'actualise en arrière-plan et les trails apparaissent
        // déjà "dessinés" au moment où on devient visible.
        if (!this._settings.enabled || !this.visible) return;

        const tip = e.detail.right?.indexTip;

        if (!tip) {
            this._isHandVisible = false;
            return;
        }

        const justAppeared = !this._isHandVisible;
        this._isHandVisible = true;

        // Mediapipe can slightly overshoot [0..1] near edges; clamp to avoid huge ray swings.
        const x01 = MathUtils.clamp(tip.x, 0, 1);
        const y01 = MathUtils.clamp(tip.y, 0, 1);

        // Convertit le point index en coordonnée, inversé pour que x soit à gauche quand = 0
        const ndcX = MathUtils.clamp((0.5 - x01) * 2, -1, 1);
        const ndcY = MathUtils.clamp((0.5 - y01) * 2, -1, 1);

        const statueRoot =
            MainThreeApp.scene.getObjectByName(Object3DId.STATUE) ?? MainThreeApp.scene.getObjectByName('STATUE001');

        let resolved = false;

        if (statueRoot) {
            const hits = ThreeRaycasterManager.castFromCameraToNdc(ndcX, ndcY, [statueRoot]);
            if (hits.length > 0) {
                const hit = hits[0];
                this._target3D.copy(hit.point);
                this._fallbackPlanePoint.copy(hit.point);
                this._hasFallbackPlanePoint = true;
                this._applyHitToStatue(hit.object, hit);
                resolved = true;
            } else {
                // Fallback si aucune intersection : projection sur un plan parallèle à la caméra
                const planePoint = this._hasFallbackPlanePoint
                    ? this._fallbackPlanePoint
                    : statueRoot.getWorldPosition(this._tmpStatueCenter);

                const p = this._ndcToWorldOnPlane(ndcX, ndcY, planePoint);
                if (p) {
                    this._target3D.copy(p);
                    resolved = true;
                }
            }
        }

        if (!resolved) {
            this._handToWorld(x01, y01);
        }

        // Au premier frame visible/main détectée, snap les trails sur la position
        // courante pour qu'ils naissent au doigt et ne traversent pas la scène.
        if (justAppeared) {
            for (const tr of this._trails) {
                tr.smoothedTarget.copy(this._target3D);
                for (const point of tr.points) point.copy(this._target3D);
            }
        }
    };

    private _applyHitToStatue(hitNode: THREE.Object3D, hit: THREE.Intersection): void {
        const painter = this._findHitMaskPainter(hitNode);
        if (!painter) return;

        // UV explicitement typé et validé
        if (!hit.uv) return;
        if (isNaN(hit.uv.x) || isNaN(hit.uv.y)) return;

        // on joue un son au hasard parmi une sélection, pour ajouter du feedback sonore à l'interaction
        SoundManager.playInteractionSandSound();

        // On délègue toute la logique de peinture au painter
        painter.paint(hit.uv.x, hit.uv.y);
    }

    private _findHitMaskPainter(node: THREE.Object3D | null): HitMaskPainter | undefined {
        while (node) {
            const painter = node.userData.hitMaskPainter as HitMaskPainter | undefined;
            if (painter) return painter;
            node = node.parent;
        }
        return undefined;
    }

    public update(dt: number): void {
        super.update(dt);
        if (!this.visible) return;
        this._time += dt;

        // Frame-rate-independent smoothing: at 60fps with smoothing=s we get exactly lerp(target, s).
        const smoothFactor = 1 - Math.pow(1 - this._settings.smoothing, dt * 60);

        this._trails.forEach((tr) => {
            tr.smoothedTarget.lerp(this._target3D, smoothFactor);

            // Rotate the ring in place: oldest tail Vector3 is recycled as the new head — no allocation.
            const recycled = tr.points.pop()!;
            this._writeWavePoint(tr, this._time, recycled);
            tr.points.unshift(recycled);

            tr.geometry.setPoints(tr.points, (p: number) => {
                const edge = 0.1;
                if (p < edge) return MathUtils.lerp(0.05, tr.material.lineWidth, p / edge);
                if (p > 1 - edge) return MathUtils.lerp(0.05, tr.material.lineWidth, (1 - p) / edge);
                return tr.material.lineWidth;
            });
        });
    }

    private _writeWavePoint(tr: Trail, t: number, out: Vector3): void {
        const idx = tr.points.length;
        const { amplitudeXY: aXY, amplitudeZ: aZ } = this._settings;

        this._tmpWave.set(
            Math.sin(t * tr.speed + tr.phase + idx * 0.2) * aXY,
            Math.cos(t * tr.speed * 1.3 + tr.phase + idx * 0.15) * aXY,
            Math.sin(t * tr.speed * 0.7 + tr.phase + idx * 0.1) * aZ
        );

        out.copy(tr.smoothedTarget).add(tr.offset).add(this._tmpWave);
        if (out.y < this._settings.minHeight) out.y = this._settings.minHeight;
    }

    public override reset(): void {}

    public dispose(): void {
        TimelineExperienceManager.onEnterInteract1.remove(this._show);
        TimelineExperienceManager.onLeaveInteract1.remove(this._hide);
        super.dispose();

        window.removeEventListener('hand:update', this._onHandUpdate);
        for (const trail of this._trails) {
            this.remove(trail.mesh);
            trail.geometry.dispose();
            trail.material.dispose();
        }
        this._trails = [];

        this._sharedAlphaTexture?.dispose();
        this._sharedAlphaTexture = null;

        if (this._debugRaycastPoint) {
            MainThreeApp.scene.remove(this._debugRaycastPoint);
            this._debugRaycastPoint.geometry.dispose();
            (this._debugRaycastPoint.material as MeshBasicMaterial).dispose();
            this._debugRaycastPoint = null;
        }
    }
}

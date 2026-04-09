import { MathUtils, Mesh, NormalBlending, Vector2, Vector3, Texture, CanvasTexture } from 'three';
import ThreeActorBase from '../../bases/components/ThreeActorBase';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import MediapipeManager, { type MediapipeHandsSnapshot } from '../../../../managers/MediapipeManager';
import ThreeCameraControllerManager from '../../../../managers/threes/ThreeCameraControllerManager';
import { CameraId } from '../../../../constants/experiences/CameraId';
import ThreeCameraControllerBase from '../../../../cameras/threes/bases/ThreeCameraControllerBase';

// ─── Types ────────────────────────────────────────────────────────────────────

type Trail = {
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
    private static readonly _NUM_TRAILS   = 16;
    private static readonly _TRAIL_LEN    = 100;
    private static readonly _TRAIL_COLORS = ['#f2f2f2', '#ececec', '#e0e0e0', '#dadada'];

    // How far in front of the camera the hand plane sits (world units)
    private static readonly _HAND_DEPTH   = 5;
    // How wide/tall the hand area spans in world units (tune to match your scene scale)
    private static readonly _HAND_SPREAD  = 4;

    private _trails: Trail[]   = [];
    private _time: number      = 0;
    private _target3D: Vector3 = new Vector3();
    private _cameraController: ThreeCameraControllerBase;

    // Reusable vectors — allocated once, never inside the hot path
    private readonly _right   = new Vector3();
    private readonly _up      = new Vector3();
    private readonly _forward = new Vector3();

    constructor() {
        super();
        this._cameraController = ThreeCameraControllerManager.get(CameraId.THREE_MAIN);
        this._generateMesh();
        window.addEventListener('hand:update', this._onHandUpdate);
    }

    // ── Setup ─────────────────────────────────────────────────────────────────

    private _generateMesh(): void {
        for (let t = 0; t < WindLines._NUM_TRAILS; t++) {
            const points: Vector3[] = Array(WindLines._TRAIL_LEN)
                .fill(0)
                .map(() => new Vector3());

            const geometry = new MeshLineGeometry();
            geometry.setPoints(points.map(p => p.clone()));

            const mat = new MeshLineMaterial({
                color: WindLines._TRAIL_COLORS[t % WindLines._TRAIL_COLORS.length],
                sizeAttenuation: 1,
                resolution: new Vector2(window.innerWidth, window.innerHeight),
                lineWidth: 0.2 + Math.random() * 0.3,
                transparent: true,
                blending: NormalBlending,
                useAlphaMap: 1,
                alphaTest: 0.1,
                alphaMap: this._createAlphaTexture(),
            });

            const mesh = new Mesh(geometry, mat);
            mesh.frustumCulled = false;
            this.add(mesh);

            this._trails.push({
                mesh,
                geometry,
                material: mat,
                points,
                offset: new Vector3(
                    (Math.random() - 0.5) * 0.6,
                    0.1 + Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.6,
                ),
                phase: Math.random() * Math.PI * 2,
                speed: 0.8 + Math.random() * 0.6,
                smoothedTarget: new Vector3(),
            });
        }
    }

    private _createAlphaTexture(): Texture {
        const canvas = document.createElement('canvas');
        canvas.width  = 256;
        canvas.height = 1;
        const ctx = canvas.getContext('2d')!;

        const gradient = ctx.createLinearGradient(0, 0, 256, 0);
        gradient.addColorStop(0,   'rgba(255,255,255,1)');
        gradient.addColorStop(0.9, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1,   'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 1);

        const texture = new CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    // ── Hand → world space ────────────────────────────────────────────────────

    /**
     * Converts a mediapipe [0..1] tip into a world-space position locked
     * in front of the camera, using the camera's own right/up/forward axes.
     *
     * extractBasis pulls the three columns of the camera's world matrix:
     *   col 0 → right, col 1 → up, col 2 → camera's local +Z (backwards),
     * so we negate col 2 to get the true look-forward direction.
     */
    private _handToWorld(tip: { x: number; y: number; z: number }): Vector3 {
        const camera = this._cameraController.camera;

        // Remap mediapipe [0..1] → [-1..1], mirror x so left = left on screen
        const nx = (tip.x - 0.5) * -2;
        const ny = (0.5 - tip.y) *  2;

        camera.matrixWorld.extractBasis(this._right, this._up, this._forward);
        this._forward.negate(); // col 2 is +Z (behind camera), flip to look direction

        return new Vector3()
            .copy(camera.position)
            .addScaledVector(this._forward, WindLines._HAND_DEPTH)
            .addScaledVector(this._right,   nx * WindLines._HAND_SPREAD)
            .addScaledVector(this._up,      ny * WindLines._HAND_SPREAD);
    }

    // ── Event handler ─────────────────────────────────────────────────────────

    private _onHandUpdate = (e: CustomEvent<MediapipeHandsSnapshot>): void => {
        const tip = e.detail.right?.indexTip;
        if (tip) this._target3D.copy(this._handToWorld(tip));
    };

    // ── Per-frame ─────────────────────────────────────────────────────────────

    public update(dt: number): void {
        super.update(dt);
        this._time += dt;

        this._trails.forEach((tr) => {
            tr.smoothedTarget.lerp(this._target3D, 0.07);

            tr.points.unshift(this._getWavePoint(tr, this._time));
            if (tr.points.length > WindLines._TRAIL_LEN) tr.points.pop();

            tr.geometry.setPoints(
                tr.points.map((p: Vector3) => p.clone()),
                (p: number) => {
                    const edge = 0.1;
                    if (p < edge)     return MathUtils.lerp(0.05, tr.material.lineWidth, p / edge);
                    if (p > 1 - edge) return MathUtils.lerp(0.05, tr.material.lineWidth, (1 - p) / edge);
                    return tr.material.lineWidth;
                },
            );
        });
    }

    private _getWavePoint(tr: Trail, t: number): Vector3 {
        const idx = tr.points.length;
        const wave = new Vector3(
            Math.sin(t * tr.speed         + tr.phase + idx * 0.20) * 0.5,
            Math.cos(t * tr.speed * 1.3   + tr.phase + idx * 0.15) * 0.5,
            Math.sin(t * tr.speed * 0.7   + tr.phase + idx * 0.10) * 0.3,
        );
        return new Vector3().copy(tr.smoothedTarget).add(tr.offset).add(wave);
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────

    public override reset(): void {}

    public dispose(): void {
        window.removeEventListener('hand:update', this._onHandUpdate);
        for (const trail of this._trails) {
            this.remove(trail.mesh);
            trail.geometry.dispose();
            trail.material.dispose();
        }
        this._trails = [];
    }
}
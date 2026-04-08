import { MathUtils, Mesh, NormalBlending, Vector2, Vector3, Texture, CanvasTexture } from 'three';
import ThreeActorBase from '../../bases/components/ThreeActorBase';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

// create type for _trails
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

export default class WindLines extends ThreeActorBase {
    private static readonly _DEFAULT_GEOMETRY_NUM_TRAILS = 6;
    private static readonly _DEFAULT_GEOMETRY_TRAIL_LEN = 180;
    private static readonly _DEFAULT_MATERIAL_TRAILS_COLORS = [
        "#f2f2f2",
        "#ececec",
        "#e0e0e0",
        "#dadada",
    ]

    private _trails: Trail[];
    private _time: number;

    constructor() {
        super();
        this._trails = [];
        this._time = 0;
        this._generateMesh();
    }

    private _generateMesh(): void {
        for (let t = 0; t < WindLines._DEFAULT_GEOMETRY_NUM_TRAILS; t++) {
            const points: Vector3[] = Array(WindLines._DEFAULT_GEOMETRY_TRAIL_LEN).fill(0).map(() => new Vector3());

            const geometry = new MeshLineGeometry();
            geometry.setPoints(points.map(p => p.clone()));

            const mat = new MeshLineMaterial({
                color: WindLines._DEFAULT_MATERIAL_TRAILS_COLORS[t % WindLines._DEFAULT_MATERIAL_TRAILS_COLORS.length],
                sizeAttenuation: 1,
                resolution: new Vector2(window.innerWidth, window.innerHeight),
                lineWidth: 0.2 + Math.random() * 0.3,
                depthTest: false,
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
                    0.5 + Math.random(),
                    (Math.random() - 0.5) * 0.6
                ),
                phase: Math.random() * Math.PI * 2,
                speed: 0.8 + Math.random() * 0.6,
                smoothedTarget: new Vector3(),
            });
        }
    }
    
    private _createAlphaTexture(): Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 1;
        const ctx = canvas.getContext('2d')!;

        const gradient = ctx.createLinearGradient(0, 0, 256, 0);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');    // head → opaque
        gradient.addColorStop(0.9, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');    // tail → transparent

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 1);

        const texture = new CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }


    public override reset(): void {
    }

    public update(dt: number): void {
        super.update(dt);
        this._time += dt;
        this._trails.forEach((tr) => {

            tr.points.unshift(this._getWavePoint(tr, this._time));
            if (tr.points.length > WindLines._DEFAULT_GEOMETRY_TRAIL_LEN) tr.points.pop();

            tr.geometry.setPoints(tr.points.map((p: Vector3) => p.clone()), (p: number) => {
                const edge = 0.1;
                if (p < edge) return MathUtils.lerp(0.05, tr.material.lineWidth, p / edge);
                if (p > 1 - edge) return MathUtils.lerp(0.05, tr.material.lineWidth, (1 - p) / edge);
                return tr.material.lineWidth;
            });
        });
    }

    private _getWavePoint(tr: Trail, t: number) {
        const idx = tr.points.length;
        const wave = new Vector3(
            Math.sin(t * tr.speed + tr.phase + idx * 0.2) * 0.5,
            Math.cos(t * tr.speed * 1.3 + tr.phase + idx * 0.15) * 0.5,
            Math.sin(t * tr.speed * 0.7 + tr.phase + idx * 0.1) * 0.3
        );
        return new Vector3().copy(tr.smoothedTarget).add(tr.offset).add(wave);
    }
}

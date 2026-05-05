import { MathUtils } from 'three';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import ThreeActorBase from "../../bases/components/ThreeActorBase";
import { Mesh } from "three/src/objects/Mesh.js";
import { Vector2 } from 'three/src/math/Vector2.js';
import { AssetId } from '../../../../constants/experiences/AssetId';
import ThreeAssetsManager from '../../../../managers/threes/ThreeAssetsManager';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry.js';
import { MeshBasicMaterial } from 'three/src/materials/Materials.js';
import { DoubleSide, LinearFilter } from 'three/src/Three.WebGPU.Nodes.js';
import MainThreeCameraController from '../../../../cameras/threes/MainThreeCameraController';
import * as THREE from 'three';

export default class MovementHelper extends ThreeActorBase {
    private _material: MeshLineMaterial | undefined;
    private _mesh: Mesh | undefined;
    private _icon: Mesh | undefined;
    private _group: THREE.Group = new THREE.Group();
    private _height: number = 1.2;

    private _lastX: number | null = null;

    private _rotationY: number = 0;
    private _rotationYTarget: number = 0;
    private static readonly _DAMPING: number = 10;

    constructor() {
        super();

        this.createMesh();
        this.createIcon();
        this.add(this._group); // ← on ajoute le groupe une seule fois
        this.mediaPipeControls();
    }

    private createMesh(): void {
        const geometry = new MeshLineGeometry();

        const points: number[] = [];
        const segments = 100;

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * 2 * Math.PI;
            points.push(Math.cos(t), this._height, Math.sin(t));
        }
        points.push(points[0], points[1], points[2]);

        geometry.setPoints(points);

        this._material = new MeshLineMaterial({
            color: '#ffffff',
            resolution: new Vector2(window.innerWidth, window.innerHeight),
            lineWidth: 0.04,
            toneMapped: false,
            depthWrite: false,
            transparent: true,
            dashArray: 0.01,
            dashRatio: 0.5,
            dashOffset: 0.
        });

        const mesh = new Mesh(geometry, this._material);
        this._mesh = mesh;
        this._group.add(mesh); // ← uniquement dans le groupe
    }

    private createIcon(): void {
        const texture = ThreeAssetsManager.getTexture(AssetId.UI_WHITE_STAR);
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;

        const geometry = new PlaneGeometry(0.1, 0.1);
        const material = new MeshBasicMaterial({
            map: texture,
            alphaTest: 0.9,
            side: DoubleSide
        });

        const mesh = new Mesh(geometry, material);
        mesh.position.set(Math.cos(Math.PI / 2), this._height, Math.sin(Math.PI / 2));
        this._icon = mesh;
        this._group.add(mesh); // ← uniquement dans le groupe
    }

    private mediaPipeControls(): void {
        window.addEventListener('hand:update', (e) => {
            const fist = e.detail.left?.fist;
            const isFist = e.detail.left?.isFist;
            if (!isFist || !fist) {
                this._lastX = null; // ← reset
                return;
            }

            const x = fist.x;
            if (this._lastX === null) {
                this._lastX = x;
                return;
            }

            const dx = x - this._lastX;
            this._rotationYTarget -= dx * MainThreeCameraController._ROTATE_SPEED;
            this._lastX = x;
        });
    }

    update(dt: number): void {
        this._rotationY = MathUtils.damp(
            this._rotationY,
            this._rotationYTarget,
            MovementHelper._DAMPING,
            dt
        );

        this._group.rotation.y = this._rotationY;
    }
}
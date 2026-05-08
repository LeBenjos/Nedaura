import { MathUtils } from 'three';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three';
import gsap from 'gsap';
import { Mesh } from "three/src/objects/Mesh.js";
import { Vector2 } from 'three/src/math/Vector2.js';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry.js';
import { MeshBasicMaterial } from 'three/src/materials/Materials.js';
import { DoubleSide, LinearFilter } from 'three/src/Three.WebGPU.Nodes.js';

import ThreeActorBase from "../../bases/components/ThreeActorBase";
import { AssetId } from '../../../../constants/experiences/AssetId';
import ThreeAssetsManager from '../../../../managers/threes/ThreeAssetsManager';
import MainThreeCameraController from '../../../../cameras/threes/MainThreeCameraController';
import TimelineExperienceManager from '../../../../managers/TimelineExperienceManager';

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

    private _cameraController: MainThreeCameraController;

    private _hideTimeout: ReturnType<typeof setTimeout> | null = null;
    private _hasInteracted: boolean = false;

    constructor(cameraController: MainThreeCameraController) {
        super();
        this._cameraController = cameraController;
        this.visible = false;
        this.createMesh();
        this.createIcon();
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
        this.add(mesh);
    }

    private createIcon(): void {
        const texture = ThreeAssetsManager.getTexture(AssetId.UI_WHITE_STAR);
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;

        const geometry = new PlaneGeometry(0.1, 0.1);
        const material = new MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: DoubleSide
        });

        const mesh = new Mesh(geometry, material);
        mesh.position.set(Math.cos(Math.PI / 2), this._height, Math.sin(Math.PI / 2));
        this._icon = mesh;
        this.add(mesh);
    }

    private mediaPipeControls(): void {
        window.addEventListener('hand:update', (e) => {
            const fist = e.detail.left?.fist;
            const isFist = e.detail.left?.isFist;
            if (!isFist || !fist || !this.visible) {
                this._lastX = null;
                return;
            }

            // Première interaction : arme le timer une seule fois
            if (!this._hasInteracted) {
                this._hasInteracted = true;
                this._hideTimeout = setTimeout(() => {
                    if (this._material && this._icon) {
                        const iconMaterial = this._icon.material as MeshBasicMaterial;

                        gsap.to(this._material, {
                            opacity: 0,
                            duration: 1.2,
                            ease: 'power2.in',
                        });

                        gsap.to(iconMaterial, {
                            opacity: 0,
                            duration: 1.2,
                            ease: 'power2.in',
                            onComplete: () => { this.visible = false; }
                        });
                    }
                }, 4000);
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
        if (this._mesh) {
            this._mesh.rotation.y = this._rotationY;
        }
        if (this._icon) {
            const camTheta = this._cameraController.sphericalTheta;
            this._icon.position.set(
                Math.sin(camTheta),
                this._height,
                Math.cos(camTheta)
            );
            this._icon.lookAt(this._cameraController.camera.position);
        }
    }

    public override init(): void {
        super.init();

        TimelineExperienceManager.onEnterInteract1.add(this._show, this);
        TimelineExperienceManager.onLeaveInteract1.add(this._hide, this);
    }

    public override dispose(): void {
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
            this._hideTimeout = null;
        }
        TimelineExperienceManager.onEnterInteract1.remove(this._show, this);
        TimelineExperienceManager.onLeaveInteract1.remove(this._hide, this);
        super.dispose();
    }

    private _show = () => {
        this._hasInteracted = false;
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
            this._hideTimeout = null;
        }

        // Reset opacités avant d'afficher
        if (this._material) this._material.opacity = 0;
        if (this._icon) (this._icon.material as MeshBasicMaterial).opacity = 0;

        this.visible = true;

        if (this._material && this._icon) {
            const iconMaterial = this._icon.material as MeshBasicMaterial;

            gsap.to(this._material, {
                opacity: 1,
                duration: 1.2,
                ease: 'power2.out',
            });

            gsap.to(iconMaterial, {
                opacity: 1,
                duration: 1.2,
                ease: 'power2.out',
            });
        }
    };
    
    private _hide = () => { this.visible = false; };
}
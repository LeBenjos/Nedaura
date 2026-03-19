import { Mesh, MeshStandardMaterial, RepeatWrapping, SphereGeometry, type MeshStandardMaterialParameters } from 'three';
import { AssetId } from '../../../../constants/experiences/AssetId';
import ThreeAssetsManager from '../../../../managers/threes/ThreeAssetsManager';
import ThreeActorBase from '../../bases/components/ThreeActorBase';

export default class TemplateMesh extends ThreeActorBase {
    private static readonly _DEFAULT_GEOMETRY_RADIUS = 1;
    private static readonly _DEFAULT_GEOMETRY_WIDTH_SEGMENTS = 64;
    private static readonly _DEFAULT_GEOMETRY_HEIGHT_SEGMENTS = 64;
    private static readonly _DEFAULT_MATERIAL_REPEAT = 1.5;
    private static readonly _DEFAULT_MATERIAL_OPTIONS: MeshStandardMaterialParameters = {
        color: 0xffffff,
        metalness: 0.7,
        roughness: 0.2,
        envMapIntensity: 0,
    };
    private static readonly _MESH_ROTATION_Y = 0.25;

    declare private _geometry: SphereGeometry;
    declare private _material: MeshStandardMaterial;
    declare private _mesh: Mesh;

    constructor() {
        super();

        this._generateGeometry();
        this._generateMaterial();
        this._generateMesh();
    }

    private _generateGeometry(): void {
        this._geometry = new SphereGeometry(
            TemplateMesh._DEFAULT_GEOMETRY_RADIUS,
            TemplateMesh._DEFAULT_GEOMETRY_WIDTH_SEGMENTS,
            TemplateMesh._DEFAULT_GEOMETRY_HEIGHT_SEGMENTS
        );
    }

    private _generateMaterial(): void {
        const normalMat = ThreeAssetsManager.getTexture(AssetId.THREE_TEXTURE_TEMPLATE);
        normalMat.repeat.set(TemplateMesh._DEFAULT_MATERIAL_REPEAT, TemplateMesh._DEFAULT_MATERIAL_REPEAT);
        normalMat.wrapS = normalMat.wrapT = RepeatWrapping;

        this._material = new MeshStandardMaterial({
            ...TemplateMesh._DEFAULT_MATERIAL_OPTIONS,
            normalMap: normalMat,
        });
    }

    private _generateMesh(): void {
        this._mesh = new Mesh(this._geometry, this._material);
        this._mesh.castShadow = true;
        this._mesh.receiveShadow = true;
        this.add(this._mesh);
    }

    public override reset(): void {
        this._mesh.rotation.y = 0;
    }

    public update(dt: number): void {
        super.update(dt);
        this._mesh.rotation.y += dt * TemplateMesh._MESH_ROTATION_Y;
    }
}

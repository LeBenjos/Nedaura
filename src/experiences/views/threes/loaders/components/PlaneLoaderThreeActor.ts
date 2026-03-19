import { Mesh, PlaneGeometry } from 'three';
import PlaneLoaderMaterial from '../../../../materials/threes/loaders/PlaneLoaderMaterial';
import ThreeActorBase from '../../worlds/components/actors/bases/ThreeActorBase';

export default class PlaneLoaderThreeActor extends ThreeActorBase {
    private static readonly _DEFAULT_SIZE_WIDTH: number = 2;
    private static readonly _DEFAULT_SIZE_HEIGHT: number = 2;
    private static readonly _DEFAULT_SEGMENTS_WIDTH: number = 1;
    private static readonly _DEFAULT_SEGMENTS_HEIGHT: number = 1;

    declare private _geometry: PlaneGeometry;
    declare private _material: PlaneLoaderMaterial;
    declare private _mesh: Mesh;

    constructor() {
        super();

        this._generateGeometry();
        this._generateMaterial();
        this._generateMesh();

        this.add(this._mesh);
    }

    private _generateGeometry(): void {
        this._geometry = new PlaneGeometry(
            PlaneLoaderThreeActor._DEFAULT_SIZE_WIDTH,
            PlaneLoaderThreeActor._DEFAULT_SIZE_HEIGHT,
            PlaneLoaderThreeActor._DEFAULT_SEGMENTS_WIDTH,
            PlaneLoaderThreeActor._DEFAULT_SEGMENTS_HEIGHT
        );
    }

    private _generateMaterial(): void {
        this._material = new PlaneLoaderMaterial();
    }

    private _generateMesh(): void {
        this._mesh = new Mesh(this._geometry, this._material);
    }

    public override update(dt: number): void {
        super.update(dt);
        this._material.update(dt);
    }

    //#region Getters
    //
    public get material(): PlaneLoaderMaterial {
        return this._material;
    }
    //
    //#endregion
}

import { Mesh, PlaneGeometry } from 'three';
import LoaderMaterial from '../../../../materials/threes/loaders/LoaderMaterial';
import ThreeActorBase from '../../worlds/components/actors/bases/ThreeActorBase';

export default class TemplateLoaderThreeActor extends ThreeActorBase {
    private static readonly _DEFAULT_SIZE_WIDTH: number = 2;
    private static readonly _DEFAULT_SIZE_HEIGHT: number = 2;
    private static readonly _DEFAULT_SEGMENTS_WIDTH: number = 1;
    private static readonly _DEFAULT_SEGMENTS_HEIGHT: number = 1;

    declare private _geometry: PlaneGeometry;
    declare private _material: LoaderMaterial;
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
            TemplateLoaderThreeActor._DEFAULT_SIZE_WIDTH,
            TemplateLoaderThreeActor._DEFAULT_SIZE_HEIGHT,
            TemplateLoaderThreeActor._DEFAULT_SEGMENTS_WIDTH,
            TemplateLoaderThreeActor._DEFAULT_SEGMENTS_HEIGHT
        );
    }

    private _generateMaterial(): void {
        this._material = new LoaderMaterial();
    }

    private _generateMesh(): void {
        this._mesh = new Mesh(this._geometry, this._material);
    }

    //#region Getters
    //
    public get material(): LoaderMaterial {
        return this._material;
    }
    //
    //#endregion
}

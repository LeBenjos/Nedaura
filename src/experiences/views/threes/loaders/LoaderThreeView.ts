import { ViewId } from '../../../constants/experiences/ViewId';
import ThreeViewBase from '../bases/ThreeViewBase';
import PlaneLoaderThreeActor from './components/PlaneLoaderThreeActor';

export default class LoaderThreeView extends ThreeViewBase {
    declare private _plane: PlaneLoaderThreeActor;

    constructor() {
        super(ViewId.THREE_LOADER);
        this._generateActors();
    }

    protected override _generateActors(): void {
        super._generateActors();
        this._plane = new PlaneLoaderThreeActor();
        this._actors.push(this._plane);

        for (const actor of this._actors) this.add(actor);
    }

    public override update(dt: number): void {
        for (const actor of this._actors) actor.update(dt);
    }

    public readonly show = (): Promise<void> => {
        return this._plane.material.show();
    };

    public readonly hide = (): Promise<void> => {
        return this._plane.material.hide();
    };
}

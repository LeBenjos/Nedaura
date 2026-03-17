import { ViewId } from '../../../constants/experiences/ViewId';
import ThreeViewBase from '../bases/ThreeViewBase';
import TemplateLoaderThreeActor from './components/TemplateLoaderThreeActor';

export default class LoaderThreeView extends ThreeViewBase {
    declare private _threeLoader: TemplateLoaderThreeActor;

    constructor() {
        super(ViewId.THREE_LOADER);
        this._generateActors();
    }

    protected override _generateActors(): void {
        super._generateActors();
        this._threeLoader = new TemplateLoaderThreeActor();
        this._actors.push(this._threeLoader);

        for (const actor of this._actors) this.add(actor);
    }

    public readonly show = (): Promise<void> => {
        return this._threeLoader.material.show();
    };

    public readonly hide = (): Promise<void> => {
        return this._threeLoader.material.hide();
    };
}

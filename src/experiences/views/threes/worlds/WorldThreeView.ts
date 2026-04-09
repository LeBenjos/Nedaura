import { ViewId } from '../../../constants/experiences/ViewId';
import ThreeViewBase from '../bases/ThreeViewBase';
import Dunes from './components/Dunes';
import Environment from './components/Environment';
import Sky from './components/Sky';

export default class WorldThreeView extends ThreeViewBase {
    constructor() {
        super(ViewId.THREE_WORLD);
    }

    protected override _generateActors(): void {
        super._generateActors();

        this._actors.push(new Environment());
        // this._actors.push(new TemplateMesh());
        // this._actors.push(new TemplateModel());
        // this._actors.push(new TemplateFont());

        this._actors.push(new Sky());
        this._actors.push(new Dunes());

        for (const actor of this._actors) this.add(actor);
    }

    public override update(dt: number): void {
        for (const actor of this._actors) actor.update(dt);
    }
}

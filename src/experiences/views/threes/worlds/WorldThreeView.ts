import { ViewId } from '../../../constants/experiences/ViewId';
import ThreeViewBase from '../bases/ThreeViewBase';
import CameraPath from './components/CameraPath';
import Dunes from './components/Dunes';
import Environment from './components/Environment';
import Sand from './components/Sand';
import Sky from './components/Sky';
import Statue from './components/Statue';
import WindLines from './components/WindLines';

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
        this._actors.push(new Statue());
        this._actors.push(new CameraPath());
        this._actors.push(new WindLines());
        this._actors.push(new Sand());

        for (const actor of this._actors) this.add(actor);
    }

    public override update(dt: number): void {
        for (const actor of this._actors) actor.update(dt);
    }
}

import { DebugGuiTitle } from '../../../constants/experiences/DebugGuiTitle';
import { ViewId } from '../../../constants/experiences/ViewId';
import MainThreeApp from '../../../engines/threes/app/MainThreeApp';
import DebugManager from '../../../managers/DebugManager';
import ThreeViewBase from '../bases/ThreeViewBase';
import Environment from './components/Environment';
import TemplateFont from './components/actors/TemplateFont';
import TemplateMesh from './components/actors/TemplateMesh';
import TemplateModel from './components/actors/TemplateModel';

export default class WorldThreeView extends ThreeViewBase {
    constructor() {
        super(ViewId.THREE_VIEW_WORLD_1);
    }

    protected override _generateActors(): void {
        super._generateActors();

        if (DebugManager.isActive) {
            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS)
            viewsDebug.add({ switchToWorldThreeView: () => MainThreeApp.setCurrentView(ViewId.THREE_VIEW_WORLD_1) }, 'switchToWorldThreeView').name('SWITCH WORLD_1_VIEW');
        }

        this._actors.push(new Environment());
        this._actors.push(new TemplateMesh());
        this._actors.push(new TemplateModel());
        this._actors.push(new TemplateFont());

        for (const actor of this._actors) this.add(actor);
    }

    public override update(dt: number): void {
        for (const actor of this._actors) actor.update(dt);
    }
}

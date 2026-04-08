import { DebugGuiTitle } from '../../../constants/experiences/DebugGuiTitle';
import { ViewId } from '../../../constants/experiences/ViewId';
import MainThreeApp from '../../../engines/threes/app/MainThreeApp';
import DebugManager from '../../../managers/DebugManager';
import ThreeViewBase from '../bases/ThreeViewBase';
import Environment from './components/Environment';
import TemplateFont from './components/TemplateFont';
import TemplateMesh from './components/TemplateMesh';
import TemplateModel from './components/TemplateModel';
import WindLines from './components/WindLines';

export default class WorldThreeView extends ThreeViewBase {
    constructor() {
        super(ViewId.THREE_WORLD_1);
    }

    protected override _generateActors(): void {
        super._generateActors();

        if (DebugManager.isActive) {
            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS)
            viewsDebug.add({ switchToWorldThreeView: () => MainThreeApp.setCurrentView(ViewId.THREE_WORLD_1) }, 'switchToWorldThreeView').name('SWITCH WORLD_1_VIEW');
        }

        this._actors.push(new Environment());
        this._actors.push(new WindLines());
        this._actors.push(new TemplateModel());

        for (const actor of this._actors) this.add(actor);
    }

    public override update(dt: number): void {
        for (const actor of this._actors) actor.update(dt);
    }
}

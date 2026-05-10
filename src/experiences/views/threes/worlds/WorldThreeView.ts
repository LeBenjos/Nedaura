import MainThreeCameraController from '../../../cameras/threes/MainThreeCameraController';
import { CameraId } from '../../../constants/experiences/CameraId';
import { ViewId } from '../../../constants/experiences/ViewId';
import ThreeCameraControllerManager from '../../../managers/threes/ThreeCameraControllerManager';
import ThreeViewBase from '../bases/ThreeViewBase';
import CameraPath from './components/CameraPath';
import Dunes from './components/Dunes';
import Environment from './components/Environment';
import MovementHelper from './components/MovementHelper';
import Sand from './components/Sand';
import Sky from './components/Sky';
import Statue from './components/Statue';
import WindLines from './components/WindLines';

export default class WorldThreeView extends ThreeViewBase {
    private declare _sand: Sand;

    constructor() {
        super(ViewId.THREE_WORLD);
    }

    protected override _generateActors(): void {
        super._generateActors();

        const cameraController = this._getCamera();

        this._actors.push(new Environment());
        // this._actors.push(new TemplateMesh());
        // this._actors.push(new TemplateModel());
        // this._actors.push(new TemplateFont());

        this._actors.push(new Sky());
        this._actors.push(new Dunes());
        this._actors.push(new Statue());
        this._actors.push(new CameraPath());
        this._actors.push(new WindLines());
        this._actors.push(new MovementHelper(cameraController));
        this._sand = new Sand();
        this._sand.setCount(10000);
        this._actors.push(this._sand);

        for (const actor of this._actors) this.add(actor);
    }

    public override update(dt: number): void {
        for (const actor of this._actors) actor.update(dt);
    }

    private _getCamera(): MainThreeCameraController {
        return ThreeCameraControllerManager.get(CameraId.THREE_MAIN) as MainThreeCameraController;
    }

    //#region Getters
    //
    public get sand(): Sand {
        return this._sand;
    }
    //
    //#endregion
}

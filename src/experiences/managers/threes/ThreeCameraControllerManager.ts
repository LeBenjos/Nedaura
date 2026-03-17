import { Action } from '@benjos/cookware';
import type ThreeCameraControllerBase from '../../cameras/threes/bases/ThreeCameraControllerBase';
import type { CameraId } from '../../constants/experiences/CameraId';

class ThreeCameraControllerManager {
    declare private _threeCameraControllers: Map<CameraId, ThreeCameraControllerBase>;
    declare private _activeThreeCameraController: ThreeCameraControllerBase;

    public readonly onActiveThreeCameraControllerChange = new Action();

    public init(): void {
        this._threeCameraControllers = new Map();
        this._threeCameraControllers.clear();
    }

    public add(threeCameraController: ThreeCameraControllerBase, isActive = false): void {
        this._threeCameraControllers.set(threeCameraController.cameraId, threeCameraController);
        if (isActive) this.setActiveCamera(threeCameraController.cameraId);
    }

    public get(cameraId: CameraId): ThreeCameraControllerBase {
        const threeCameraController = this._threeCameraControllers.get(cameraId);
        if (!threeCameraController) {
            throw new Error(`CameraControllerManager: No camera found with id ${cameraId}`);
        }
        return threeCameraController;
    }

    public setActiveCamera(cameraId: CameraId): void {
        const threeCameraController = this.get(cameraId);
        this._activeThreeCameraController?.disable();
        this._activeThreeCameraController = threeCameraController;
        this._activeThreeCameraController.enable();
        this.onActiveThreeCameraControllerChange.execute();
    }

    //#region Getters
    //
    public get activeThreeCameraController(): ThreeCameraControllerBase {
        return this._activeThreeCameraController;
    }
    //
    //#endregion
}

export default new ThreeCameraControllerManager();

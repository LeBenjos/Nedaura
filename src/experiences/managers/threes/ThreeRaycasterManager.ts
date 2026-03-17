import { DomPointerManager } from '@benjos/cookware';
import { Object3D, Raycaster, Vector2, type Intersection, type Object3DEventMap } from 'three';
import MainThreeApp from '../../engines/threes/app/MainThreeApp';

class ThreeRaycasterManager {
    private readonly _raycaster = new Raycaster();
    private readonly _pointerPosition = new Vector2();

    public init(): void {
        //
    }

    public castFromCameraToPointer(objects: Object3D[], recursive = true): Intersection<Object3D<Object3DEventMap>>[] {
        this._pointerPosition.set(DomPointerManager.ndcX, DomPointerManager.ndcY);
        this._raycaster.setFromCamera(this._pointerPosition, MainThreeApp.cameraController.camera);
        const intersects = this._raycaster.intersectObjects(objects, recursive);
        return intersects;
    }
}

export default new ThreeRaycasterManager();

import { CatmullRomCurve3, Line, Mesh, Vector3 } from 'three';
import type MainThreeCameraController from '../../../../cameras/threes/MainThreeCameraController';
import { AssetId } from '../../../../constants/experiences/AssetId';
import { CameraId } from '../../../../constants/experiences/CameraId';
import { Object3DId } from '../../../../constants/experiences/Object3dId';
import { TimelineExperienceState } from '../../../../constants/experiences/TimelineExperienceState';
import DebugManager from '../../../../managers/DebugManager';
import TimelineExperienceManager from '../../../../managers/TimelineExperienceManager';
import ThreeCameraControllerManager from '../../../../managers/threes/ThreeCameraControllerManager';
import ThreeModelBase from '../../bases/components/ThreeModelBase';

export default class CameraPath extends ThreeModelBase {
    private static readonly _DEDUPE_EPSILON = 1e-5;
    private static readonly _CLOSE_LOOP_EPSILON = 1e-2;
    private static readonly _INTRO_DURATION_S = 30;

    declare private _curve: CatmullRomCurve3;

    constructor() {
        super(AssetId.THREE_GLTF_DUNES, {
            object3DId: Object3DId.CAMERA_PATH,
            castShadow: false,
            receiveShadow: false,
        });

        this._curve = this._buildCurveFromMesh();
        this.visible = DebugManager.isActive;

        // INITIAL state: camera held at the path origin until PATH_INTRO fires.
        this._getCamera().anchorOnPath(this._curve, 0);

        TimelineExperienceManager.onEnterPathIntro.add(this._onEnterPathIntro);
    }

    private _getCamera(): MainThreeCameraController {
        return ThreeCameraControllerManager.get(CameraId.THREE_MAIN) as MainThreeCameraController;
    }

    private _onEnterPathIntro = (): void => {
        this._getCamera().playPath(this._curve, CameraPath._INTRO_DURATION_S, () =>
            TimelineExperienceManager.setState(TimelineExperienceState.VERSE_1)
        );
    };

    private _buildCurveFromMesh(): CatmullRomCurve3 {
        if (!(this._model instanceof Mesh) && !(this._model instanceof Line)) {
            throw new Error('CameraPath: imported object must be a Mesh or Line (Bezier-to-mesh export).');
        }

        this._model.updateMatrixWorld(true);
        const positionAttr = this._model.geometry.getAttribute('position');
        if (!positionAttr) {
            throw new Error('CameraPath: geometry has no position attribute.');
        }

        const points: Vector3[] = [];
        const tmp = new Vector3();
        for (let i = 0; i < positionAttr.count; i++) {
            tmp.fromBufferAttribute(positionAttr, i).applyMatrix4(this._model.matrixWorld);
            const last = points[points.length - 1];
            if (!last || last.distanceTo(tmp) > CameraPath._DEDUPE_EPSILON) {
                points.push(tmp.clone());
            }
        }

        if (points.length < 2) {
            throw new Error('CameraPath: not enough unique vertices to build a curve.');
        }

        const closed = points[0].distanceTo(points[points.length - 1]) < CameraPath._CLOSE_LOOP_EPSILON;
        if (closed) points.pop();

        return new CatmullRomCurve3(points, closed);
    }

    public override update(dt: number): void {
        super.update(dt);
    }

    //#region Getters
    //
    public get curve(): CatmullRomCurve3 {
        return this._curve;
    }
    //
    //#endregion
}

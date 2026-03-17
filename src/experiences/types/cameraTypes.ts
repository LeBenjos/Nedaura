//#region Three
//
export const ThreeCameraType = {
    PERSPECTIVE: 'PERSPECTIVE',
    ORTHOGRAPHIC: 'ORTHOGRAPHIC',
} as const;

export type ThreeCameraType = (typeof ThreeCameraType)[keyof typeof ThreeCameraType];

interface CameraOptionsBase {
    near?: number;
    far?: number;
}

interface PerspectiveCameraOptions extends CameraOptionsBase {
    type: typeof ThreeCameraType.PERSPECTIVE;
    fov?: number;
    aspect?: number;
}

interface OrthographicCameraOptions extends CameraOptionsBase {
    type: typeof ThreeCameraType.ORTHOGRAPHIC;
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export type ThreeCameraOptions = PerspectiveCameraOptions | OrthographicCameraOptions;

export interface ThreeControls {
    enabled: boolean;
    update(delta?: number): void;
    dispose(): void;
}
//
//#endregion

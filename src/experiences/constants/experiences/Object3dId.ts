export const Object3DId = {
    DESERT: "desert",
    DUNES: "dunes",
    STATUE: "statue",
    CAMERA_PATH: "cameraPath",
} as const;

export type Object3DId = (typeof Object3DId)[keyof typeof Object3DId];

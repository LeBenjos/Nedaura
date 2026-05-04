export const Object3DId = {
    DESERT: "desert",
    DESERT_DUNES: "dunes",
    STATUE: "statue"
} as const;

export type Object3DId = (typeof Object3DId)[keyof typeof Object3DId];

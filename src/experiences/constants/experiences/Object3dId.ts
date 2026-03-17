export const Object3DId = {} as const;

export type Object3DId = (typeof Object3DId)[keyof typeof Object3DId];

export const AnimationId = {} as const;

export type AnimationId = (typeof AnimationId)[keyof typeof AnimationId];

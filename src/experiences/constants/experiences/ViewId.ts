const ThreeViewId = {
    THREE_LOADER: 'THREE_LOADER',
    THREE_WORLD_1: 'THREE_WORLD_1',
    THREE_WORLD_2: 'THREE_WORLD_2',
} as const;

export const ViewId = {
    ...ThreeViewId,
} as const;

export type ViewId = (typeof ViewId)[keyof typeof ViewId];

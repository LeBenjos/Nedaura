const ThreeViewId = {
    THREE_LOADER: 'THREE_LOADER',
    THREE_WORLD: 'THREE_WORLD',
} as const;

export const ViewId = {
    ...ThreeViewId,
} as const;

export type ViewId = (typeof ViewId)[keyof typeof ViewId];

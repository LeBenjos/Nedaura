const HTMLViewId = {
    HTML_LOADER: 'HTML_LOADER',
} as const;

const ThreeViewId = {
    THREE_LOADER: 'THREE_LOADER',
    THREE_VIEW_WORLD_1: 'THREE_VIEW_WORLD_1',
    THREE_VIEW_WORLD_2: 'THREE_VIEW_WORLD_2',
} as const;

export const ViewId = {
    ...HTMLViewId,
    ...ThreeViewId,
} as const;

export type ViewId = (typeof ViewId)[keyof typeof ViewId];

export const CameraId = {
    THREE_DEBUG: 'THREE_DEBUG',
    THREE_MAIN: 'THREE_MAIN',
    THREE_LOADER: 'THREE_LOADER',
} as const;

export type CameraId = (typeof CameraId)[keyof typeof CameraId];

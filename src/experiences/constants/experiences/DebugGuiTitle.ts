export const DebugGuiTitle = {
    THREE_RENDERER: 'Three Renderer',
    THREE_COMPOSERS: 'Three Composers',
    THREE_VIEWS: 'Three Views',
    THREE_CAMERAS: 'Three Cameras',
    WINDLINES: 'Windlines',
} as const;

export type DebugGuiTitle = (typeof DebugGuiTitle)[keyof typeof DebugGuiTitle];

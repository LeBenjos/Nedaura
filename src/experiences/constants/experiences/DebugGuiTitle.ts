export const DebugGuiTitle = {
    THREE_RENDERER: 'Three Renderer',
    THREE_VIEWS: 'Three Views',
} as const;

export type DebugGuiTitle = (typeof DebugGuiTitle)[keyof typeof DebugGuiTitle];

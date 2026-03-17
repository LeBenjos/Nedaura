export const ViewType = {
    HTML: 'HTML',
    THREE: 'THREE',
} as const;

export type ViewType = (typeof ViewType)[keyof typeof ViewType];

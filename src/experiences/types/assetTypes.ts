export const AssetType = {
    TEXTURE: 'TEXTURE',
    HDR: 'HDR',
    MODEL: 'MODEL',
    FONT: 'FONT',
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

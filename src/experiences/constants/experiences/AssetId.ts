export const AssetId = {
    THREE_TEXTURE_TEMPLATE: 'THREE_TEXTURE_TEMPLATE',
    THREE_HDR_TEMPLATE: 'THREE_HDR_TEMPLATE',
    THREE_GLTF_TEMPLATE: 'THREE_GLTF_TEMPLATE',
    THREE_FONT_TEMPLATE: 'THREE_FONT_TEMPLATE',
} as const;

export type AssetId = (typeof AssetId)[keyof typeof AssetId];

export const LayerId = {
    DEFAULT: 0,
    NO_KUWAHARA: 1,
} as const;

export type LayerId = (typeof LayerId)[keyof typeof LayerId];

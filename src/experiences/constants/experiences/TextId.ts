export const TextId = {
    INTRO_0: 'INTRO_0',
    INTRO_1: 'INTRO_1',
    INTRO_2: 'INTRO_2',
    INTRO_3: 'INTRO_3',
    INTRO_4: 'INTRO_4',
    INTRO_5: 'INTRO_5',
    INTRO_6: 'INTRO_6',
    INTRO_7: 'INTRO_7',
    INTRO_BONJOUR: 'INTRO_BONJOUR',
} as const;

export type TextId = (typeof TextId)[keyof typeof TextId];

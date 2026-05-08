export const SoundId = {
    INTRO_1: 'INTRO_1',
    INTRO_2: 'INTRO_2',
    INTRO_3: 'INTRO_3',
    INTRO_4: 'INTRO_4',
    INTRO_5: 'INTRO_5',
    INTRO_6: 'INTRO_6',
    INTRO_7: 'INTRO_7',
} as const;

export type SoundId = (typeof SoundId)[keyof typeof SoundId];

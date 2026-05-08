export const SoundId = {
    INTRO_1: 'INTRO_1',
    INTRO_2: 'INTRO_2',
    INTRO_3: 'INTRO_3',
    INTRO_4: 'INTRO_4',
    INTRO_5: 'INTRO_5',
    INTRO_6: 'INTRO_6',
    INTRO_7: 'INTRO_7',
    // verset 1 
    VERSE_1_1: 'VERSE_1_1',
    VERSE_1_2: 'VERSE_1_2',
    VERSE_1_3: 'VERSE_1_3',
    VERSE_1_4: 'VERSE_1_4',
} as const;

export type SoundId = (typeof SoundId)[keyof typeof SoundId];

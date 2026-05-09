export const TextId = {
    INTRO_1: 'INTRO_1',
    INTRO_2: 'INTRO_2',
    INTRO_3: 'INTRO_3',
    INTRO_4: 'INTRO_4',
    INTRO_5: 'INTRO_5',
    INTRO_6: 'INTRO_6',
    INTRO_7: 'INTRO_7',
    CAMERA_PATH: 'CAMERA_PATH',
    // verset 1
    VERSE_1_1: 'VERSE_1_1',
    VERSE_1_2: 'VERSE_1_2',
    VERSE_1_3: 'VERSE_1_3',
    VERSE_1_4: 'VERSE_1_4',
    // verset 2
    VERSE_2_1: 'VERSE_2_1',
    VERSE_2_2: 'VERSE_2_2',
    VERSE_2_3: 'VERSE_2_3',
    VERSE_2_4: 'VERSE_2_4',
} as const;

export type TextId = (typeof TextId)[keyof typeof TextId];

export const TimelineExperienceState = {
    INITIAL: 'INITIAL',
    PATH_INTRO: 'PATH_INTRO',
    VERSE_1: 'VERSE_1',
    INTERACT_1: 'INTERACT_1',
    VERSE_2: 'VERSE_2',
} as const;

export type TimelineExperienceState = (typeof TimelineExperienceState)[keyof typeof TimelineExperienceState];

export const TimelineExperienceState = {
    INITIAL: 'INITIAL',
    PATH_INTRO: 'PATH_INTRO',
    IDLE: 'IDLE',
} as const;

export type TimelineExperienceState = (typeof TimelineExperienceState)[keyof typeof TimelineExperienceState];

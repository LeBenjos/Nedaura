import { SoundId, type SoundId as SoundIdType } from './SoundId';

export const SOUNDS: Record<SoundIdType, string> = {
    // menu
    [SoundId.MENU_AMBIANCE]: "/menu/accueil.wav",
    [SoundId.MENU_MUSIC]: "/menu/sand_background_02.mp3",

    [SoundId.INTRO_AMBIANCE]: "/intro/sand_background_01.mp3",
    [SoundId.INTRO_1]: "/intro/voixoff_intro_ecran1.wav",
    [SoundId.INTRO_2]: "/intro/voixoff_intro_ecran2.wav",
    [SoundId.INTRO_3]: "/intro/voixoff_intro_ecran3.wav",
    [SoundId.INTRO_4]: "/intro/voixoff_intro_ecran4.wav",
    [SoundId.INTRO_5]: "/intro/voixoff_intro_ecran5.wav",
    [SoundId.INTRO_6]: "/intro/voixoff_intro_ecran6.wav",
    [SoundId.INTRO_7]: "/intro/voixoff_intro_ecran7.wav",

    // sand interractions
    [SoundId.SAND_1]: "/interractions/sand_interaction_01.mp3",
    [SoundId.SAND_2]: "/interractions/sand_interaction_02.mp3",
    [SoundId.SAND_3]: "/interractions/sand_interaction_03.mp3",
    [SoundId.SAND_4]: "/interractions/sand_interaction_04.mp3",
    [SoundId.SAND_5]: "/interractions/sand_interaction_05.mp3",
    [SoundId.SAND_6]: "/interractions/sand_interaction_06.mp3",
    [SoundId.SAND_7]: "/interractions/sand_interaction_07.mp3",
    
    // travelling
    [SoundId.TRAVELLING_AMBIANCE]: "/travelling/ambiance.wav",
    [SoundId.TRAVELLING_MUSIC]: "/travelling/music.mp3",
    
    
    // verset 1
    [SoundId.VERSE_1_1]: "/verset_1/01.mp3",
    [SoundId.VERSE_1_2]: "/verset_1/02.mp3",
    [SoundId.VERSE_1_3]: "/verset_1/03.mp3",
    [SoundId.VERSE_1_4]: "/verset_1/04.mp3",
};

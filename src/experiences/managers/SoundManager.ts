import {Howl, Howler} from 'howler';
import { SoundId } from '../constants/experiences/Sound/SoundId';
import { SOUNDS } from '../constants/experiences/Sound/Sounds';

class SoundManager {
    constructor() {

    }

    playSound(soundId: SoundId): void {
        const sound = new Howl({
            src: [`/assets/sounds/${SOUNDS[soundId]}`],
            volume: 0.5,
        })

        sound.play();
    }

    playAmbiantSound(soundId: string): void {
        const sound = new Howl({
            src: [`/assets/sounds/${soundId}`],
            volume: 0.5,
            loop: true,
        })
        
        sound.play();
    }

    stopSound(soundId: string): void {
        const sound = new Howl({
            src: [`/assets/sounds/${soundId}`],
            volume: 0.5,
        });
        sound.stop();
    }

    clearSounds(): void {
        Howler.stop();
    }
}

export default new SoundManager();
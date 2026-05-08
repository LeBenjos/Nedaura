import {Howl, Howler} from 'howler';
import { SoundId } from '../constants/experiences/Sound/SoundId';
import { SOUNDS } from '../constants/experiences/Sound/Sounds';

class SoundManager {
    private _isPlayingInteraction: boolean = false;

    constructor() {}

    playSound(soundId: SoundId): void {
        const sound = new Howl({
            src: [`/assets/sounds/${SOUNDS[soundId]}`],
            volume: 0.5,
        })

        sound.play();
    }

    playInteractionSandSound(): void {
        if (this._isPlayingInteraction) return;

        const listSandInterractionsSound = [
            SoundId.SAND_1,
            SoundId.SAND_2,
            SoundId.SAND_3,
            SoundId.SAND_4,
            SoundId.SAND_5,
            SoundId.SAND_6,
            SoundId.SAND_7
        ];
        console.log("play sand interaction sound"); 
        const soundIndex = Math.floor(Math.random() * listSandInterractionsSound.length);
        const sound = new Howl({
            src: [`/assets/sounds/${SOUNDS[listSandInterractionsSound[soundIndex]]}`],
            volume: 0.5,
            onend: () => { this._isPlayingInteraction = false; }
        });

        this._isPlayingInteraction = true;
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
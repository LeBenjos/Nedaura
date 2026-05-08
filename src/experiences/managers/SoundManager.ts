import {Howl, Howler} from 'howler';
import { SoundId } from '../constants/experiences/Sound/SoundId';
import { SOUNDS } from '../constants/experiences/Sound/Sounds';

class SoundManager {
    private _isPlayingInteraction: boolean = false;
    private _ambientSounds: Map<SoundId, Howl> = new Map();

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

    playAmbientSound(soundId: SoundId, fadeDuration: number = 1000): void {
        if (this._ambientSounds.has(soundId)) return;

        const sound = new Howl({
            src: [`/assets/sounds/${SOUNDS[soundId]}`],
            volume: 0,
            loop: true,
        });

        sound.play();
        sound.fade(0, 0.3, fadeDuration);
        this._ambientSounds.set(soundId, sound);
    }

    stopAmbientSound(soundId: SoundId, fadeDuration: number = 1000): void {
        const sound = this._ambientSounds.get(soundId);
        if (!sound) return;

        sound.fade(sound.volume(), 0, fadeDuration);
        sound.once('fade', () => {
            sound.stop();
            this._ambientSounds.delete(soundId);
        });
    }

    stopAllAmbientSounds(fadeDuration: number = 1000): void {
        for (const soundId of this._ambientSounds.keys()) {
            this.stopAmbientSound(soundId, fadeDuration);
        }
    }

    stopSound(soundId: SoundId): void {
        const sound = new Howl({
            src: [`/assets/sounds/${SOUNDS[soundId]}`],
            volume: 0.5,
        });
        sound.stop();
    }

    clearSounds(): void {
        Howler.stop();
    }
}

export default new SoundManager();
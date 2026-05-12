import { Howl, Howler } from 'howler';
import { SoundId } from '../constants/experiences/Sound/SoundId';
import { SOUNDS } from '../constants/experiences/Sound/Sounds';

const SAND_INTERACTION_SOUND_IDS: SoundId[] = [
    SoundId.SAND_1, SoundId.SAND_2, SoundId.SAND_3,
    SoundId.SAND_4, SoundId.SAND_5, SoundId.SAND_6, SoundId.SAND_7,
];

const SAND_INTERACTION_VOLUME = 0.5;
const AMBIENT_BASE_VOLUME = 0.1;

class SoundManager {
    private _ambientSounds: Map<SoundId, Howl> = new Map();
    private _ambientBaseVolumes: Map<SoundId, number> = new Map();
    private _activeSounds: Map<SoundId, Howl> = new Map();
    private _sandPool: Howl[] = [];
    private _isPlayingInteraction: boolean = false;
    private _isMuted: boolean = false;
    private _masterVolume: number = 1;
    private _ambientBus: number = 1;

    constructor() {
        for (const id of SAND_INTERACTION_SOUND_IDS) {
            this._sandPool.push(new Howl({
                src: [`/assets/sounds/${SOUNDS[id]}`],
                volume: SAND_INTERACTION_VOLUME,
            }));
        }
    }

    playSound(soundId: SoundId): void {
        const sound = new Howl({
            src: [`/assets/sounds/${SOUNDS[soundId]}`],
            volume: 1,
            onend: () => this._activeSounds.delete(soundId),
        });

        this._activeSounds.set(soundId, sound);
        sound.play();
    }

    playInteractionSandSound(): void {
        if (this._isPlayingInteraction) return;

        const sound = this._sandPool[Math.floor(Math.random() * this._sandPool.length)];
        this._isPlayingInteraction = true;
        sound.once('end', () => { this._isPlayingInteraction = false; });
        sound.play();
    }

    playAmbientSound(soundId: SoundId, fadeDuration: number = 1000, baseVolume: number = AMBIENT_BASE_VOLUME): void {
        if (this._ambientSounds.has(soundId)) return;

        this._ambientBaseVolumes.set(soundId, baseVolume);
        const target = baseVolume * this._ambientBus;
        const sound = new Howl({
            src: [`/assets/sounds/${SOUNDS[soundId]}`],
            volume: fadeDuration > 0 ? 0 : target,
            loop: true,
        });

        this._ambientSounds.set(soundId, sound);
        sound.play();
        if (fadeDuration > 0) sound.fade(0, target, fadeDuration);
    }

    setAmbientVolume(soundId: SoundId, baseVolume: number, fadeMs: number = 600): void {
        const sound = this._ambientSounds.get(soundId);
        if (!sound) return;

        this._ambientBaseVolumes.set(soundId, baseVolume);
        const target = baseVolume * this._ambientBus;
        sound.fade(sound.volume(), target, fadeMs);
    }

    stopAmbientSound(soundId: SoundId, fadeDuration: number = 1000): void {
        const sound = this._ambientSounds.get(soundId);
        if (!sound) return;

        this._ambientSounds.delete(soundId);
        this._ambientBaseVolumes.delete(soundId);

        const currentVolume = sound.volume();

        if (fadeDuration <= 0 || currentVolume <= 0) {
            sound.stop();
            return;
        }

        sound.fade(currentVolume, 0, fadeDuration);
        setTimeout(() => sound.stop(), fadeDuration);
    }

    stopAllAmbientSounds(fadeDuration: number = 1000): void {
        for (const soundId of this._ambientSounds.keys()) {
            this.stopAmbientSound(soundId, fadeDuration);
        }
    }

    duckAmbient(factor: number, fadeMs: number = 600): void {
        this._ambientBus = factor;
        for (const [soundId, sound] of this._ambientSounds) {
            const base = this._ambientBaseVolumes.get(soundId) ?? AMBIENT_BASE_VOLUME;
            sound.fade(sound.volume(), base * factor, fadeMs);
        }
    }

    restoreAmbient(fadeMs: number = 600): void {
        this.duckAmbient(1, fadeMs);
    }

    stopSound(soundId: SoundId): void {
        const sound = this._activeSounds.get(soundId);
        if (!sound) return;
        sound.stop();
        this._activeSounds.delete(soundId);
    }

    clearSounds(): void {
        Howler.stop();
        this._activeSounds.clear();
        this._ambientSounds.clear();
        this._ambientBaseVolumes.clear();
    }

    get isMuted(): boolean {
        return this._isMuted;
    }

    toggleMute(): void {
        this._isMuted = !this._isMuted;
        Howler.volume(this._isMuted ? 0 : this._masterVolume);
    }

    mute(): void {
        this._isMuted = true;
        Howler.volume(0);
    }

    unmute(): void {
        this._isMuted = false;
        Howler.volume(this._masterVolume);
    }

    setVolume(volume: number): void {
        this._masterVolume = volume;
        if (!this._isMuted) Howler.volume(volume);
    }
}

export default new SoundManager();

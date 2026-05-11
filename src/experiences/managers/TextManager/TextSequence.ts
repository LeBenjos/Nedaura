// utils/textSequence.ts

import { SoundId } from '../../constants/experiences/Sound/SoundId';
import { TextId } from '../../constants/experiences/Text/TextId';
import SoundManager from '../SoundManager';
import TextManager from './TextManager';
import type { TextShowOptions } from './TextManager';

type TextStep = {
    id: TextId;
    x?: number;
    y?: number;
    sound?: SoundId;
    options?: Partial<TextShowOptions>;
    displayDuration: number; // en secondes 
};

type SequenceOptions = {
    signal?: AbortSignal; 
};

const wait = (ms: number, signal?: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        });
    });

export const playTextSequence = async (
    steps: TextStep[],
    { signal }: SequenceOptions = {}
): Promise<void> => {
    for (const step of steps) {
        if (signal?.aborted) break;

        
        const showDuration = (step.options?.duration ?? 1.2) * 1000;
        const hideDuration = (step.options?.hideDuration ?? 0.8) * 1000;
        const maxWidthPercent = step.options?.maxWidthPercent ?? 0.64;
        
        await wait(showDuration, signal).catch(() => {});
        
        if (step.sound) {
            SoundManager.playSound(step.sound);
        }
        TextManager.showText(step.id, step.x, step.y, { ...step.options, maxWidthPercent });

        // attendre que le show soit fini + le temps d'affichage
        await wait(showDuration + step.displayDuration, signal).catch(() => {});

        TextManager.hideText(step.id);

        // attendre que le hide soit fini avant le prochain texte
        await wait(hideDuration, signal).catch(() => {});
    }
};
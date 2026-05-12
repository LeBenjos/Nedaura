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
    /** Facteur de réduction des ambients pendant la séquence VO (0 = silence, 1 = pas de duck). Défaut 0.25. */
    ambientDuckFactor?: number;
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
    { signal, ambientDuckFactor = 0.25 }: SequenceOptions = {}
): Promise<void> => {
    const hasVoiceOver = steps.some((step) => step.sound !== undefined);
    if (hasVoiceOver) SoundManager.duckAmbient(ambientDuckFactor, 400);

    try {
        for (const step of steps) {
            if (signal?.aborted) break;

            const showDuration = (step.options?.duration ?? 1.2) * 1000;
            const hideDuration = (step.options?.hideDuration ?? 0.8) * 1000;
            const maxWidthPercent = step.options?.maxWidthPercent ?? 0.64;
            const fontFamily = step.options?.fontFamily ?? '"Averia Serif Libre", sans-serif';

            await wait(showDuration, signal).catch(() => {});

            if (step.sound) {
                SoundManager.playSound(step.sound);
            }
            TextManager.showText(step.id, step.x, step.y, { ...step.options, maxWidthPercent, fontFamily });

            // attendre que le show soit fini + le temps d'affichage
            await wait(showDuration + step.displayDuration, signal).catch(() => {});

            TextManager.hideText(step.id);

            // attendre que le hide soit fini avant le prochain texte
            await wait(hideDuration, signal).catch(() => {});
        }
    } finally {
        if (hasVoiceOver) SoundManager.restoreAmbient(800);
    }
};
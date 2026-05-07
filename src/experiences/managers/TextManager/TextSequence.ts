// utils/textSequence.ts

import { TextId } from '../../constants/experiences/TextId';
import TextManager from './TextManager';
import type { TextShowOptions } from './TextManager';

type TextStep = {
    id: TextId;
    x?: number;
    y?: number;
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
        
        await wait(showDuration, signal).catch(() => {});
        
        TextManager.showText(step.id, step.x, step.y, step.options);

        // attendre que le show soit fini + le temps d'affichage
        await wait(showDuration + step.displayDuration, signal).catch(() => {});

        TextManager.hideText(step.id);

        // attendre que le hide soit fini avant le prochain texte
        await wait(hideDuration, signal).catch(() => {});
    }
};
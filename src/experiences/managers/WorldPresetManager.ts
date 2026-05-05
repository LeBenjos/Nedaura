import { TickerManager } from '@benjos/cookware';
import { Color } from 'three';
import {
    THREE_WORLD_PRESETS,
    type ThreeWorldPresetId,
} from '../constants/experiences/ThreeWorldPresets';
import type { ThreeWorldConfig } from '../constants/experiences/ThreeWorldConfig';
import DebugManager from './DebugManager';

type EasingFn = (t: number) => number;

interface PresetTransitionOptions {
    duration?: number;
    easing?: EasingFn;
}

type TrackType = 'number' | 'array' | 'color' | 'snap';

interface PresetTrack {
    path: string;
    type: TrackType;
    from: unknown;
    to: unknown;
}

class WorldPresetManager {
    private static readonly _DEFAULT_DURATION_S = 1.5;
    private static readonly _EASE_IN_OUT_CUBIC: EasingFn = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    private _activePresetId: ThreeWorldPresetId | null = null;
    private _tracks: PresetTrack[] = [];
    private _elapsed = 0;
    private _duration = 0;
    private _easing: EasingFn = WorldPresetManager._EASE_IN_OUT_CUBIC;
    private _isRunning = false;
    private _tickerBound = false;

    private readonly _fromColor = new Color();
    private readonly _toColor = new Color();
    private readonly _tmpColor = new Color();

    public showPreset(id: ThreeWorldPresetId, opts: PresetTransitionOptions = {}): void {
        const preset = THREE_WORLD_PRESETS[id];
        if (!preset) {
            console.warn(`[WorldPresetManager] Unknown preset "${id}"`);
            return;
        }

        this._tracks = this._buildTracks(preset);
        this._activePresetId = id;
        this._duration = Math.max(0, opts.duration ?? WorldPresetManager._DEFAULT_DURATION_S);
        this._easing = opts.easing ?? WorldPresetManager._EASE_IN_OUT_CUBIC;
        this._elapsed = 0;

        if (this._duration === 0 || this._tracks.length === 0) {
            this._applyAtT(1, 1);
            this._isRunning = false;
            return;
        }

        this._isRunning = true;
        if (!this._tickerBound) {
            TickerManager.add(this._update);
            this._tickerBound = true;
        }
    }

    private _buildTracks(preset: ThreeWorldConfig): PresetTrack[] {
        const tracks: PresetTrack[] = [];
        for (const [section, fields] of Object.entries(preset)) {
            if (!fields || typeof fields !== 'object') continue;
            for (const [key, to] of Object.entries(fields as Record<string, unknown>)) {
                const path = `${section}.${key}`;
                if (!DebugManager.hasConfigSetter(path)) continue;
                const from = DebugManager.getConfigValue(path);
                if (from === undefined) continue;
                tracks.push({ path, type: WorldPresetManager._classify(from, to), from, to });
            }
        }
        return tracks;
    }

    private static _classify(from: unknown, to: unknown): TrackType {
        if (typeof from === 'number' && typeof to === 'number') return 'number';
        if (Array.isArray(from) && Array.isArray(to)) return 'array';
        if (
            typeof from === 'string' && typeof to === 'string' &&
            from.startsWith('#') && to.startsWith('#')
        ) return 'color';
        return 'snap';
    }

    private _update = (dt: number): void => {
        if (!this._isRunning) return;
        this._elapsed += dt;
        const tRaw = Math.min(1, this._elapsed / this._duration);
        this._applyAtT(this._easing(tRaw), tRaw);
        if (tRaw >= 1) this._isRunning = false;
    };

    private _applyAtT(t: number, tRaw: number): void {
        for (const track of this._tracks) {
            DebugManager.setConfigValue(track.path, this._sample(track, t, tRaw));
        }
    }

    private _sample(track: PresetTrack, t: number, tRaw: number): unknown {
        switch (track.type) {
            case 'number': {
                const a = track.from as number;
                const b = track.to as number;
                return a + (b - a) * t;
            }
            case 'array': {
                const a = track.from as number[];
                const b = track.to as number[];
                const len = Math.min(a.length, b.length);
                const out = new Array<number>(len);
                for (let i = 0; i < len; i++) out[i] = a[i] + (b[i] - a[i]) * t;
                return out;
            }
            case 'color': {
                this._fromColor.set(track.from as string);
                this._toColor.set(track.to as string);
                this._tmpColor.copy(this._fromColor).lerp(this._toColor, t);
                return '#' + this._tmpColor.getHexString();
            }
            case 'snap':
            default:
                return tRaw >= 1 ? track.to : track.from;
        }
    }

    //#region Getters
    //
    public get activePresetId(): ThreeWorldPresetId | null { return this._activePresetId; }
    public get isTransitioning(): boolean { return this._isRunning; }
    //
    //#endregion
}

export default new WorldPresetManager();

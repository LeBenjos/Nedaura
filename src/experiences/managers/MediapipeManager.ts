import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";

// ─── Types ────────────────────────────────────────────────────────────────────

type MediapipePoint3 = { x: number; y: number; z: number };
type HandSide = 'Left' | 'Right' | 'Unknown';

export interface MediapipeHandSnapshot {
    side: HandSide;
    landmarks: Array<MediapipePoint3>;
    wrist: MediapipePoint3;
    indexTip: MediapipePoint3;
    worldLandmarks?: Array<MediapipePoint3>;
    worldWrist?: MediapipePoint3;
    worldIndexTip?: MediapipePoint3;
}

export interface MediapipeHandsSnapshot {
    timestampMs: number;
    left: MediapipeHandSnapshot | null;
    right: MediapipeHandSnapshot | null;
}

declare global {
    interface WindowEventMap {
        'hand:update': CustomEvent<MediapipeHandsSnapshot>;
    }
}

const EMPTY_SNAPSHOT: MediapipeHandsSnapshot = {
    timestampMs: 0,
    left: null,
    right: null,
};

class MediapipeManager {
    private _hands: MediapipeHandsSnapshot = { ...EMPTY_SNAPSHOT };
    private _webcamRunning: boolean = false;

    public init(): void {
        this._initGui();
    }

    private _initGui(): void {}

    /**
     * Call this each frame from MainMediapipe.predictWebcam().
     * Stores the snapshot, dispatches 'hand:update', and returns it.
     */
    public update(results: HandLandmarkerResult, timestampMs: number): MediapipeHandsSnapshot {
        const snapshot = this._extractHands(results, timestampMs);
        this._hands = snapshot;

        window.dispatchEvent(
            new CustomEvent<MediapipeHandsSnapshot>('hand:update', {
                detail: snapshot,
            })
        );

        return snapshot;
    }

    private _extractHands(results: HandLandmarkerResult, timestampMs: number): MediapipeHandsSnapshot {
        const snapshot: MediapipeHandsSnapshot = {
            timestampMs,
            left: null,
            right: null,
        };

        const hands = results.landmarks ?? [];

        for (let i = 0; i < hands.length; i++) {
            const landmarks = hands[i];
            if (!landmarks?.length) continue;

            const sideName = results.handedness?.[i]?.[0]?.categoryName;
            const side: HandSide =
                sideName === 'Left' || sideName === 'Right' ? sideName : 'Unknown';

            const wrist    = landmarks[0];
            const indexTip = landmarks[8] ?? wrist;

            const worldLandmarks = results.worldLandmarks?.[i];
            const worldWrist     = worldLandmarks?.[0];
            const worldIndexTip  = worldLandmarks?.[8];

            const hand: MediapipeHandSnapshot = {
                side,
                landmarks,
                wrist,
                indexTip,
                worldLandmarks,
                worldWrist,
                worldIndexTip,
            };

            if      (side === 'Left')            snapshot.left  = hand;
            else if (side === 'Right')           snapshot.right = hand;
            else if (!snapshot.left)             snapshot.left  = hand;
            else if (!snapshot.right)            snapshot.right = hand;
        }

        return snapshot;
    }

    public get hands(): MediapipeHandsSnapshot  { return this._hands; }
    public get leftHand(): MediapipeHandSnapshot | null  { return this._hands.left; }
    public get rightHand(): MediapipeHandSnapshot | null { return this._hands.right; }
    public get isRunning(): boolean { return this._webcamRunning; }

    public setRunning(value: boolean): void {
        this._webcamRunning = value;
    }
}

export default new MediapipeManager();
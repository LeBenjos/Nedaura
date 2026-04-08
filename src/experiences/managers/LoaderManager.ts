import { Action, TickerManager } from '@benjos/cookware';
import ThreeAssetsManager from './threes/ThreeAssetsManager';

class LoaderManager {
    private static readonly _MIN_LOAD_DURATION: number = 0.5;

    private _totalSize = 0;
    private _loadedSize = 0;
    private _progress = 0;
    private _isTransitioning = false;
    private _elapsed = 0;
    private _hasAssetsToLoad = false;
    private _assetsFinished = false;
    private _transitionResolves: (() => void)[] = [];
    private _showTransition: (() => Promise<void>) | null = null;
    private _hideTransition: (() => Promise<void>) | null = null;

    public readonly onBeginLoad = new Action();
    public readonly onProgress = new Action();
    public readonly onFinishLoad = new Action();
    public readonly onShow = new Action();
    public readonly onHide = new Action();

    public init(): void {
        this._addCallbacks();
    }

    public setShowTransition(callback: () => Promise<void>): void {
        this._showTransition = callback;
    }

    public setHideTransition(callback: () => Promise<void>): void {
        this._hideTransition = callback;
    }

    private _addCallbacks(): void {
        this._removeCallbacks();
        ThreeAssetsManager.onLoad.add(this._onLoad);
        ThreeAssetsManager.onProgress.add(this._onAssetProgress);
    }

    private _removeCallbacks(): void {
        ThreeAssetsManager.onLoad.remove(this._onLoad);
        ThreeAssetsManager.onProgress.remove(this._onAssetProgress);
    }

    private _beginLoad = (): void => {
        ThreeAssetsManager.beginLoad();
        this.onBeginLoad.execute();
    };

    private _finishLoad = (): void => {
        ThreeAssetsManager.finishLoad();
        this.onFinishLoad.execute();
    };

    private async _showLoader(): Promise<void> {
        this.onShow.execute();
        if (this._showTransition) await this._showTransition();
    }

    private async _hideLoader(): Promise<void> {
        this.onHide.execute();
        if (this._hideTransition) await this._hideTransition();
    }

    private readonly _onAssetsFinish = (): void => {
        this._assetsFinished = true;
        this.onFinishLoad.remove(this._onAssetsFinish);
    };

    private readonly _onTransitionTick = (dt: number): void => {
        this._elapsed += dt;
        const timerProgress = Math.min(this._elapsed / LoaderManager._MIN_LOAD_DURATION, 1);

        let assetProgress = 1;
        if (this._hasAssetsToLoad && !this._assetsFinished) {
            assetProgress = this._totalSize > 0 ? Math.min(this._loadedSize / this._totalSize, 1) : 0;
        }

        this._progress = Math.min(timerProgress, assetProgress);
        this.onProgress.execute();

        if (timerProgress >= 1 && this._assetsFinished) {
            this._progress = 1;
            this.onProgress.execute();
            TickerManager.remove(this._onTransitionTick);
            this._transitionResolves.forEach((resolve) => resolve());
            this._transitionResolves.length = 0;
        }
    };

    public async loadAssetsWithTransition(onReady?: () => void | Promise<void>): Promise<void> {
        const isNested = this._isTransitioning;
        if (!isNested) {
            this._isTransitioning = true;
            await this._showLoader();
        }

        this._hasAssetsToLoad = !this._checkIsFinished();

        if (this._hasAssetsToLoad || !isNested) {
            this._progress = 0;
            this._elapsed = 0;
            this._assetsFinished = !this._hasAssetsToLoad;
            this.onProgress.execute();

            if (this._hasAssetsToLoad) {
                this.onFinishLoad.add(this._onAssetsFinish);
                this._beginLoad();
            }

            await new Promise<void>((resolve) => {
                this._transitionResolves.push(resolve);
                TickerManager.add(this._onTransitionTick);
            });
        }

        if (onReady) await onReady();

        if (!isNested) {
            this._isTransitioning = false;
            await this._hideLoader();
        }
    }

    private _onLoad = (): void => {
        this._refreshSizes();
        if (this._checkIsFinished()) this._finishLoad();
    };

    private _checkIsFinished = (): boolean => {
        if (!ThreeAssetsManager.isLoaded) return false;
        return true;
    };

    private _onAssetProgress = (): void => {
        this._refreshSizes();
        this._progress = this._totalSize > 0 ? Math.min(this._loadedSize / this._totalSize, 1) : 0;
        this.onProgress.execute();
    };

    private _refreshSizes = (): void => {
        this._refreshTotalSize();
        this._refreshLoadedSize();
    };

    private _refreshTotalSize = (): void => {
        this._totalSize = 0;
        this._totalSize += ThreeAssetsManager.totalSize;
    };

    private _refreshLoadedSize = (): void => {
        this._loadedSize = 0;
        this._loadedSize += ThreeAssetsManager.loadedSize;
    };

    //#region Getters
    //
    public get isLoaded(): boolean {
        return this._checkIsFinished();
    }
    public get progress(): number {
        return this._progress;
    }
    public get totalSize(): number {
        return this._totalSize;
    }
    public get loadedSize(): number {
        return this._loadedSize;
    }
    //
    //#endregion
}

export default new LoaderManager();

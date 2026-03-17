import './styles/style.scss';

import InitCommand from './commands/InitCommand';
import { ViewId } from './constants/experiences/ViewId';
import MainThree from './engines/threes/MainThree';
import MainThreeApp from './engines/threes/app/MainThreeApp';
import LoaderManager from './managers/LoaderManager';

class Experience {
    private _isInitialized = false;

    public async init(): Promise<void> {
        if (this._isInitialized) return;
        this._isInitialized = true;

        InitCommand.init();
        MainThree.init();

        await LoaderManager.loadAssetsWithTransition(this._onReady);
    }

    private readonly _onReady = async (): Promise<void> => {
        await MainThreeApp.setCurrentView(ViewId.THREE_VIEW_WORLD_1);
    };
}

export default new Experience();

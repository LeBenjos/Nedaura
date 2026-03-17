import LoaderThreeApp from './app/LoaderThreeApp';
import MainThreeApp from './app/MainThreeApp';

class MainThree {
    public init(): void {
        LoaderThreeApp.init();
        MainThreeApp.init();
    }
}

export default new MainThree();

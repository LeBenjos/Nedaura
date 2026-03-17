import { MainThreeApp } from '../engines/threes/app/MainThreeApp';

declare global {
    interface Window {
        mainThreeApp: MainThreeApp;
    }
}

export {};

import { Action } from "@benjos/cookware";
import { TextId } from "../constants/experiences/Text/TextId";
import { TimelineExperienceState } from "../constants/experiences/TimelineExperienceState";

import WorldPresetManager from "./WorldPresetManager";
import TextManager from "./TextManager/TextManager";

class TimelineExperienceManager {
    private declare _state: TimelineExperienceState;

    public readonly onEnterPathIntro = new Action();
    public readonly onLeavePathIntro = new Action();
    public readonly onEnterVerse1 = new Action();
    public readonly onLeaveVerse1 = new Action();
    public readonly onEnterInteract1 = new Action();
    public readonly onLeaveInteract1 = new Action();
    public readonly onEnterVerse2 = new Action();
    public readonly onLeaveVerse2 = new Action();

    public init(): void {
        this.setState(TimelineExperienceState.INITIAL);
    }

    public setState(state: TimelineExperienceState): void {
        this._leaveState();
        this._state = state;
        this._enterState();
    }

    private _enterState(): void {
        switch (this._state) {
            case TimelineExperienceState.INITIAL:
                break;
            case TimelineExperienceState.PATH_INTRO:
                this._enterPathIntro();
                break;
            case TimelineExperienceState.VERSE_1:
                this._enterVerse1();
                break;
            case TimelineExperienceState.INTERACT_1:
                this._enterInteract1();
                break;
            case TimelineExperienceState.VERSE_2:
                this._enterVerse2();
                break;
        }
    }

    private _leaveState(): void {
        switch (this._state) {
            case TimelineExperienceState.INITIAL:
                break;
            case TimelineExperienceState.PATH_INTRO:
                this._leavePathIntro();
                break;
            case TimelineExperienceState.VERSE_1:
                this._leaveVerse1();
                break;
            case TimelineExperienceState.INTERACT_1:
                this._leaveInteract1();
                break;
            case TimelineExperienceState.VERSE_2:
                this._leaveVerse2();
                break;
        }
    }

    private _enterPathIntro(): void {
        TextManager.showText(TextId.CAMERA_PATH);
        this.onEnterPathIntro.execute();
    }

    private _leavePathIntro(): void {
        TextManager.hideText(TextId.CAMERA_PATH);
        this.onLeavePathIntro.execute();
    }

    private _enterVerse1(): void {
        this.onEnterVerse1.execute();
    }

    private _leaveVerse1(): void {
        this.onLeaveVerse1.execute();
    }

    private _enterInteract1(): void {
        WorldPresetManager.showPreset('wind');
        this.onEnterInteract1.execute();
    }

    private _leaveInteract1(): void {
        this.onLeaveInteract1.execute();
    }

    private _enterVerse2(): void {
        this.onEnterVerse2.execute();
    }

    private _leaveVerse2(): void {
        WorldPresetManager.showPreset('base');
        this.onLeaveVerse2.execute();
    }

    //#region Getters
    //
    public get state(): TimelineExperienceState { return this._state; }
    //
    //#endregion
}

export default new TimelineExperienceManager();

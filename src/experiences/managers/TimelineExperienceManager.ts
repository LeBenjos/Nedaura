import { Action } from "@benjos/cookware";
import { TimelineExperienceState } from "../constants/experiences/TimelineExperienceState";

class TimelineExperienceManager {
    private declare _state: TimelineExperienceState;

    public readonly onEnterPathIntro = new Action();
    public readonly onLeavePathIntro = new Action();
    public readonly onEnterIdle = new Action();
    public readonly onLeaveIdle = new Action();

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
                this.onEnterPathIntro.execute();
                break;
            case TimelineExperienceState.IDLE:
                this.onEnterIdle.execute();
                break;
        }
    }

    private _leaveState(): void {
        switch (this._state) {
            case TimelineExperienceState.INITIAL:
                break;
            case TimelineExperienceState.PATH_INTRO:
                this.onLeavePathIntro.execute();
                break;
            case TimelineExperienceState.IDLE:
                this.onLeaveIdle.execute();
                break;
        }
    }

    //#region Getters
    //
    public get state(): TimelineExperienceState { return this._state; }
    //
    //#endregion
}

export default new TimelineExperienceManager();

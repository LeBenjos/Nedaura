import { Action } from '@benjos/cookware';
import { TextId } from '../constants/experiences/Text/TextId';
import { TimelineExperienceState } from '../constants/experiences/TimelineExperienceState';

import TimelineView from '@/views/TimelineView';

import { SoundId } from '../constants/experiences/Sound/SoundId';
import MainThreeApp from '../engines/threes/app/MainThreeApp';
import WorldThreeView from '../views/threes/worlds/WorldThreeView';
import { useInterfaceManager } from '../views/vues/hooks/useInterfaceManager';
import HandMovementHelper from '../views/vues/interactions/HandMovementHelper.vue';
import InteractionWindView from '../views/vues/interactions/InteractionWindView.vue';
import SoundManager from './SoundManager';
import { playTextSequence } from './TextManager/TextSequence';
import WorldPresetManager from './WorldPresetManager';

class TimelineExperienceManager {
    declare private _state: TimelineExperienceState;

    public readonly onEnterPathIntro = new Action();
    public readonly onLeavePathIntro = new Action();
    public readonly onEnterVerse1 = new Action();
    public readonly onLeaveVerse1 = new Action();
    public readonly onEnterInteract1 = new Action();
    public readonly onLeaveInteract1 = new Action();
    public readonly onEnterVerse2 = new Action();
    public readonly onLeaveVerse2 = new Action();

    private _controller = new AbortController();

    private mount = (options: {
        id: string;
        component: any;
        noAnimation?: boolean;
        props?: Record<string, unknown>;
    }) => {
        const { mount } = useInterfaceManager();
        mount(options);
    };

    private unmount = (id: string) => {
        const { unmount } = useInterfaceManager();
        unmount(id);
    };

    private _timelineSegments = [
        {
            enter: this.onEnterVerse1,
            leave: this.onLeaveVerse1,
            id: 'timeline-verse1',
            initialValue: -3600,
            endValue: -2000,
        },
        {
            enter: this.onEnterVerse2,
            leave: this.onLeaveVerse2,
            id: 'timeline-verse2',
            initialValue: -2000,
            endValue: 0,
        },
    ];

    public init(): void {
        this.setState(TimelineExperienceState.INITIAL);
        this.setSegments();
    }

    public setSegments(): void {
        for (const segment of this._timelineSegments) {
            segment.enter.add(() =>
                this.mount({
                    id: segment.id,
                    component: TimelineView,
                    props: {
                        initialValue: segment.initialValue,
                        endValue: segment.endValue,
                        duration: 6000,
                    },
                })
            );

            segment.leave.add(() => this.unmount(segment.id));
        }
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

    private async _enterPathIntro(): Promise<void> {
        SoundManager.playAmbientSound(SoundId.INTRO_AMBIANCE);
        //SoundManager.playAmbientSound(SoundId.TRAVELLING_MUSIC);

        this.onEnterPathIntro.execute();

        await playTextSequence([
            {
                id: TextId.CAMERA_PATH,
                displayDuration: 2500,
                options: { duration: 0.8, hideDuration: 0.8 },
            },
            {
                id: TextId.INTRO_1,
                displayDuration: 2500,
                sound: SoundId.INTRO_1,
                options: { duration: 0.8, hideDuration: 0.8 },
            },
            {
                id: TextId.INTRO_2,
                displayDuration: 8000,
                sound: SoundId.INTRO_2,
                options: { duration: 0.8, hideDuration: 0.8 },
            },
            {
                id: TextId.INTRO_3,
                displayDuration: 3500,
                sound: SoundId.INTRO_3,
                options: { duration: 0.8, hideDuration: 0.8 },
            },
            {
                id: TextId.INTRO_4,
                displayDuration: 9000,
                sound: SoundId.INTRO_4,
                options: { duration: 0.8, hideDuration: 0.8 },
            },
            {
                id: TextId.INTRO_5,
                displayDuration: 3500,
                sound: SoundId.INTRO_5,
                options: { duration: 0.8, hideDuration: 0.8 },
            },
            {
                id: TextId.INTRO_6,
                displayDuration: 6000,
                sound: SoundId.INTRO_6,
                options: { duration: 0.8, hideDuration: 0.8 },
            },
            {
                id: TextId.INTRO_7,
                displayDuration: 3000,
                sound: SoundId.INTRO_7,
                options: { duration: 0.8, hideDuration: 0.8 },
            },
        ]).then(() => {
            SoundManager.stopAmbientSound(SoundId.INTRO_AMBIANCE);
            SoundManager.playAmbientSound(SoundId.TRAVELLING_MUSIC);
        });

        const totalDuration = 3100 + 2500 + 8000 + 3500 + 9000 + 3500 + 6000 + 3000; // durée totale des textes + transitions
        const totalDurationSeconds = totalDuration / 1000;
        console.log(`Total duration of intro sequence: ${totalDurationSeconds} seconds`);
    }

    private _leavePathIntro(): void {
        console.log('leave path intro');
        this.onLeavePathIntro.execute();
    }

    private async _enterVerse1() {
        console.log('enter verse 1');

        SoundManager.stopAmbientSound(SoundId.TRAVELLING_MUSIC);

        this.onEnterVerse1.execute();
        await playTextSequence([
            {
                id: TextId.VERSE_1_1,
                displayDuration: 2000,
                sound: SoundId.VERSE_1_1,
                options: { duration: 0.5, hideDuration: 0.5, anchor: 'center-right', maxWidthPercent: 0.5 },
            },
            {
                id: TextId.VERSE_1_2,
                displayDuration: 2500,
                sound: SoundId.VERSE_1_2,
                options: { duration: 0.7, hideDuration: 0.5, anchor: 'center-right', maxWidthPercent: 0.4 },
            },
            {
                id: TextId.VERSE_1_3,
                displayDuration: 2500,
                sound: SoundId.VERSE_1_3,
                options: { duration: 0.7, hideDuration: 0.5, anchor: 'center-right', maxWidthPercent: 0.5 },
            },
            {
                id: TextId.VERSE_1_4,
                displayDuration: 2000,
                sound: SoundId.VERSE_1_4,
                options: { duration: 0.5, hideDuration: 0.5, anchor: 'center-right', maxWidthPercent: 0.5 },
            },
        ]);

        if (!this._controller.signal.aborted) {
            this.setState(TimelineExperienceState.INTERACT_1);
        }
    }

    private _leaveVerse1(): void {
        console.log('leave verse 1');
        this.onLeaveVerse1.execute();
    }

    private _enterInteract1(): void {
        console.log('enter interact 1');
        WorldPresetManager.showPreset('wind');
        const view = MainThreeApp.currentView as WorldThreeView;
        view.sand.setCount(50000);
        view.stormWind.setCount(1000);
        view.clouds.setIntensity(0.4);
        this.mount({ id: 'interaction-wind', component: InteractionWindView });
        this.mount({ id: 'hand-movement-helper', component: HandMovementHelper });
        this.onEnterInteract1.execute();
    }

    private _leaveInteract1(): void {
        console.log('leave interact 1');
        this.unmount('interaction-wind');
        this.unmount('hand-movement-helper');
        this.onLeaveInteract1.execute();
    }

    private async _enterVerse2(): Promise<void> {
        console.log('enter verse 2');
        const view = MainThreeApp.currentView as WorldThreeView;
        view.sand.setCount(200000);
        view.stormWind.setCount(5000);
        view.clouds.setIntensity(0.8);
        this.onEnterVerse2.execute();
        await playTextSequence([
            {
                id: TextId.VERSE_2_1,
                displayDuration: 2000,
                sound: SoundId.VERSE_2_1,
                options: { duration: 0.5, hideDuration: 0.5, anchor: 'center-right', maxWidthPercent: 0.5 },
            },
            {
                id: TextId.VERSE_2_2,
                displayDuration: 2000,
                sound: SoundId.VERSE_2_2,
                options: { duration: 0.7, hideDuration: 0.5, anchor: 'center-right', maxWidthPercent: 0.5 },
            },
            {
                id: TextId.VERSE_2_3,
                displayDuration: 3500,
                sound: SoundId.VERSE_2_3,
                options: { duration: 0.7, hideDuration: 0.5, anchor: 'center-right', maxWidthPercent: 0.5 },
            },
            {
                id: TextId.VERSE_2_4,
                displayDuration: 3000,
                sound: SoundId.VERSE_2_4,
                options: { duration: 0.5, hideDuration: 0.5, anchor: 'center-right', maxWidthPercent: 0.5 },
            },
        ]);
    }

    private _leaveVerse2(): void {
        WorldPresetManager.showPreset('base');
        this.onLeaveVerse2.execute();
    }

    //#region Getters
    //
    public get state(): TimelineExperienceState {
        return this._state;
    }
    //
    //#endregion
}

export default new TimelineExperienceManager();

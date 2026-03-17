import { AnimationAction, AnimationMixer } from 'three';
import type { AnimationId } from '../../../../../../constants/experiences/AnimationId';
import type { AssetId } from '../../../../../../constants/experiences/AssetId';
import ThreeAssetsManager from '../../../../../../managers/threes/ThreeAssetsManager';
import ThreeModelBase, { type ModelBaseParams } from './ThreeModelBase';

export default abstract class ThreeAnimatedModelBase extends ThreeModelBase {
    private static readonly _DEFAULT_ANIMATION_FADE_DURATION: number = 1;

    declare private _mixer: AnimationMixer;
    declare private _actions: AnimationAction[];
    declare private _currentAction: AnimationAction | null;

    constructor(assetId: AssetId, params: ModelBaseParams = {}) {
        super(assetId, params);

        this._generateAnimations();
    }

    protected _generateAnimations(): void {
        const animations = ThreeAssetsManager.getModel(this._assetId).animations;
        this._mixer = new AnimationMixer(this._model);
        this._actions = [];
        this._currentAction = null;

        for (const clip of animations) {
            const action = this._mixer.clipAction(clip);
            this._addAnimationAction(action);
        }
    }

    private _addAnimationAction(action: AnimationAction): void {
        this._actions.push(action);
    }

    protected _playAnimation = (
        animationId: AnimationId,
        fadeDuration: number = ThreeAnimatedModelBase._DEFAULT_ANIMATION_FADE_DURATION
    ): void => {
        if (!this._actions) return;
        const newAction = this._getAnimationAction(animationId);
        const oldAction = this._currentAction ?? null;

        newAction.reset();
        newAction.play();
        if (oldAction) newAction.crossFadeFrom(oldAction, fadeDuration);
        this._currentAction = newAction;
    };

    private _getAnimationAction = (animationId: AnimationId): AnimationAction => {
        for (const action of this._actions) {
            if (action.getClip().name === animationId) {
                return action;
            }
        }
        throw new Error(`Animation action not found for animationId: ${animationId}`);
    };

    public update(dt: number): void {
        super.update(dt);
        if (this._mixer) this._mixer.update(dt);
    }
}

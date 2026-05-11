import { Camera, Color, Scene, Vector2, WebGLRenderer, WebGLRenderTarget } from 'three';
import { DebugGuiTitle } from '../../../constants/experiences/DebugGuiTitle';
import { LayerId } from '../../../constants/experiences/LayerId';
import { THREE_WORLD_CONFIG } from '../../../constants/experiences/ThreeWorldConfig';
import MainThreeApp from '../../../engines/threes/app/MainThreeApp';
import DebugManager from '../../../managers/DebugManager';
import KuwaharaPassFragmentShader from '../../../shaders/threes/composers/kuwahara/KuwaharaPassFragmentShader.glsl';
import KuwaharaPassVertexShader from '../../../shaders/threes/composers/kuwahara/KuwaharaPassVertexShader.glsl';
import ThreePassBase from '../bases/passes/ThreePassBase';

export default class KuwaharaThreePass extends ThreePassBase {
    private static readonly _FOLDER_TITLE: string = 'Kuwahara';
    private static readonly _MIN_DOWNSCALE: number = 1;
    private static readonly _MAX_DOWNSCALE: number = 8;
    private static readonly _MASK_LAYER: number = LayerId.NO_KUWAHARA;
    private static readonly _MASK_CLEAR_COLOR: Color = new Color(0x000000);

    private readonly _scene: Scene;
    private _camera: Camera;
    private readonly _maskRenderTarget: WebGLRenderTarget;
    private readonly _previousClearColor: Color = new Color();

    constructor(scene: Scene, camera: Camera) {
        super({
            uniforms: {
                tDiffuse: { value: null },
                uTexelSize: { value: new Vector2(1 / window.innerWidth, 1 / window.innerHeight) },
                uMask: { value: null },
            },
            vertexShader: KuwaharaPassVertexShader,
            fragmentShader: KuwaharaPassFragmentShader,
        });

        this._scene = scene;
        this._camera = camera;
        this._maskRenderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
            depthBuffer: false,
            stencilBuffer: false,
        });
        this.uniforms.uMask.value = this._maskRenderTarget.texture;

        this.enabled = THREE_WORLD_CONFIG.kuwahara.enabled;

        if (DebugManager.isActive) this._initDebug();
    }

    public override setCamera(camera: Camera): void {
        this._camera = camera;
    }

    public override setSize(width: number, height: number): void {
        super.setSize(width, height);
        (this.uniforms.uTexelSize.value as Vector2).set(1 / width, 1 / height);
        this._maskRenderTarget.setSize(width, height);
    }

    public override render(
        renderer: WebGLRenderer,
        writeBuffer: WebGLRenderTarget,
        readBuffer: WebGLRenderTarget,
        deltaTime: number,
        maskActive: boolean,
    ): void {
        this._renderMask(renderer);
        super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
    }

    private _renderMask(renderer: WebGLRenderer): void {
        const previousRenderTarget = renderer.getRenderTarget();
        const previousLayerMask = this._camera.layers.mask;
        const previousAutoClear = renderer.autoClear;
        const previousBackground = this._scene.background;
        renderer.getClearColor(this._previousClearColor);
        const previousClearAlpha = renderer.getClearAlpha();

        this._scene.background = null;
        this._camera.layers.set(KuwaharaThreePass._MASK_LAYER);
        renderer.setRenderTarget(this._maskRenderTarget);
        renderer.setClearColor(KuwaharaThreePass._MASK_CLEAR_COLOR, 0);
        renderer.autoClear = true;
        renderer.render(this._scene, this._camera);

        this._scene.background = previousBackground;
        this._camera.layers.mask = previousLayerMask;
        renderer.setRenderTarget(previousRenderTarget);
        renderer.setClearColor(this._previousClearColor, previousClearAlpha);
        renderer.autoClear = previousAutoClear;
    }

    public dispose(): void {
        this._maskRenderTarget.dispose();
    }

    private _initDebug(): void {
        const composersFolder = DebugManager.getGuiFolder(DebugGuiTitle.THREE_COMPOSERS);
        const folder = composersFolder.addFolder(KuwaharaThreePass._FOLDER_TITLE);
        const enabledCtrl = folder.add(this, 'enabled').name('enabled');

        const downscaleProxy = { value: THREE_WORLD_CONFIG.kuwahara.downscale };
        const downscaleCtrl = folder
            .add(
                downscaleProxy,
                'value',
                KuwaharaThreePass._MIN_DOWNSCALE,
                KuwaharaThreePass._MAX_DOWNSCALE,
                1,
            )
            .name('downscale')
            .onChange((value: number) => MainThreeApp.renderer.setDownscale(value));

        DebugManager.registerConfigGetter('kuwahara.enabled', () => this.enabled);
        DebugManager.registerConfigGetter('kuwahara.downscale', () => downscaleProxy.value);

        DebugManager.registerConfigSetter('kuwahara.enabled', (v) => enabledCtrl.setValue(v));
        DebugManager.registerConfigSetter('kuwahara.downscale', (v) => downscaleCtrl.setValue(v));
    }
}

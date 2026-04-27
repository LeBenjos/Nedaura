import { Color, DirectionalLight, DirectionalLightHelper, FogExp2, MathUtils, Spherical, Vector3, type DataTexture } from 'three';
import { AssetId } from '../../../../constants/experiences/AssetId';
import { DebugGuiTitle } from '../../../../constants/experiences/DebugGuiTitle';
import { THREE_WORLD_CONFIG } from '../../../../constants/experiences/ThreeWorldConfig';
import MainThreeApp from '../../../../engines/threes/app/MainThreeApp';
import DebugManager from '../../../../managers/DebugManager';
import ThreeAssetsManager from '../../../../managers/threes/ThreeAssetsManager';
import ThreeActorBase from '../../bases/components/ThreeActorBase';

interface EnvironmentMap {
    intensity?: number;
    texture?: DataTexture;
    hdrId?: AssetId;
}

export default class Environment extends ThreeActorBase {
    declare private _environmentMap: EnvironmentMap;
    declare private _sunLight: DirectionalLight;
    private _sunLightHelper?: DirectionalLightHelper;

    constructor() {
        super();

        this._generateEnvironmentMap();
        this._generateSunLight();
        this._generateFog();
    }

    public init(): void {
        this.reset();
        if (this._environmentMap) {
            MainThreeApp.scene.environment = this._environmentMap.texture!;
            MainThreeApp.scene.environmentIntensity = this._environmentMap.intensity!;
        }
    }

    public reset(): void {
        //
    }

    private _generateEnvironmentMap = (): void => {
        this._environmentMap = {};
        this._environmentMap.intensity = THREE_WORLD_CONFIG.environment.mapIntensity;
        this._environmentMap.hdrId = AssetId[THREE_WORLD_CONFIG.environment.hdrId as keyof typeof AssetId];
        this._environmentMap.texture = ThreeAssetsManager.getHDR(this._environmentMap.hdrId);
        this._environmentMap.texture.needsUpdate = true;

        MainThreeApp.scene.environment = this._environmentMap.texture;
        MainThreeApp.scene.environmentIntensity = this._environmentMap.intensity!;

        if (DebugManager.isActive) {
            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS)
            const environmentFolder = viewsDebug.addFolder('Ambient Light (HDR)');
            const hdrOptions: Record<string, AssetId> = {
                'Template': AssetId.THREE_HDR_TEMPLATE,
                'Ferndale Studio': AssetId.THREE_HDR_1,
                'Wooden Studio': AssetId.THREE_HDR_2,
                'Pink Sunrise': AssetId.THREE_HDR_3,
            };
            environmentFolder.add(this._environmentMap, 'intensity', 0, 100, 0.001).onChange(() => {
                MainThreeApp.scene.environmentIntensity = this._environmentMap.intensity!;
            });
            environmentFolder
                .add(this._environmentMap, 'hdrId', hdrOptions)
                .name('hdr')
                .onChange((id: AssetId) => {
                    const texture = ThreeAssetsManager.getHDR(id);
                    texture.needsUpdate = true;
                    this._environmentMap.texture = texture;
                    MainThreeApp.scene.environment = texture;
                });

            DebugManager.registerConfigGetter('environment.mapIntensity', () => this._environmentMap.intensity);
            DebugManager.registerConfigGetter('environment.hdrId', () => this._environmentMap.hdrId);
        }
    };

    private _generateSunLight(): void {
        this._sunLight = new DirectionalLight(
            new Color(THREE_WORLD_CONFIG.environment.sunLightColor),
            THREE_WORLD_CONFIG.environment.sunLightIntensity
        );
        this._sunLight.castShadow = true;
        this._sunLight.shadow.camera.far = THREE_WORLD_CONFIG.environment.sunShadowCameraFar;
        this._sunLight.shadow.mapSize.set(
            THREE_WORLD_CONFIG.environment.sunShadowMapSize,
            THREE_WORLD_CONFIG.environment.sunShadowMapSize
        );
        this._sunLight.shadow.normalBias = THREE_WORLD_CONFIG.environment.sunShadowNormalBias;
        this._sunLight.position.set(...THREE_WORLD_CONFIG.environment.sunPosition);
        this.add(this._sunLight);

        if (DebugManager.isActive) {
            this._sunLightHelper = new DirectionalLightHelper(
                this._sunLight,
                1
            );
            this._sunLightHelper.visible = DebugManager.isVisible;
            this.add(this._sunLightHelper);

            DebugManager.onVisibilityChange.add(this._onDebugVisibilityChange);

            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS)
            const sunLightFolder = viewsDebug.addFolder('Sun Light');
            sunLightFolder.add(this._sunLight, 'intensity', 0, 100, 0.001).name('intensity');

            const spherical = new Spherical().setFromVector3(this._sunLight.position);
            const sphericalProxy = {
                radius: spherical.radius,
                phiDeg: MathUtils.radToDeg(spherical.phi),
                thetaDeg: MathUtils.radToDeg(spherical.theta),
            };
            const applySpherical = (): void => {
                spherical.radius = Math.max(0.001, sphericalProxy.radius);
                spherical.phi = MathUtils.degToRad(sphericalProxy.phiDeg);
                spherical.theta = MathUtils.degToRad(sphericalProxy.thetaDeg);
                this._sunLight.position.setFromSpherical(spherical);
            };
            sunLightFolder.add(sphericalProxy, 'radius', 0.1, 200, 0.001).name('distance').onChange(applySpherical);
            sunLightFolder.add(sphericalProxy, 'phiDeg', 0, 180, 0.1).name('elevation (phi°)').onChange(applySpherical);
            sunLightFolder.add(sphericalProxy, 'thetaDeg', -180, 180, 0.1).name('azimuth (theta°)').onChange(applySpherical);

            sunLightFolder.addColor(this._sunLight, 'color').name('color');

            DebugManager.registerConfigGetter('environment.sunLightColor', () => '#' + this._sunLight.color.getHexString());
            DebugManager.registerConfigGetter('environment.sunLightIntensity', () => this._sunLight.intensity);
            DebugManager.registerConfigGetter('environment.sunShadowCameraFar', () => this._sunLight.shadow.camera.far);
            DebugManager.registerConfigGetter('environment.sunShadowMapSize', () => this._sunLight.shadow.mapSize.x);
            DebugManager.registerConfigGetter('environment.sunShadowNormalBias', () => this._sunLight.shadow.normalBias);
            DebugManager.registerConfigGetter('environment.sunPosition', () => [
                this._sunLight.position.x,
                this._sunLight.position.y,
                this._sunLight.position.z,
            ]);
        }
    }

    private _generateFog(): void {
        const fog = new FogExp2(new Color(THREE_WORLD_CONFIG.environment.fogColor), THREE_WORLD_CONFIG.environment.fogDensity);
        MainThreeApp.scene.fog = THREE_WORLD_CONFIG.environment.fogEnabled ? fog : null;

        if (DebugManager.isActive) {
            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS);
            const fogFolder = viewsDebug.addFolder('Fog');

            const fogProxy = { enabled: THREE_WORLD_CONFIG.environment.fogEnabled };
            fogFolder.add(fogProxy, 'enabled').name('enabled').onChange((enabled: boolean) => {
                MainThreeApp.scene.fog = enabled ? fog : null;
            });
            fogFolder.addColor(fog, 'color').name('color');
            fogFolder.add(fog, 'density', 0, 0.2, 0.0001).name('density');

            DebugManager.registerConfigGetter('environment.fogEnabled', () => fogProxy.enabled);
            DebugManager.registerConfigGetter('environment.fogColor', () => '#' + fog.color.getHexString());
            DebugManager.registerConfigGetter('environment.fogDensity', () => fog.density);
        }
    }

    public update(_dt: number): void {
        this._sunLightHelper?.update();
    }

    private readonly _onDebugVisibilityChange = (): void => {
        if (this._sunLightHelper) this._sunLightHelper.visible = DebugManager.isVisible;
    };
}

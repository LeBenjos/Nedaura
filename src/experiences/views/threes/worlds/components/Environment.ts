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
    private static readonly _SUN_SHADOW_MAP_SIZE: number = 1024;
    private static readonly _SUN_SHADOW_NORMAL_BIAS: number = 0.05;

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
            const intensityCtrl = environmentFolder.add(this._environmentMap, 'intensity', 0, 100, 0.001).onChange(() => {
                MainThreeApp.scene.environmentIntensity = this._environmentMap.intensity!;
            });
            const hdrCtrl = environmentFolder
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

            DebugManager.registerConfigSetter('environment.mapIntensity', (v) => intensityCtrl.setValue(v));
            DebugManager.registerConfigSetter('environment.hdrId', (v) => {
                const id = typeof v === 'string' ? AssetId[v as keyof typeof AssetId] : v;
                hdrCtrl.setValue(id);
            });
        }
    };

    private _generateSunLight(): void {
        this._sunLight = new DirectionalLight(
            new Color(THREE_WORLD_CONFIG.environment.sunLightColor),
            THREE_WORLD_CONFIG.environment.sunLightIntensity
        );
        this._sunLight.castShadow = true;

        const shadowCamSize = THREE_WORLD_CONFIG.environment.sunShadowCameraSize;
        this._sunLight.shadow.camera.near = THREE_WORLD_CONFIG.environment.sunShadowCameraNear;
        this._sunLight.shadow.camera.far = THREE_WORLD_CONFIG.environment.sunShadowCameraFar;
        this._sunLight.shadow.camera.left = -shadowCamSize;
        this._sunLight.shadow.camera.right = shadowCamSize;
        this._sunLight.shadow.camera.top = shadowCamSize;
        this._sunLight.shadow.camera.bottom = -shadowCamSize;

        this._sunLight.shadow.mapSize.set(
            Environment._SUN_SHADOW_MAP_SIZE,
            Environment._SUN_SHADOW_MAP_SIZE
        );
        this._sunLight.shadow.normalBias = Environment._SUN_SHADOW_NORMAL_BIAS;
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
            const sunIntensityCtrl = sunLightFolder.add(this._sunLight, 'intensity', 0, 100, 0.001).name('intensity');

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
            const sphRadiusCtrl = sunLightFolder.add(sphericalProxy, 'radius', 0.1, 200, 0.001).name('distance').onChange(applySpherical);
            const sphPhiCtrl = sunLightFolder.add(sphericalProxy, 'phiDeg', 0, 180, 0.1).name('elevation (phi°)').onChange(applySpherical);
            const sphThetaCtrl = sunLightFolder.add(sphericalProxy, 'thetaDeg', -180, 180, 0.1).name('azimuth (theta°)').onChange(applySpherical);

            const sunColorCtrl = sunLightFolder.addColor(this._sunLight, 'color').name('color');

            const shadowCam = this._sunLight.shadow.camera;
            const shadowProxy = {
                near: shadowCam.near,
                far: shadowCam.far,
                size: THREE_WORLD_CONFIG.environment.sunShadowCameraSize,
            };
            const updateShadowFrustum = (): void => {
                shadowCam.near = shadowProxy.near;
                shadowCam.far = shadowProxy.far;
                shadowCam.left = -shadowProxy.size;
                shadowCam.right = shadowProxy.size;
                shadowCam.top = shadowProxy.size;
                shadowCam.bottom = -shadowProxy.size;
                shadowCam.updateProjectionMatrix();
            };
            const shadowNearCtrl = sunLightFolder.add(shadowProxy, 'near', 0.01, 10, 0.01).name('shadow near').onChange(updateShadowFrustum);
            const shadowFarCtrl = sunLightFolder.add(shadowProxy, 'far', 1, 500, 0.1).name('shadow far').onChange(updateShadowFrustum);
            const shadowSizeCtrl = sunLightFolder.add(shadowProxy, 'size', 1, 100, 0.1).name('shadow size').onChange(updateShadowFrustum);

            DebugManager.registerConfigGetter('environment.sunLightColor', () => '#' + this._sunLight.color.getHexString());
            DebugManager.registerConfigGetter('environment.sunLightIntensity', () => this._sunLight.intensity);
            DebugManager.registerConfigGetter('environment.sunShadowCameraFar', () => this._sunLight.shadow.camera.far);
            DebugManager.registerConfigGetter('environment.sunShadowCameraNear', () => this._sunLight.shadow.camera.near);
            DebugManager.registerConfigGetter('environment.sunShadowCameraSize', () => shadowProxy.size);
            DebugManager.registerConfigGetter('environment.sunPosition', () => [
                this._sunLight.position.x,
                this._sunLight.position.y,
                this._sunLight.position.z,
            ]);

            DebugManager.registerConfigSetter('environment.sunLightColor', (v) => {
                this._sunLight.color.set(v as string);
                sunColorCtrl.updateDisplay();
            });
            DebugManager.registerConfigSetter('environment.sunLightIntensity', (v) => sunIntensityCtrl.setValue(v));
            DebugManager.registerConfigSetter('environment.sunShadowCameraFar', (v) => shadowFarCtrl.setValue(v));
            DebugManager.registerConfigSetter('environment.sunShadowCameraNear', (v) => shadowNearCtrl.setValue(v));
            DebugManager.registerConfigSetter('environment.sunShadowCameraSize', (v) => shadowSizeCtrl.setValue(v));
            DebugManager.registerConfigSetter('environment.sunPosition', (v) => {
                const [x, y, z] = v as [number, number, number];
                this._sunLight.position.set(x, y, z);
                spherical.setFromVector3(this._sunLight.position);
                sphRadiusCtrl.setValue(spherical.radius);
                sphPhiCtrl.setValue(MathUtils.radToDeg(spherical.phi));
                sphThetaCtrl.setValue(MathUtils.radToDeg(spherical.theta));
            });
        }
    }

    private _generateFog(): void {
        const fog = new FogExp2(new Color(THREE_WORLD_CONFIG.environment.fogColor), THREE_WORLD_CONFIG.environment.fogDensity);
        MainThreeApp.scene.fog = THREE_WORLD_CONFIG.environment.fogEnabled ? fog : null;

        if (DebugManager.isActive) {
            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS);
            const fogFolder = viewsDebug.addFolder('Fog');

            const fogProxy = { enabled: THREE_WORLD_CONFIG.environment.fogEnabled };
            const fogEnabledCtrl = fogFolder.add(fogProxy, 'enabled').name('enabled').onChange((enabled: boolean) => {
                MainThreeApp.scene.fog = enabled ? fog : null;
            });
            const fogColorCtrl = fogFolder.addColor(fog, 'color').name('color');
            const fogDensityCtrl = fogFolder.add(fog, 'density', 0, 0.2, 0.0001).name('density');

            DebugManager.registerConfigGetter('environment.fogEnabled', () => fogProxy.enabled);
            DebugManager.registerConfigGetter('environment.fogColor', () => '#' + fog.color.getHexString());
            DebugManager.registerConfigGetter('environment.fogDensity', () => fog.density);

            DebugManager.registerConfigSetter('environment.fogEnabled', (v) => fogEnabledCtrl.setValue(v));
            DebugManager.registerConfigSetter('environment.fogColor', (v) => {
                fog.color.set(v as string);
                fogColorCtrl.updateDisplay();
            });
            DebugManager.registerConfigSetter('environment.fogDensity', (v) => fogDensityCtrl.setValue(v));
        }
    }

    public update(_dt: number): void {
        this._sunLightHelper?.update();
    }

    private readonly _onDebugVisibilityChange = (): void => {
        if (this._sunLightHelper) this._sunLightHelper.visible = DebugManager.isVisible;
    };
}

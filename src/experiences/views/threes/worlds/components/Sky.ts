import { MathUtils, Vector3 } from "three";
import { Sky as ThreeSky } from "three/examples/jsm/objects/Sky.js";
import { DebugGuiTitle } from "../../../../constants/experiences/DebugGuiTitle";
import DebugManager from "../../../../managers/DebugManager";
import ThreeActorBase from "../../bases/components/ThreeActorBase";

export default class Sky extends ThreeActorBase {
    private static readonly _SCALE: number = 1000;
    private static readonly _DEFAULT_TURBIDITY: number = 10;
    private static readonly _DEFAULT_RAYLEIGH: number = 2;
    private static readonly _DEFAULT_MIE_COEFFICIENT: number = 0.005;
    private static readonly _DEFAULT_MIE_DIRECTIONAL_G: number = 0.8;
    private static readonly _DEFAULT_SUN_ELEVATION_DEG: number = 30;
    private static readonly _DEFAULT_SUN_AZIMUTH_DEG: number = 180;

    declare private _sky: ThreeSky;

    constructor() {
        super();

        this._generateSky();
    }

    private _generateSky(): void {
        this._sky = new ThreeSky();
        this._sky.scale.setScalar(Sky._SCALE);

        const uniforms = this._sky.material.uniforms;
        uniforms.turbidity.value = Sky._DEFAULT_TURBIDITY;
        uniforms.rayleigh.value = Sky._DEFAULT_RAYLEIGH;
        uniforms.mieCoefficient.value = Sky._DEFAULT_MIE_COEFFICIENT;
        uniforms.mieDirectionalG.value = Sky._DEFAULT_MIE_DIRECTIONAL_G;

        this._updateSunPosition(Sky._DEFAULT_SUN_ELEVATION_DEG, Sky._DEFAULT_SUN_AZIMUTH_DEG);

        this.add(this._sky);

        if (DebugManager.isActive) {
            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS);
            const skyFolder = viewsDebug.addFolder('Sky');

            skyFolder.add(uniforms.turbidity, 'value', 0, 20, 0.1).name('turbidity');
            skyFolder.add(uniforms.rayleigh, 'value', 0, 4, 0.001).name('rayleigh');
            skyFolder.add(uniforms.mieCoefficient, 'value', 0, 0.1, 0.0001).name('mie coefficient');
            skyFolder.add(uniforms.mieDirectionalG, 'value', 0, 1, 0.001).name('mie directional g');

            const sunProxy = {
                elevation: Sky._DEFAULT_SUN_ELEVATION_DEG,
                azimuth: Sky._DEFAULT_SUN_AZIMUTH_DEG,
            };
            skyFolder.add(sunProxy, 'elevation', -10, 90, 0.1).name('sun elevation').onChange(() => {
                this._updateSunPosition(sunProxy.elevation, sunProxy.azimuth);
            });
            skyFolder.add(sunProxy, 'azimuth', -180, 180, 0.1).name('sun azimuth').onChange(() => {
                this._updateSunPosition(sunProxy.elevation, sunProxy.azimuth);
            });
        }
    }

    private _updateSunPosition(elevationDeg: number, azimuthDeg: number): void {
        const phi = MathUtils.degToRad(90 - elevationDeg);
        const theta = MathUtils.degToRad(azimuthDeg);
        const sun = this._sky.material.uniforms.sunPosition.value as Vector3;
        sun.setFromSphericalCoords(1, phi, theta);
    }
}

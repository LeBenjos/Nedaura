import { Color, MathUtils, Vector3 } from "three";
import { Sky as ThreeSky } from "three/examples/jsm/objects/Sky.js";
import { DebugGuiTitle } from "../../../../constants/experiences/DebugGuiTitle";
import { THREE_WORLD_CONFIG } from "../../../../constants/experiences/ThreeWorldConfig";
import DebugManager from "../../../../managers/DebugManager";
import ThreeActorBase from "../../bases/components/ThreeActorBase";

export default class Sky extends ThreeActorBase {
    private static readonly _SCALE: number = 1000;

    declare private _sky: ThreeSky;

    constructor() {
        super();

        this._generateSky();
    }

    private _generateSky(): void {
        this._sky = new ThreeSky();
        this._sky.scale.setScalar(Sky._SCALE);

        const material = this._sky.material;
        const uniforms = material.uniforms;

        const tintColor = new Color(THREE_WORLD_CONFIG.sky.tintColor);
        uniforms.tintColor = { value: new Vector3(tintColor.r, tintColor.g, tintColor.b) };

        material.fragmentShader = material.fragmentShader.replace(
            'gl_FragColor = vec4( texColor, 1.0 );',
            'gl_FragColor = vec4( texColor * tintColor, 1.0 );'
        );
        material.fragmentShader = 'uniform vec3 tintColor;\n' + material.fragmentShader;
        material.needsUpdate = true;

        uniforms.turbidity.value = THREE_WORLD_CONFIG.sky.turbidity;
        uniforms.rayleigh.value = THREE_WORLD_CONFIG.sky.rayleigh;
        uniforms.mieCoefficient.value = THREE_WORLD_CONFIG.sky.mieCoefficient;
        uniforms.mieDirectionalG.value = THREE_WORLD_CONFIG.sky.mieDirectionalG;

        this._updateSunPosition(THREE_WORLD_CONFIG.sky.sunElevationDeg, THREE_WORLD_CONFIG.sky.sunAzimuthDeg);

        this.add(this._sky);

        if (DebugManager.isActive) {
            const viewsDebug = DebugManager.getGuiFolder(DebugGuiTitle.THREE_VIEWS);
            const skyFolder = viewsDebug.addFolder('Sky');

            skyFolder.add(uniforms.turbidity, 'value', 0, 20, 0.1).name('turbidity');
            skyFolder.add(uniforms.rayleigh, 'value', 0, 4, 0.001).name('rayleigh');
            skyFolder.add(uniforms.mieCoefficient, 'value', 0, 0.1, 0.0001).name('mie coefficient');
            skyFolder.add(uniforms.mieDirectionalG, 'value', 0, 1, 0.001).name('mie directional g');

            const sunProxy = {
                elevation: THREE_WORLD_CONFIG.sky.sunElevationDeg,
                azimuth: THREE_WORLD_CONFIG.sky.sunAzimuthDeg,
            };
            skyFolder.add(sunProxy, 'elevation', -10, 90, 0.1).name('sun elevation').onChange(() => {
                this._updateSunPosition(sunProxy.elevation, sunProxy.azimuth);
            });
            skyFolder.add(sunProxy, 'azimuth', -180, 180, 0.1).name('sun azimuth').onChange(() => {
                this._updateSunPosition(sunProxy.elevation, sunProxy.azimuth);
            });

            const tintProxy = { color: THREE_WORLD_CONFIG.sky.tintColor };
            skyFolder.addColor(tintProxy, 'color').name('tint color').onChange(() => {
                tintColor.set(tintProxy.color);
                uniforms.tintColor.value.set(tintColor.r, tintColor.g, tintColor.b);
            });

            DebugManager.registerConfigGetter('sky.turbidity', () => uniforms.turbidity.value);
            DebugManager.registerConfigGetter('sky.rayleigh', () => uniforms.rayleigh.value);
            DebugManager.registerConfigGetter('sky.mieCoefficient', () => uniforms.mieCoefficient.value);
            DebugManager.registerConfigGetter('sky.mieDirectionalG', () => uniforms.mieDirectionalG.value);
            DebugManager.registerConfigGetter('sky.sunElevationDeg', () => sunProxy.elevation);
            DebugManager.registerConfigGetter('sky.sunAzimuthDeg', () => sunProxy.azimuth);
            DebugManager.registerConfigGetter('sky.tintColor', () => tintProxy.color);
        }
    }

    private _updateSunPosition(elevationDeg: number, azimuthDeg: number): void {
        const phi = MathUtils.degToRad(90 - elevationDeg);
        const theta = MathUtils.degToRad(azimuthDeg);
        const sun = this._sky.material.uniforms.sunPosition.value as Vector3;
        sun.setFromSphericalCoords(1, phi, theta);
    }
}

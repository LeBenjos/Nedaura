import type { ColorSpace, ToneMapping } from 'three';

export interface ThreeWorldConfig {
    camera: {
        fov: number;
        target: [number, number, number];
        radius: number;
        phiDeg: number;
        thetaDeg: number;
    };
    kuwahara: {
        enabled: boolean;
        downscale: number;
    };
    renderer: {
        postProcessing: boolean;
        toneMapping: ToneMapping;
        outputColorSpace: ColorSpace;
        toneMappingExposure: number;
    };
    environment: {
        mapIntensity: number;
        hdrId: string;
        sunLightColor: string;
        sunLightIntensity: number;
        sunShadowCameraFar: number;
        sunShadowCameraNear: number;
        sunShadowCameraSize: number;
        sunPosition: [number, number, number];
        fogEnabled: boolean;
        fogColor: string;
        fogDensity: number;
    };
    sky: {
        turbidity: number;
        rayleigh: number;
        mieCoefficient: number;
        mieDirectionalG: number;
        sunElevationDeg: number;
        sunAzimuthDeg: number;
        tintColor: string;
    };
    dunes: {
        textureRepeat: number;
        textureRotation: number;
        color: string;
        roughness: number;
        metalness: number;
        normalScaleX: number;
        normalScaleY: number;
    };
    windLines: {
        enabled: boolean;
        handDepth: number;
        handSpread: number;
        smoothing: number;
        numTrails: number;
        lineWidth: number;
        trailSpread: number;
        amplitudeXY: number;
        amplitudeZ: number;
        color0: string;
        color1: string;
        color2: string;
        color3: string;
    };
}

export const THREE_WORLD_CONFIG: ThreeWorldConfig = {
    "camera": {
        "fov": 38,
        "target": [
            0,
            1.05,
            0
        ],
        "radius": 4,
        "phiDeg": 91.01,
        "thetaDeg": 0
    },
    "kuwahara": {
        "enabled": true,
        "downscale": 1
    },
    "renderer": {
        "postProcessing": false,
        "toneMapping": 5,
        "outputColorSpace": "srgb",
        "toneMappingExposure": 1
    },
    "environment": {
        "mapIntensity": 1,
        "hdrId": "THREE_HDR_3",
        "sunLightColor": "#ffd4b8",
        "sunLightIntensity": 2.797,
        "sunShadowCameraFar": 10,
        "sunShadowCameraNear": 1,
        "sunShadowCameraSize": 20,
        "sunPosition": [
            -3.2564509231010397,
            3.650811383103761,
            -1.0330070815025356
        ],
        "fogEnabled": true,
        "fogColor": "#c287ab",
        "fogDensity": 0.0364
    },
    "sky": {
        "turbidity": 0.4,
        "rayleigh": 1.151,
        "mieCoefficient": 0.0942,
        "mieDirectionalG": 1,
        "sunElevationDeg": 15.9,
        "sunAzimuthDeg": 180,
        "tintColor": "#ffb0af"
    },
    "dunes": {
        "textureRepeat": 127.2,
        "textureRotation": 58.6,
        "color": "#bd5d65",
        "roughness": 0.702,
        "metalness": 1,
        "normalScaleX": 2.998,
        "normalScaleY": -2.046
    },
    "windLines": {
        "enabled": true,
        "handDepth": 0,
        "handSpread": 8.9,
        "smoothing": 0.41,
        "numTrails": 5,
        "lineWidth": 0.35,
        "trailSpread": 0.3,
        "amplitudeXY": 0.2,
        "amplitudeZ": 0.1,
        "color0": "#ffffff",
        "color1": "#ffffff",
        "color2": "#ffffff",
        "color3": "#ffffff"
    }
} as const;

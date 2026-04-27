import type { ColorSpace, ToneMapping } from 'three';

export interface ThreeWorldConfig {
    kuwahara: {
        enabled: boolean;
        downscale: number;
    };
    renderer: {
        postProcessing: boolean;
        toneMapping: ToneMapping;
        outputColorSpace: ColorSpace;
        toneMappingExposure: number;
        clearColor: string;
        clearAlpha: number;
    };
    environment: {
        mapIntensity: number;
        hdrId: string;
        sunLightColor: string;
        sunLightIntensity: number;
        sunShadowCameraFar: number;
        sunShadowMapSize: number;
        sunShadowNormalBias: number;
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
    "kuwahara": {
        "enabled": true,
        "downscale": 1
    },
    "renderer": {
        "postProcessing": false,
        "toneMapping": 5,
        "outputColorSpace": "srgb",
        "toneMappingExposure": 1,
        "clearColor": "#fafafa",
        "clearAlpha": 0
    },
    "environment": {
        "mapIntensity": 1,
        "hdrId": "THREE_HDR_3",
        "sunLightColor": "#ffffff",
        "sunLightIntensity": 1,
        "sunShadowCameraFar": 15,
        "sunShadowMapSize": 1024,
        "sunShadowNormalBias": 0.05,
        "sunPosition": [
            0,
            2,
            1
        ],
        "fogEnabled": true,
        "fogColor": "#d8a878",
        "fogDensity": 0.015
    },
    "sky": {
        "turbidity": 10,
        "rayleigh": 2,
        "mieCoefficient": 0.005,
        "mieDirectionalG": 0.8,
        "sunElevationDeg": 30,
        "sunAzimuthDeg": 180,
        "tintColor": "#ffffff"
    },
    "dunes": {
        "textureRepeat": 50,
        "textureRotation": 0,
        "color": "#8c2120",
        "roughness": 1,
        "metalness": 0,
        "normalScaleX": 1,
        "normalScaleY": 1
    },
    "windLines": {
        "enabled": true,
        "handDepth": 0,
        "handSpread": 4,
        "smoothing": 0.07,
        "numTrails": 6,
        "lineWidth": 0.35,
        "trailSpread": 0.3,
        "amplitudeXY": 0.2,
        "amplitudeZ": 0.1,
        "color0": "#f2f2f2",
        "color1": "#ececec",
        "color2": "#e0e0e0",
        "color3": "#dadada"
    }
} as const;

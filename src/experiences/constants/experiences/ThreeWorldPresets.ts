import type { ThreeWorldConfig } from './ThreeWorldConfig';

export type ThreeWorldPresetId = 'base' | 'wind' | 'rain' | 'sun';

export const THREE_WORLD_DEFAULT_PRESET_ID: ThreeWorldPresetId = 'base';

export const THREE_WORLD_PRESETS: Record<ThreeWorldPresetId, ThreeWorldConfig> = {
    "base": {
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
            "downscale": 2
        },
        "smaa": {
            "enabled": true
        },
        "renderer": {
            "postProcessing": true,
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
            "turbidity": 0,
            "rayleigh": 4,
            "mieCoefficient": 0.0906,
            "mieDirectionalG": 0.841,
            "sunElevationDeg": 14.1,
            "sunAzimuthDeg": 180,
            "tintColor": "#ae959e"
        },
        "dunes": {
            "textureRepeat": 127.2,
            "textureRotation": 58.6,
            "color": "#8e1c26",
            "roughness": 0.702,
            "metalness": 1,
            "normalScaleX": 2.998,
            "normalScaleY": -2.046
        },
        "windLines": {
            "enabled": true,
            "handDepth": 0,
            "handSpread": 9,
            "smoothing": 0.45,
            "lineWidth": 0.3,
            "trailSpread": 0.3,
            "amplitudeXY": 0.2,
            "amplitudeZ": 0.3,
            "minHeight": 0,
            "trailLength": 25,
            "color0": "#ffffff",
            "color1": "#ffffff",
            "color2": "#ffffff",
            "color3": "#ffffff",
            "numTrails": 5
        }
    },
    "wind": {
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
            "downscale": 2
        },
        "smaa": {
            "enabled": true
        },
        "renderer": {
            "postProcessing": true,
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
            "turbidity": 0,
            "rayleigh": 4,
            "mieCoefficient": 0.0906,
            "mieDirectionalG": 0.841,
            "sunElevationDeg": 14.1,
            "sunAzimuthDeg": 180,
            "tintColor": "#96656e"
        },
        "dunes": {
            "textureRepeat": 127.2,
            "textureRotation": 58.6,
            "color": "#352628",
            "roughness": 0.702,
            "metalness": 1,
            "normalScaleX": 2.998,
            "normalScaleY": -2.046
        },
        "windLines": {
            "enabled": true,
            "handDepth": 0,
            "handSpread": 9,
            "smoothing": 0.45,
            "lineWidth": 0.3,
            "trailSpread": 0.3,
            "amplitudeXY": 0.2,
            "amplitudeZ": 0.3,
            "minHeight": 0,
            "trailLength": 25,
            "color0": "#ffffff",
            "color1": "#ffffff",
            "color2": "#ffffff",
            "color3": "#ffffff",
            "numTrails": 5
        }
    },
    "rain": {
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
            "downscale": 2
        },
        "smaa": {
            "enabled": true
        },
        "renderer": {
            "postProcessing": true,
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
            "turbidity": 0,
            "rayleigh": 4,
            "mieCoefficient": 0.0906,
            "mieDirectionalG": 0.841,
            "sunElevationDeg": 14.1,
            "sunAzimuthDeg": 180,
            "tintColor": "#fe8ebf"
        },
        "dunes": {
            "textureRepeat": 127.2,
            "textureRotation": 58.6,
            "color": "#705f85",
            "roughness": 0.702,
            "metalness": 1,
            "normalScaleX": 2.998,
            "normalScaleY": -2.046
        },
        "windLines": {
            "enabled": true,
            "handDepth": 0,
            "handSpread": 9,
            "smoothing": 0.45,
            "lineWidth": 0.3,
            "trailSpread": 0.3,
            "amplitudeXY": 0.2,
            "amplitudeZ": 0.3,
            "minHeight": 0,
            "trailLength": 25,
            "color0": "#ffffff",
            "color1": "#ffffff",
            "color2": "#ffffff",
            "color3": "#ffffff",
            "numTrails": 5
        }
    },
    "sun": {
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
            "downscale": 2
        },
        "smaa": {
            "enabled": true
        },
        "renderer": {
            "postProcessing": true,
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
            "turbidity": 0,
            "rayleigh": 0.75,
            "mieCoefficient": 0.0906,
            "mieDirectionalG": 0.841,
            "sunElevationDeg": 14.1,
            "sunAzimuthDeg": 180,
            "tintColor": "#eecbff"
        },
        "dunes": {
            "textureRepeat": 127.2,
            "textureRotation": 58.6,
            "color": "#e8b8a1",
            "roughness": 0.702,
            "metalness": 1,
            "normalScaleX": 2.998,
            "normalScaleY": -2.046
        },
        "windLines": {
            "enabled": true,
            "handDepth": 0,
            "handSpread": 9,
            "smoothing": 0.45,
            "lineWidth": 0.3,
            "trailSpread": 0.3,
            "amplitudeXY": 0.2,
            "amplitudeZ": 0.3,
            "minHeight": 0,
            "trailLength": 25,
            "color0": "#ffffff",
            "color1": "#ffffff",
            "color2": "#ffffff",
            "color3": "#ffffff",
            "numTrails": 5
        }
    }
} as const;

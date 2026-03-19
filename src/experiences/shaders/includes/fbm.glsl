#ifndef FBM_GLSL
#define FBM_GLSL

#include "noise.glsl"

float fbm(vec2 p, int octaves, float initialAmplitude, float frequencyGain, float amplitudeDecay) {
    float value = 0.0;
    float amplitude = initialAmplitude;
    mat2 rotation = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < octaves; i++) {
        value += amplitude * noise(p);
        p = rotation * p * frequencyGain;
        amplitude *= amplitudeDecay;
    }
    return value;
}

#endif

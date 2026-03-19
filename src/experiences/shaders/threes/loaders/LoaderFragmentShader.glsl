precision mediump float;

#include "../../includes/fbm.glsl"

uniform vec3 uColor;
uniform float uProgress;
uniform float uTime;

varying vec2 vUv;

// --- Constants ---

const int FBM_OCTAVES = 5;
const float FBM_INITIAL_AMPLITUDE = 0.5;
const float FBM_FREQUENCY_GAIN = 2.0;
const float FBM_AMPLITUDE_DECAY = 0.5;

const float NOISE_SCALE = 3.0;
const float NOISE_SPEED = 0.08;

const float DISTANCE_WEIGHT = 0.7;
const float NOISE_WEIGHT = 0.3;

const float DISSOLVE_EDGE_SOFTNESS = 0.12;
const float DISSOLVE_RANGE_MAX = 0.85;

// --- Main ---

void main() {
    vec2 uv = vUv;

    float distFromCenter = length(uv - 0.5);

    float organicNoise = fbm(uv * NOISE_SCALE + uTime * NOISE_SPEED, FBM_OCTAVES, FBM_INITIAL_AMPLITUDE, FBM_FREQUENCY_GAIN, FBM_AMPLITUDE_DECAY);

    float dissolveMap = distFromCenter * DISTANCE_WEIGHT + organicNoise * NOISE_WEIGHT;

    float thresholdMin = -DISSOLVE_EDGE_SOFTNESS;
    float thresholdMax = DISSOLVE_RANGE_MAX + DISSOLVE_EDGE_SOFTNESS;
    float threshold = mix(thresholdMax, thresholdMin, uProgress);

    float alpha = smoothstep(
        threshold - DISSOLVE_EDGE_SOFTNESS,
        threshold + DISSOLVE_EDGE_SOFTNESS,
        dissolveMap
    );

    gl_FragColor = vec4(uColor, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}

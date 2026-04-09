uniform sampler2D tDiffuse;
uniform vec2 uTexelSize;

varying vec2 vUv;

// Generalized Kuwahara filter (radius = 3).
// Splits the neighborhood into 4 quadrants, keeps the mean of the
// one with the lowest variance — producing a painterly, edge-preserving result.
void main() {
    const int R = 3;

    vec3 mean[4];
    vec3 var_[4];
    for (int i = 0; i < 4; i++) {
        mean[i] = vec3(0.0);
        var_[i] = vec3(0.0);
    }

    // Top-left quadrant
    for (int j = -R; j <= 0; j++) {
        for (int i = -R; i <= 0; i++) {
            vec3 c = texture2D(tDiffuse, vUv + vec2(float(i), float(j)) * uTexelSize).rgb;
            mean[0] += c; var_[0] += c * c;
        }
    }
    // Top-right quadrant
    for (int j = -R; j <= 0; j++) {
        for (int i = 0; i <= R; i++) {
            vec3 c = texture2D(tDiffuse, vUv + vec2(float(i), float(j)) * uTexelSize).rgb;
            mean[1] += c; var_[1] += c * c;
        }
    }
    // Bottom-left quadrant
    for (int j = 0; j <= R; j++) {
        for (int i = -R; i <= 0; i++) {
            vec3 c = texture2D(tDiffuse, vUv + vec2(float(i), float(j)) * uTexelSize).rgb;
            mean[2] += c; var_[2] += c * c;
        }
    }
    // Bottom-right quadrant
    for (int j = 0; j <= R; j++) {
        for (int i = 0; i <= R; i++) {
            vec3 c = texture2D(tDiffuse, vUv + vec2(float(i), float(j)) * uTexelSize).rgb;
            mean[3] += c; var_[3] += c * c;
        }
    }

    float n = float((R + 1) * (R + 1));
    float minVar = 1e10;
    vec3 result = vec3(0.0);

    for (int i = 0; i < 4; i++) {
        mean[i] /= n;
        var_[i] = var_[i] / n - mean[i] * mean[i];
        float v = dot(var_[i], vec3(1.0));
        if (v < minVar) {
            minVar = v;
            result = mean[i];
        }
    }

    gl_FragColor = vec4(result, 1.0);
}

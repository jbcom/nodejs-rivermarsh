/**
 * Fur Shader - Shell-based fur rendering
 *
 * Uses multiple shell layers to create a fur effect.
 * Each layer is slightly displaced along the normal.
 */

export const furVertexShader = /* glsl */ `
uniform float layerOffset;
uniform float spacing;
uniform float time;

varying vec2 vUv;
varying float vLayerAlpha;

void main() {
    vUv = uv;
    vLayerAlpha = layerOffset;
    
    // Displace vertex along normal based on layer
    vec3 displaced = position + normal * layerOffset * spacing;
    
    // Add slight wind movement to fur tips
    float windStrength = layerOffset * 0.02;
    displaced.x += sin(time * 2.0 + position.y * 5.0) * windStrength;
    displaced.z += cos(time * 1.5 + position.x * 5.0) * windStrength;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const furFragmentShader = /* glsl */ `
uniform vec3 colorBase;
uniform vec3 colorTip;
uniform float time;

varying vec2 vUv;
varying float vLayerAlpha;

// Simple noise function for fur variation
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    // Create fur strand pattern using noise
    vec2 strandUV = vUv * 50.0;
    float strandNoise = hash(floor(strandUV));
    
    // Density falls off with layer height (outer layers have less fur)
    float density = 1.0 - vLayerAlpha * 0.8;
    
    // Random cutoff for strand visibility
    float cutoff = step(strandNoise, density);
    
    // Discard pixels where there's no fur strand
    if (cutoff < 0.5) {
        discard;
    }
    
    // Interpolate color from base to tip based on layer
    vec3 furColor = mix(colorBase, colorTip, vLayerAlpha);
    
    // Add subtle variation
    furColor *= 0.9 + strandNoise * 0.2;
    
    // Alpha falls off at tips for soft edges
    float alpha = 1.0 - vLayerAlpha * vLayerAlpha;
    alpha *= cutoff;
    
    gl_FragColor = vec4(furColor, alpha);
}
`;

// Shader configuration defaults
export const FUR_DEFAULTS = {
    layers: 6,
    spacing: 0.02,
    skinColor: 0x3e2723,
    tipColor: 0x795548,
};

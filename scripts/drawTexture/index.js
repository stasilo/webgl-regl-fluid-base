const regl = require('../reglInstance')();
const glsl = require('glslify');

const drawTexture = (args, antialias = false, grain = false) => regl({
    framebuffer: regl.prop('output'),
    frag: glsl`
        precision mediump float;

        uniform sampler2D texture;
        uniform vec2 resolution;

        uniform bool antialias;
        uniform bool grain;

        varying vec2 uv;

        #pragma glslify: fxaa = require(glsl-fxaa)

        float rand(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        vec3 saturate(vec3 a) {
            return clamp(a, 0., 1.);
        }

        void main () {
            vec4 col = antialias == true
                ? fxaa(texture, gl_FragCoord.xy, resolution)
                : texture2D(texture, uv);

            if(grain) {
                col.rgb += (rand(uv) - 0.5) * 0.07;
                col.rgb = saturate(col.rgb);
            }

            gl_FragColor = col;
        }
    `,
    vert: glsl`
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;

        void main () {
            uv = position;
            gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
        }
    `,
    attributes: {
        position: [
            -2, 0,
            0, -2,
            2, 2
        ]
    },
    uniforms: {
        resolution: context => [context.viewportWidth, context.viewportHeight],
        texture: regl.prop('texture'),
        antialias,
        grain
    },
    count: 3
})(args);

const drawTextureToScreen = (args, antialias = false, grain = false) => drawTexture( {output: null, texture: args.texture}, antialias, grain);

module.exports = {drawTexture, drawTextureToScreen};

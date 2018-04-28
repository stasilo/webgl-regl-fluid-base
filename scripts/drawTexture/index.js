const regl = require('../reglInstance')();
const glsl = require('glslify');

const canvas = document.getElementsByTagName('canvas')[0];

const drawTexture = (args, antialias = false) => regl({
    framebuffer: regl.prop('output'),
    frag: antialias
        ? glsl`
            precision mediump float;

            #pragma glslify: fxaa = require(glsl-fxaa)

            uniform sampler2D texture;
            uniform vec2 resolution;

            void main () {
                gl_FragColor = fxaa(texture, gl_FragCoord.xy, resolution);
            }
        `
        : glsl`
            precision mediump float;

            uniform sampler2D texture;
            varying vec2 uv;

            void main () {
                gl_FragColor = texture2D(texture, uv);
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
        texture: regl.prop('texture'),
        resolution: [canvas.width, canvas.height],
    },
    count: 3
})(args);

const drawTextureToScreen = (args, antialias = true) => drawTexture( {output: null, texture: args.texture}, antialias);

module.exports = {drawTexture, drawTextureToScreen};

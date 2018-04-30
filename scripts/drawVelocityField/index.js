const regl = require('../reglInstance')();
const glsl = require('glslify');

const drawVelocityField = args => regl({
    framebuffer: args.output,
    frag: glsl`
        precision mediump float;
        // uniform float time;

        varying vec2 uv;

        #define SCALE 2. // bigger scale => smaller swirls in bigger no.

        #pragma glslify: map = require('glsl-map');

        void main () {
            gl_FragColor = vec4(
                map(sin(2.0 * ${Math.PI} * uv.y * SCALE), -1., 1., 0., 1.),
                map(sin(2.0 * ${Math.PI} * uv.x * SCALE), -1., 1., 0., 1.),
                0.0,
                1.0
            );
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
        // time: ({tick}) => 0.01 * tick
    },
    count: 3
})();

module.exports = drawVelocityField;

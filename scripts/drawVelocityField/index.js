const regl = require('../reglInstance')();
const glsl = require('glslify');

const defined = require('../utils').defined;

const defaultField = {
    vX: `sin(2.0 * ${Math.PI} * uv.y * SCALE)`,
    vY: `sin(2.0 * ${Math.PI} * uv.x * SCALE)`
};

const drawVelocityField = args => regl({
    framebuffer: args.output,
    frag: glsl`
        precision mediump float;
        varying vec2 uv;

        #define SCALE 2. // bigger scale => smaller swirls in bigger numbers

        #pragma glslify: map = require('glsl-map');

        void main () {
            gl_FragColor = vec4(
                map(${defined(args.field) ? args.field.vX : defaultField.vX}, -1., 1., 0., 1.),
                map(${defined(args.field) ? args.field.vY : defaultField.vY}, -1., 1., 0., 1.),
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

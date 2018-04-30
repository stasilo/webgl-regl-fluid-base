const regl = require('../reglInstance')();
const glsl = require('glslify');

const canvas = document.getElementsByTagName('canvas')[0];
const mouse = require('mouse-position')();

const disturbFieldWithMouse = args => regl({
    framebuffer: args.output,
    frag: glsl`
        precision mediump float;
        uniform float time;
        uniform sampler2D velocityTexture;
        uniform vec4 mouse;
        uniform vec2 resolution;

        varying vec2 uv;

        #pragma glslify: map = require('glsl-map');

        #define SPLAT_INTENSITY 20.

        void main () {
            float dist = length(gl_FragCoord.xy - mouse.xy);
            float radius = 0.25;
            float blobIntensity = exp(-(0.01 * dist) / radius);

            vec2 blob = clamp(blobIntensity * mouse.zw, -1.0, 1.0);
            gl_FragColor = texture2D(velocityTexture, uv) + vec4(blob * SPLAT_INTENSITY, 0., 1.);

        }
    `,

    vert: glsl`
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;

        void main () {
            uv = 1.0 - 1.0 * position; //position;
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
        resolution: [canvas.width, canvas.height],
        velocityTexture: args.velocityField,
        time: ({tick}) => 0.01 * tick,
        mouse: () => {
            const dX = (mouse.prev[0] - mouse[0])/canvas.width;
            const dY = (mouse.prev[1] - mouse[1])/canvas.height;

            return [
                mouse[0],
                canvas.height - mouse[1],
                dX * -1,
                dY
            ];
        }
    },
    count: 3
})();

module.exports = disturbFieldWithMouse;

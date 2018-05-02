const regl = require('../reglInstance')();
const glsl = require('glslify');

const canvas = document.getElementsByTagName('canvas')[0];
const mouse = require('mouse-position')(canvas);

const fragge = glsl`
    precision mediump float;
    uniform float time;
    uniform sampler2D velocityTexture;
    uniform vec4 mouse;
    uniform vec2 resolution;

    varying vec2 uv;

    #pragma glslify: map = require('glsl-map');

    // account for safari mouse pos update freq
    #define SPLAT_INTENSITY ${window.safari !== undefined ? '200.' : '20.'}

    void main () {
        vec2 mouseDir = mouse.zw;
        float dist = length(gl_FragCoord.xy - mouse.xy);
        float radius = 0.75;

        float blobIntensity = exp(-(0.01 * dist) / radius);
        vec2 blob = clamp(blobIntensity * mouseDir, -1.0, 1.0);

        gl_FragColor = texture2D(velocityTexture, uv) + vec4(blob * SPLAT_INTENSITY, 0., 1.);
    }
`;

console.log(fragge);

const disturbFieldWithMouse = args => regl({
    framebuffer: args.output,
    frag: fragge,

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
        velocityTexture: args.velocityField,
        resolution: context => [context.viewportWidth, context.viewportHeight],
        time: ({tick}) => 0.01 * tick,
        mouse: ({pixelRatio, viewportHeight, viewportWidth}) => {

            const dX = (mouse.prev[0] - mouse[0])/viewportWidth;
            const dY = (mouse.prev[1] - mouse[1])/viewportHeight;

            const mouseX = mouse[0]*pixelRatio;
            const mouseY = viewportHeight - mouse[1]*pixelRatio;

            mouse.flush();

            return [
                mouseX,
                mouseY,
                dX * -1,
                dY
            ];
        }
    },
    count: 3
})();

module.exports = disturbFieldWithMouse;

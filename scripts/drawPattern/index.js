const regl = require('../reglInstance')();
const glsl = require('glslify');

const drawPattern = regl({
    framebuffer: regl.prop('output'),
    frag: glsl`
        precision mediump float;

        uniform sampler2D velocityTexture;
        uniform sampler2D fboTexture;

        uniform sampler2D texture;
        uniform float time;
        uniform float frameCount;

        varying vec2 uv;

        // from book of shaders
        float circle(in vec2 uv, in float radius){
            uv *= 7.0; // scale up the space
            uv = fract(uv); // wrap around 1.0

            vec2 l = uv - vec2(0.5);
            return 1. - smoothstep(radius - (radius * 0.01), radius + (radius * 0.01), dot(l, l) * 4.);
        }

        void main () {
            gl_FragColor = vec4(vec3(circle(uv, 0.25)), 1.0);
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
        time: ({tick}) => 0.00005 * tick, //0.001 * tick,
    },
    count: 3,
});

module.exports = drawPattern;

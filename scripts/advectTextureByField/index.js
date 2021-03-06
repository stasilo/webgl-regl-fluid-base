const glsl = require('glslify');
const defined = require('../utils').defined;

// advection time delta
const deltaT = 1/100;

// given an velocity vector field texture and a time delta, advect the
// quantities in the input texture into the output texture

module.exports = regl => {
    const advectTextureByField = args => regl({
        framebuffer: regl.prop('output'),
        frag: glsl`
            precision mediump float;

            uniform sampler2D velocityTexture;
            uniform sampler2D inputTexture;

            uniform vec2 resolution;
            uniform float deltaT;
            // uniform float time;

            varying vec2 uv;

            #pragma glslify: map = require('glsl-map');

            void main () {
                vec2 q = map(
                    texture2D(velocityTexture, uv).xy,
                    vec2(0.), vec2(1.),
                    vec2(-1.), vec2(1.)
                );

                vec2 pastCoord = fract(uv + (0.5 * deltaT * q));
                gl_FragColor = texture2D(inputTexture, pastCoord);
            }
            `,

        vert: glsl`
            precision mediump float;

            attribute vec2 position;
            varying vec2 uv;

            void main () {
                uv = 1. - position;
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
            velocityTexture: regl.prop('velocityField'),
            inputTexture: regl.prop('input'),
            deltaT: defined(args.deltaT) ? args.deltaT : deltaT,
            // time: ({tick}) => 0.01 * tick
        },
        count: 3,
    })(args);

    return advectTextureByField;
}

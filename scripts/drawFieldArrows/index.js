const regl = require('../reglInstance')();
const glsl = require('glslify');

const flatten = require('../utils').flatten;

// triangle coord offsets for a 19x19 grid of triangles covering the canvas
let triangleOffsets = flatten(
    [...Array(19)].map((_, i) =>
        [...Array(19)].map((_, j) => ({ offset: [
            -0.93 + 0.1 * j,
            0.9 - 0.1 * i
        ]}))
    )
);

// draw a field of arrows to track velocity field activity
const drawArrows = (args) => regl({
    frag: glsl`
        precision mediump float;
        uniform vec4 color;

        void main() {
            gl_FragColor = color;
        }
    `,
    vert: glsl`
        precision mediump float;

        attribute vec2 position;
        uniform sampler2D fieldTexture;
        uniform vec2 offset;

        #pragma glslify: map = require('glsl-map');

        void main() {
            vec2 uv = map(position + offset,
                vec2(-1.), vec2(1.),
                vec2(0.), vec2(1.)
            );

            vec2 v = map(
                texture2D(fieldTexture, uv).xy,
                vec2(0.), vec2(1.),
                vec2(-1.), vec2(1.)
            );

            float scale = 1.0 * length(v);
            float angle = -atan(v.y, v.x); // angle between vector and x-axis

            vec2 pos = position * scale;

            // rotate and translate by offset
            gl_Position = vec4(
                cos(angle) * pos.x + sin(angle) * pos.y + offset.x,
                -sin(angle) * pos.x + cos(angle) * pos.y + offset.y,
                0,
                1
            );
        }
    `,
    attributes: {
        position: [ // centered triangle vertices
            0, 0.2,
            1, 0,
            0, -0.2
        ].map(p => p * 0.05) // scale down
    },
    uniforms: {
        color: [0, 1, 0, 1],
        fieldTexture: () => args.fieldTexture,
        offset: regl.prop('offset')
    },
    depth: {
        enable: false
    },
    count: 3
})(triangleOffsets);

module.exports = drawArrows;

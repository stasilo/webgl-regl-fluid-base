// const regl = require('../reglInstance')();
const glsl = require('glslify');
const defined = require('../utils').defined;

// divergence free field copied from Jamie Wong - http://jamie-wong.com/2016/08/05/webgl-fluid-simulation/
const defaultField = {
    vX: `sin(2.0 * ${Math.PI} * uv.y * SCALE)`,
    vY: `sin(2.0 * ${Math.PI} * uv.x * SCALE)`
};

// output field to a framebuffer, input range of scalar functions is assumed to be [-1, 1]
// output range is mapped to [0, 1]

module.exports = regl => {
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
	        // time: ({tick}) => 0.01 * tick
	    },
	    count: 3
	})();

	return drawVelocityField;
}

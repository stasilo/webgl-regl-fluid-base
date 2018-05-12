const glsl = require('glslify');

module.exports = regl => {
	const drawPattern = regl({
	    framebuffer: regl.prop('output'),
	    frag: glsl`
	        precision mediump float;

	        uniform vec2 resolution;
	        uniform vec3 color;
	        varying vec2 uv;

	        // from book of shaders
	        float circle(in vec2 uv, in float radius) {
	            uv.y *= resolution.y / resolution.x; // fix aspect ratio
	            uv *= 7.0; // scale the space
	            uv = fract(uv); // wrap around 1.0

	            vec2 l = uv - vec2(0.5);
	            return 1. - smoothstep(radius - (radius * 0.01), radius + (radius * 0.01), dot(l, l) * 4.);
	        }

	        void main () {
	            // black bg
	            // gl_FragColor = vec4(color * circle(uv, 0.25), 1.0);

	            // trans bg
	            gl_FragColor = circle(uv, 0.25) * vec4(color, 1.0);
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
	        color: [211, 69, 69].map(rgb => rgb/255)
	    },
	    count: 3,
	});

	return drawPattern;
}



// module.exports = drawPattern;

const glsl = require('glslify');
const {defined} = require('../utils');

module.exports = regl => {
	const drawTexture = (args, antialias = false, grain = false, cover = false, textureResolution = [0, 0]) => regl({
	    framebuffer: regl.prop('output'),
	    frag: glsl`
	        precision mediump float;

	        uniform sampler2D texture;
	        uniform vec2 resolution;
			uniform vec2 textureResolution;
			uniform bool antialias;

	        varying vec2 uv;

	        #pragma glslify: fxaa = require(glsl-fxaa)

	        float rand(vec2 co) {
	            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
	        }

	        vec3 saturate(vec3 a) {
	            return clamp(a, 0., 1.);
	        }

	        void main () {

				// draw texture using "background-size: cover"-ish fill?
				// see: https://gist.github.com/statico/df64c5d167362ecf7b34fca0b1459a44

				${defined(cover) && cover ? `
					vec2 s = resolution; // Screen
					vec2 i = textureResolution; //vec2(1920.0, 1080.0); // Image

					float rs = s.x / s.y;
					float ri = i.x / i.y;

					vec2 new = rs < ri
						? vec2(i.x * s.y / i.y, s.y)
						: vec2(s.x, i.y * s.x / i.x);

					vec2 offset = rs < ri
						? vec2((new.x - s.x) / 2.0, 0.0) / new
						: vec2(0.0, (new.y - s.y) / 2.0) / new;

					vec2 uw = uv * s / new + offset;
				` : `
					vec2 uw = uv;
				`};

				// screen space aa?
				// (conditional in-shader 'cause glslify transforms required func names, i think)

				vec4 col = antialias == true
					? fxaa(texture, resolution*uw, resolution) // fxaa(texture, gl_FragCoord.xy, resolution)
					: texture2D(texture, uw);

				// add noise grain?

				${defined(grain) && grain ? `
					col.rgb += (rand(uv) - 0.5) * 0.07;
	                col.rgb = saturate(col.rgb);
				` :''};

	            gl_FragColor = col;
	        }
	    `,
	    vert: glsl`
	        precision mediump float;

	        attribute vec2 position;
			uniform vec2 resolution;
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
			texture: regl.prop('texture'),
			antialias,
			textureResolution
	    },
	    count: 3
	})(args);

	const drawTextureToScreen = (args, antialias = false, grain = false, cover = false, textureResolution = [0,0]) =>
		drawTexture({output: null, texture: args.texture}, antialias, grain, cover, textureResolution);

	return {drawTexture, drawTextureToScreen};
}

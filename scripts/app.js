const options = require('./options');
const defined = require('./utils').defined;

const regl = defined(options.pixelRatio) && options.pixelRatio != null
? require('regl')({pixelRatio: options.pixelRatio, container: options.container})
: require('regl')({container: options.container});

const glsl = require('glslify');
const fpsSampler = new (require('fps-sampler'))();
const inViewport = require('in-viewport');

const drawPattern = require('./drawPattern')(regl);
const drawFieldArrows = require('./drawFieldArrows')(regl);
const drawVelocityField = require('./drawVelocityField')(regl);
const {drawTexture, drawTextureToScreen} = require('./drawTexture')(regl);

const advectTextureByField = require('./advectTextureByField')(regl);
const disturbFieldWithMouse = require('./disturbFieldWithMouse')(regl);

const copyFrameBufferToTexture = (args, texture) => 
	regl({framebuffer: args.fbo})(() => texture({copy: true}));

let paused = false;
let stop = false;

let showArrows = defined(options.showArrows) ? options.showArrows : false;
let waveMode = defined(options.waveMode) ? options.waveMode : false;

let canvas = document.querySelector(options.container ? `${options.container} canvas` : 'canvas');
let fpsContainer = document.getElementById('fps');

let colorDeltaT = defined(options.colorDeltaT) ? options.colorDeltaT : 1/60;
let fieldDeltaT = defined(options.fieldDeltaT) ? options.fieldDeltaT : 1/120;

if(defined(options.pixelRatio) && options.pixelRatio != null) {
	colorDeltaT *= options.pixelRatio;
	fieldDeltaT *= options.pixelRatio;
} else {
	colorDeltaT *= defined(devicePixelRatio) ? devicePixelRatio : 1;
	fieldDeltaT *= defined(devicePixelRatio) ? devicePixelRatio : 1;
}

const fieldSettings = {
	colorDeltaT,
	fieldDeltaT
}

const fboSettings = {
	width: canvas.width,
	height: canvas.height,
	depth: false,
	stencil: false,
}

let velocityFbo0 = regl.framebuffer(fboSettings);
let velocityFbo1 = regl.framebuffer(fboSettings);
let velocityTexture = regl.texture();

let colorFieldFbo0 = regl.framebuffer(fboSettings);
let colorFieldFbo1 = regl.framebuffer(fboSettings);

let frameRenderer = null;
let image = null;

const setupKeyboardEvents = () => {
	document.addEventListener('keydown', e => {
		const key = String.fromCharCode(e.keyCode);
		if(key === 'A') {
			showArrows = !showArrows;
		}
	});
}

const advectColorsAndFieldLoop = () => {
	regl.clear({
		color: [0, 0, 0, 0]
	})

	// debug
	// drawPattern({output: colorFieldFbo0});
	let imageTexture = regl.texture({data: image, flipY: true});
	drawTexture({
		texture: imageTexture,
		output: colorFieldFbo0
	}, true, false, true, [image.width, image.height]);

	// drawTextureToScreen({texture: colorFieldFbo0}, false, false, false);
	// return;

	drawVelocityField({
		output: velocityFbo0,
		field: { // empty field, see drawVelocityField() for examples
			vX: `0.0`,
			vY: `0.0`
		}
	});

	frameRenderer = regl.frame(() => {
		if(paused || !inViewport(canvas)) {
			fpsSampler.update();
			return;
		}

		copyFrameBufferToTexture({fbo: velocityFbo0}, velocityTexture);

		// wow
		if(waveMode) {
			velocityTexture({flipY: true});
		}

		advectTextureByField({
			velocityField: velocityTexture,
			input: velocityFbo0,
			output: velocityFbo1,
			deltaT: fieldSettings.fieldDeltaT
		});

		disturbFieldWithMouse({
			velocityField: velocityFbo1,
			output: velocityFbo0
		});

		advectTextureByField({
			velocityField: velocityFbo0,
			input: colorFieldFbo0,
			output: colorFieldFbo1,
			deltaT: fieldSettings.colorDeltaT,
			flip: true,
		});

		[colorFieldFbo0, colorFieldFbo1] = [colorFieldFbo1, colorFieldFbo0];

		drawTextureToScreen({texture: colorFieldFbo1});

		if(showArrows) {
			drawFieldArrows({
				fieldTexture: velocityFbo0,
				arrowColor: options.arrowColor
			});
		}

		fpsContainer.innerHTML = `${fpsSampler.update().fps} fps`;
	});
}

function app() {
	image = new Image();

	image.onload = () => {
		setupKeyboardEvents();
		advectColorsAndFieldLoop();
	}

	image.src = options.imageUrl;
}

document.addEventListener('DOMContentLoaded', app, false);

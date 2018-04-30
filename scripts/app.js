const regl = require('./reglInstance')();
const glsl = require('glslify');

const drawPattern = require('./drawPattern');
const drawFieldArrows = require('./drawFieldArrows');
const drawVelocityField = require('./drawVelocityField');
const {drawTexture, drawTextureToScreen} = require('./drawTexture');

const advectTextureByField = require('./advectTextureByField');
const disturbFieldWithMouse = require('./disturbFieldWithMouse');

const copyFrameBufferToTexture = (args, texture) => regl({framebuffer: args.fbo})(() => texture({copy: true}));

const canvas = document.getElementsByTagName('canvas')[0];

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

regl.clear({
    color: [0, 0, 0, 1]
})

// advects the color field through the velocity field
const advectColors = () => {
    drawTexture({
        texture: regl.texture(require('baboon-image')),
        output: colorFieldFbo0
    });

    drawVelocityField({output: velocityFbo0});

    regl.frame(() => {
        disturbFieldWithMouse({
            velocityField: velocityFbo0,
            output: velocityFbo1
        });

        advectTextureByField({
            velocityField: velocityFbo1,
            input: colorFieldFbo0,
            output: colorFieldFbo1
        });

        [colorFieldFbo0, colorFieldFbo1] = [colorFieldFbo1, colorFieldFbo0];

        drawTextureToScreen({texture: colorFieldFbo0});
        drawFieldArrows({fieldTexture: velocityFbo1});
    });
}


// advects the color field through the velocity field
// and also advects the velocity field through itself

const advectColorsAndField = () => {
    // drawTexture({
    //     texture: regl.texture(require('baboon-image')),
    //     output: colorFieldFbo0
    // });

    drawPattern({output: colorFieldFbo0});
    drawVelocityField({output: velocityFbo0});

    regl.frame(() => {
        copyFrameBufferToTexture({fbo: velocityFbo0}, velocityTexture);
        advectTextureByField({
            velocityField: velocityTexture,
            input: velocityFbo0,
            output: velocityFbo1
        });

        disturbFieldWithMouse({
            velocityField: velocityFbo1,
            output: velocityFbo0
        });

        advectTextureByField({
            velocityField: velocityFbo0,
            input: colorFieldFbo0,
            output: colorFieldFbo1
        });
        [colorFieldFbo0, colorFieldFbo1] = [colorFieldFbo1, colorFieldFbo0];

        drawTextureToScreen({texture: colorFieldFbo1});
        drawFieldArrows({fieldTexture: velocityFbo0});
    });
}


advectColorsAndField();
// advectColors();

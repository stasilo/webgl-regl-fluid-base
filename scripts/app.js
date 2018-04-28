const regl = require('./reglInstance')();
const glsl = require('glslify');

const drawPattern = require('./drawPattern');
const drawFieldArrows = require('./drawFieldArrows');
const drawVelocityField = require('./drawVelocityField');
const {drawTexture, drawTextureToScreen} = require('./drawTexture');

const advectTextureByField = require('./advectTextureByField');

let frameCount = 1.0;

const canvas = document.getElementsByTagName('canvas')[0];
const fboSettings = {
    width: canvas.width,
    height: canvas.height,
    depth: false,
    stencil: false,
}

let velocityFbo0 = regl.framebuffer(fboSettings);
let velocityFbo1 = regl.framebuffer(fboSettings);
// let velocityTexture = regl.texture();

let colorFieldFbo0 = regl.framebuffer(fboSettings);
let colorFieldFbo1 = regl.framebuffer(fboSettings);

regl.clear({
    color: [0, 0, 0, 1]
})


drawVelocityField({output: velocityFbo0});
drawTexture({texture: regl.texture(require('baboon-image')), output: colorFieldFbo0});
// drawPattern({output: colorFieldFbo0});

// regl({framebuffer: velocityFbo0 })(()=> {
//     velocityTexture({copy: true});
// })

regl.frame(function () {
    advectTextureByField({velocityField: velocityFbo0, input: colorFieldFbo0, output: colorFieldFbo1});
    [colorFieldFbo0, colorFieldFbo1] = [colorFieldFbo1, colorFieldFbo0];

    // advectTextureByField({velocityField: velocityTexture, input: velocityFbo0, output: velocityFbo1});
    // [velocityFbo0, velocityFbo1] = [velocityFbo1, velocityFbo0];
    //
    // regl({framebuffer: velocityFbo0 })(()=> {
    //     velocityTexture({copy: true});
    // })

    drawTextureToScreen({texture: colorFieldFbo0});
    drawFieldArrows({fieldTexture: velocityFbo0});

    frameCount++;
});

const canvas = document.getElementsByTagName('canvas')[0];
const regl = require('regl')(); //(canvas);

module.exports = () => regl;

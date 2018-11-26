const path = require('path');

const DATA_ROOT = path.resolve(__dirname, '../../data/ImageNet');

module.exports.DATA_ROOT = DATA_ROOT;
module.exports.MAX_NUM_IMAGES = 10;
module.exports.ALL_IMAGES = `${DATA_ROOT}/all-images.json`;
module.exports.IMAGE_HEALTH = `${DATA_ROOT}/image-health.json`;
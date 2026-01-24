const path = require('path');
const { v4: uuid } = require('uuid');

module.exports = function safeName(originalName) {
    const ext = path.extname(originalName);
    return `${uuid()}${ext}`;
};

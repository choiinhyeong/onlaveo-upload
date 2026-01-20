module.exports = function safeName(name = '') {
    return name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
};

const Texture = require('./Texture');

async function Load(textureName) {
    const tex = new Texture();
    await tex.Load(textureName);
    return tex;
}


module.exports = {
    Load: Load
}
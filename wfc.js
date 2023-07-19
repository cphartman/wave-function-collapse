const TextureFactory = require('./TextureFactory');
const Canvas = require("./Canvas");
const Config = require("./config");

(async()=>{
    const texture = await TextureFactory.Load(Config.TextureName);
    const canvas = new Canvas(Config.CanvasWidth, Config.CanvasHeight, texture);
    canvas.Generate();
})();

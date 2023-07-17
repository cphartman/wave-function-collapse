//const Texture = require('./Texture');
const TextureFactory = require('./TextureFactory');
const Map = require("./Map");

const TEXTURE_NAME = "1";
const OutputWidth = 40;
const OutputHeight = 40;

(async()=>{
    const texture = await TextureFactory.Load(TEXTURE_NAME);
    GenerateOutput(texture);

})();

function GenerateOutput(texture) {
    let map = new Map(OutputWidth, OutputHeight, texture.tiles, texture.adjacencyRules);
    map.Print();
    map.Tick();
}
const fs = require('fs').promises;


let SourceImage = null;
let Textures = null;




async function LoadTexture(textureName) {
    const file_handle = await fs.readFile(`./textures/${textureName}.txt`);
    const file_contents = file_handle.toString()
    return file_contents.split('\n');
}

const TEXTURE_NAME = "1";
const OutputWidth = 80;
const OutputHeight = 40;
const TileSize = 3;

(async()=>{

    const texture = await LoadTexture(TEXTURE_NAME);
    const tiles = GenerateTilesFromTexture(texture);
    const adjacencyRules = GenerateAdjacencyRules(tiles);
    OutputData = GenerateOutput(tiles, adjacencyRules);

})();

let Directions = {
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3,
}


let TileData = [];
let AdjacencyRules = [
    {
        parent: 1,
        child: 2,
        direction: "up"
    }
];


const Map = require("./Map.js");

function GenerateOutput(tiles, adjacencyRules) {
    let map = new Map(OutputWidth, OutputHeight, tiles, adjacencyRules);

    // Hack to test constraints
    //map.grid[1][1].possibleTiles = [9];
    //map.ResolveMapConstraints();
    //map.Print();
    map.Print();
    map.Tick();

    return map;
}


function GenerateTilesFromTexture(texture) {
    let tiles = [];

    let input = {
        width: texture[0].length,
        height: texture.length
    };

    let tileIndex = 0;
    // Loop each tile
    for (let tileY = 0; tileY < input.height; tileY++) {
        for (let tileX = 0; tileX < input.width; tileX++) {

            // Initialize blank tile
            let newTile = new Array(TileSize);
            for (let pixelY = 0; pixelY < TileSize; pixelY++) {
                newTile[pixelY] = new Array(TileSize);
            }


            let tileHash = "";
            // Extract pixels for tile
            for (let pixelY = 0; pixelY < TileSize; pixelY++) {
                for (let pixelX = 0; pixelX < TileSize; pixelX++) {
                    newTile[pixelY][pixelX] = texture[(tileY + pixelY) % input.height][(tileX + pixelX) % input.width];
                }
            }

            // Check if tile exists
            let tileExists = false;
            let existingTileIndex = 0;
            let newTileHash = GetTileHash(newTile)

            for (let i = 0; i < tileIndex; i++) {
                if (tiles[i].hash == newTileHash) {
                    tileExists = true;
                    existingTileIndex = i;
                    break;
                }
            }

            // Store new tile
            if (!tileExists) {
                tiles[tileIndex] = {
                    data: null,
                    hash: newTileHash,
                    frequency: 1
                };

                tiles[tileIndex].data = new Array(TileSize);
                TileData[tileIndex] = new Array(TileSize);
                for (let pixelY = 0; pixelY < TileSize; pixelY++) {
                    TileData[tileIndex][pixelY] = new Array(TileSize);
                    tiles[tileIndex].data[pixelY] = new Array(TileSize);
                    for (let pixelX = 0; pixelX < TileSize; pixelX++) {
                        TileData[tileIndex][pixelY][pixelX] = newTile[pixelY][pixelX];
                        tiles[tileIndex].data[pixelY][pixelX] = newTile[pixelY][pixelX];
                    }
                }

                tileIndex++;
            } else {
                tiles[existingTileIndex].frequency++;
            }
        }
    }

    return tiles;
}

function GetTileHash(tileData) {
    let tileHash = "";
    for (let pixelY = 0; pixelY < TileSize; pixelY++) {
        for (let pixelX = 0; pixelX < TileSize; pixelX++) {
            tileHash += tileData[pixelY][pixelX];
        }
    }
    return tileHash;
}

function GenerateAdjacencyRules(tiles) {
    let returnData = new Array(tiles.length);
    for (let parentTile = 0; parentTile < tiles.length; parentTile++) {
        returnData[parentTile] = new Array(tiles.length);
        for (let childTile = 0; childTile < tiles.length; childTile++) {
            returnData[parentTile][childTile] = new Array(4);
            for (let direction of Object.values(Directions)) {
                returnData[parentTile][childTile][direction] = AreTilesCompatible(tiles, parentTile, childTile, direction);
            }
        }
    }
    return returnData;
}

function AreTilesCompatible(tiles, parentTile, childTile, direction) {

    if (direction == Directions.Up) {
        for (let pixelY = 0; pixelY < TileSize - 1; pixelY++) {
            for (let pixelX = 0; pixelX < TileSize; pixelX++) {
                var parentPixelValue = tiles[parentTile].data[pixelY][pixelX];
                var childPixelValue = tiles[childTile].data[pixelY + 1][pixelX];

                if (parentPixelValue != childPixelValue) return false;
            }
        }
    }

    if (direction == Directions.Down) {
        for (let pixelY = 1; pixelY < TileSize; pixelY++) {
            for (let pixelX = 0; pixelX < TileSize; pixelX++) {
                var parentPixelValue = tiles[parentTile].data[pixelY][pixelX];
                var childPixelValue = tiles[childTile].data[pixelY - 1][pixelX];

                if (parentPixelValue != childPixelValue) return false;
            }
        }
    }

    if (direction == Directions.Right) {
        for (let pixelY = 0; pixelY < TileSize; pixelY++) {
            for (let pixelX = 1; pixelX < TileSize; pixelX++) {
                var parentPixelValue = tiles[parentTile].data[pixelY][pixelX];
                var childPixelValue = tiles[childTile].data[pixelY][pixelX - 1];

                if (parentPixelValue != childPixelValue) return false;
            }
        }
    }

    if (direction == Directions.Left) {
        for (let pixelY = 0; pixelY < TileSize; pixelY++) {
            for (let pixelX = 0; pixelX < TileSize - 1; pixelX++) {
                var parentPixelValue = tiles[parentTile].data[pixelY][pixelX];
                var childPixelValue = tiles[childTile].data[pixelY][pixelX + 1];

                if (parentPixelValue != childPixelValue) return false;
            }
        }
    }

    return true;
}
const fs = require('fs').promises;

const TILE_SIZE = 3;

const Directions = {
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3,
}


class Texture {

    constructor() {
        this.data = null;
        this.width = null;
        this.height = null;
        this.tiles = null;
        this.tileSize = null;
        this.adjacencyRules = null;
    }

    // Load file data for the texture
    // Assumes all rows are the same length
    async Load(textureName) {
        await this.LoadFile(`./textures/${textureName}.txt`);
        this.GenerateTiles();
        this.GenerateAdjacencyRules();
    }

    async LoadFile(fileName) {
        const file_handle = await fs.readFile(fileName);
        const file_contents = file_handle.toString()
        
        this.data = file_contents.split('\n');
        this.width = this.data[0].length;
        this.height = this.data.length;
    }

    // Split texture into unique tiles
    GenerateTiles() {
        this.tiles = [];

        let tileIndex = 0;

        // Loop each pixel of the texture
        for (let tileY = 0; tileY < this.height; tileY++) {
            for (let tileX = 0; tileX < this.width; tileX++) {

                // Initialize blank tile
                let newTile = new Array(TILE_SIZE);
                for (let pixelY = 0; pixelY < TILE_SIZE; pixelY++) {
                    newTile[pixelY] = new Array(TILE_SIZE);
                }

                let tileHash = "";
                // Extract pixels for tile
                for (let pixelY = 0; pixelY < TILE_SIZE; pixelY++) {
                    for (let pixelX = 0; pixelX < TILE_SIZE; pixelX++) {
                        newTile[pixelY][pixelX] = this.data[(tileY + pixelY) % this.height][(tileX + pixelX) % this.width];
                    }
                }

                // Check if tile exists
                let tileExists = false;
                let existingTileIndex = 0;
                let newTileHash = newTile.join(''); //GetTileHash(newTile)

                for (let i = 0; i < tileIndex; i++) {
                    if (this.tiles[i].hash === newTileHash) {
                        tileExists = true;
                        existingTileIndex = i;
                        break;
                    }
                }

                // Store new tile
                if (!tileExists) {
                    this.tiles[tileIndex] = {
                        data: null,
                        hash: newTileHash,
                        frequency: 1
                    };

                    this.tiles[tileIndex].data = new Array(TILE_SIZE);
                    //TileData[tileIndex] = new Array(TILE_SIZE);
                    for (let pixelY = 0; pixelY < TILE_SIZE; pixelY++) {
                        //TileData[tileIndex][pixelY] = new Array(TILE_SIZE);
                        this.tiles[tileIndex].data[pixelY] = new Array(TILE_SIZE);
                        for (let pixelX = 0; pixelX < TILE_SIZE; pixelX++) {
                            //TileData[tileIndex][pixelY][pixelX] = newTile[pixelY][pixelX];
                            this.tiles[tileIndex].data[pixelY][pixelX] = newTile[pixelY][pixelX];
                        }
                    }

                    tileIndex++;
                } else {
                    this.tiles[existingTileIndex].frequency++;
                }
            }
        }
    }

    GenerateAdjacencyRules() {
        this.adjacencyRules = new Array(this.tiles.length);
        for (let parentTile = 0; parentTile < this.tiles.length; parentTile++) {
            this.adjacencyRules[parentTile] = new Array(this.tiles.length);
            for (let childTile = 0; childTile < this.tiles.length; childTile++) {
                this.adjacencyRules[parentTile][childTile] = new Array(4);
                for (let direction of Object.values(Directions)) {
                    this.adjacencyRules[parentTile][childTile][direction] = this.AreTilesCompatible(parentTile, childTile, direction);
                }
            }
        }
        return this.adjacencyRules;
    }

    AreTilesCompatible(parentTile, childTile, direction) {

        if (direction == Directions.Up) {
            for (let pixelY = 0; pixelY < TILE_SIZE - 1; pixelY++) {
                for (let pixelX = 0; pixelX < TILE_SIZE; pixelX++) {
                    var parentPixelValue = this.tiles[parentTile].data[pixelY][pixelX];
                    var childPixelValue = this.tiles[childTile].data[pixelY + 1][pixelX];
    
                    if (parentPixelValue != childPixelValue) return false;
                }
            }
        }
    
        if (direction == Directions.Down) {
            for (let pixelY = 1; pixelY < TILE_SIZE; pixelY++) {
                for (let pixelX = 0; pixelX < TILE_SIZE; pixelX++) {
                    var parentPixelValue = this.tiles[parentTile].data[pixelY][pixelX];
                    var childPixelValue = this.tiles[childTile].data[pixelY - 1][pixelX];
    
                    if (parentPixelValue != childPixelValue) return false;
                }
            }
        }
    
        if (direction == Directions.Right) {
            for (let pixelY = 0; pixelY < TILE_SIZE; pixelY++) {
                for (let pixelX = 1; pixelX < TILE_SIZE; pixelX++) {
                    var parentPixelValue = this.tiles[parentTile].data[pixelY][pixelX];
                    var childPixelValue = this.tiles[childTile].data[pixelY][pixelX - 1];
    
                    if (parentPixelValue != childPixelValue) return false;
                }
            }
        }
    
        if (direction == Directions.Left) {
            for (let pixelY = 0; pixelY < TILE_SIZE; pixelY++) {
                for (let pixelX = 0; pixelX < TILE_SIZE - 1; pixelX++) {
                    var parentPixelValue = this.tiles[parentTile].data[pixelY][pixelX];
                    var childPixelValue = this.tiles[childTile].data[pixelY][pixelX + 1];
    
                    if (parentPixelValue != childPixelValue) return false;
                }
            }
        }
    
        return true;
    }
}

module.exports = Texture;
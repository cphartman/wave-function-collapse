
const TILE_SIZE = 3;

class Tile {
    constructor(data) {
        this.size = TILE_SIZE;
        
        // Initialize blank tile
        this.tile = new Array(TILE_SIZE);
        for (let row = 0; row < TILE_SIZE; row++) {
            this.tile[row] = new Array(TILE_SIZE);
        }        
    }

    Equals(tile) {

    }
}
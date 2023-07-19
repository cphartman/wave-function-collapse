const Profiler = require("./Profiler");
const Config = require("./config");



let DirtyCellList = [];
let AdjacencyRules = null;

let Directions = {
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3,
}

class Canvas {
    constructor(width, height, texture) {
        AdjacencyRules = texture.adjacencyRules;
        this.tiles = texture.tiles;
        this.gridHeight = height;
        this.gridWidth = width;
        this.grid = new Array(this.gridHeight);

        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = new Array(this.gridWidth);
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = new Cell(this.tiles);
            }
        }
    }

    async Generate() {
        let isDone = false;
        while (!isDone) {
            let coords = this.GetRandomUnresolvedPoint();
            // Rename "Tile" to "Point"
            this.ResolvePoint(coords[0], coords[1]);
            this.ResolveCanvasConstraints();
            this.Print();
            isDone = !this.HasUnresolvedPoints();
        }
    }


    Print() {

        let output = "";

        // Add a bunch of padding so it animates without needing to clear the screen
        output += "\n".repeat(20);

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                let cell = this.grid[y][x];
                output += cell.GetOutput();
            }
            output += "\n";
        }
        
        console.log(output);
    }

    ResolvePoint(x, y) {

        // Generate a list of possible tiles
        let weightedPossibleTileList = [];
        for (let possibleTileIndex of this.grid[y][x].possibleTiles) {
            for (let f = 0; f < this.tiles[possibleTileIndex].frequency; f++) {
                weightedPossibleTileList.push(possibleTileIndex);
            }
        }

        // Pick a random possible tile
        let randomTileIndex = Math.floor(Math.random() * weightedPossibleTileList.length);
        this.grid[y][x].possibleTiles = [weightedPossibleTileList[randomTileIndex]];

        // Mark neighbors as dirty
        this.MarkNeighborsDirty(x, y);

        this.DebuggerStepThrough();
    }

    MarkNeighborsDirty(x, y) {
        let topY = (y > 0 ? y - 1 : this.gridHeight - 1);
        let bottomY = (y < this.gridHeight - 1 ? y + 1 : 0);
        let leftX = (x > 0 ? x - 1 : this.gridWidth - 1);
        let rightX = (x < this.gridWidth - 1 ? x + 1 : 0);

        DirtyCellList.push([x, topY]);
        DirtyCellList.push([x, bottomY]);
        DirtyCellList.push([leftX, y]);
        DirtyCellList.push([rightX, y]);

        this.grid[topY][x].dirty = true;
        this.grid[bottomY][x].dirty = true;
        this.grid[y][leftX].dirty = true;
        this.grid[y][rightX].dirty = true;
    }

    HasUnresolvedPoints() {
        let p = new Profiler("HasRandomUnresolvedTile");

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x].possibleTiles.length > 1) {
                    p.end();
                    return true;
                }
            }
        }
        p.end();
        return false;
    }

    GetRandomUnresolvedPoint() {
        let p = new Profiler("GetRandomUnresolvedTile");

        // Get lowest entropy cells
        let lowestEntropyCells = [];
        let lowestEntropy = this.tiles.length;

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                let currentEntropy = this.grid[y][x].possibleTiles.length;

                if (currentEntropy <= 1) continue;

                if (currentEntropy <= lowestEntropy) {

                    if (currentEntropy < lowestEntropy) {
                        lowestEntropyCells = [];
                        lowestEntropy = currentEntropy;
                    }

                    lowestEntropyCells.push([x, y]);
                }
            }
        }

        let randIndex = Math.floor(Math.random() * lowestEntropyCells.length);

        p.end();
        return lowestEntropyCells[randIndex];
    }

    ResolveCanvasConstraints() {
        let isMapResolved = false;
        let pMapResolved = new Profiler("ResolveMapConstraints");
        do {
            let pMapUnresolved = new Profiler("ResolveMapConstraints Unresolved Loop");

            let oldDirtyCellList = DirtyCellList;
            DirtyCellList = [];
            for (var dirtyCellCords of oldDirtyCellList) {
                let x = dirtyCellCords[0];
                let y = dirtyCellCords[1];
                let pTile = new Profiler("ResolveMapConstraints Tile Iteration");

                let currentPossibleTiles = this.grid[y][x].possibleTiles;

                if (currentPossibleTiles.length > 1 && this.grid[y][x].dirty) {

                    for (let currentTile of currentPossibleTiles) {
                        let validUp = false;
                        let validDown = false;
                        let validRight = false;
                        let validLeft = false;

                        let loopVertical = false;
                        let loopHorizontal = false;

                        if (y == 0 && !loopVertical) {
                            validUp = true;
                        } else {
                            let aboveY = (y == 0 ? this.gridHeight - 1 : y - 1);
                            let abovePossibleTiles = this.grid[aboveY][x].possibleTiles;
                            for (let aboveTile of abovePossibleTiles) {
                                if (AdjacencyRules[currentTile][aboveTile][Directions.Up]) {
                                    validUp = true;
                                    break;
                                }
                            }
                        }

                        if (x == this.gridWidth - 1 && !loopHorizontal) {
                            validRight = true;
                        } else {
                            let rightX = (x == this.gridWidth - 1 ? 0 : x + 1);
                            let rightPossibleTiles = this.grid[y][rightX].possibleTiles;
                            for (let rightTile of rightPossibleTiles) {
                                if (AdjacencyRules[currentTile][rightTile][Directions.Right]) {
                                    validRight = true;
                                    break;
                                }
                            }
                        }

                        if (y == this.gridHeight - 1 && !loopVertical) {
                            validDown = true;
                        } else {
                            let belowY = (y == this.gridHeight - 1 ? 0 : y + 1);
                            let belowPossibleTiles = this.grid[belowY][x].possibleTiles;
                            for (let belowTile of belowPossibleTiles) {
                                if (AdjacencyRules[currentTile][belowTile][Directions.Down]) {
                                    validDown = true;
                                    break;
                                }
                            }
                        }
                        if (x == 0 && !loopHorizontal) {
                            validLeft = true;
                        } else {
                            let leftX = (x == 0 ? this.gridWidth - 1 : x - 1);
                            let leftPossibleTiles = this.grid[y][leftX].possibleTiles;
                            for (let leftTile of leftPossibleTiles) {
                                if (AdjacencyRules[currentTile][leftTile][Directions.Left]) {
                                    validLeft = true;
                                    break;
                                }
                            }
                        }

                        if (!validUp || !validRight || !validDown || !validLeft) {
                            this.grid[y][x].possibleTiles = this.grid[y][x].possibleTiles.filter(item => item !== currentTile);
                            isMapResolved = false;
                            this.MarkNeighborsDirty(x, y);
                        }
                        this.grid[y][x].dirty = false;
                    }
                }

                pTile.end();
                //    }
            }
            pMapUnresolved.end();
        } while (DirtyCellList.length);

        this.DebuggerStepThrough();

        pMapResolved.end();
    }

    DebuggerStepThrough() {
        if( Config.Debug.StepThrough) {
            this.Print();
            debugger;
        }
    }
}

// Cell represnts a point on the canvas.  
// The cell has a list of possible texture tiles that will collapse down to a single texture tile
class Cell {
    constructor(tiles) {
        this.tiles = tiles;

        // Set cell to all possible tiles
        this.possibleTiles = [];
        this.dirty = false;

        for (let i = 0; i < this.tiles.length; i++) {
            this.possibleTiles.push(i);
        }
    }

    GetOutput() {
        if (this.possibleTiles.length == 1) {
            // Tile value is known
            let tileIndex = this.possibleTiles[0];
            return this.tiles[tileIndex].data[0][0];
        } else if( Config.Debug.StepThrough ) {
            // Tile value is unknown (debug)
            let count = this.possibleTiles.length;
            if( count < 10 ) {
                return count;
            } else {
                return "?";
            }
        } else {
            // Tile value is unknown
            return "?";
        }
    }
}


module.exports = Canvas;
/*
let SourceImage = [
    "   |       |     ",
    "   |       |     ",
    "   |-------|     ",
    "   |       |     ",
    "   |       |     ",
    "   \\       /     ",
    "    \\     /      ",
    "     \\   /       ",
    "      \\ /        ",
    "       |         ",
    "      <|>        ",
    "       |         ",
    "      / \\        ",
    "     /   \\       ",
    "    /     \\      ",
    "   /       \\     ",
];
*/
/*
let SourceImage = [
    "            ",
    "            ",
    "     ┌─────┐",
    "     │┌───┐│",
    "     ││   ││",
    "     ││   ││",
    "┌────┤├───┘│",
    "│┌───┤├────┘",
    "││   ││     ",
    "││   ││     ",
    "│└───┘│     ",
    "└─────┘     ",
    "            ",
    "            ",
    "            ",
];
*/
/*
let SourceImage = [
    "           _____             ",
    "          /     \\            ",
    "         /       \\           ",
    "   ,----<         >----.     ",
    "  /      \\       /      \\    ",
    " /        \\_____/        \\   ",
    " \\        /     \\        /   ",
    "  \\      /       \\      /    ",
    "   >----<         >----<     ",
    "  /      \\       /      \\    ",
    " /        \\_____/        \\   ",
    " \\        /     \\        /   ",
    "  \\      /       \\      /    ",
    "   `----<         >----'     ",
    "         \\       /           ",
    "          \\_____/            ",
    "                             ",
    "                             ",
    "                             ",
];
*/
/*
let SourceImage = [
    "O----O   ",
    "|    |   ",
    "|    |   ",
    "|    |   ",
    "|    |   ",
    "O----O   ",
    "         ",
    "         ",
    "         ",
];
*/

let SourceImage = [
    "   |   ",
    "   |   ",
    "---+---",
    "   |   ",
    "   |   ",
    "   |   ",
];

let Directions = {
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3,
}

let Tiles = [];


let TileData = [];
let AdjacencyRules = [
    {
        parent: 1,
        child: 2,
        direction: "up"
    }
];
let DirtyCellList = [];

const OutputWidth = 120;
const OutputHeight = 40;
const TileSize = 3;

class Cell {
    constructor() {
        // Set cell to all possible tiles
        this.possibleTiles = [];
        this.dirty = false;
        for (let i = 0; i < Tiles.length; i++) {
            this.possibleTiles.push(i);
        }
    }
}

class Profiler {

    static Results = {}

    constructor(tag) {
        this.startTime = (new Date()).getTime();
        this.tag = tag;
    }

    end() {
        this.endTime = (new Date()).getTime();

        if (!Profiler.Results[this.tag]) {
            Profiler.Results[this.tag] = [];
        }

        let delta = this.endTime - this.startTime;
        if (delta < 1) delta = 1;
        Profiler.Results[this.tag].push(delta);
    }
}

class Map {
    constructor(width, height) {
        this.gridHeight = height;
        this.gridWidth = width;
        this.grid = new Array(this.gridHeight);

        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = new Array(this.gridWidth);
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = new Cell();
            }
        }
    }

    Print() {
        console.clear();

        let output = "";
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x].possibleTiles.length == 1) {
                    let tile = this.grid[y][x].possibleTiles[0];
                    output += Tiles[tile].data[0][0];
                } else {
                    // Show unresolved count
                    //output += this.grid[y][x].possibleTiles.length > 9 ? 9 : this.grid[y][x].possibleTiles.length;

                    // Show blank unresolved tiles
                    output += " ";
                }
            }
            output += "\n";
        }
        console.log(output);

        /*for (let tag in Profiler.Results) {
            let profiles = Profiler.Results[tag];
            let total = profiles.length;
            let average = Math.floor(profiles.reduce((a, b) => a + b) / total);
            let max = Math.max(profiles);
            console.log(`${tag}: total=${total} average=${average}`);
        }*/
    }

    ResolveTile(x, y) {
        if (this.grid[y][x].possibleTiles.length == 1) {
            console.log(`Tile ${x},${y} already resolved to ${this.grid[y][x].possibleTiles[0]}`);
            debugger;
        }

        if (this.grid[y][x].possibleTiles.length == 0) {
            console.log(`Tile ${x},${y} has not possibilities`);
            debugger;
        }

        //let weightedPossibleTileList = this.grid[y][x].possibleTiles;
        let weightedPossibleTileList = [];
        for (let possibleTileIndex of this.grid[y][x].possibleTiles) {
            for (let f = 0; f < Tiles[possibleTileIndex].frequency; f++) {
                weightedPossibleTileList.push(possibleTileIndex);
            }
        }

        let randomTileIndex = Math.floor(Math.random() * weightedPossibleTileList.length);
        //console.log(`Assigining ${x},${y} to ${randomTile}`);
        this.grid[y][x].possibleTiles = [weightedPossibleTileList[randomTileIndex]];
        this.MarkNeighborsDirty(x, y);
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

    Tick() {
        let p = new Profiler("Tick");

        if (this.HasRandomUnresolvedTile()) {
            let coords = this.GetRandomUnresolvedTile();
            this.ResolveTile(coords[0], coords[1]);
            this.ResolveMapConstraints();
            p.end();
            this.Print();
            setTimeout(this.Tick.bind(this), 1);

        } else {
            p.end();

            for (let tag in Profiler.Results) {
                let profiles = Profiler.Results[tag];
                let total = profiles.length;
                let average = Math.floor(profiles.reduce((a, b) => a + b) / total);
                let max = Math.max(profiles);
                //console.log(`${tag}: total=${total} average=${average}`);
            }

            //setTimeout(GenerateOutput, 1000);
        }
    }

    HasRandomUnresolvedTile() {
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

    GetRandomUnresolvedTile() {
        let p = new Profiler("GetRandomUnresolvedTile");

        // Get lowest entropy cells
        let lowestEntropyCells = [];
        let lowestEntropy = Tiles.length;

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

    ResolveMapConstraints() {
        let isMapResolved = true;

        let pMapResolved = new Profiler("ResolveMapConstraints");
        do {
            let pMapUnresolved = new Profiler("ResolveMapConstraints Unresolved Loop");

            let oldDirtyCellList = DirtyCellList;
            DirtyCellList = [];
            for (var dirtyCellCords of oldDirtyCellList) {
                let x = dirtyCellCords[0];
                let y = dirtyCellCords[1];
                //for (let y = 0; y < this.gridHeight; y++) {
                //    for (let x = 0; x < this.gridWidth; x++) {
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
        pMapResolved.end();
    }
}

GenerateTiles();
AdjacencyRules = GenerateAdjacencyRules(Tiles);
OutputData = GenerateOutput();

function GenerateOutput() {
    let map = new Map(OutputWidth, OutputHeight);

    // Hack to test constraints
    //map.grid[1][1].possibleTiles = [9];
    //map.ResolveMapConstraints();
    //map.Print();
    map.Print();
    map.Tick();

    return map;
}


function GenerateTiles() {
    let returnData = [];

    let input = {
        width: SourceImage[0].length,
        height: SourceImage.length
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
                    newTile[pixelY][pixelX] = SourceImage[(tileY + pixelY) % input.height][(tileX + pixelX) % input.width];
                }
            }

            // Check if tile exists
            let tileExists = false;
            let existingTileIndex = 0;
            let newTileHash = GetTileHash(newTile)

            for (let i = 0; i < tileIndex; i++) {
                if (Tiles[i].hash == newTileHash) {
                    tileExists = true;
                    existingTileIndex = i;
                    break;
                }
            }

            // Store new tile
            if (!tileExists) {
                Tiles[tileIndex] = {
                    data: null,
                    hash: newTileHash,
                    frequency: 1
                };

                Tiles[tileIndex].data = new Array(TileSize);
                TileData[tileIndex] = new Array(TileSize);
                for (let pixelY = 0; pixelY < TileSize; pixelY++) {
                    TileData[tileIndex][pixelY] = new Array(TileSize);
                    Tiles[tileIndex].data[pixelY] = new Array(TileSize);
                    for (let pixelX = 0; pixelX < TileSize; pixelX++) {
                        TileData[tileIndex][pixelY][pixelX] = newTile[pixelY][pixelX];
                        Tiles[tileIndex].data[pixelY][pixelX] = newTile[pixelY][pixelX];
                    }
                }

                tileIndex++;
            } else {
                Tiles[existingTileIndex].frequency++;
            }
        }
    }
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
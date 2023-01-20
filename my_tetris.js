const COLUMNS = 10;
const ROWS = 20;
const CELL_SIZE = 20;
let context;
let currentShape;
let currentColor;

class Tetromino {
    // tetrominoes = {
    //     l: {
    //         shape: [
    //             [0, 0, 1],
    //             [1, 2, 1],
    //             [0, 0, 0]],
    //         color: "orange",
    //         xStart: (COLUMNS / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Orange Ricky
    //     j: {
    //         shape: [
    //             [1, 0, 0],
    //             [1, 2, 1],
    //             [0, 0, 0]],
    //         color: "blue",
    //         xStart: (COLUMNS / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Blue Ricky
    //     z: {
    //         shape: [
    //             [1, 1, 0],
    //             [0, 2, 1],
    //             [0, 0, 0]],
    //         color: "red",
    //         xStart: (COLUMNS / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Cleveland Z
    //     s: {
    //         shape: [
    //             [0, 1, 1],
    //             [1, 2, 0],
    //             [0, 0, 0]],
    //         color: "green",
    //         xStart: (COLUMNS / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Rhode Island Z
    //     i: {
    //         shape: [
    //             [0, 0, 0, 0],
    //             [1, 2, 2, 1],
    //             [0, 0, 0, 0],
    //             [0, 0, 0, 0]],
    //         color: "cyan",
    //         xStart: (COLUMNS / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Hero
    //     t: {
    //         shape: [
    //             [0, 1, 0],
    //             [1, 2, 1],
    //             [0, 0, 0]],
    //         color: "purple",
    //         xStart: (COLUMNS / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Teewee
    //     o: {
    //         shape: [
    //             [1, 1],
    //             [1, 1]],
    //         color: "yellow",
    //         xStart: (COLUMNS / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Smashboy
    // };
    // only L tetromino for debugging
    tetrominoes = {
        l: {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]],
            color: "orange",
            xStart: 1,
            yStart: 10
        } // Orange Ricky
    };

    constructor() {
        this.tetromino = this.selectTetromino();
        this.xPos = this.tetromino.xStart;
        this.yPos = this.tetromino.yStart;
        currentShape = this.tetromino.shape;
        currentColor = this.tetromino.color;
        // console.log("shape ", currentShape);
    }

    selectTetromino() {
        let tetrominoNames = Object.keys(this.tetrominoes);
        let randomTetromino = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
        return this.tetrominoes[randomTetromino];
    }

    drawTetromino() {
        // console.log("drawing tetromino")
        currentShape.forEach((row, y) => {
            row.forEach((cellValue, x) => {
                if (cellValue === 1) {
                    context.fillStyle = currentColor;
                    context.fillRect((this.xPos + x) * CELL_SIZE, (this.yPos + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
                // debugging: highlight center, change if to === 1
                else if (cellValue === 2) {
                    context.fillStyle = "white";
                    context.fillRect((this.xPos + x) * CELL_SIZE, (this.yPos + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            });
        });
        // debugging: rotation, fills cells around tetromino
        currentShape.forEach((row, y) => {
            row.forEach((cellValue, x) => {
                if (cellValue === 0) {
                    context.fillStyle = "black";
                    context.fillRect((this.xPos + x) * CELL_SIZE, (this.yPos + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            });
        });
    }
}

class Field {
    constructor() {
        this.tetromino = new Tetromino(context);
        this.gameArea = this.createNewGameArea();
        // this.gameArea[1][0] = [1, "white"];
        // this.gameArea[3][0] = [1, "white"];
        // this.gameArea[5][0] = [1, "white"];
        // this.gameArea[7][0] = [1, "white"];
        // this.gameArea[9][0] = [1, "white"];
        // this.gameArea[11][0] = [1, "white"];
        // this.gameArea[13][0] = [1, "white"];
        // this.gameArea[15][0] = [1, "white"];
        // this.gameArea[17][0] = [1, "white"];
        // this.gameArea[19][0] = [1, "white"];
        // console.log("original", this.gameArea);
    }

    stackNeedsUpdate = false;

    createNewGameArea() {
        return Array.from({length: ROWS}, () =>
            Array(COLUMNS).fill([1, "pink"]));
    }

    updateField() {
        this.drawStack();
        this.tetromino.drawTetromino();
        if (this.stackNeedsUpdate) {
            this.updateStack();
        }
    }

    hasTetrominoReachedStack() {
        return false;
    }

    updateStack() {
        // console.log("updating stack")
        this.stackNeedsUpdate = false;
        currentShape.forEach((row, y) => {
            row.forEach((cellValue, x) => {
                if (cellValue === 1) {
                    this.gameArea[this.tetromino.yPos + y][this.tetromino.xPos + x] = [1, currentColor];
                }
            });
        });


        this.tetromino = new Tetromino(context);
    }

    drawStack() {
        console.log("drawing current stack")
        this.gameArea.forEach((row, y) =>
            row.forEach((cell, x) => {
                if (cell[0] > 0) {
                    context.fillStyle = cell[1];
                    context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            })
        );

    }

    checkSolidBlocksOnSides(side) {
        if (side === "left") {
            for(let i = 0; i < currentShape.length; i++) {
                if (currentShape[i][0] !== 0) {
                    return true;
                }
            }
            return false;
        }
        for(let i = 0; i < currentShape.length; i++) {
            if (currentShape[i][currentShape[0].length - 1] !== 0) {
                return true;
            }
        }
        return false;

    }
    updateTetrominoPosition(key) {
        let atTopOfStack = ((this.tetromino.yPos + 1) * CELL_SIZE) === (context.canvas.height - ((currentShape.length + 1) * CELL_SIZE));
        let solidBlocksDown = !(currentShape[currentShape.length - 1].includes(1));
        let leftChangePossible = ((this.tetromino.xPos - 1) * CELL_SIZE) >= 0;
        let rightChangePossible = ((this.tetromino.xPos + 1) * CELL_SIZE) <= (context.canvas.width - (currentShape[0].length * CELL_SIZE));
        let downChangePossible = ((this.tetromino.yPos + 1) * CELL_SIZE) < (context.canvas.height - ((currentShape.length + 1) * CELL_SIZE));

        console.log(leftChangePossible)
        switch (key) {
            // case"ArrowUp":
            //     if (this.tetromino.yPos + CELL_SIZE < context.canvas.height) {
            //         this.tetromino.yPos = context.canvas.height - CELL_SIZE;
            //     }
            //     break;
            case "ArrowDown":
                // console.log("top of stack: ", atTopOfStack, " solid down:", !solidBlocksDown, " change possible: ", downChangePossible)
                if (downChangePossible) {
                    this.tetromino.yPos += 1;
                }
                if (atTopOfStack) {
                    if (solidBlocksDown) {
                        this.tetromino.yPos += 1;
                    }
                    this.stackNeedsUpdate = true;
                }
                break;
            case "ArrowLeft":
                let solidBlocksLeft = this.checkSolidBlocksOnSides("left");
                if (leftChangePossible) {
                    this.tetromino.xPos -= 1;
                } else if (!leftChangePossible && !solidBlocksLeft) {
                    this.tetromino.xPos -= 1;
                }
                break;
            case "ArrowRight":
                let solidBlocksRight = this.checkSolidBlocksOnSides("right");
                if (rightChangePossible) {
                    this.tetromino.xPos += 1;
                }
                break;
            case"KeyA":
                currentShape = currentShape[0].map((value, index) => currentShape.map(row => row[index]).reverse());
                break;
            case "KeyB":
                currentShape = currentShape[0].map((value, index) => currentShape.map(row => row[row.length - index - 1]));
                break;
            default:
                break;
        }
        // if ((this.tetromino.yPos + 1) * CELL_SIZE < context.canvas.height) {
        //     this.tetromino.yPos += 1;
        // }
    }
}

class Game {
    constructor(ctx) {
        context = ctx;
        this.field = new Field(context);
    }

    gameActive = false;
    moveRate = 1;

    play(key) {
        // let {width, height} = context.canvas;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        this.field.updateTetrominoPosition(key);
        this.field.updateField();
    }
}
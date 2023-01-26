const CELL_SIZE = 20;
let columns;
let rows;
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
    //         xStart: (columns / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Orange Ricky
    //     j: {
    //         shape: [
    //             [1, 0, 0],
    //             [1, 2, 1],
    //             [0, 0, 0]],
    //         color: "blue",
    //         xStart: (columns / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Blue Ricky
    //     z: {
    //         shape: [
    //             [1, 1, 0],
    //             [0, 2, 1],
    //             [0, 0, 0]],
    //         color: "red",
    //         xStart: (columns / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Cleveland Z
    //     s: {
    //         shape: [
    //             [0, 1, 1],
    //             [1, 2, 0],
    //             [0, 0, 0]],
    //         color: "green",
    //         xStart: (columns / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Rhode Island Z
    //     i: {
    //         shape: [
    //             [0, 0, 0, 0],
    //             [1, 2, 2, 1],
    //             [0, 0, 0, 0],
    //             [0, 0, 0, 0]],
    //         color: "cyan",
    //         xStart: (columns / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Hero
    //     t: {
    //         shape: [
    //             [0, 1, 0],
    //             [1, 2, 1],
    //             [0, 0, 0]],
    //         color: "purple",
    //         xStart: (columns / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Teewee
    //     o: {
    //         shape: [
    //             [1, 1],
    //             [1, 1]],
    //         color: "yellow",
    //         xStart: (columns / 2) * CELL_SIZE,
    //         yStart: 5 * CELL_SIZE
    //     }, // Smashboy
    // };
    // only L tetromino for debugging
    // debugging: only use Orange Ricky
    tetrominoes = {
        test: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]],
            color: "cyan",
            xStart: 3,
            yStart: 5
        }
    };

    constructor() {
        this.tetromino = this.selectTetromino();
        this.xPos = this.tetromino.xStart;
        this.yPos = this.tetromino.yStart;
        currentShape = this.tetromino.shape;
        currentColor = this.tetromino.color;
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
        this.gameArea = Array.from({length: rows}, () => Array(columns).fill([1, "pink"]));
    }

    stackNeedsUpdate = false;

    updateField() {
        this.drawStack();
        this.tetromino.drawTetromino();
        if (this.stackNeedsUpdate) {
            this.updateStack();
        }
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
        // console.log("drawing current stack")
        this.gameArea.forEach((row, y) =>
            row.forEach((cell, x) => {
                if (cell[0] > 0) {
                    context.fillStyle = cell[1];
                    context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            })
        );
    }

    checkLastSolidBlockOnSide(side) {
        let position = 0;
        switch (side) {
            case "left":
                position = currentShape[0].length;
                for (let i = 0; i < currentShape.length; i++) {
                    let positionOfSolidBlock = currentShape[i].indexOf(1);
                    if (positionOfSolidBlock < position && positionOfSolidBlock >= 0) {
                        position = positionOfSolidBlock;
                    }
                }
                break;
            case "right":
                for (let i = 0; i < currentShape.length; i++) {
                    let positionOfSolidBlock = currentShape[i].lastIndexOf(1);
                    if (positionOfSolidBlock > position) {
                        position = positionOfSolidBlock;
                    }
                }
                break;
            case "down":
                for (let i = 0; i < currentShape.length; i++) {
                    if (currentShape[i].includes(1) && i > position) {
                        position = i;
                    }
                }
                break;
        }
        return position;
    }

    verifyPositionChange(move, lastSolidBlock) {
        switch (move) {
            case "left":
                return (this.tetromino.xPos + lastSolidBlock - 1) >= 0;
            case "right":
                return (this.tetromino.xPos + lastSolidBlock + 1) < columns;
            case "down":
                return (this.tetromino.yPos + lastSolidBlock + 1) < rows;
            case "drop":
                return false;
            default:
                return false;
        }
    }

    calculateRotation(move) {
        switch (move) {
            case "clockwise turn":
                return currentShape = currentShape[0].map((value, index) => currentShape.map(row => row[index]).reverse());
            case "counterclockwise turn":
                return currentShape = currentShape[0].map((value, index) => currentShape.map(row => row[row.length - index - 1]));
            default:
                return false;
        }
    }

    updateTetrominoPosition(key) {
        let atTopOfStack = this.tetromino.yPos === (rows - currentShape.length);
        let moveValid;
        let potentialTurn;
        switch (key) {
            case "ArrowLeft":
                moveValid = this.verifyPositionChange("left", this.checkLastSolidBlockOnSide("left"));
                if (moveValid) {
                    this.tetromino.xPos -= 1;
                }
                break;
            case "ArrowRight":
                moveValid = this.verifyPositionChange("right", this.checkLastSolidBlockOnSide("right"));
                if (moveValid) {
                    this.tetromino.xPos += 1;
                }
                break;
            case"KeyA":
                currentShape = this.calculateRotation("clockwise turn");
                break;
            case "KeyB":
                currentShape = this.calculateRotation("counterclockwise turn");
                break;
            case "ArrowDown":
            default:
                moveValid = this.verifyPositionChange("down", this.checkLastSolidBlockOnSide("down"));
                if (moveValid) {
                    this.tetromino.yPos += 1;
                }
                // if (atTopOfStack) {
                //     this.stackNeedsUpdate = true;
                // }
                break;
        }
        this.stackNeedsUpdate = atTopOfStack;
    }
}

class Game {
    constructor(ctx) {
        context = ctx;
        columns = ctx.canvas.width / CELL_SIZE;
        rows = ctx.canvas.height / CELL_SIZE;
        this.field = new Field(context);
    }

    gameActive = false;
    moveRate = 1;

    play(key) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        this.field.updateTetrominoPosition(key);
        this.field.updateField();
    }
}
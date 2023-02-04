const CELL_SIZE = 20;
let columns;
let rows;
let context;
let currentShape;
let currentColor;

class Tetromino {
    tetrominoes = {
        l: {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]],
            color: "orange",
            xStart: 0,
            yStart: 0
        }, // Orange Ricky
        j: {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]],
            color: "blue",
            xStart: 0,
            yStart: 0
        }, // Blue Ricky
        z: {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]],
            color: "red",
            xStart: 0,
            yStart: 0
        }, // Cleveland Z
        s: {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]],
            color: "green",
            xStart: 0,
            yStart: 0
        }, // Rhode Island Z
        i: {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]],
            color: "cyan",
            xStart: 0,
            yStart: 0
        }, // Hero
        t: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]],
            color: "purple",
            xStart: 0,
            yStart: 0
        }, // Teewee
        o: {
            shape: [
                [1, 1],
                [1, 1]],
            color: "yellow",
            xStart: 0,
            yStart: 0
        }, // Smashboy
    };
    // only one tetromino for debugging
    // debugging: only use Orange Ricky
    // tetrominoes = {
    //     test: {
    //         shape: [
    //             [0, 1, 0],
    //             [1, 1, 1],
    //             [0, 0, 0]],
    //         color: "cyan",
    //         xStart: 0,
    //         yStart: 0
    //     }
    // };

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
        this.gameArea = Array.from({length: rows}, () => Array(columns).fill([2, "pink"]));
    }

    stackNeedsUpdate = false;
    tetrominoOrientation = 0;

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
        this.tetrominoOrientation = 0;
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

    firstOrLastSolidBlockOnSide(side) {
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
        }
        return position;
    }

    isThereWallConflict(move, position) {
        switch (move) {
            case "left":
                return position + this.firstOrLastSolidBlockOnSide("left") < 0;
            case "right":
                return position + this.firstOrLastSolidBlockOnSide("right") >= columns;
            case "down":
                return position + this.firstOrLastSolidBlockOnSide("down") >= rows;
            case "rotate":
                let leftConflict = this.isThereWallConflict("left", this.tetromino.xPos);
                let rightConflict = this.isThereWallConflict("right", this.tetromino.xPos);
                let downConflict = this.isThereWallConflict("down", this.tetromino.yPos);
                return leftConflict || rightConflict || downConflict;
            default:
                return true;
        }
    }

    isThereStackConflict(position) {

    }

    isPositionChangeValid(move) {
        let potentialPosition;
        let wallConflict = false;
        switch (move) {
            case "left":
                potentialPosition = this.tetromino.xPos - 1;
                wallConflict = this.isThereWallConflict("left", potentialPosition);
                if (!wallConflict) {
                    return true;
                }
                break;
            case "right":
                potentialPosition = this.tetromino.xPos + 1;
                wallConflict = this.isThereWallConflict("right", potentialPosition);
                if (!wallConflict) {
                    return true;
                }
                break;
            case "down":
                potentialPosition = this.tetromino.yPos + 1;
                wallConflict = this.isThereWallConflict("down", potentialPosition);
                if (!wallConflict) {
                    return true;
                }
                break;
            case "rotate":
                wallConflict = this.isThereWallConflict("rotate");
                if (!wallConflict) {
                    return true;
                }
        }
        return false;
    }

    calculateRotation(move) {
        let previousOrientation = currentShape;
        let isNewOrientationValid;
        let canKickWall;
        switch (move) {
            case "clockwise turn":
                currentShape = currentShape[0].map((value, index) => currentShape.map(row => row[index]).reverse());
                isNewOrientationValid = this.isPositionChangeValid("rotate");
                if (!isNewOrientationValid) {
                    canKickWall = this.testWallKick(move);
                    if (!canKickWall) {
                        currentShape = previousOrientation;
                    }
                }
                this.tetrominoOrientation++;
                return;
            case "counterclockwise turn":
                currentShape = currentShape[0].map((value, index) => currentShape.map(row => row[row.length - index - 1]));
                isNewOrientationValid = this.isPositionChangeValid("rotate");
                if (!isNewOrientationValid) {
                    currentShape = previousOrientation;
                }
                this.tetrominoOrientation--;
                return;
            default:
                return;
        }
    }

    testWallKick(move) {
        let turning
    }

    updateTetrominoPosition(key) {
        let atTopOfStack = this.tetromino.yPos + this.firstOrLastSolidBlockOnSide("down") === rows - 1;
        let moveValid;
        let potentialTurn;
        switch (key) {
            case "ArrowUp":
                this.tetromino.yPos -= 1;
                break;
            case "ArrowLeft":
                moveValid = this.isPositionChangeValid("left");
                if (moveValid) {
                    this.tetromino.xPos -= 1;
                }
                break;
            case "ArrowRight":
                moveValid = this.isPositionChangeValid("right");
                if (moveValid) {
                    this.tetromino.xPos += 1;
                }
                break;
            case"KeyA":
                this.calculateRotation("clockwise turn");
                break;
            case "KeyB":
                this.calculateRotation("counterclockwise turn");
                break;
            case "ArrowDown":
                // default:
                moveValid = this.isPositionChangeValid("down");
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
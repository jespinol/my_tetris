const columns = 10;
const rows = 22;
let cellSize;
let ctxGameArea;
let ctxNextArea;
let ctxHoldArea;
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
            xStart: 3,
            yStart: -3
        }, // Orange Ricky
        j: {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]],
            color: "blue",
            xStart: 3,
            yStart: -3
        }, // Blue Ricky
        z: {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]],
            color: "red",
            xStart: 3,
            yStart: -3
        }, // Cleveland Z
        s: {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]],
            color: "green",
            xStart: 3,
            yStart: -3
        }, // Rhode Island Z
        i: {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]],
            color: "cyan",
            xStart: 3,
            yStart: -3
        }, // Hero
        t: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]],
            color: "purple",
            xStart: 3,
            yStart: -3
        }, // Teewee
        o: {
            shape: [
                [1, 1],
                [1, 1]],
            color: "yellow",
            xStart: 4,
            yStart: -3
        }, // Smashboy
    };

    // only one tetromino for debugging
    // tetrominoes = {
    //     test: {
    //         shape: [
    //             [0, 0, 0, 0],
    //             [1, 1, 1, 1],
    //             [0, 0, 0, 0],
    //             [0, 0, 0, 0]],
    //         color: "cyan",
    //         xStart: 0,
    //         yStart: -2
    //     }
    // };
    currentTetromino;
    heldTetromino;
    canHoldTetromino = true;

    constructor() {
        this.nextTetrominoes = this.initTetrominoes();
        this.setNextTetromino();
    }

    selectRandomTetromino() {
        let tetrominoNames = Object.keys(this.tetrominoes);
        return tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
    }

    initTetrominoes() {
        let tetrominoList = [];
        for (let i = 0; i < 6; i++) {
            tetrominoList[i] = this.selectRandomTetromino();
        }
        return tetrominoList;
    }

    setNextTetromino(useHeld = false) {
        let previousHeldTetromino;
        if (useHeld) {
            previousHeldTetromino = this.heldTetromino;
            this.heldTetromino = this.currentTetromino;
        }
        this.currentTetromino = useHeld ? previousHeldTetromino: this.tetrominoes[this.nextTetrominoes.shift()];
        this.xPos = this.currentTetromino.xStart;
        this.yPos = this.currentTetromino.yStart;
        currentShape = this.currentTetromino.shape;
        currentColor = this.currentTetromino.color;
        if (!useHeld) {
            this.nextTetrominoes.push(this.selectRandomTetromino());
        }
    }

    holdTetromino() {
        if (this.canHoldTetromino) {
            if (this.heldTetromino === undefined) {
                this.heldTetromino = this.currentTetromino;
                this.setNextTetromino();
            } else {
                this.setNextTetromino(true);
            }
            this.canHoldTetromino = false;
        }
    }

    selectTetromino() {
        let tetrominoNames = Object.keys(this.tetrominoes);
        let randomTetromino = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
        return this.tetrominoes[randomTetromino];
    }

    drawSideTetromino(location, shape, color) {
        let size = cellSize / 2;
        shape.forEach((row, y) => {
            row.forEach((cellValue, x) => {
                if (cellValue === 1) {
                    location.beginPath()
                    location.fillStyle = color;
                    location.roundRect(x * size, y * size, size, size, [3]);
                    location.fill()
                    location.beginPath()
                    location.strokeStyle = "gainsboro";
                    location.roundRect(x * size, y * size, size, size, 0);
                    location.stroke()
                }
            });
        });
    }

    drawGameTetromino(yPos = this.yPos, xPos = this.xPos, ghost = false, location = ctxGameArea, shape = currentShape) {
        // console.log("drawing tetromino")
        if (ghost) {
            shape.forEach((row, y) => {
                row.forEach((cellValue, x) => {
                    if (cellValue === 1) {
                        location.beginPath()
                        location.strokeStyle = "gray";
                        location.roundRect((xPos + x) * cellSize, (yPos + y) * cellSize, cellSize, cellSize, [3]);
                        location.stroke()
                    }
                });
            });
        } else {
            shape.forEach((row, y) => {
                row.forEach((cellValue, x) => {
                    if (cellValue === 1) {
                        location.beginPath()
                        location.fillStyle = currentColor;
                        location.roundRect((xPos + x) * cellSize, (yPos + y) * cellSize, cellSize, cellSize, [3]);
                        location.fill()
                        location.beginPath()
                        location.strokeStyle = "gainsboro";
                        location.roundRect((xPos + x) * cellSize, (yPos + y) * cellSize, cellSize, cellSize, 0);
                        location.stroke()
                    }
                });
            });
            // debugging: rotation, fills cells around tetromino
            // shape.forEach((row, y) => {
            //     row.forEach((cellValue, x) => {
            //         if (cellValue === 0) {
            //             location.fillStyle = "black";
            //             location.fillRect((this.xPos + x) * cellSize, (this.yPos + y) * cellSize, cellSize, cellSize);
            //         }
            //     });
            // });
        }
    }
}

class Field {
    constructor() {
        this.tetromino = new Tetromino(ctxGameArea);
        this.gameArea = Array.from({length: rows}, () => Array(columns).fill([0, ""]));
    }

    stackNeedsUpdate = false;
    tetrominoOrientation = 0;

    drawStack() {
        // console.log("drawing current stack")
        ctxGameArea.fillStyle = "whitesmoke";
        ctxGameArea.fillRect(0, 0, columns * cellSize, rows * cellSize);
        this.gameArea.forEach((row, y) =>
            row.forEach((cell, x) => {
                if (cell[0] > 0) {
                    ctxGameArea.beginPath()
                    ctxGameArea.fillStyle = cell[1];
                    ctxGameArea.roundRect(x * cellSize, y * cellSize, cellSize, cellSize, [3]);
                    ctxGameArea.fill()
                    ctxGameArea.beginPath()
                    ctxGameArea.strokeStyle = "gainsboro";
                    ctxGameArea.roundRect(x * cellSize, y * cellSize, cellSize, cellSize, 0);
                    ctxGameArea.stroke()
                }
            })
        );
    }

    updateField() {
        this.drawStack();
        this.tetromino.drawGameTetromino();
        let ghostPosition = this.calculateGhostPosition();
        this.tetromino.drawGameTetromino(ghostPosition[0], ghostPosition[1], true);
        this.tetromino.drawSideTetromino(ctxNextArea, this.tetromino.tetrominoes[this.tetromino.nextTetrominoes[0]].shape, this.tetromino.tetrominoes[this.tetromino.nextTetrominoes[0]].color);
        if (this.tetromino.heldTetromino) {
            this.tetromino.drawSideTetromino(ctxHoldArea, this.tetromino.heldTetromino.shape, this.tetromino.heldTetromino.color);
        }
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
                    if ((this.tetromino.yPos + y) < 0) {
                        console.log("end game sequence")
                    } else {
                        this.gameArea[this.tetromino.yPos + y][this.tetromino.xPos + x] = [1, currentColor];
                    }
                }
            });
        });
        this.tetromino.setNextTetromino();
        this.tetrominoOrientation = 0;
    }

    whereIsSolidOnSide(side) {
        let pos;
        switch (side) {
            case "left":
                pos = currentShape[0].length;
                for (let i = 0; i < currentShape.length; i++) {
                    let solidPos = currentShape[i].indexOf(1);
                    if (solidPos < pos && solidPos >= 0) {
                        pos = solidPos;
                    }
                }
                break;
            case "right":
                pos = 0;
                for (let i = 0; i < currentShape.length; i++) {
                    let solidPos = currentShape[i].lastIndexOf(1);
                    if (solidPos > pos) {
                        pos = solidPos;
                    }
                }
                break;
            case "down":
                pos = 0;
                for (let i = 0; i < currentShape.length; i++) {
                    if (currentShape[i].includes(1) && i > pos) {
                        pos = i;
                    }
                }
                break;
            case "up":
                pos = currentShape.length;
                for (let i = 0; i < currentShape.length; i++) {
                    if (currentShape[i].includes(1) && i < pos) {
                        pos = i;
                    }
                }
        }
        // console.log(`solid index is ${pos}`)
        return pos;
    }

    isPositionValid(yPos = this.tetromino.yPos, xPos = this.tetromino.xPos) {
        let colStart = xPos + this.whereIsSolidOnSide("left");
        let colEnd = xPos + this.whereIsSolidOnSide("right");
        let rowStart = yPos + this.whereIsSolidOnSide("up");
        let rowEnd = yPos + this.whereIsSolidOnSide("down");
        // checks that the tetromino is within game area
        if (colStart < 0 || colEnd >= columns || rowEnd >= rows) {
            return false;
        }
        // checks that the tetromino would not be on a cell that's already occupied
        if (yPos >= 0 && (yPos + this.whereIsSolidOnSide("down")) < rows) {
            for (let y = rowStart, y_ = rowStart - yPos; y <= rowEnd; y++, y_++) {
                for (let x = colStart, x_ = colStart - xPos; x <= colEnd; x++, x_++) {
                    if (y < rows && x < columns && x >= 0) {
                        if (this.gameArea[y][x][0] === 1 && currentShape[y_][x_] === 1) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    calculateGhostPosition() {
        // the ghost tetromino is simply the tetromino as if it was hard-dropped
        return this.calculateHardDrop();
    }

    calculateHardDrop(yPos = this.tetromino.yPos, xPos = this.tetromino.xPos) {
        let validPosition = true;
        let finalYPos = yPos;
        let finalXPos = xPos;
        while (validPosition) {
            validPosition = this.isPositionValid(finalYPos + 1, finalXPos)
            if (validPosition) {
                finalYPos++;
            }
        }
        return [finalYPos, finalXPos]
    }

    calculateRotation(direction) {
        let previousOrientation = currentShape;
        let isNewOrientationValid;
        let wallKickPossible;
        let orientationChange = 0;
        switch (direction) {
            case "clockwise turn":
                currentShape = currentShape[0].map((value, index) => currentShape.map(row => row[index]).reverse());
                orientationChange++;
                break;
            case "counterclockwise turn":
                currentShape = currentShape[0].map((value, index) => currentShape.map(row => row[row.length - index - 1]));
                orientationChange--;
        }
        // console.log(`yPos is ${this.tetromino.yPos}`)
        isNewOrientationValid = this.isPositionValid();
        if (!isNewOrientationValid) {
            wallKickPossible = this.canKickWall();
            if (!wallKickPossible) {
                // console.log("cannot kick wall")
                currentShape = previousOrientation;
                orientationChange = 0;
            }
        }
        this.tetrominoOrientation += orientationChange;
    }

    canKickWall() {
        // need to fix cyan wall kicks
        let conflictLeft = !this.isPositionValid(this.tetromino.yPos, this.tetromino.xPos - 1);
        let conflictRight = !this.isPositionValid(this.tetromino.yPos, this.tetromino.xPos + 1);
        let conflictDown = !this.isPositionValid(this.tetromino.yPos + 1, this.tetromino.xPos);
        let conflictUp = !this.isPositionValid(this.tetromino.yPos - 1, this.tetromino.xPos);
        if (conflictLeft && conflictRight && conflictDown && conflictUp) {
            return false;
        }
        if (conflictLeft) {
            if (!conflictRight) {
                this.tetromino.xPos += 1;
                return true;
            }
        }
        if (conflictRight) {
            if (!conflictLeft) {
                this.tetromino.xPos -= 1;
                return true;
            }
        }
        if (conflictUp) {
            if (!conflictDown) {
                this.tetromino.yPos += 1;
                return true;
            }
        }
        if (conflictDown) {
            if (!conflictUp) {
                this.tetromino.yPos -= 1;
                return true;
            }
        }
        return false;
    }

    updateTetrominoPosition(key) {
        let yPos = this.tetromino.yPos;
        let xPos = this.tetromino.xPos;
        let moveValid;
        switch (key) {
            case "ArrowLeft":
                moveValid = this.isPositionValid(yPos, xPos - 1);
                if (moveValid) {
                    this.tetromino.xPos -= 1;
                }
                break;
            case "ArrowRight":
                moveValid = this.isPositionValid(yPos, xPos + 1);
                if (moveValid) {
                    this.tetromino.xPos += 1;
                }
                break;
            case"KeyX":
            case "ArrowUp":
                this.calculateRotation("clockwise turn");
                break;
            case "KeyZ":
            case "ControlLeft":
                this.calculateRotation("counterclockwise turn");
                break;
            case "Space":
                this.tetromino.yPos = this.calculateHardDrop()[0]
                break;
            case "KeyC":
            case "ShiftLeft":
            case "ShiftRight":
                this.tetromino.holdTetromino();
                this.updateField();
                break;
            case "ArrowDown":
            case "auto":
                moveValid = this.isPositionValid(yPos + 1, xPos);
                if (moveValid) {
                    this.tetromino.yPos += 1;
                } else {
                    this.stackNeedsUpdate = true;
                    this.tetromino.canHoldTetromino = true;
                }
        }
    }

    checkRows() {
        // console.log("checking rows")
        let clearedRows = 0;
        for (let y = 0; y < rows; y++) {
            let row2clear = true;
            for (let cell = 0; cell < this.gameArea[y].length; cell++) {
                if (this.gameArea[y][cell][0] === 0) {
                    row2clear = false;
                    break
                }
            }
            if (row2clear) {
                this.gameArea.splice(y, 1);
                this.gameArea.unshift(Array(columns).fill([0, ""]));
                clearedRows++;
            }
        }
        let tetris = Math.floor(clearedRows / 4);
        clearedRows = clearedRows % 4;
        let triple = Math.floor(clearedRows / 3);
        clearedRows = clearedRows % 3;
        let double = Math.floor(clearedRows / 2);
        let single = clearedRows % 2;
        return (tetris * 8) + (triple * 5) + (double * 3) + (single);
    }
}

class Game {
    constructor(contextGameArea, contextNextArea, contextHoldArea, size) {
        ctxGameArea = contextGameArea;
        ctxNextArea = contextNextArea;
        ctxHoldArea = contextHoldArea;
        cellSize = size;
        this.field = new Field(ctxGameArea);
    }

    levelPoints = 0;
    level = 1;
    points = 0;

    play(key) {
        // console.log("playing")
        ctxGameArea.clearRect(0, 0, ctxGameArea.canvas.width, ctxGameArea.canvas.height);
        ctxNextArea.clearRect(0, 0, ctxNextArea.canvas.width, ctxNextArea.canvas.height);
        ctxHoldArea.clearRect(0, 0, ctxHoldArea.canvas.width, ctxHoldArea.canvas.height)
        if (key !== "auto") {
            this.field.updateTetrominoPosition(key);
        } else {
            this.field.updateTetrominoPosition("auto");
        }
        this.field.updateField();
        let clearedRows = this.field.checkRows();
        this.levelPoints += clearedRows;
        this.points += clearedRows * 100 * this.level;
        if (this.levelPoints >= (5 * this.level)) {
            this.level++;
            return true;
        }

        return false;
    }
}
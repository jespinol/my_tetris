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

    constructor() {
        this.tetromino = this.selectTetromino();
        this.xPos = this.tetromino.xStart;
        this.yPos = this.tetromino.yStart;
        this.currentShape = this.tetromino.shape;
        currentShape = this.tetromino.shape;
        this.currentColor = this.tetromino.color;
        currentColor = this.tetromino.color;
    }

    selectTetromino() {
        let tetrominoNames = Object.keys(this.tetrominoes);
        let randomTetromino = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
        return this.tetrominoes[randomTetromino];
    }

    drawTetromino(yPos = this.yPos, xPos = this.xPos, ghost = false) {
        // console.log("drawing tetromino")
        if (ghost) {
            // console.log(`drawing ghost at ${yPos} ${xPos}`)
            currentShape.forEach((row, y) => {
                row.forEach((cellValue, x) => {
                    if (cellValue === 1) {
                        context.beginPath()
                        context.strokeStyle = "gray";
                        context.roundRect((xPos + x) * CELL_SIZE, (yPos + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE, [3]);
                        context.stroke()
                    }
                });
            });
            return;
        }
        // console.log(`drawing tetromino at ${yPos} ${xPos}`)
        currentShape.forEach((row, y) => {
            row.forEach((cellValue, x) => {
                if (cellValue === 1) {
                    context.beginPath()
                    context.fillStyle = currentColor;
                    context.roundRect((xPos + x) * CELL_SIZE, (yPos + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE, [3]);
                    context.fill()
                    context.beginPath()
                    context.strokeStyle = "gainsboro";
                    context.roundRect((xPos + x) * CELL_SIZE, (yPos + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE, 0);
                    context.stroke()
                }
            });
        });
        // debugging: rotation, fills cells around tetromino
        // currentShape.forEach((row, y) => {
        //     row.forEach((cellValue, x) => {
        //         if (cellValue === 0) {
        //             context.fillStyle = "black";
        //             context.fillRect((this.xPos + x) * CELL_SIZE, (this.yPos + y) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        //         }
        //     });
        // });
    }
}

class Field {
    constructor() {
        this.tetromino = new Tetromino(context);
        this.gameArea = Array.from({length: rows}, () => Array(columns).fill([0, ""]));
    }

    stackNeedsUpdate = false;
    tetrominoOrientation = 0;
    ghostXPos = 0;
    ghostYPos = 0;

    updateField() {
        this.drawStack();
        this.tetromino.drawTetromino();
        this.calculateGhostPosition();
        this.tetromino.drawTetromino(this.ghostYPos, this.ghostXPos, true);
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
        context.fillStyle = "whitesmoke";
        context.fillRect(0, 0, columns * CELL_SIZE, rows * CELL_SIZE);
        this.gameArea.forEach((row, y) =>
            row.forEach((cell, x) => {
                if (cell[0] > 0) {
                    // context.fillStyle = cell[1];
                    // context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    context.beginPath()
                    context.fillStyle = cell[1];
                    context.roundRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE, [3]);
                    context.fill()
                    context.beginPath()
                    context.strokeStyle = "gainsboro";
                    context.roundRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE, 0);
                    context.stroke()
                }
            })
        );
    }

    firstOrLastSolidBlockOnSide(side) {
        let position = 0;
        switch (side) {
            case "left":
                // console.log("solid left")
                position = currentShape[0].length;
                for (let i = 0; i < currentShape.length; i++) {
                    let positionOfSolidBlock = currentShape[i].indexOf(1);
                    if (positionOfSolidBlock < position && positionOfSolidBlock >= 0) {
                        position = positionOfSolidBlock;
                    }
                }
                break;
            case "right":
                // console.log("solid right")
                for (let i = 0; i < currentShape.length; i++) {
                    let positionOfSolidBlock = currentShape[i].lastIndexOf(1);
                    if (positionOfSolidBlock > position) {
                        position = positionOfSolidBlock;
                    }
                }
                break;
            case "down":
                // console.log("solid down")
                for (let i = 0; i < currentShape.length; i++) {
                    if (currentShape[i].includes(1) && i > position) {
                        position = i;
                    }
                }
                break;
            case "up":
                for (let i = 0; i < currentShape.length; i++) {
                    if (currentShape[i].includes(1) && i < position) {
                        position = i;
                    }
                }
        }
        // console.log(`for firstOrLastSolid returning ${position}`)
        return position;
    }

    isThereWallConflict(move, position) {
        switch (move) {
            case "left":
                // console.log(`position ${position}, firstOrLast ${this.firstOrLastSolidBlockOnSide("left")}`)
                return position + this.firstOrLastSolidBlockOnSide("left") < 0;
            case "right":
                return position + this.firstOrLastSolidBlockOnSide("right") >= columns;
            case "down":
                return position + this.firstOrLastSolidBlockOnSide("down") >= rows;
            case "up":
                return position + this.firstOrLastSolidBlockOnSide("up") < 0;
            case "all":
                let leftConflict = this.isThereWallConflict("left", this.tetromino.xPos);
                let rightConflict = this.isThereWallConflict("right", this.tetromino.xPos);
                let downConflict = this.isThereWallConflict("down", this.tetromino.yPos);
                // console.log(`wall conflict returning ${leftConflict || rightConflict || downConflict}`)
                return leftConflict || rightConflict || downConflict;
            default:
                return true;
        }
    }

    isThereStackConflict(yPos, xPos) {
        for (let y = 0; y < currentShape.length; y++) {
            // console.log(y)
            for (let x = 0; x < currentShape[0].length; x++) {
                // console.log(x)
                // console.log(`checking (${y},${x}) `)
                // if (currentShape[y][x] === 1) {
                //     console.log(`found 1 in tetromino ${y} ${x}`)
                // }
                // console.log(`occupied stack ${this.gameArea[yPos + y][xPos + x][0] === 1}, checked ${yPos + y} ${xPos + x}`)
                if (currentShape[y][x] === 1) {
                    let stackY = yPos + y < rows && yPos + y >= 0;
                    let stackX = xPos + x < columns && xPos + x >= 0;
                    if ((stackX && stackY) && this.gameArea[yPos + y][xPos + x][0] === 1) {
                        // console.log(`checking ${this.gameArea[yPos + y][xPos + x][0]} for ${y} ${x}`)
                        return true;
                    }
                    // console.log(`found stack conflict`);
                }
            }
        }
        return false;
    }

    isPositionChangeValid(move, yPos = this.tetromino.yPos, xPos = this.tetromino.xPos) {
        let potentialPosition;
        let wallConflict = false;
        let stackConflict = false;
        switch (move) {
            case "left":
                potentialPosition = xPos - 1;
                wallConflict = this.isThereWallConflict("left", potentialPosition);
                stackConflict = this.isThereStackConflict(yPos, potentialPosition);
                if (!wallConflict && !stackConflict) {
                    return true;
                }
                break;
            case "right":
                potentialPosition = xPos + 1;
                wallConflict = this.isThereWallConflict("right", potentialPosition);
                stackConflict = this.isThereStackConflict(yPos, potentialPosition);
                if (!wallConflict && !stackConflict) {
                    return true;
                }
                break;
            case "down":
                potentialPosition = yPos + 1;
                wallConflict = this.isThereWallConflict("down", potentialPosition);
                stackConflict = this.isThereStackConflict(potentialPosition, xPos);
                if (!wallConflict && !stackConflict) {
                    return true;
                }
                break;
            case "up":
                potentialPosition = yPos - 1;
                wallConflict = this.isThereWallConflict("up", potentialPosition);
                stackConflict = this.isThereStackConflict(potentialPosition, xPos);
                if (!wallConflict && !stackConflict) {
                    return true;
                }
                break;
            case "rotate":
                wallConflict = this.isThereWallConflict("all");
                stackConflict = this.isThereStackConflict(yPos, xPos);
                if (!wallConflict && !stackConflict) {
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
                break;
            case "counterclockwise turn":
                currentShape = currentShape[0].map((value, index) => currentShape.map(row => row[row.length - index - 1]));
        }
        isNewOrientationValid = this.isPositionChangeValid("rotate");
        if (!isNewOrientationValid) {
            canKickWall = this.testWallKick(move);
            // console.log(`xPosition before kick ${this.tetromino.xPos}`)
            if (!canKickWall) {
                currentShape = previousOrientation;
            }
        }
    }

    testWallKick() {
        let conflictLeft = this.isThereWallConflict("left", this.tetromino.xPos);
        let conflictRight = this.isThereWallConflict("right", this.tetromino.xPos);
        let conflictDown = this.isThereWallConflict("down", this.tetromino.yPos);
        switch (true) {
            case conflictLeft:
                if (currentColor === "cyan" && this.tetromino.xPos === -2) {
                    this.tetromino.xPos += 1;
                }
                if (this.isPositionChangeValid("right")) {
                    this.tetromino.xPos += 1;

                }
                return true;
            case conflictRight:
                if (currentColor === "cyan" && this.tetromino.xPos === 8) {
                    this.tetromino.xPos -= 1;
                }
                if (this.isPositionChangeValid("left")) {
                    this.tetromino.xPos -= 1;
                }
                return true;
            case conflictDown:
                if (currentColor === "cyan" && this.tetromino.yPos === 20) {
                    this.tetromino.yPos -= 1;
                }
                if (this.isPositionChangeValid("up")) {
                    this.tetromino.yPos -= 1;
                }
                return true;
        }
        return false;
    }

    updateTetrominoPosition(key) {
        let atTopOfStack = this.tetromino.yPos + this.firstOrLastSolidBlockOnSide("down") === rows - 1;
        let moveValid;
        let potentialTurn;
        switch (key) {
            // case "customUp":
            // case "ArrowUp":
            //     this.tetromino.yPos -= 1;
            //     break;
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
                console.log("hold")
                break;
            case "ArrowDown":
                moveValid = this.isPositionChangeValid("down");
                if (moveValid) {
                    this.tetromino.yPos += 1;
                }
                break;
            case "auto":
                moveValid = this.isPositionChangeValid("down");
                if (moveValid) {
                    this.tetromino.yPos += 1;
                } else {
                    atTopOfStack = true;
                }
        }
        this.stackNeedsUpdate = atTopOfStack;
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
                // console.log(`found complete row at index ${y}`)
                // console.log(`before ${this.gameArea}`)
                this.gameArea.splice(y, 1);
                this.gameArea.unshift(Array(columns).fill([0, ""]));
                // console.log(`after ${this.gameArea}`)
                clearedRows++;
                // console.log(this.gameArea)
            }
        }

        let tetris = Math.floor(clearedRows / 4);
        clearedRows = clearedRows % 4;
        let triple = Math.floor(clearedRows / 3);
        clearedRows = clearedRows % 3;
        let double = Math.floor(clearedRows / 2);
        let single = clearedRows % 2;
        // return {'tetris': tetris, 'triple': triple, 'double': double, 'single': single};

        return (tetris * 8) + (triple * 5) + (double * 3) + (single);
    }

    calculateGhostPosition() {
        // console.log("ghost")
        let finalPos = this.calculateHardDrop();
        // console.log(finalPos)
        this.ghostYPos = finalPos[0];
        this.ghostXPos = finalPos[1];
        // this.ghostXPos = this.tetromino.xPos;
        // this.ghostYPos = this.tetromino.yPos;
        // let validGhostPosition = true;
        // while (validGhostPosition) {
        //     // console.log("in while loop")
        //     validGhostPosition = this.calculateHardDrop(this.ghostYPos, this.ghostXPos);
        //     // console.log(validGhostPosition)
        //     if (validGhostPosition) {
        //         this.ghostYPos++;
        //     }
        // }
    }

    calculateHardDrop(yPos = this.tetromino.yPos, xPos = this.tetromino.xPos) {
        let validPosition = true;
        let finalYPos = yPos;
        let finalXPos = xPos;
        while (validPosition) {
            validPosition = this.isPositionChangeValid("down", finalYPos, finalXPos)
            if (validPosition) {
                finalYPos++;
            }
        }
        return [finalYPos, finalXPos]
    }
}

class Game {
    constructor(ctx) {
        context = ctx;
        columns = ctx.canvas.width / CELL_SIZE;
        rows = ctx.canvas.height / CELL_SIZE;
        this.field = new Field(context);
    }
    levelPoints = 0;
    level = 1;
    points = 0;

    play(key) {
        // console.log("playing")
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        if (key !== "auto") {
            this.field.updateTetrominoPosition(key);
        } else {
            this.field.updateTetrominoPosition("auto");
        }
        this.field.updateField();
        let clearedRows = this.field.checkRows();
        this.levelPoints += clearedRows;
        // console.log(this.levelPoints)
        this.points += clearedRows * 100 * this.level;
        // console.log(this.points);
        // console.log(`score is ${this.score}`)
        if (this.levelPoints >= (5 * this.level)) {
            this.level++;
            // console.log(`score high enough, level is ${this.level}. returning true`)
            return true;
        }
        return false;
        // console.log(`score is ${this.score}`)
    }
}
const columns = 10;
const rows = 22;
let cellSize;
let ctxGameArea;
let ctxNextArea;
let ctxHoldArea;
let gameOver = false;

class Main {
    // backgroundMusic = new Audio("resources/static/sounds/TwisterTetris_poinl.mp3");

    constructor(contextGameArea, contextNextArea, contextHoldArea, size) {
        ctxGameArea = contextGameArea;
        ctxNextArea = contextNextArea;
        ctxHoldArea = contextHoldArea;
        cellSize = size;
        this.field = new GameArea(ctxGameArea);
        // this.backgroundMusic.volume = 0.5;
    }

    levelPoints = 0;
    level = 1;
    points = 0;
    gameOver = false;

    play(key) {
        // console.log("playing")
        this.gameOver = gameOver;
        if (this.gameOver) {
            return true;
        }
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

    endGame() {
        // console.log("end game sequence")
        this.field.drawGameOver();
    }
}

class Tetromino {
    current;
    held;
    canHold = true;

    tetrominoes = {
        l: {shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: "#FFA366", xStart: 3, yStart: -3}, // Orange Ricky
        j: {shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: "#0099CC", xStart: 3, yStart: -3}, // Blue Ricky
        z: {shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: "#FF5A5A", xStart: 3, yStart: -3}, // Cleveland Z
        s: {shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: "#70C05A", xStart: 3, yStart: -3}, // Rhode Island Z
        i: {shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: "#97FFFF", xStart: 3, yStart: -3}, // Hero
        t: {shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: "#A667E7", xStart: 3, yStart: -3}, // Teewee
        o: {shape: [[1, 1], [1, 1]], color: "#FFE066", xStart: 4, yStart: -3}, // Smashboy
    };

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
        let previousHeld;
        if (useHeld) {
            previousHeld = this.held;
            this.held = this.current;
        }
        this.current = useHeld ? previousHeld : this.tetrominoes[this.nextTetrominoes.shift()];
        this.xPos = this.current.xStart;
        this.yPos = this.current.yStart;
        this.shape = this.current.shape;
        this.color = this.current.color;
        if (!useHeld) {
            this.nextTetrominoes.push(this.selectRandomTetromino());
        }
        this.next = this.tetrominoes[this.nextTetrominoes[0]];
    }

    holdTetromino() {
        if (this.canHold) {
            if (this.held === undefined) {
                this.held = this.current;
                this.setNextTetromino();
            } else {
                this.setNextTetromino(true);
            }
            // this.fadeTetromino(ctxHoldArea);
            this.canHold = false;
        }
    }

    drawTetromino(location, size, shape, color, xPos, yPos, isGhost, isStack) {
        shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (isStack ? cell[0] === 1 : cell === 1) {
                    location.beginPath()
                    location.roundRect((xPos + x) * size, (yPos + y) * size, size, size, [3]);
                    if (isGhost) {
                        location.strokeStyle = "#888888";
                        location.lineWidth = 1;
                        location.stroke();
                    } else {
                        let gradient = location.createLinearGradient((xPos + x) * size, (yPos + y) * size, (xPos + x + 1) * size, (yPos + y + 1) * size);
                        if (isStack) {
                            color = cell[1];
                        }
                        gradient.addColorStop(0, color);
                        gradient.addColorStop(0.5, this.shadeColor(color, -10))
                        gradient.addColorStop(1, this.shadeColor(color, -40));
                        location.fillStyle = gradient;
                        location.fill()
                    }
                }
            });
        });
    }

    fadeTetromino(location) {
        let opacity = 1;
        if (!location.style.opacity) {
            location.style.opacity = "1";
        }
        while (opacity > 1) {
            location.style.opacity -= "0.1";
        }
    }

    shadeColor(color, percent) { // adapted from https://stackoverflow.com/a/13532993
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        R = Math.round(R)
        G = Math.round(G)
        B = Math.round(B)

        let RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        let GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        let BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }

    posSolidOnSide(side) {
        let pos;
        switch (side) {
            case "left":
                pos = this.shape[0].length;
                for (let i = 0; i < this.shape.length; i++) {
                    let solidPos = this.shape[i].indexOf(1);
                    if (solidPos < pos && solidPos >= 0) {
                        pos = solidPos;
                    }
                }
                break;
            case "right":
                pos = 0;
                for (let i = 0; i < this.shape.length; i++) {
                    let solidPos = this.shape[i].lastIndexOf(1);
                    if (solidPos > pos) {
                        pos = solidPos;
                    }
                }
                break;
            case "down":
                pos = 0;
                for (let i = 0; i < this.shape.length; i++) {
                    if (this.shape[i].includes(1) && i > pos) {
                        pos = i;
                    }
                }
                break;
            case "up":
                pos = this.shape.length;
                for (let i = 0; i < this.shape.length; i++) {
                    if (this.shape[i].includes(1) && i < pos) {
                        pos = i;
                    }
                }
        }
        return pos;
    }
}

class GameArea {
    constructor() {
        this.tetromino = new Tetromino(ctxGameArea);
        this.gameArea = this.createEmptyField();
        this.drawGameBackground()
    }

    stackNeedsUpdate = false;

    createEmptyField() {
        return Array.from({length: rows}, () => Array(columns).fill([0, ""]))
    }

    updateField() {
        this.drawGameBackground();
        // draw the current stack
        this.tetromino.drawTetromino(ctxGameArea, cellSize, this.gameArea, null, 0, 0, false, true)
        // draw current tetromino
        this.tetromino.drawTetromino(ctxGameArea, cellSize, this.tetromino.shape, this.tetromino.color, this.tetromino.xPos, this.tetromino.yPos, false);
        // draw ghost tetromino
        let ghostPosition = this.calculateHardDrop(true);
        this.tetromino.drawTetromino(ctxGameArea, cellSize, this.tetromino.shape, null, ghostPosition[0], ghostPosition[1], true);
        // draw next tetromino and held tetromino, if there's one. Calculate offsets to center tetrominoes
        // let xPosHeldOffset = this.tetromino.held.shape.length;
        // console.log(this.tetromino.held.shape);
        // let yPosHeldOffset = this.tetromino.held.shape.length;
        this.tetromino.drawTetromino(ctxNextArea, (cellSize / 2), this.tetromino.next.shape, this.tetromino.next.color, 0, 0, false)
        if (this.tetromino.held) {
            this.tetromino.drawTetromino(ctxHoldArea, (cellSize / 2), this.tetromino.held.shape, this.tetromino.held.color, 0, 0, false)
        }
        // check if a tetromino needs to be locked in the stack
        if (this.stackNeedsUpdate) {
            this.updateStack();
        }
    }

    updateStack() {
        // console.log("updating stack")
        this.stackNeedsUpdate = false;
        this.tetromino.shape.forEach((row, y) => {
            row.forEach((cellValue, x) => {
                if (cellValue === 1) {
                    if ((this.tetromino.yPos + y) < 0) {
                        gameOver = true;
                    } else {
                        this.gameArea[this.tetromino.yPos + y][this.tetromino.xPos + x] = [1, this.tetromino.color];
                    }
                }
            });
        });
        this.tetromino.setNextTetromino();
    }

    isPositionValid(yPos = this.tetromino.yPos, xPos = this.tetromino.xPos) {
        let colStart = xPos + this.tetromino.posSolidOnSide("left");
        let colEnd = xPos + this.tetromino.posSolidOnSide("right");
        let rowStart = yPos + this.tetromino.posSolidOnSide("up");
        let rowEnd = yPos + this.tetromino.posSolidOnSide("down");
        // checks that the tetromino is within game area
        if (colStart < 0 || colEnd >= columns || rowEnd >= rows) {
            return false;
        }
        // checks that the tetromino would not be on a cell that's already occupied
        if (yPos >= 0 && (yPos + this.tetromino.posSolidOnSide("down")) < rows) {
            for (let y = rowStart, y_ = rowStart - yPos; y <= rowEnd; y++, y_++) {
                for (let x = colStart, x_ = colStart - xPos; x <= colEnd; x++, x_++) {
                    if (y < rows && x < columns && x >= 0) {
                        if (this.gameArea[y][x][0] === 1 && this.tetromino.shape[y_][x_] === 1) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    calculateHardDrop(isGhost = false) {
        let validPosition = true;
        let finalXPos = this.tetromino.xPos;
        let finalYPos = this.tetromino.yPos;
        while (validPosition) {
            validPosition = this.isPositionValid(finalYPos + 1, finalXPos)
            if (validPosition) {
                finalYPos++;
            }
        }
        if (!isGhost) {
            this.stackNeedsUpdate = true;
            this.tetromino.canHold = true;
        }
        return [finalXPos, finalYPos];
    }

    calculateRotation(direction) {
        let previousShape = this.tetromino.shape;
        let isNewOrientationValid;
        let wallKickPossible;
        switch (direction) {
            case "clockwise turn":
                this.tetromino.shape = previousShape[0].map((value, index) => previousShape.map(row => row[index]).reverse());
                break;
            case "counterclockwise turn":
                this.tetromino.shape = previousShape[0].map((value, index) => previousShape.map(row => row[row.length - index - 1]));
        }
        isNewOrientationValid = this.isPositionValid();
        if (!isNewOrientationValid) {
            wallKickPossible = this.canKickWall();
            if (!wallKickPossible) {
                this.tetromino.shape = previousShape;
            }
        }
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
                this.tetromino.yPos = this.calculateHardDrop()[1]
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
                    this.tetromino.canHold = true;
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

    drawGameOver() {
        console.log("some message on screen")
    }

    drawGameBackground() {
        // location.fillRect(0, 0, columns * cellSize, rows * cellSize);
        let backgroundColor = "#D0D0D0";
        ctxGameArea.fillStyle = backgroundColor;
        ctxGameArea.fillRect(0, 0, columns * cellSize, rows * cellSize);
        ctxNextArea.fillStyle = backgroundColor;
        ctxNextArea.fillRect(0, 0, cellSize * 2, cellSize * 2);
        ctxHoldArea.fillStyle = backgroundColor;
        ctxHoldArea.fillRect(0, 0, cellSize * 2, cellSize * 2);
    }
}
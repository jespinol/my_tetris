function setCanvas(canvasId, width, height) {
    document.getElementById(canvasId).setAttribute("width", width);
    document.getElementById(canvasId).setAttribute("height", height);
}

function getBlockSizeSetCanvas() {
    let blockSize = Math.round((window.innerHeight * 0.045) / 10) * 10;
    let gameCanvasWidth = (blockSize * 20).toString();
    let gameCanvasHeight = (blockSize * 44).toString();
    let sideCanvasSize = (blockSize * 4).toString();
    setCanvas("gameCanvas", gameCanvasWidth, gameCanvasHeight);
    setCanvas("nextCanvas", sideCanvasSize, sideCanvasSize);
    setCanvas("holdCanvas", sideCanvasSize, sideCanvasSize);
    return blockSize * 2;
}

function init(size) {
    const playButton = document.getElementById("playButton");
    const gameCanvas_ = document.getElementById("gameCanvas");
    const holdCanvas_ = document.getElementById("holdCanvas");
    const nextCanvas = document.getElementById("nextCanvas");
    let game = new Tetris(gameCanvas_, nextCanvas, holdCanvas_, size);
    let lastRender = 0;
    let lastRenderTimingEvent = 0;
    let animationReference;

    window.addEventListener('keydown', function (event) {
        let key = event.code;
        if (event.defaultPrevented) {
            return;
        } else {
            if (game.gameState === "running" || game.gameState === "updating") {
                if (key === "Escape" || key === "F1" || key === 'KeyP') {
                    game.gameState = "paused"
                    cancelAnimationFrame(animationReference);
                    changePlayButton();
                } else {
                    game.play(key);
                }
            } else {
                if (key === "Enter") {
                    if (game.gameState === "paused") {
                        game.gameState = "running"
                    }
                    changePlayButton();
                    runGame();
                }
            }
        }
        event.preventDefault();
    }, true);

    window.addEventListener("blur", function () {
        if (game.gameState === "running") {
            game.gameState = "paused"
            runGame()
            cancelAnimationFrame(animationReference);
            changePlayButton();
        }
    });

    playButton.addEventListener("click", function () {
        if (game.gameState === "ended") {
            location.reload();
        } else {
            if (game.gameState === "running") {
                game.gameState = "paused";
                runGame();
                cancelAnimationFrame(animationReference);
            } else if (game.gameState === "new") {
                runGame();
            } else {
                game.gameState = "running";
                runGame();
            }
            changePlayButton();
        }
    });

    function runGame(timestamp) {
        // if (game.gameState !== "ended") {
        //     if (game.gameState === "updating") {
        //         console.log("updating animation");
        //         // console.log(timestamp)
        //         // console.log(lastRender);
        //         if (timestamp - lastRender >= 500) {
        //             console.log("time's up")
        //             lastRender = timestamp;
        //             // game.gameField.updateStack();
        //             game.gameState = "running";
        //             runGame(timestamp)
        //         }
        //         // else {
        //         //     game.play();
        //         // }
        //         // animationReference = requestAnimationFrame(runGame);
        //         game.play()
        //     } else {
        //         if (timestamp - lastRender >= game.speed) {
        //             console.log("normal animation")
        //             lastRender = timestamp;
        //             document.getElementById("levelArea").innerText = "Level:\n" + (game.level).toString();
        //             document.getElementById("scoreArea").innerText = "Score:\n" + (game.points).toString();
        //             game.play();
        //         }
        //     }
        //     animationReference = requestAnimationFrame(runGame);
        // } else {
        //     changePlayButton();
        // }
        if (game.gameState !== "ended") {
            if (timestamp - lastRender >= game.speed) {
                lastRender = timestamp;
                document.getElementById("levelArea").innerText = "Level:\n" + (game.level).toString();
                document.getElementById("scoreArea").innerText = "Score:\n" + (game.points).toString();
                game.play();
            }
            animationReference = requestAnimationFrame(runGame);
        } else {
            changePlayButton();
        }
    }

    function changePlayButton() {
        if (game.gameState === "ended") {
            playButton.innerText = "Try again";
            playButton.classList.remove("btn-danger");
            playButton.classList.add("btn-light");
        } else if (game.gameState === "paused") {
            // game.backgroundMusic.pause();
            playButton.innerText = "Continue";
            playButton.classList.remove("btn-danger");
            playButton.classList.add("btn-success");
        } else {
            // game.backgroundMusic.play();
            playButton.innerText = "Pause";
            playButton.classList.remove("btn-primary");
            playButton.classList.add("btn-danger");
        }
    }
}


class Tetris {
    // gameOver = false;
    // backgroundMusic = new Audio("resources/static/sounds/TwisterTetris_poinl.mp3");
    constructor(mainCanvasId, nextCanvasId, holdCanvasId, blockSize) {
        this.gameField = new GameField(mainCanvasId, nextCanvasId, holdCanvasId, blockSize);
        this.speed = 1000;
        this.tempSpeed = this.speed;
        this.level = 1;
        this.levelPoints = 0;
        this.points = 0;
        this.gameState = "new";
        // this.backgroundMusic.volume = 0.5;
    }

    play(key) {
        switch (this.gameState) {
            case "new":
                this.gameField.drawCountdown() ? this.gameState = "running" : "new";
                break;
            case "running":
                this.runGame(key);
                break;
            // case "updating":
            //     // console.log("update sequence")
            //     this.speed = 500;
            //     this.runGame(key);
            //     break;
            case "paused":
                this.gameField.drawPausedMessage();
                break;
            case "ending":
                this.gameField.drawGameOverMessage();
                this.gameState = "ended";
        }
    }

    runGame(key) {
        this.gameField.updatePos(key);
        this.gameField.updateField();
        if (this.gameField.fieldState === "notUpdatable") {
            this.gameState = "ending";
        }
        // else if (this.gameField.fieldState === "update") {
        //     // console.log("here")
        //     this.gameState = "updating";
        // }
        else {
            let clearedRows = this.gameField.checkRows();
            this.levelPoints += clearedRows;
            this.points += clearedRows * 100 * this.level;
            if (this.levelPoints >= (5 * this.level)) {
                this.level++;
                let newSpeed = 1000 * Math.pow((0.9 - (this.level - 1) * 0.007), this.level - 1);
                this.speed = newSpeed;
                // this.tempSpeed = newSpeed;
            }
        }
    }
}

class Tetromino {
    static tetrominoes = {
        l: {shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: "#FFA366", xStart: 3, yStart: -1}, // Orange Ricky
        j: {shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: "#0099CC", xStart: 3, yStart: -1}, // Blue Ricky
        z: {shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: "#FF5A5A", xStart: 3, yStart: -1}, // Cleveland Z
        s: {shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: "#70C05A", xStart: 3, yStart: -1}, // Rhode Island Z
        i: {shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: "#97FFFF", xStart: 3, yStart: -2}, // Hero
        t: {shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: "#A667E7", xStart: 3, yStart: -1}, // Teewee
        o: {shape: [[1, 1], [1, 1]], color: "#FFE066", xStart: 4, yStart: -1}, // Smashboy
    };

    constructor() {
        this.current = null;
        this.held = null;
        this.canHold = true;
        this.nextTetrominoes = this.initTetrominoes();
        this.setTetromino();
    }

    selectRandomTetromino() {
        let tetrominoNames = Object.keys(Tetromino.tetrominoes);
        return tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
    }

    initTetrominoes() {
        let tetrominoList = [];
        for (let i = 0; i < 6; i++) {
            tetrominoList[i] = this.selectRandomTetromino();
        }
        return tetrominoList;
    }

    setTetromino(useHeld = false) {
        let previousHeld;
        if (useHeld) {
            previousHeld = this.held;
            this.held = this.current;
        }
        this.current = useHeld ? previousHeld : Tetromino.tetrominoes[this.nextTetrominoes.shift()];
        this.xPos = this.current.xStart;
        this.yPos = this.current.yStart;
        this.shape = this.current.shape;
        this.color = this.current.color;
        if (!useHeld) {
            this.nextTetrominoes.push(this.selectRandomTetromino());
        }
        this.next = Tetromino.tetrominoes[this.nextTetrominoes[0]];
    }

    holdTetromino() {
        if (this.canHold) {
            if (this.held === null) {
                this.held = this.current;
                this.setTetromino();
            } else {
                this.setTetromino(true);
            }
            this.canHold = false;
        }
    }

    posSolidOnSide(side) {
        let positionOfFirstSolidBlockOnSide;
        switch (side) {
            case "left":
                positionOfFirstSolidBlockOnSide = this.shape[0].length;
                for (let i = 0; i < this.shape.length; i++) {
                    let solidPos = this.shape[i].indexOf(1);
                    if (solidPos < positionOfFirstSolidBlockOnSide && solidPos >= 0) {
                        positionOfFirstSolidBlockOnSide = solidPos;
                    }
                }
                break;
            case "right":
                positionOfFirstSolidBlockOnSide = 0;
                for (let i = 0; i < this.shape.length; i++) {
                    let solidPos = this.shape[i].lastIndexOf(1);
                    if (solidPos > positionOfFirstSolidBlockOnSide) {
                        positionOfFirstSolidBlockOnSide = solidPos;
                    }
                }
                break;
            case "down":
                positionOfFirstSolidBlockOnSide = 0;
                for (let i = 0; i < this.shape.length; i++) {
                    if (this.shape[i].includes(1) && i > positionOfFirstSolidBlockOnSide) {
                        positionOfFirstSolidBlockOnSide = i;
                    }
                }
                break;
            case "up":
                positionOfFirstSolidBlockOnSide = this.shape.length;
                for (let i = 0; i < this.shape.length; i++) {
                    if (this.shape[i].includes(1) && i < positionOfFirstSolidBlockOnSide) {
                        positionOfFirstSolidBlockOnSide = i;
                    }
                }
        }
        return positionOfFirstSolidBlockOnSide;
    }
}

class GameField {
    static columns = 10;
    static rows = 22;

    constructor(mainCanvasId, nextCanvasId, holdCanvasId, blockSize) {
        this.ctxMain = mainCanvasId.getContext("2d");
        this.ctxNext = nextCanvasId.getContext("2d");
        this.ctxHold = holdCanvasId.getContext("2d");
        this.blockSize = blockSize;
        this.tetromino = new Tetromino();
        this.gameField = GameField.createEmptyGameField();
        this.stackNeedsUpdate = false;
        this.fieldState = "noChange"
    }

    // stackNeedsUpdate = false;

    static createEmptyGameField() {
        return Array.from({length: GameField.rows}, () => Array(GameField.columns).fill([0, ""]))
    }

    static getPosOffset(tetromino) {
        let shapeWidth = tetromino.shape[0].length;
        let shapeHeight = tetromino.shape.length;
        let xPosOffset = shapeWidth > 3 ? 0 : shapeWidth > 2 ? 0.5 : 1;
        let yPosOffset = shapeHeight > 3 ? 0.5 : 1;
        return [xPosOffset, yPosOffset];
    }

    hardDropPerformed = false;

    updateField() {
        this.clearCanvas();
        // draw the current stack
        this.drawTetromino(this.ctxMain, this.blockSize, this.gameField, null, 0, 0, false, true)
        // draw current tetromino
        this.drawTetromino(this.ctxMain, this.blockSize, this.tetromino.shape, this.tetromino.color, this.tetromino.xPos, this.tetromino.yPos, false);
        // draw ghost tetromino
        let ghostPosition = this.calculateHardDrop(true);
        this.drawTetromino(this.ctxMain, this.blockSize, this.tetromino.shape, null, ghostPosition[0], ghostPosition[1], true);
        // draw next tetromino and held tetromino, if there's one
        // first calculate offsets to center tetrominoes
        let [xPosOffset, yPosOffset] = GameField.getPosOffset(this.tetromino.next);
        this.drawTetromino(this.ctxNext, (this.blockSize / 2), this.tetromino.next.shape, this.tetromino.next.color, xPosOffset, yPosOffset, false)
        if (this.tetromino.held) {
            [xPosOffset, yPosOffset] = GameField.getPosOffset(this.tetromino.held);
            this.drawTetromino(this.ctxHold, (this.blockSize / 2), this.tetromino.held.shape, this.tetromino.held.color, xPosOffset, yPosOffset, false)
        }
        // check if a tetromino needs to be locked in the stack, if not possible the game is over and return false
        if (this.stackNeedsUpdate) {
            this.updateStack();
            return;
            // console.log("update stack")
            // if (this.hardDropPerformed) {
            //     this.hardDropPerformed = false;
            //     this.fieldState = "noChange"
            //     this.updateStack();
            // } else {
            //     this.fieldState = "update";
            //     return;
            // }
            // let fieldUpdatable =  this.updateStack();
            // if (fieldUpdatable) {
            // }
        }
        this.fieldState = "noChange"
        return true;
    }

    updateStack() {
        this.stackNeedsUpdate = false;
        this.tetromino.shape.forEach((row, y) => {
            row.forEach((cellValue, x) => {
                if (cellValue === 1) {
                    if ((this.tetromino.yPos + y) <= 0) {
                        // this.fieldUpdatable = false;
                        this.fieldState = "notUpdatable"
                        return false;
                    } else {
                        this.gameField[this.tetromino.yPos + y][this.tetromino.xPos + x] = [1, this.tetromino.color];
                    }
                }
            });
        });
        this.tetromino.setTetromino();
        return true;
    }

    updatePos(key = "default") {
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
                this.hardDropPerformed = true;
                break;
            case "KeyC":
            case "ShiftLeft":
            case "ShiftRight":
                this.tetromino.holdTetromino();
                // this.updateField();
                break;
            case "ArrowDown":
            case "default":
                moveValid = this.isPositionValid(yPos + 1, xPos);
                if (moveValid) {
                    this.tetromino.yPos += 1;
                } else {
                    this.stackNeedsUpdate = true;
                    this.tetromino.canHold = true;
                }
        }
        return true;
    }

    isPositionValid(yPos = this.tetromino.yPos, xPos = this.tetromino.xPos) {
        let colStart = xPos + this.tetromino.posSolidOnSide("left");
        let colEnd = xPos + this.tetromino.posSolidOnSide("right");
        let rowStart = yPos + this.tetromino.posSolidOnSide("up");
        let rowEnd = yPos + this.tetromino.posSolidOnSide("down");
        // checks that the tetromino is within game area
        if (colStart < 0 || colEnd >= GameField.columns || rowEnd >= GameField.rows) {
            return false;
        }
        // checks that the tetromino would not be on a cell that's already occupied
        if (yPos >= 0 && ((yPos + this.tetromino.posSolidOnSide("down")) < GameField.rows)) {
            for (let y = rowStart, y_ = rowStart - yPos; y <= rowEnd; y++, y_++) {
                for (let x = colStart, x_ = colStart - xPos; x <= colEnd; x++, x_++) {
                    if (y < GameField.rows && x < GameField.columns && x >= 0) {
                        if (this.gameField[y][x][0] === 1 && this.tetromino.shape[y_][x_] === 1) {
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

    checkRows() {
        let clearedRows = 0;
        for (let y = 0; y < GameField.rows; y++) {
            let row2clear = true;
            for (let cell = 0; cell < this.gameField[y].length; cell++) {
                if (this.gameField[y][cell][0] === 0) {
                    row2clear = false;
                    break
                }
            }
            if (row2clear) {
                this.gameField.splice(y, 1);
                this.gameField.unshift(Array(GameField.columns).fill([0, ""]));
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

    clearCanvas(providedLocation) {
        if (providedLocation) {
            providedLocation.clearRect(0, 0, providedLocation.canvas.width, providedLocation.canvas.height);
        } else {
            this.ctxMain.clearRect(0, 0, this.ctxMain.canvas.width, this.ctxMain.canvas.height);
            this.ctxNext.clearRect(0, 0, this.ctxNext.canvas.width, this.ctxNext.canvas.height);
            this.ctxHold.clearRect(0, 0, this.ctxHold.canvas.width, this.ctxHold.canvas.height);
        }
    }

    drawTetromino(location, size, shape, color, xPos, yPos, isGhost, isStack) {
        shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (isStack ? cell[0] === 1 : cell === 1) {
                    location.beginPath()
                    location.roundRect((xPos + x) * size, (yPos + y) * size, size, size, [3]);
                    if (!isGhost) {
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
                    location.strokeStyle = "#FFFFFF";
                    location.lineWidth = 1;
                    location.stroke();
                }
            });
        });
    }

    count = 1

    drawCountdown() {
        this.clearCanvas(this.ctxMain)
        this.drawText(this.ctxMain, this.count.toString(), 10);
        this.count--;
        return this.count < 1;
    }

    drawGameOverMessage() {
        this.drawText(this.ctxMain, "Game Over", 5);
    }

    drawPausedMessage() {
        this.drawText(this.ctxMain, "Paused", 5);
    }

    drawText(location, text, sizeMultiplier = 0, color = "#FFFFFF") {
        // location.clearRect(0, 0, location.canvas.width, location.canvas.height);
        location.font = (30 * sizeMultiplier) + "px Arial";
        location.fillStyle = color;
        location.textAlign = "center";
        location.fillText(text, location.canvas.width / 2, location.canvas.height / 2);
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
}
const COLUMNS = 10;
const ROWS = 20;
const CELL_SIZE = 20;
let context;
let currentShape;
let currentColor;

class Tetromino {
    tetrominoes = {
        l: {
            shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: "orange", xStart: (COLUMNS / 2) * CELL_SIZE, yStart: -1 * CELL_SIZE
        }, // Orange Ricky
        j: {
            shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: "blue", xStart: (COLUMNS / 2) * CELL_SIZE, yStart: -1 * CELL_SIZE
        }, // Blue Ricky
        z: {
            shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: "red", xStart: (COLUMNS / 2) * CELL_SIZE, yStart: -1 * CELL_SIZE
        }, // Cleveland Z
        s: {
            shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: "green", xStart: (COLUMNS / 2) * CELL_SIZE, yStart: -1 * CELL_SIZE
        }, // Rhode Island Z
        i: {
            shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]], color: "cyan", xStart: (COLUMNS / 2) * CELL_SIZE, yStart: -1 * CELL_SIZE
        }, // Hero
        t: {
            shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: "purple", xStart: (COLUMNS / 2) * CELL_SIZE, yStart: -1 * CELL_SIZE
        }, // Teewee
        o: {
            shape: [[1, 1], [1, 1]], color: "yellow", xStart: (COLUMNS / 2) * CELL_SIZE, yStart: -1 * CELL_SIZE
        }, // Smashboy
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
    // xPos = this.tetromino.xStart;
    // yPos = this.tetromino.yStart;
    // xPos = 40;
    // yPos = 0;
    draw() {
        console.log(this.tetromino.xStart);
        context.fillStyle = currentColor;
        currentShape.forEach((row, y) => {
            row.forEach((cellValue, x) => {
                if (cellValue > 0) {
                    context.fillRect(this.xPos + x * CELL_SIZE, this.yPos + y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            });
        });
    }
}
class Field {
    constructor() {
        this.tetromino = new Tetromino(context);
        this.gameArea = this.getNewGameArea();
    }
    getNewGameArea() {
        return Array.from({length: ROWS}, () => Array(COLUMNS).fill(Array(0, 0)));
    }
    updateField() {
        this.tetromino.draw();
        // console.log(this.gameArea.includes(1))
        // this.drawLockedCells();
    }
    updateTetrominoPosition(key) {
        switch (key) {
            case"ArrowUp":
                if (this.tetromino.yPos + CELL_SIZE < context.canvas.height) {
                    this.tetromino.yPos = context.canvas.height - CELL_SIZE;
                }
                break;
            case "ArrowDown":
                if (this.tetromino.yPos + CELL_SIZE < context.canvas.height) {
                    this.tetromino.yPos += CELL_SIZE;
                }
                break;
            case "ArrowLeft":
                if (this.tetromino.xPos - CELL_SIZE > 0) {
                    this.tetromino.xPos -= CELL_SIZE;
                }
                break;
            case "ArrowRight":
                if (this.tetromino.xPos + CELL_SIZE < context.canvas.width) {
                    this.tetromino.xPos += CELL_SIZE;
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
        if (this.tetromino.yPos + CELL_SIZE < context.canvas.height) {
            this.tetromino.yPos += CELL_SIZE;
        }
        console.log("x, y: ", this.tetromino.yPos, this.tetromino.xPos);
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
    pause() {
    }
}
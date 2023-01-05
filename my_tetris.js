const COLUMNS = 10;
const ROWS = 20;
const CELL_SIZE = 20;
class Tetromino {
    tetrominoes = {
        orangeRicky:
            {shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
                ],
             color: "orange"}, // L
        blueRicky: {shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: "blue"}, // J
        clevelandZ: {shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            color: "red"}, // Z
        rhodeIslandZ: {shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            color: "green"}, // S
        hero: {shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0]
            ],
            color: "cyan"}, // I
        teewee: {shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            color: "purple"}, // T
        smashboy: {shape: [
                [1, 1],
                [1, 1]
            ],
            color: "yellow"}, // O
    }; // L, J, Z, S, I, T, O
    currentTetromino;
    constructor(context) {
        this.context = context;
        this.currentTetromino = this.selectTetromino();
    }

    selectTetromino() {
        let tetrominoNames = Object.keys(this.tetrominoes);
        let chooseTetrominoAtRandom = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
        return this.tetrominoes[chooseTetrominoAtRandom];
    }
    // Blue Ricky
    // color = "blue";
    // shape = [[1, 0, 0], [1, 1, 1], [0, 0, 0]];
    // color = this.currentTetromino.color;
    // shape = this.currentTetromino.shape;

    xPos = 0;
    yPos = 0;

    // draw() {
    //     // let color = this.currentTetromino.color;
    //     // let shape = this.currentTetromino.shape;
    //     this.context.fillStyle = color;
    //     shape.forEach((row, y) => {
    //         row.forEach((cell, x) => {
    //             if (cell > 0) {
    //                 this.context.fillRect(this.xPos + x, this.yPos + y, CELL_SIZE, CELL_SIZE);
    //             }
    //         });
    //     });
    // }
}

class Field {
    constructor(context) {
        this.context = context;
        this.tetromino = new Tetromino(context);
        this.gameArea = this.getNewGameArea();
    }

    getNewGameArea() {
        return Array.from({length: ROWS}, () => Array(COLUMNS).fill(0));
    }
}

class Game {
    constructor(context) {
        this.context = context;
    }

    play() {
        this.field = new Field(this.context);
    }

    draw() {
        let {width, height} = this.context.canvas;
        context.clearRect(0, 0, width, height);
        this.field.tetromino.draw();
    }
}


let tetromino = new Tetromino("abc");
console.log(tetromino.currentTetromino.color);
// console.log(tetromino.color);

// class Game {
//     field;
//     displayedTetromino;
//     isNewGame;
//     gameIsActive;
//     score;
//     level;
//     gameType;
//
//     constructor(canvasTag) {
//         this.field = new Field(canvasTag);
//         this.isNewGame = true;
//         this.gameIsActive = false;
//     }
//
//     updateField(key) {
//         this.displayedTetromino.updateTetrominoPosition(key);
//         this.field.updateOccupiedTiles();
//     }
//
// }
//
// class Field {
//     location;
//     currentTetromino;
//     tetrominoPosition;
//     occupiedTiles = {};
//
//     constructor(canvasTag) {
//         this.location = canvasTag;
//     }
//     createNewTetromino() {
//         this.currentTetromino = new Tetromino();
//
//     }
//     checkIfTetrominoCanMove(){
//         if (true) {
//            return;
//         }
//         this.updateOccupiedTiles();
//     }
//     updateOccupiedTiles() {
//         let tetrominoPosition =  this.currentTetromino.tetrominoTiles;
//     }
//
// }
//
// class Tetromino {
//     tetrominoes = {
//         orangeRicky: {shape1: {x: 40, y: 0, w: 20, h: 20}, shape2: {x: 0, y: 20, w: 60, h: 20}, color: "orange"},
//         blueRicky: {shape1: {x: 0, y: 0, w: 20, h: 20}, shape2: {x: 0, y: 20, w: 60, h: 20}, color: "blue"},
//         clevelandZ: {shape1: {x: 0, y: 0, w: 40, h: 20}, shape2: {x: 20, y: 20, w: 40, h: 20}, color: "red"},
//         rhodeIslandZ: {shape1: {x: 20, y: 20, w: 40, h: 20}, shape2: {x: 0, y: 0, w: 40, h: 20}, color: "green"},
//         hero: {shape1: {x: 0, y: 0, w: 80, h: 20}, shape2: {x: 0, y: 0, w: 0, h: 0}, color: "cyan"},
//         teewee: {shape1: {x: 20, y: 0, w: 20, h: 20}, shape2: {x: 0, y: 20, w: 60, h: 20}, color: "purple"},
//         smashboy: {shape1: {x: 0, y: 0, w: 40, h: 20}, shape2: {x: 0, y: 20, w: 40, h: 20}, color: "yellow"},
//     }; // L, J, Z, S, I, T, O
//     width = 10 * 20;
//     height = 22 * 20;
//     tetromino;
//     moveRate = 20;
//     tetrominoTiles = {}
//     xPos = 0;
//     yPos = 0;
//     constructor() {
//         let tetrominoNames = Object.keys(this.tetrominoes);
//         this.tetromino = tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
//     }
//
//     updateTetrominoPosition(event) {
//         switch (event.code) {
//             case "ArrowDown":
//                 if (this.yPos + this.moveRate < this.height) {
//                     this.yPos += this.moveRate;
//                 }
//                 break;
//             case"ArrowUp":
//                 if (this.yPos - this.moveRate > 0) {
//                     this.yPos -= this.moveRate;
//                 }
//                 break;
//             case "ArrowLeft":
//                 if (this.xPos - this.moveRate > 0) {
//                     this.xPos -= this.moveRate;
//                 }
//                 break;
//             case "ArrowRight":
//                 if (this.xPos + this.moveRate < this.width) {
//                     this.xPos += this.moveRate;
//                 }
//                 break;
//             default:
//                 break;
//         }
//         return this.tetrominoTiles;
//     }
//
//     getTetromino() {
//         return this.tetromino;
//     }
// }
//
// //
// //
// // let gameArea;
// // const dx = 20;
// // const dy = 20;
// // const WIDTH = 10 * 20;
// // const HEIGHT = 22 * 20;
// // let xPos = WIDTH / 3;
// // let yPos = 100;
// //
// //
// // function init(isNewGame, whereIsGameArea) {
// //     console.log("init function")
// //     gameArea = whereIsGameArea;
// //     if (isNewGame) {
// //         return generateNewGame();
// //     }
// //     // canvas = document.getElementById("canvas");
// //     // ctx = canvas.getContext("2d");
// //     return setInterval(updateGame, 500);
// // }
// //
// // function generateNewGame() {
// //
// // }
// //
// // function updateGame() {
// //     draw();
// // }
//
// function figure(x, y) {
//     let ctx = gameArea.getContext("2d");
//     const tetrominoNum = 7;
//     let block = Math.floor(Math.random() * tetrominoNum + 1);
//     console.log(block);
//     switch (block) {
//         case 1: // Orange Ricky
//             ctx.beginPath();
//             ctx.rect(x + 40, y, 20, 20)
//             ctx.rect(x, y + 20, 60, 20)
//             ctx.fill();
//             break;
//         case 2: // Blue Ricky
//             ctx.beginPath();
//             ctx.rect(x, y, 20, 20)
//             ctx.rect(x, y + 20, 60, 20)
//             ctx.fill();
//             break;
//         case 3: // Cleveland Z
//             ctx.beginPath();
//             ctx.rect(x, y, 40, 20)
//             ctx.rect(x + 20, y + 20, 40, 20)
//             ctx.fill();
//             break;
//         case 4: // Rhode Island Z
//             ctx.beginPath();
//             ctx.rect(x + 20, y + 20, 40, 20)
//             ctx.rect(x, y, 40, 20)
//             ctx.fill();
//             break;
//         case 5: // Hero
//             ctx.beginPath();
//             ctx.rect(x, y, 80, 20)
//             ctx.fill();
//             break;
//         case 6: // Teewee
//             ctx.beginPath();
//             ctx.rect(x + 20, y, 20, 20)
//             ctx.rect(x, y + 20, 60, 20)
//             ctx.fill();
//             break;
//         case 7: // Smashboy
//             ctx.beginPath();
//             ctx.rect(x, y, 40, 20)
//             ctx.rect(x, y + 20, 40, 20)
//             ctx.fill();
//             break;
//     }
// }
//
// function rect(x, y, w, h) {
//     ctx.beginPath();
//     ctx.rect(x, y, w, h);
//     ctx.closePath();
//     ctx.fill();
//     ctx.stroke();
// }
//
// function clear() {
//     ctx.clearRect(0, 0, WIDTH, HEIGHT);
// }
//
//
// function draw() {
//     clear();
//     ctx.fillStyle = "white";
//     ctx.strokeStyle = "black";
//     rect(0, 0, WIDTH, HEIGHT);
//     ctx.fillStyle = "purple";
//     figure(xPos, yPos);
// }
//
// // function keyPressed(event) {
// //     switch (event.code) {
// //         case "ArrowDown":
// //             if (yPos + dy < HEIGHT) {
// //                 yPos += dy;
// //             }
// //             break;
// //         case"ArrowUp":
// //             if (yPos - dy > 0) {
// //                 yPos -= dy;
// //             }
// //             break;
// //         case "ArrowLeft":
// //             if (xPos - dx > 0) {
// //                 xPos -= dx;
// //             }
// //             break;
// //         case "ArrowRight":
// //             if (xPos + dx < WIDTH) {
// //                 xPos += dx;
// //             }
// //             break;
// //         default:
// //             break;
// //     }
// // }
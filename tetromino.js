import { SIDES } from './constants.js';

const {
  LEFT, RIGHT, UP, DOWN,
} = SIDES;

export default class Tetromino {
  static tetrominoes = {
    l: {
      shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#FFA366', xPos: 3, yPos: -2,
    }, // Orange Ricky
    j: {
      shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#0099CC', xPos: 3, yPos: -2,
    }, // Blue Ricky
    z: {
      shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#FF5A5A', xPos: 3, yPos: -2,
    }, // Cleveland Z
    s: {
      shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#70C05A', xPos: 3, yPos: -2,
    }, // Rhode Island Z
    i: {
      shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#97FFFF', xPos: 3, yPos: -3,
    }, // Hero
    t: {
      shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#A667E7', xPos: 3, yPos: -2,
    }, // Teewee
    o: {
      shape: [[1, 1], [1, 1]], color: '#FFE066', xPos: 4, yPos: -2,
    }, // Smashboy
  };

  constructor() {
    this.listOfNextTretrominoes = Tetromino.initTetrominoes();
    this.current = null;
    this.next = null;
    this.held = null;
    this.canHold = true;
    this.setCurrentAndNext();
  }

  static initTetrominoes() {
    const tetrominoList = [];
    for (let i = 0; i < 3; i++) {
      tetrominoList[i] = Tetromino.selectRandomTetromino();
    }
    return tetrominoList;
  }

  static selectRandomTetromino() {
    const tetrominoNames = Object.keys(Tetromino.tetrominoes);
    return tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
  }

  setCurrentAndNext(useHeld = false) {
    let prevHeld;
    if (useHeld) {
      prevHeld = this.held;
      this.held = this.current;
    }
    this.current = useHeld ? prevHeld : Tetromino.tetrominoes[this.listOfNextTretrominoes.shift()];
    if (!useHeld) {
      this.listOfNextTretrominoes.push(Tetromino.selectRandomTetromino());
    }
    this.next = Tetromino.tetrominoes[this.listOfNextTretrominoes[0]];
  }

  setHeld() {
    if (this.canHold) {
      if (this.held === null) {
        this.held = this.current;
        this.setCurrentAndNext();
      } else {
        this.setCurrentAndNext(true);
      }
      this.canHold = false;
    }
  }

  static getSolidBlockOnSideOffset(tetromino, side) {
    let position;
    switch (side) {
      case LEFT:
        position = tetromino.shape[0].length;
        for (let i = 0; i < tetromino.shape.length; i++) {
          const solidPos = tetromino.shape[i].indexOf(1);
          if (solidPos < position && solidPos >= 0) {
            position = solidPos;
          }
        }
        break;
      case RIGHT:
        position = 0;
        for (let i = 0; i < tetromino.shape.length; i++) {
          const solidPos = tetromino.shape[i].lastIndexOf(1);
          if (solidPos > position) {
            position = solidPos;
          }
        }
        break;
      case DOWN:
        position = 0;
        for (let i = 0; i < tetromino.shape.length; i++) {
          if (tetromino.shape[i].includes(1) && i > position) {
            position = i;
          }
        }
        break;
      case UP:
        position = tetromino.shape.length;
        for (let i = 0; i < tetromino.shape.length; i++) {
          if (tetromino.shape[i].includes(1) && i < position) {
            position = i;
          }
        }
        break;
      default:
        break;
    }
    return position;
  }
}

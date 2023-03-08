import {SIDES, TURNS} from './constants.js';

const {
  LEFT, RIGHT, UP, DOWN,
} = SIDES;
const { CLOCKWISE_TURN, COUNTERCLOCKWISE_TURN } = TURNS;
export default class Tetromino {
  static tetrominoes = {
    l: {
      shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#FFA366', xStart: 3, yStart: -1,
    }, // Orange Ricky
    j: {
      shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#0099CC', xStart: 3, yStart: -1,
    }, // Blue Ricky
    z: {
      shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#FF5A5A', xStart: 3, yStart: -1,
    }, // Cleveland Z
    s: {
      shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#70C05A', xStart: 3, yStart: -1,
    }, // Rhode Island Z
    i: {
      shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#97FFFF', xStart: 3, yStart: -2,
    }, // Hero
    t: {
      shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#A667E7', xStart: 3, yStart: -1,
    }, // Teewee
    o: {
      shape: [[1, 1], [1, 1]], color: '#FFE066', xStart: 4, yStart: -1,
    }, // Smashboy
  };

  constructor() {
    this.current = null;
    this.held = null;
    this.canHold = true;
    this.nextTetrominoes = this.initTetrominoes();
    this.setCurrentAndNext();
  }

  initTetrominoes() {
    const tetrominoList = [];
    for (let i = 0; i < 3; i++) {
      tetrominoList[i] = this.selectRandomTetromino();
    }
    return tetrominoList;
  }

  selectRandomTetromino() {
    const tetrominoNames = Object.keys(Tetromino.tetrominoes);
    return tetrominoNames[Math.floor(Math.random() * tetrominoNames.length)];
  }

  setCurrentAndNext(useHeld = false) {
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

  getPosSolidBlockOnSide(side) {
    let position;
    switch (side) {
      case LEFT:
        position = this.shape[0].length;
        for (let i = 0; i < this.shape.length; i++) {
          const solidPos = this.shape[i].indexOf(1);
          if (solidPos < position && solidPos >= 0) {
            position = solidPos;
          }
        }
        break;
      case RIGHT:
        position = 0;
        for (let i = 0; i < this.shape.length; i++) {
          const solidPos = this.shape[i].lastIndexOf(1);
          if (solidPos > position) {
            position = solidPos;
          }
        }
        break;
      case DOWN:
        position = 0;
        for (let i = 0; i < this.shape.length; i++) {
          if (this.shape[i].includes(1) && i > position) {
            position = i;
          }
        }
        break;
      case UP:
        position = this.shape.length;
        for (let i = 0; i < this.shape.length; i++) {
          if (this.shape[i].includes(1) && i < position) {
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

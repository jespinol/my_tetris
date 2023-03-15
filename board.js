import Tetromino from './tetromino.js';
import {
  SIDES, SOUNDS, STACK_STATES, TURNS,
} from './constants.js';
import SoundPlayer from './sound_player.js';

const { OK, NOT_UPDATABLE } = STACK_STATES;
const {
  LEFT, RIGHT, UP, DOWN,
} = SIDES;
const { CLOCKWISE_TURN, COUNTERCLOCKWISE_TURN } = TURNS;
const {
  CLEARED_ROW_SOUND, HARD_DROP_SOUND, TETROMINO_LOCKED_SOUND, ON_EDGE_SOUND,
} = SOUNDS;

export default class Board {
  static columns = 10;

  static rows = 22;

  constructor(mainCanvasId, nextCanvasId, holdCanvasId, blockSize) {
    this.blockSize = blockSize;
    this.ctxMain = mainCanvasId.getContext('2d');
    this.ctxNext = nextCanvasId.getContext('2d');
    this.ctxHold = holdCanvasId.getContext('2d');
    this.gameField = Board.createEmptyGameField();
    this.tetrominoes = new Tetromino();
    this.tetrominoOnBoard = Board.setTetrominoOnBoard(this.tetrominoes.current);
    this.stackNeedsUpdate = false;
    this.stackState = OK;
  }

  static createEmptyGameField() {
    return Array.from({ length: Board.rows }, () => Array(Board.columns).fill([0, '']));
  }

  static getTopOccupiedRow(gameField) {
    return gameField.findIndex((row) => row.some((cell) => cell[0] === 1));
  }

  static getPosOffsetForSideCanvas(tetromino) {
    const shapeWidth = tetromino.shape[0].length;
    const shapeHeight = tetromino.shape.length;
    let xPosOffset;
    if (shapeWidth > 3) {
      xPosOffset = 0;
    } else if (shapeWidth > 2) {
      xPosOffset = 0.5;
    } else {
      xPosOffset = 1;
    }
    let yPosOffset;
    if (shapeHeight > 3) {
      yPosOffset = 0.5;
    } else {
      yPosOffset = 1;
    }
    return [xPosOffset, yPosOffset];
  }

  static setTetrominoOnBoard(tetromino) {
    return { ...tetromino };
  }

  static addTextToCanvas(ctx, text, fontSize, color = '#FFFFFF') {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    const xPos = ctx.canvas.width / 2;
    const yPos = ctx.canvas.height / 2;
    ctx.fillText(text, xPos, yPos);
  }

  static hex2Dec(hexadecimal) {
    return parseInt(hexadecimal, 16);
  }

  static dec2hex(decimal) {
    return decimal.toString(16).padStart(2, '0');
  }

  static calculateNewShade(startValue, percentChange) {
    return Math.min(255, Math.round((startValue * (100 + percentChange)) / 100));
  }

  static shadeColor(color, percent) { // adapted from https://stackoverflow.com/a/13532993
    const redDec = Board.hex2Dec(color.substring(1, 3));
    const greenDec = Board.hex2Dec(color.substring(3, 5));
    const blueDec = Board.hex2Dec(color.substring(5, 7));

    const newRed = Board.calculateNewShade(redDec, percent);
    const newGreen = Board.calculateNewShade(greenDec, percent);
    const newBlue = Board.calculateNewShade(blueDec, percent);

    const redHex = Board.dec2hex(newRed);
    const greenHex = Board.dec2hex(newGreen);
    const blueHex = Board.dec2hex(newBlue);

    return `#${redHex}${greenHex}${blueHex}`;
  }

  static drawBlocks(object2draw) {
    const {
      location, size, shape, xPos, yPos, isGhost, isStack,
    } = object2draw;
    let { color } = object2draw;
    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (isStack ? cell[0] === 1 : cell === 1) {
          location.beginPath();
          location.roundRect((xPos + x) * size, (yPos + y) * size, size, size, [3]);
          if (!isGhost) {
            const gradient = location.createLinearGradient((xPos + x) * size, (yPos + y) * size, (xPos + x + 1) * size, (yPos + y + 1) * size);
            if (isStack) {
              color = cell[1];
            }
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, Board.shadeColor(color, -10));
            gradient.addColorStop(1, Board.shadeColor(color, -40));
            location.fillStyle = gradient;
            location.fill();
          }
          location.strokeStyle = '#FFFFFF';
          location.lineWidth = 1;
          location.stroke();
        }
      });
    });
  }

  updateField() {
    this.clearCanvas();
    const {
      stack, currentTetromino, ghostTetromino, nextTetromino, heldTetromino,
    } = this.getUpdatableObjects();
    // draw the current stack
    Board.drawBlocks(stack);
    // draw current tetromino
    Board.drawBlocks(currentTetromino);
    // draw ghost tetromino
    Board.drawBlocks(ghostTetromino);
    // draw next tetromino and held tetromino, first calculate offsets to center tetrominoes
    Board.drawBlocks(nextTetromino);
    if (this.tetrominoes.held) {
      Board.drawBlocks(heldTetromino);
    }
    // check if a tetromino needs to be locked in the stack
    // if it's not possible the game is over and return false
    if (this.stackNeedsUpdate) {
      this.updateStack();
      this.tetrominoes.setCurrentAndNext();
      this.tetrominoOnBoard = Board.setTetrominoOnBoard(this.tetrominoes.current);
      const topOccupiedRow = Board.getTopOccupiedRow(this.gameField);
      if (topOccupiedRow <= 7) {
        SoundPlayer.playOnEdgeSoundFX(ON_EDGE_SOUND, topOccupiedRow);
      } else {
        SoundPlayer.pauseSound(ON_EDGE_SOUND);
      }
      this.stackNeedsUpdate = false;
    }
  }

  getUpdatableObjects() {
    const stack = {
      location: this.ctxMain,
      size: this.blockSize,
      shape: this.gameField,
      xPos: 0,
      yPos: 0,
      isStack: true,
    };
    const currentTetromino = {
      location: this.ctxMain,
      size: this.blockSize,
      shape: this.tetrominoOnBoard.shape,
      color: this.tetrominoOnBoard.color,
      xPos: this.tetrominoOnBoard.xPos,
      yPos: this.tetrominoOnBoard.yPos,
    };
    const [ghostX, ghostY] = this.calculateHardDrop(this.tetrominoOnBoard);
    const ghostTetromino = {
      location: this.ctxMain,
      size: this.blockSize,
      shape: this.tetrominoOnBoard.shape,
      xPos: ghostX,
      yPos: ghostY,
      isGhost: true,
    };
    let [offsetX, offsetY] = Board.getPosOffsetForSideCanvas(this.tetrominoes.next);
    const nextTetromino = {
      location: this.ctxNext,
      size: this.blockSize,
      shape: this.tetrominoes.next.shape,
      color: this.tetrominoes.next.color,
      xPos: offsetX,
      yPos: offsetY,
    };
    let heldTetromino;
    if (this.tetrominoes.held) {
      [offsetX, offsetY] = Board.getPosOffsetForSideCanvas(this.tetrominoes.held);
      heldTetromino = {
        location: this.ctxHold,
        size: this.blockSize,
        shape: this.tetrominoes.held.shape,
        color: this.tetrominoes.held.color,
        xPos: offsetX,
        yPos: offsetY,
      };
    }
    return {
      stack, currentTetromino, ghostTetromino, nextTetromino, heldTetromino,
    };
  }

  updateStack() {
    this.tetrominoOnBoard.shape.forEach((row, y) => {
      row.forEach((cellValue, x) => {
        if (cellValue === 1) {
          if ((this.tetrominoOnBoard.yPos + y) < 0) {
            this.stackState = NOT_UPDATABLE;
            return;
          }
          this.gameField[this.tetrominoOnBoard.yPos + y][this.tetrominoOnBoard.xPos + x] = [1, this.tetrominoOnBoard.color];
        }
      });
    });
  }

  updatePos(direction = 'default') {
    const { yPos, xPos } = this.tetrominoOnBoard;
    switch (direction) {
      case 'ArrowLeft': {
        const newXPos = xPos - 1;
        if (this.isPositionValid(yPos, newXPos)) {
          this.tetrominoOnBoard.xPos = newXPos;
        }
        break;
      }
      case 'ArrowRight': {
        const newXPos = xPos + 1;
        if (this.isPositionValid(yPos, newXPos)) {
          this.tetrominoOnBoard.xPos = newXPos;
        }
        break;
      }
      case 'KeyX':
      case 'ArrowUp':
        this.calculateAndVerifyRotation(CLOCKWISE_TURN);
        break;
      case 'KeyZ':
      case 'ControlLeft':
        this.calculateAndVerifyRotation(COUNTERCLOCKWISE_TURN);
        break;
      case 'Space': {
        this.tetrominoOnBoard.yPos = this.calculateHardDrop(this.tetrominoOnBoard)[1];
        this.stackNeedsUpdate = true;
        this.tetrominoes.canHold = true;
        SoundPlayer.playSound(HARD_DROP_SOUND);
        break;
      }
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight': {
        const canHold = this.tetrominoes.setHeld();
        if (canHold) {
          this.tetrominoOnBoard = Board.setTetrominoOnBoard(this.tetrominoes.current);
        }
      }
        break;
      case 'ArrowDown':
      case 'default': {
        const newYPos = yPos + 1;
        if (this.isPositionValid(newYPos, xPos)) {
          this.tetrominoOnBoard.yPos = newYPos;
          break;
        }
        SoundPlayer.playSound(TETROMINO_LOCKED_SOUND);
        this.stackNeedsUpdate = true;
        this.tetrominoes.canHold = true;
        return false;
      }
      default:
        break;
    }
    return true;
  }

  getTetrominoPosRelativeToField(xPos, yPos) {
    const colStart = xPos + Tetromino.getSolidBlockOnSideOffset(this.tetrominoOnBoard, LEFT);
    const colEnd = xPos + Tetromino.getSolidBlockOnSideOffset(this.tetrominoOnBoard, RIGHT);
    const rowStart = yPos + Tetromino.getSolidBlockOnSideOffset(this.tetrominoOnBoard, UP);
    const rowEnd = yPos + Tetromino.getSolidBlockOnSideOffset(this.tetrominoOnBoard, DOWN);
    return {
      colStart, colEnd, rowStart, rowEnd,
    };
  }

  isPositionValid(yPos = this.tetrominoOnBoard.yPos, xPos = this.tetrominoOnBoard.xPos) {
    const posRelativeToField = this.getTetrominoPosRelativeToField(xPos, yPos);
    const {
      colStart, colEnd, rowStart, rowEnd,
    } = posRelativeToField;
    // checks that the tetromino is within game area
    if (colStart < 0 || colEnd >= Board.columns || rowEnd >= Board.rows) {
      return false;
    }
    // checks if the tetromino would be in a space that's already occupied
    for (let yBoard = rowStart, yTetromino = rowStart - yPos; yBoard <= rowEnd; yBoard++, yTetromino++) {
      for (let xBoard = colStart, xTetromino = colStart - xPos; xBoard <= colEnd; xBoard++, xTetromino++) {
        if (yBoard < Board.rows && yBoard >= 0 && xBoard < Board.columns && xBoard >= 0) {
          if (this.gameField[yBoard][xBoard][0] === 1 && this.tetrominoOnBoard.shape[yTetromino][xTetromino] === 1) {
            return false;
          }
        }
      }
    }
    return true;
  }

  calculateHardDrop(tetromino) {
    let validPosition = true;
    const finalXPos = tetromino.xPos;
    let finalYPos = tetromino.yPos;
    while (validPosition) {
      validPosition = this.isPositionValid(finalYPos + 1, finalXPos);
      if (validPosition) {
        finalYPos += 1;
      }
    }
    return [finalXPos, finalYPos];
  }

  calculateAndVerifyRotation(direction) {
    const { shape: originalShape } = this.tetrominoOnBoard;
    switch (direction) {
      case CLOCKWISE_TURN:
        this.tetrominoOnBoard.shape = originalShape[0].map((value, index) => originalShape.map((row) => row[index]).reverse());
        break;
      case COUNTERCLOCKWISE_TURN:
        this.tetrominoOnBoard.shape = originalShape[0].map((value, index) => originalShape.map((row) => row[row.length - index - 1]));
        break;
      default:
        break;
    }
    if (!this.isPositionValid() && !this.canKickWall()) {
      this.tetrominoOnBoard.shape = originalShape;
    }
  }

  canKickWall() {
    const [yPos, xPos] = [this.tetrominoOnBoard.yPos, this.tetrominoOnBoard.xPos];

    // move one row up, move one row down, move one column left, move one column right
    const posChanges = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    // the i tetromino can move one or two positions depending on which side makes the kick
    // the following block adds two spaces to each direction if the tetromino is i
    // if not, all moves are already present in posChanges
    let allPosChanges = posChanges;
    if (this.tetrominoOnBoard.color === Tetromino.tetrominoShapes.i.color) {
      allPosChanges = posChanges.concat(posChanges.map(([y, x]) => [y * 2, x * 2]));
    }

    // check if kick positions are valid
    // if so set new x and y positions, if not return false
    let canKickWall = false;
    allPosChanges.some(([changeY, changeX]) => {
      const [newY, newX] = [yPos + changeY, xPos + changeX];
      if (this.isPositionValid(newY, newX)) {
        this.tetrominoOnBoard.yPos = newY;
        this.tetrominoOnBoard.xPos = newX;
        canKickWall = true;
        return true;
      }
      return false;
    });

    return canKickWall;
  }

  clearRow(row2clear) {
    for (let row = row2clear; row > 0; row--) {
      this.gameField[row] = this.gameField[row - 1];
    }
    this.gameField[0] = Array(Board.columns).fill([0, '']);
  }

  checkClearedRows() {
    let clearedRows = 0;
    const { gameField } = this;
    for (let row = 0; row < Board.rows; row++) {
      const rowIsComplete = gameField[row].every((cell) => cell[0] !== 0);
      if (rowIsComplete) {
        this.clearRow(row);
        SoundPlayer.playSound(CLEARED_ROW_SOUND);
        clearedRows += 1;
      }
    }
    return clearedRows;
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

  drawText(location, text, sizeMultiplier = 1, color = '#FFFFFF') {
    location.font = `${this.blockSize * sizeMultiplier}px Arial`;
    location.fillStyle = color;
    location.textAlign = 'center';
    location.fillText(text, location.canvas.width / 2, location.canvas.height / 2);
  }

  drawCountdown(count) {
    this.clearCanvas(this.ctxMain);
    const fontSize = this.blockSize * 5;
    Board.addTextToCanvas(this.ctxMain, count, fontSize);
    return count === 1;
  }

  drawGameOverMessage() {
    const fontSize = this.blockSize * 2;
    Board.addTextToCanvas(this.ctxMain, 'Game Over', fontSize, '#FF0000');
  }

  drawPausedMessage() {
    this.clearCanvas(this.ctxMain);
    const fontSize = this.blockSize * 2;
    Board.addTextToCanvas(this.ctxMain, 'Paused', fontSize);
  }
}

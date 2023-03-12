import Tetromino from './tetromino.js';
import {
  SIDES, STACK_STATES, TURNS, SOUNDS,
} from './constants.js';
import SoundPlayer from './sound_player.js';

const { UNCHANGED, NOT_UPDATABLE } = STACK_STATES;
const {
  LEFT, RIGHT, UP, DOWN,
} = SIDES;
const { CLOCKWISE_TURN, COUNTERCLOCKWISE_TURN } = TURNS;
const {
  CLEARED_ROW_SOUND, HARD_DROP_SOUND, TETROMINO_LOCKED_SOUND, ON_EDGE_SOUND,
} = SOUNDS;

export default class GameField {
  static columns = 10;

  static rows = 22;

  constructor(mainCanvasId, nextCanvasId, holdCanvasId, blockSize) {
    this.gameField = GameField.createEmptyGameField();
    this.tetromino = new Tetromino();
    this.blockSize = blockSize;
    this.ctxMain = mainCanvasId.getContext('2d');
    this.ctxNext = nextCanvasId.getContext('2d');
    this.ctxHold = holdCanvasId.getContext('2d');
    this.stackNeedsUpdate = false;
    this.stackState = UNCHANGED;
  }

  static createEmptyGameField() {
    return Array.from({ length: GameField.rows }, () => Array(GameField.columns).fill([0, '']));
  }

  static getPosOffset(tetromino) {
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

  updateField() {
    // console.log(`needs update ${this.stackNeedsUpdate}`)
    this.clearCanvas();
    // draw the current stack
    this.drawTetromino(this.ctxMain, this.blockSize, this.gameField, null, 0, 0, false, true);
    // draw current tetromino
    this.drawTetromino(this.ctxMain, this.blockSize, this.tetromino.shape, this.tetromino.color, this.tetromino.xPos, this.tetromino.yPos);
    // draw ghost tetromino
    const [ghostX, ghostY] = this.calculateHardDrop();
    this.drawTetromino(this.ctxMain, this.blockSize, this.tetromino.shape, null, ghostX, ghostY, true);
    // draw next tetromino and held tetromino, first calculate offsets to center tetrominoes
    let [offsetX, offsetY] = GameField.getPosOffset(this.tetromino.next);
    this.drawTetromino(this.ctxNext, this.blockSize, this.tetromino.next.shape, this.tetromino.next.color, offsetX, offsetY);
    if (this.tetromino.held) {
      [offsetX, offsetY] = GameField.getPosOffset(this.tetromino.held);
      this.drawTetromino(this.ctxHold, this.blockSize, this.tetromino.held.shape, this.tetromino.held.color, offsetX, offsetY);
    }
    // check if a tetromino needs to be locked in the stack
    // if it's not possible the game is over and return false
    if (this.stackNeedsUpdate) {
      this.updateStack();
      this.tetromino.setCurrentAndNext();
      const topOccupiedRow = GameField.getTopOccupiedRow(this.gameField);
      if (topOccupiedRow <= 7) {
        SoundPlayer.playOnEdgeFX(ON_EDGE_SOUND, topOccupiedRow);
      } else {
        SoundPlayer.pause(ON_EDGE_SOUND);
      }
      this.stackNeedsUpdate = false;
    }
  }

  updateStack() {
    this.tetromino.shape.forEach((row, y) => {
      row.forEach((cellValue, x) => {
        if (cellValue === 1) {
          if ((this.tetromino.yPos + y) < 0) {
            this.stackState = NOT_UPDATABLE;
            return;
          }
          this.gameField[this.tetromino.yPos + y][this.tetromino.xPos + x] = [1, this.tetromino.color];
        }
      });
    });
  }

  updatePos(direction = 'default') {
    const { yPos } = this.tetromino;
    const { xPos } = this.tetromino;
    let moveValid;
    switch (direction) {
      case 'ArrowLeft':
        moveValid = this.isPositionValid(yPos, xPos - 1);
        if (moveValid) {
          this.tetromino.xPos -= 1;
        }
        break;
      case 'ArrowRight':
        moveValid = this.isPositionValid(yPos, xPos + 1);
        if (moveValid) {
          this.tetromino.xPos += 1;
        }
        break;
      case 'KeyX':
      case 'ArrowUp':
        this.calculateAndVerifyRotation(CLOCKWISE_TURN);
        break;
      case 'KeyZ':
      case 'ControlLeft':
        this.calculateAndVerifyRotation(COUNTERCLOCKWISE_TURN);
        break;
      case 'Space':
        this.tetromino.yPos = this.calculateHardDrop()[1];
        this.stackNeedsUpdate = true;
        this.tetromino.canHold = true;
        SoundPlayer.play(HARD_DROP_SOUND);
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        this.tetromino.setHeld();
        break;
      case 'ArrowDown':
      case 'default':
        moveValid = this.isPositionValid(yPos + 1, xPos);
        if (moveValid) {
          this.tetromino.yPos += 1;
        } else {
          SoundPlayer.play(TETROMINO_LOCKED_SOUND);
          this.stackNeedsUpdate = true;
          this.tetromino.canHold = true;
        }
        break;
      default:
        break;
    }
    return true;
  }

  getTetrominoPosRelativeToField(xPos, yPos) {
    const colStart = xPos + Tetromino.getSolidBlockOnSideOffset(this.tetromino, LEFT);
    const colEnd = xPos + Tetromino.getSolidBlockOnSideOffset(this.tetromino, RIGHT);
    const rowStart = yPos + Tetromino.getSolidBlockOnSideOffset(this.tetromino, UP);
    const rowEnd = yPos + Tetromino.getSolidBlockOnSideOffset(this.tetromino, DOWN);
    return {
      colStart, colEnd, rowStart, rowEnd,
    };
  }

  isPositionValid(yPos = this.tetromino.yPos, xPos = this.tetromino.xPos) {
    const posRelativeToField = this.getTetrominoPosRelativeToField(xPos, yPos);
    const { colStart } = posRelativeToField;
    const { colEnd } = posRelativeToField;
    const { rowStart } = posRelativeToField;
    const { rowEnd } = posRelativeToField;
    // checks that the tetromino is within game area
    if (colStart < 0 || colEnd >= GameField.columns || rowEnd >= GameField.rows) {
      return false;
    }
    // checks if the tetromino would be in a space that's already occupied
    for (let y = rowStart, y_ = rowStart - yPos; y <= rowEnd; y++, y_++) {
      for (let x = colStart, x_ = colStart - xPos; x <= colEnd; x++, x_++) {
        if (y < GameField.rows && y >= 0 && x < GameField.columns && x >= 0) {
          if (this.gameField[y][x][0] === 1 && this.tetromino.shape[y_][x_] === 1) {
            return false;
          }
        }
      }
    }
    return true;
  }

  calculateHardDrop() {
    let validPosition = true;
    const finalXPos = this.tetromino.xPos;
    let finalYPos = this.tetromino.yPos;
    while (validPosition) {
      validPosition = this.isPositionValid(finalYPos + 1, finalXPos);
      if (validPosition) {
        finalYPos += 1;
      }
    }
    return [finalXPos, finalYPos];
  }

  calculateAndVerifyRotation(direction) {
    const originalShape = this.tetromino.shape;
    switch (direction) {
      case CLOCKWISE_TURN:
        this.tetromino.shape = originalShape[0].map((value, index) => originalShape.map((row) => row[index]).reverse());
        break;
      case COUNTERCLOCKWISE_TURN:
        this.tetromino.shape = originalShape[0].map((value, index) => originalShape.map((row) => row[row.length - index - 1]));
        break;
      default:
        break;
    }
    if (!this.isPositionValid()) {
      if (!this.canKickWall()) {
        this.tetromino.shape = originalShape;
      }
    }
  }

  canKickWall() {
    // for a rotated tetromino, checks if there would be a conflict (with the wall or the stack) if it's moved one step in one direction as the result of a kick
    const conflictLeft = !this.isPositionValid(this.tetromino.yPos, this.tetromino.xPos - 1);
    const conflictRight = !this.isPositionValid(this.tetromino.yPos, this.tetromino.xPos + 1);
    const conflictUp = !this.isPositionValid(this.tetromino.yPos - 1, this.tetromino.xPos);
    const conflictDown = !this.isPositionValid(this.tetromino.yPos + 1, this.tetromino.xPos);

    // if the i tetromino is rotated, it can move one or two positions depending on which side makes the kick
    // this checks if moving two positions would be valid
    let conflictLeftMoveTwo = true;
    let conflictRightMoveTwo = true;
    let conflictUpMoveTwo = true;
    let conflictDownMoveTwo = true;
    if (this.tetromino.color === Tetromino.tetrominoes.i.color) {
      conflictLeftMoveTwo = !this.isPositionValid(this.tetromino.yPos, this.tetromino.xPos - 2);
      conflictRightMoveTwo = !this.isPositionValid(this.tetromino.yPos, this.tetromino.xPos + 2);
      conflictUpMoveTwo = !this.isPositionValid(this.tetromino.yPos - 2, this.tetromino.xPos);
      conflictDownMoveTwo = !this.isPositionValid(this.tetromino.yPos + 2, this.tetromino.xPos);
    }

    const canKickOnePosition = !(conflictLeft && conflictRight && conflictUp && conflictDown);
    const canKickTwoPositionsIfI = !(conflictLeftMoveTwo && conflictRightMoveTwo && conflictUpMoveTwo && conflictDownMoveTwo);

    if (!canKickOnePosition && !canKickTwoPositionsIfI) {
      return false;
    }
    if (conflictLeft) {
      if (!conflictRight) {
        this.tetromino.xPos += 1;
        return true;
      } if (!conflictRightMoveTwo) {
        this.tetromino.xPos += 2;
        return true;
      }
    }
    if (conflictRight) {
      if (!conflictLeft) {
        this.tetromino.xPos -= 1;
        return true;
      } if (!conflictLeftMoveTwo) {
        this.tetromino.xPos -= 2;
        return true;
      }
    }
    if (conflictUp) {
      if (!conflictDown) {
        this.tetromino.yPos += 1;
        return true;
      } if (!conflictDownMoveTwo) {
        this.tetromino.yPos += 2;
        return true;
      }
    }
    if (conflictDown) {
      if (!conflictUp) {
        this.tetromino.yPos -= 1;
        return true;
      } if (!conflictUpMoveTwo) {
        this.tetromino.yPos -= 2;
        return true;
      }
    }
    return false;
  }

  static getTopOccupiedRow(gameField) {
    let topOccupiedRow = 0;
    gameField.some((row, index) => {
      if (row.some((cell) => cell[0] === 1)) {
        topOccupiedRow = index;
        return true;
      }
      return false;
    });
    return topOccupiedRow;
  }

  static clearRow(gameField, row) {
    gameField.splice(row, 1);
    gameField.unshift(Array(GameField.columns).fill([0, '']));
  }

  checkClearedRows() {
    let clearedRows = 0;
    for (let row = 0; row < GameField.rows; row++) {
      let rowIsComplete = true;
      for (let cell = 0; cell < this.gameField[row].length; cell++) {
        if (this.gameField[row][cell][0] === 0) {
          rowIsComplete = false;
          break;
        }
      }
      if (rowIsComplete) {
        GameField.clearRow(this.gameField, row);
        SoundPlayer.play(CLEARED_ROW_SOUND);
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

  drawTetromino(location, size, shape, color, xPos, yPos, isGhost = false, isStack = false) {
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
            gradient.addColorStop(0.5, GameField.shadeColor(color, -10));
            gradient.addColorStop(1, GameField.shadeColor(color, -40));
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

  drawText(location, text, sizeMultiplier = 1, color = '#FFFFFF') {
    location.font = `${this.blockSize * sizeMultiplier}px Arial`;
    location.fillStyle = color;
    location.textAlign = 'center';
    location.fillText(text, location.canvas.width / 2, location.canvas.height / 2);
  }

  count = 2;

  drawCountdown() {
    this.clearCanvas(this.ctxMain);
    const fontSize = this.blockSize * 5;
    GameField.addTextToCanvas(this.ctxMain, this.count, fontSize);
    this.count -= 1;
    return this.count < 1;
  }

  drawGameOverMessage() {
    const fontSize = this.blockSize * 2;
    GameField.addTextToCanvas(this.ctxMain, 'Game Over', fontSize, '#FF0000');
  }

  drawPausedMessage() {
    this.clearCanvas(this.ctxMain);
    const fontSize = this.blockSize * 2;
    GameField.addTextToCanvas(this.ctxMain, 'Paused', fontSize);
  }

  static addTextToCanvas(ctx, text, fontSize, color = '#FFFFFF') {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, ctx.canvas.width / 2, ctx.canvas.height / 2);
  }

  static shadeColor(color, percent) { // adapted from https://stackoverflow.com/a/13532993
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100, 10);
    G = parseInt((G * (100 + percent)) / 100, 10);
    B = parseInt((B * (100 + percent)) / 100, 10);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);

    const RR = ((R.toString(16).length === 1) ? `0${R.toString(16)}` : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? `0${G.toString(16)}` : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? `0${B.toString(16)}` : B.toString(16));

    return `#${RR}${GG}${BB}`;
  }
}

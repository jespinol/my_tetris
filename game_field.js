import Tetromino from './tetromino.js';
import {SIDES, STACK_STATES, TURNS} from './constants.js';

const { UNCHANGED, UPDATING, NOT_UPDATABLE } = STACK_STATES;
const {
  LEFT, RIGHT, UP, DOWN,
} = SIDES;
const { CLOCKWISE_TURN, COUNTERCLOCKWISE_TURN } = TURNS;

export default class GameField {
  static columns = 10;

  static rows = 22;

  constructor(mainCanvasId, nextCanvasId, holdCanvasId, blockSize) {
    this.ctxMain = mainCanvasId.getContext('2d');
    this.ctxNext = nextCanvasId.getContext('2d');
    this.ctxHold = holdCanvasId.getContext('2d');
    this.blockSize = blockSize;
    this.tetromino = new Tetromino();
    this.gameField = GameField.createEmptyGameField();
    this.stackNeedsUpdate = false;
    this.stackState = UNCHANGED;
  }

  static createEmptyGameField() {
    return Array.from({ length: GameField.rows }, () => Array(GameField.columns).fill([0, '']));
  }

  static getPosOffset(tetromino) {
    const shapeWidth = tetromino.shape[0].length;
    const shapeHeight = tetromino.shape.length;
    const xPosOffset = shapeWidth > 3 ? 0 : shapeWidth > 2 ? 0.5 : 1;
    const yPosOffset = shapeHeight > 3 ? 0.5 : 1;
    return [xPosOffset, yPosOffset];
  }

  hardDropPerformed = false;

  updateField() {
    this.clearCanvas();
    // draw the current stack
    this.drawTetromino(this.ctxMain, this.blockSize, this.gameField, null, 0, 0, false, true);
    // draw current tetromino
    this.drawTetromino(this.ctxMain, this.blockSize, this.tetromino.shape, this.tetromino.color, this.tetromino.xPos, this.tetromino.yPos, false);
    // draw ghost tetromino
    const ghostPosition = this.calculateHardDrop(true);
    this.drawTetromino(this.ctxMain, this.blockSize, this.tetromino.shape, null, ghostPosition[0], ghostPosition[1], true);
    // draw next tetromino and held tetromino, if there's one
    // first calculate offsets to center tetrominoes
    let [xPosOffset, yPosOffset] = GameField.getPosOffset(this.tetromino.next);
    this.drawTetromino(this.ctxNext, (this.blockSize / 1), this.tetromino.next.shape, this.tetromino.next.color, xPosOffset, yPosOffset, false);
    if (this.tetromino.held) {
      [xPosOffset, yPosOffset] = GameField.getPosOffset(this.tetromino.held);
      this.drawTetromino(this.ctxHold, (this.blockSize / 1), this.tetromino.held.shape, this.tetromino.held.color, xPosOffset, yPosOffset, false);
    }
    // check if a tetromino needs to be locked in the stack, if not possible the game is over and return false
    if (this.stackNeedsUpdate) {
      this.updateStack();
      return;
      // console.log("update stack")
      // if (this.hardDropPerformed) {
      //     this.hardDropPerformed = false;
      //     this.fieldState = UNCHANGED
      //     this.updateStack();
      // } else {
      //     this.fieldState = "update";
      //     return;
      // }
      // let fieldUpdatable =  this.updateStack();
      // if (fieldUpdatable) {
      // }
    }
    this.stackState = UNCHANGED;
    // return true;
  }

  updateStack() {
    this.stackNeedsUpdate = false;
    this.tetromino.shape.forEach((row, y) => {
      row.forEach((cellValue, x) => {
        if (cellValue === 1) {
          if ((this.tetromino.yPos + y) <= 0) {
            // this.fieldUpdatable = false;
            this.stackState = NOT_UPDATABLE;
            return;
          }
          this.gameField[this.tetromino.yPos + y][this.tetromino.xPos + x] = [1, this.tetromino.color];
        }
      });
    });
    this.tetromino.setCurrentAndNext();
  }

  updatePos(key = 'default') {
    const { yPos } = this.tetromino;
    const { xPos } = this.tetromino;
    let moveValid;
    switch (key) {
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
        this.calculateRotation(CLOCKWISE_TURN);
        break;
      case 'KeyZ':
      case 'ControlLeft':
        this.calculateRotation(COUNTERCLOCKWISE_TURN);
        break;
      case 'Space':
        this.tetromino.yPos = this.calculateHardDrop()[1];
        // this.hardDropPerformed = true;
        break;
      case 'KeyC':
      case 'ShiftLeft':
      case 'ShiftRight':
        this.tetromino.setHeld();
        // this.updateField();
        break;
      case 'ArrowDown':
      case 'default':
        moveValid = this.isPositionValid(yPos + 1, xPos);
        if (moveValid) {
          this.tetromino.yPos += 1;
        } else {
          this.stackNeedsUpdate = true;
          this.tetromino.canHold = true;
        }
        break;
      default:
        break;
    }
    return true;
  }

  isPositionValid(yPos = this.tetromino.yPos, xPos = this.tetromino.xPos) {
    const colStart = xPos + this.tetromino.getPosSolidBlockOnSide(LEFT);
    const colEnd = xPos + this.tetromino.getPosSolidBlockOnSide(RIGHT);
    const rowStart = yPos + this.tetromino.getPosSolidBlockOnSide(UP);
    const rowEnd = yPos + this.tetromino.getPosSolidBlockOnSide(DOWN);
    // checks that the tetromino is within game area
    if (colStart < 0 || colEnd >= GameField.columns || rowEnd >= GameField.rows) {
      return false;
    }
    // checks that the tetromino would not be on a cell that's already occupied
    if (yPos >= 0 && ((yPos + this.tetromino.getPosSolidBlockOnSide(DOWN)) < GameField.rows)) {
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
    const finalXPos = this.tetromino.xPos;
    let finalYPos = this.tetromino.yPos;
    while (validPosition) {
      validPosition = this.isPositionValid(finalYPos + 1, finalXPos);
      if (validPosition) {
        finalYPos += 1;
      }
    }
    if (!isGhost) {
      this.stackNeedsUpdate = true;
      this.tetromino.canHold = true;
    }
    return [finalXPos, finalYPos];
  }

  calculateRotation(direction) {
    const previousShape = this.tetromino.shape;
    let wallKickPossible;
    switch (direction) {
      case CLOCKWISE_TURN:
        this.tetromino.shape = previousShape[0].map((value, index) => previousShape.map((row) => row[index]).reverse());
        break;
      case COUNTERCLOCKWISE_TURN:
        this.tetromino.shape = previousShape[0].map((value, index) => previousShape.map((row) => row[row.length - index - 1]));
        break;
      default:
        break;
    }
    if (!this.isPositionValid()) {
      wallKickPossible = this.canKickWall();
      if (!wallKickPossible) {
        this.tetromino.shape = previousShape;
      }
    }
  }

  canKickWall() {
    // const potentialPositionChange = 1;

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

  checkRows() {
    let clearedRows = 0;
    for (let y = 0; y < GameField.rows; y++) {
      let row2clear = true;
      for (let cell = 0; cell < this.gameField[y].length; cell++) {
        if (this.gameField[y][cell][0] === 0) {
          row2clear = false;
          break;
        }
      }
      if (row2clear) {
        this.gameField.splice(y, 1);
        this.gameField.unshift(Array(GameField.columns).fill([0, '']));
        clearedRows += 1;
      }
    }
    const tetris = Math.floor(clearedRows / 4);
    clearedRows %= 4;
    const triple = Math.floor(clearedRows / 3);
    clearedRows %= 3;
    const double = Math.floor(clearedRows / 2);
    const single = clearedRows % 2;
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
        // debugging: paints empty blocks
        // if (!isStack && !isGhost) {
        //     if (cell === 0) {
        //         location.beginPath()
        //         location.roundRect((xPos + x) * size, (yPos + y) * size, size, size, [3]);
        //         location.fillStyle = "white"
        //         location.fill()
        //     }
        // }
      });
    });
  }

  count = 1;

  drawCountdown() {
    this.clearCanvas(this.ctxMain);
    this.drawText(this.ctxMain, this.count.toString(), 10);
    this.count -= 1;
    return this.count < 1;
  }

  drawGameOverMessage() {
    this.drawText(this.ctxMain, 'Game Over', 5);
  }

  drawPausedMessage() {
    this.drawText(this.ctxMain, 'Paused', 5);
  }

  drawText(location, text, sizeMultiplier = 0, color = '#FFFFFF') {
    // location.clearRect(0, 0, location.canvas.width, location.canvas.height);
    location.font = `${30 * sizeMultiplier}px Arial`;
    location.fillStyle = color;
    location.textAlign = 'center';
    location.fillText(text, location.canvas.width / 2, location.canvas.height / 2);
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

import MyTetris from './my_tetris.js';
import { GAME_STATES } from './constants.js';
import GameField from './game_field.js';

const {
  NEW, RUNNING, PAUSED, ENDED,
} = GAME_STATES;

export default function init() {
  const playButton = document.getElementById('playButton');
  const gameCanvas = document.getElementById('gameCanvas');
  const holdCanvas = document.getElementById('holdCanvas');
  const nextCanvas = document.getElementById('nextCanvas');
  const blockSize = getBlockSizeSetCanvas();
  const game = new MyTetris(gameCanvas, nextCanvas, holdCanvas, blockSize, playButton);

  window.addEventListener('keydown', (event) => {
    const key = event.code;
    if (event.defaultPrevented) {
      return;
    } if (game.gameState === RUNNING) {
      if (key === 'Escape' || key === 'F1' || key === 'KeyP') {
        game.switchGameStates(PAUSED);
      } else {
        game.runGame(key);
      }
    } else if (game.gameState === PAUSED) {
      if (key === 'Enter') {
        game.switchGameStates(RUNNING);
      }
    }
    event.preventDefault();
  }, true);

  window.addEventListener('blur', () => {
    if (game.gameState === RUNNING) {
      game.switchGameStates(PAUSED);
    }
  });

  playButton.addEventListener('click', () => {
    switch (game.gameState) {
      case ENDED:
        location.reload();
        break;
      case RUNNING:
        game.switchGameStates(PAUSED);
        break;
      case PAUSED:
        game.switchGameStates(RUNNING);
        break;
      case NEW:
        game.switchGameStates(NEW);
        break;
      default:
        break;
    }
  });
}

function setCanvas(canvasId, width, height) {
  document.getElementById(canvasId).setAttribute('width', width);
  document.getElementById(canvasId).setAttribute('height', height);
}

function getBlockSizeSetCanvas() {
  const blockSize = Math.round((window.innerHeight * 0.1) / 10) * 10;

  const blocksInRow = blockSize * GameField.columns;
  const gameCanvasWidth = blocksInRow.toString();
  const blocksInCol = blockSize * GameField.rows;
  const gameCanvasHeight = blocksInCol.toString();
  const blocksInSide = blocksInRow * (40 / 100);
  const sideCanvasSize = blocksInSide.toString();

  setCanvas('gameCanvas', gameCanvasWidth, gameCanvasHeight);
  setCanvas('nextCanvas', sideCanvasSize, sideCanvasSize);
  setCanvas('holdCanvas', sideCanvasSize, sideCanvasSize);
  return blockSize;
}

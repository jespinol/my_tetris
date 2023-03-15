import MyTetris from './my_tetris.js';
import { GAME_STATES } from './constants.js';
import Board from './board.js';

const {
  NEW, RUNNING, PAUSED, ENDED,
} = GAME_STATES;

function resizeCanvas(canvas, width, height) {
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
}

function setCanvas(blockSize, gameCanvas, nextCanvas, holdCanvas) {
  const blocksInRow = blockSize * Board.columns;
  const gameCanvasWidth = blocksInRow.toString();
  const blocksInCol = blockSize * Board.rows;
  const gameCanvasHeight = blocksInCol.toString();
  const blocksInSide = blocksInRow * (40 / 100);
  const sideCanvasSize = blocksInSide.toString();

  resizeCanvas(gameCanvas, gameCanvasWidth, gameCanvasHeight);
  resizeCanvas(nextCanvas, sideCanvasSize, sideCanvasSize);
  resizeCanvas(holdCanvas, sideCanvasSize, sideCanvasSize);
}

function getBlockSize() {
  return Math.round((window.innerHeight * 0.1) / 10) * 10;
}

export default function init() {
  const playButton = document.querySelector('#playButton');
  const gameCanvas = document.querySelector('#gameCanvas');
  const holdCanvas = document.querySelector('#holdCanvas');
  const nextCanvas = document.querySelector('#nextCanvas');
  const blockSize = getBlockSize();
  setCanvas(blockSize, gameCanvas, nextCanvas, holdCanvas);
  const game = new MyTetris(gameCanvas, nextCanvas, holdCanvas, blockSize, playButton);

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

  window.addEventListener('keydown', (event) => {
    const key = event.code;
    if (event.defaultPrevented) {
      return;
    }
    switch (key) {
      case 'Escape':
      case 'F1':
      case 'KeyP':
        game.switchGameStates(PAUSED);
        break;
      case 'Enter':
        if (game.gameState === PAUSED) {
          game.switchGameStates(RUNNING);
        }
        break;
      default:
        if (game.gameState === RUNNING) {
          game.runGame(key);
        }
        break;
    }
    event.preventDefault();
  }, true);

  window.addEventListener('blur', () => {
    if (game.gameState === RUNNING) {
      game.switchGameStates(PAUSED);
    }
  });
}

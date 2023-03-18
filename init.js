import MyTetris from './my_tetris.js';
import { GAME_STATES } from './constants.js';
import Board from './board.js';
import SoundPlayer from './sound_player.js';

const {
  NEW, RUNNING, PAUSED, ENDED,
} = GAME_STATES;

// calculates a size for each block depending on the height of the window
function getBlockSize() {
  return Math.round((window.innerHeight * 0.1) / 10) * 10;
}

// sets the width and height of a canvas
function resizeCanvas(canvas, width, height) {
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
}

// calculates the width/height of each canvas depending on blocksize, then call a function to change those attributes
function setCanvasSize(blockSize, gameCanvas, nextCanvas1, nextCanvas2, nextCanvas3, holdCanvas) {
  const blocksInRow = blockSize * Board.columns;
  const gameCanvasWidth = blocksInRow.toString();
  const blocksInCol = blockSize * Board.rows;
  const gameCanvasHeight = blocksInCol.toString();
  const blocksInSide = blocksInRow * (40 / 100);
  const sideCanvasSize = blocksInSide.toString();

  resizeCanvas(gameCanvas, gameCanvasWidth, gameCanvasHeight);
  resizeCanvas(nextCanvas1, sideCanvasSize, sideCanvasSize);
  resizeCanvas(nextCanvas2, sideCanvasSize, sideCanvasSize);
  resizeCanvas(nextCanvas3, sideCanvasSize, sideCanvasSize);
  resizeCanvas(holdCanvas, sideCanvasSize, sideCanvasSize);
}

// gets the canvas elements
function getCanvases() {
  const gameCanvas = document.querySelector('#gameCanvas');
  const nextCanvas1 = document.querySelector('#nextCanvas1');
  const nextCanvas2 = document.querySelector('#nextCanvas2');
  const nextCanvas3 = document.querySelector('#nextCanvas3');
  const holdCanvas = document.querySelector('#holdCanvas');
  return {
    gameCanvas, nextCanvas1, nextCanvas2, nextCanvas3, holdCanvas,
  };
}

// function that initializes the game and passes user interactions to appropriate methods
export default function init() {
  const {
    gameCanvas, nextCanvas1, nextCanvas2, nextCanvas3, holdCanvas,
  } = getCanvases();
  const blockSize = getBlockSize();
  setCanvasSize(blockSize, gameCanvas, nextCanvas1, nextCanvas2, nextCanvas3, holdCanvas);
  const playButton = document.querySelector('#playButton');
  const settingsModal = document.getElementById('settingsModal');
  const game = new MyTetris(gameCanvas, nextCanvas1, nextCanvas2, nextCanvas3, holdCanvas, blockSize, playButton);

  // changes gameState when the user clicks the playButton
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

  // handles keyboard input
  window.addEventListener('keydown', (event) => {
    const key = event.code;
    if (event.defaultPrevented) {
      return;
    }
    switch (key) {
      case 'Escape':
      case 'F1':
      case 'KeyP':
        if (settingsModal.style.display !== 'none') {
          settingsModal.style.display = 'none';
        }
        if (game.gameState === RUNNING) {
          game.switchGameStates(PAUSED);
        }
        break;
      case 'Enter':
        if (game.gameState === PAUSED) {
          game.switchGameStates(RUNNING);
        } else if (game.gameState === NEW) {
          game.switchGameStates(NEW);
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

  // pauses the game when the window is inactive
  window.addEventListener('blur', () => {
    if (game.gameState === RUNNING) {
      game.switchGameStates(PAUSED);
    }
  });

  // opens a settings panel when the user clicks on the settingsButton
  const settingsButton = document.getElementById('settingsButton');
  settingsButton.addEventListener('click', () => {
    if (game.gameState === RUNNING) {
      game.switchGameStates(PAUSED);
    }
    settingsModal.style.display = 'block';
  });

  // clicking away from the settings panel closes it
  // if the game was paused due to opening the settings panel, resume it
  window.onclick = (event) => {
    if (event.target === settingsModal) {
      settingsModal.style.display = 'none';
      if (game.gameState === PAUSED) {
        game.switchGameStates(RUNNING);
      }
    }
  };

  // close the settings panel when the close button if clicked
  const modalCloseButton = document.getElementById('modalCloseButton');
  modalCloseButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  // turns off all sounds if the setting is checked
  const toggleMuteSounds = document.getElementById('toggleMuteSounds');
  toggleMuteSounds.addEventListener('click', () => {
    if (toggleMuteSounds.checked) {
      SoundPlayer.pauseAllSounds();
      SoundPlayer.soundOn = false;
    } else {
      SoundPlayer.soundOn = true;
    }
  });

  // hides the ghost tetromino if the setting is checked
  const toggleDisplayGhostTetromino = document.getElementById('toggleDisplayGhostTetromino');
  toggleDisplayGhostTetromino.addEventListener('click', () => {
    game.gameField.displayGhostTetromino = !toggleDisplayGhostTetromino.checked;
  });

  // hides the next tetrominoes if the setting is checked
  const toggleDisplayNextTetrominoes = document.getElementById('toggleDisplayNextTetrominoes');
  toggleDisplayNextTetrominoes.addEventListener('click', () => {
    game.gameField.displayNextTetrominoes = !toggleDisplayNextTetrominoes.checked;
  });

  // disables holding tetromino if the setting is checked
  const toggleAllowHoldTetromino = document.getElementById('toggleAllowHoldTetromino');
  toggleAllowHoldTetromino.addEventListener('click', () => {
    game.gameField.holdAllowed = !toggleAllowHoldTetromino.checked;
  });

  // increases or decreases the rate of speed change upon leveling up depending on user choice
  const speedSlider = document.getElementById('speedSlider');
  speedSlider.addEventListener('input', (event) => {
    const defaultSpeed = 4;
    const chosenSpeed = event.target.valueAsNumber;
    // the slider increases (if > defaultSpeed) or decreases (if < defaultSpeed) game speed by 20%
    game.speedMultiplier = 0.2 * (defaultSpeed - chosenSpeed);
  });
}

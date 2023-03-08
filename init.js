import MyTetris from './my_tetris.js';
import { GAME_STATES } from './constants.js';

const {
  NEW, RUNNING, PAUSED, ENDING, ENDED,
} = GAME_STATES;

export default function init() {
  const playButton = document.getElementById('playButton');
  const gameCanvas = document.getElementById('gameCanvas');
  const holdCanvas = document.getElementById('holdCanvas');
  const nextCanvas = document.getElementById('nextCanvas');
  const blockSize = getBlockSizeSetCanvas();
  const game = new MyTetris(gameCanvas, nextCanvas, holdCanvas, blockSize);

  window.addEventListener('keydown', (event) => {
    const key = event.code;
    if (event.defaultPrevented) {
      return;
    } if (game.gameState === RUNNING) {
      if (key === 'Escape' || key === 'F1' || key === 'KeyP') {
        game.gameState = PAUSED;
        changePlayButton();
        return;
      }
      game.runGame(key);
    } else if (key === 'Enter' && game.gameState === PAUSED) {
      game.gameState = RUNNING;
      changePlayButton();
    }
    event.preventDefault();
  }, true);

  window.addEventListener('blur', () => {
    if (game.gameState === RUNNING) {
      game.gameState = PAUSED;
      changePlayButton();
      // animateGame()
      // game.animate();
      // cancelAnimationFrame(animationReference);
    }
  });

  playButton.addEventListener('click', () => {
    switch (game.gameState) {
      case ENDED:
        location.reload();
        return;
      case RUNNING:
        game.gameState = PAUSED;
        changePlayButton();
        break;
      case PAUSED:
        game.gameState = RUNNING;
        changePlayButton();
        break;
      case NEW:
        changePlayButton();
    }
    requestAnimationFrame((timestamp) => game.animate(timestamp));
    // game.play();
    // game.startAnimation();
    // game.animate();
    // changePlayButton();
    // if (game.gameState === ENDED) {
    //     location.reload();
    // } else {
    //     if (game.gameState === RUNNING) {
    //         game.gameState = PAUSED;
    //         // animateGame();
    //         // cancelAnimationFrame(animationReference);
    //     } else if (game.gameState === "new") {
    //         // animateGame();
    //     } else {
    //         // game.gameState == "new"
    //         game.gameState = RUNNING;
    //         // animateGame();
    //     }
    //     // animateGame();
    //     // animationReference = requestAnimationFrame(game.animate);
    //     game.animate();
    //     changePlayButton();
    // }
  });

  // function animateGame(timestamp) {
  //     console.log(timestamp)
  //     if (game.gameState !== ENDED) {
  //         if (timestamp - lastRender >= game.speed) {
  //             lastRender = timestamp;
  //             document.getElementById("levelArea").innerText = "Level:\n" + (game.level).toString();
  //             document.getElementById("scoreArea").innerText = "Score:\n" + (game.points).toString();
  //             game.play();
  //         }
  //         animationReference = requestAnimationFrame(animateGame);
  //     } else {
  //         changePlayButton();
  //     }
  // }

  function changePlayButton() {
    const currentState = game.gameState;
    switch (currentState) {
      case ENDED:
        playButton.innerText = 'Try again';
        playButton.classList.remove('btn-danger');
        playButton.classList.add('btn-light');
        break;
      case PAUSED:
        playButton.innerText = 'Continue';
        playButton.classList.remove('btn-danger');
        playButton.classList.add('btn-success');
        break;
      default:
        playButton.innerText = 'Pause';
        playButton.classList.remove('btn-primary');
        playButton.classList.add('btn-danger');
    }
    // if (game.gameState === ENDED) {
    //     playButton.innerText = "Try again";
    //     playButton.classList.remove("btn-danger");
    //     playButton.classList.add("btn-light");
    // } else if (game.gameState === PAUSED) {
    //     game.playSound("background", true).then(r => r);
    //     playButton.innerText = "Continue";
    //     playButton.classList.remove("btn-danger");
    //     playButton.classList.add("btn-success");
    // } else {
    //     game.playSound("background", true).then(r => r);
    //     playButton.innerText = "Pause";
    //     playButton.classList.remove("btn-primary");
    //     playButton.classList.add("btn-danger");
    // }
  }
}

function setCanvas(canvasId, width, height) {
  document.getElementById(canvasId).setAttribute('width', width);
  document.getElementById(canvasId).setAttribute('height', height);
}

function getBlockSizeSetCanvas() {
  const blockSize = Math.round((window.innerHeight * 0.045) / 10) * 10;
  const gameCanvasWidth = (blockSize * 20).toString();
  const gameCanvasHeight = (blockSize * 44).toString();
  const sideCanvasSize = (blockSize * 8).toString();
  setCanvas('gameCanvas', gameCanvasWidth, gameCanvasHeight);
  setCanvas('nextCanvas', sideCanvasSize, sideCanvasSize);
  setCanvas('holdCanvas', sideCanvasSize, sideCanvasSize);
  return blockSize * 2;
}

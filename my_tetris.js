import GameField from './game_field.js';
import SoundPlayer from './sound_player.js';
import { GAME_STATES, SOUNDS, STACK_STATES } from './constants.js';

const {
  NEW, RUNNING, UPDATING, PAUSED, ENDING, ENDED,
} = GAME_STATES;
const { NOT_UPDATABLE, CHANGED, UNCHANGED } = STACK_STATES;
const { BACKGROUND_MUSIC, LEVEL_UP_SOUND, ON_EDGE_SOUND } = SOUNDS;

export default class MyTetris {
  constructor(mainCanvasId, nextCanvasId, holdCanvasId, blockSize, playButton) {
    this.gameField = new GameField(mainCanvasId, nextCanvasId, holdCanvasId, blockSize);
    this.playButton = playButton;
    this.gameState = NEW;
    this.speed = 1000;
    this.levelPoints = 0;
    this.level = 1;
    this.points = 0;
    this.animationActive = false;
    this.animationReference = null;
    this.lastRender = -1;
  }

  runGame(key) {
    switch (this.gameState) {
      case NEW: {
        SoundPlayer.play(BACKGROUND_MUSIC, 0.5, true);
        const countdownFinished = this.gameField.drawCountdown();
        if (countdownFinished) {
          this.gameState = RUNNING;
        }
        break;
      }
      case RUNNING:
        SoundPlayer.play(BACKGROUND_MUSIC, 0.5, true);
        this.gameField.updatePos(key);
        this.gameField.updateField();
        if (this.gameField.stackState === NOT_UPDATABLE) {
          this.switchGameStates(ENDING);
        } else {
          this.updatePoints();
          const canLevelUp = this.levelPoints >= (10 * this.level);
          if (canLevelUp) {
            this.level = this.increaseLevel(this.level);
            this.speed = MyTetris.calculateSpeed(this.level);
          }
        }
        break;
      case PAUSED:
        SoundPlayer.fadeAudioOut(BACKGROUND_MUSIC);
        SoundPlayer.fadeAudioOut(ON_EDGE_SOUND);
        this.gameField.drawPausedMessage();
        break;
      case ENDING:
        SoundPlayer.pause(BACKGROUND_MUSIC);
        SoundPlayer.pause(ON_EDGE_SOUND);
        this.gameField.drawGameOverMessage();
        this.gameState = ENDED;
        this.changePlayButton();
        this.switchAnimationState(false);
        break;
      default:
        break;
    }
  }

  switchGameStates(newState, newSpeed) {
    if (newSpeed) {
      this.tempSpeed = this.speed;
      this.speed = newSpeed;
    }
    this.switchAnimationState(false);
    this.lastRender = -1;
    this.gameState = newState;
    this.changePlayButton();
    this.switchAnimationState(true);
  }

  changePlayButton() {
    switch (this.gameState) {
      case ENDED:
        this.playButton.innerText = 'Try again';
        this.playButton.classList.remove('btn-danger');
        this.playButton.classList.add('btn-light');
        break;
      case PAUSED:
        this.playButton.innerText = 'Continue';
        this.playButton.classList.remove('btn-danger');
        this.playButton.classList.add('btn-success');
        break;
      default:
        this.playButton.innerText = 'Pause';
        this.playButton.classList.remove('btn-primary');
        this.playButton.classList.add('btn-danger');
    }
  }

  switchAnimationState(startAnimation) {
    if (startAnimation === false) {
      this.animationActive = false;
      cancelAnimationFrame(this.animationReference);
    } else {
      this.animationActive = true;
      this.animationReference = requestAnimationFrame((timestamp) => this.animate(timestamp));
    }
  }

  animate(timestamp) {
    if (this.animationActive) {
      if (this.gameState !== ENDED) {
        if (timestamp - this.lastRender >= this.speed) {
          this.lastRender = timestamp;
          this.runGame();
        }
        this.animationReference = requestAnimationFrame((timestamp) => this.animate(timestamp));
      }
    } else {
      cancelAnimationFrame(this.animationReference);
    }
  }

  updatePoints() {
    const clearedRowNum = this.gameField.checkClearedRows();
    if (clearedRowNum > 0) {
      this.levelPoints += clearedRowNum;
      this.points += MyTetris.calculatePoints(clearedRowNum, this.level);
      document.getElementById('score').innerText = (this.points).toString();
    }
  }

  increaseLevel(level) {
    SoundPlayer.play(LEVEL_UP_SOUND);
    GameField.addTextToCanvas(this.gameField.ctxMain, 'Level up!', this.gameField.blockSize * 0.8);
    document.getElementById('level').innerText = (this.level).toString();
    return level + 1;
  }

  static calculatePoints(clearedRowNum, level) {
    const pointsPerClearedRow = {
      1: 40, 2: 100, 3: 300, 4: 1200,
    };
    return pointsPerClearedRow[clearedRowNum] * level;
  }

  static calculateSpeed(level) {
    return 1000 * (0.9 - (level - 1) * 0.007) ** (level - 1);
  }
}

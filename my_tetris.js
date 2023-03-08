import GameField from './game_field.js';
import SoundPlayer from './sound_player.js';
import { GAME_STATES, STACK_STATES, SOUNDS } from './constants.js';

const {
  NEW, RUNNING, PAUSED, ENDING, ENDED,
} = GAME_STATES;
const { UNCHANGED, UPDATING, NOT_UPDATABLE } = STACK_STATES;
const { BACKGROUND_MUSIC } = SOUNDS;

export default class MyTetris {
  constructor(mainCanvasId, nextCanvasId, holdCanvasId, blockSize) {
    this.gameField = new GameField(mainCanvasId, nextCanvasId, holdCanvasId, blockSize);
    this.gameState = NEW;
    this.speed = 1000;
    this.levelPoints = 0;
    this.level = 1;
    this.points = 0;
    this.animationReference = null;
    this.lastRender = 0;
  }

  runGame(key) {
    switch (this.gameState) {
      case NEW:
        SoundPlayer.play(BACKGROUND_MUSIC);
        const countdownFinished = this.gameField.drawCountdown();
        countdownFinished ? this.gameState = RUNNING : NEW;
        break;
      case RUNNING:
        SoundPlayer.play(BACKGROUND_MUSIC);
        // this.runGame(key);
        this.gameField.updatePos(key);
        this.gameField.updateField();
        if (this.gameField.stackState === NOT_UPDATABLE) {
          this.gameState = ENDING;
        } else {
          const canLevelUp = this.updatePoints();
          if (canLevelUp) {
            this.increaseLevel();
            this.increaseSpeed();
          }
        }
        break;
      case PAUSED:
        SoundPlayer.fadeAudioOut(BACKGROUND_MUSIC);
        cancelAnimationFrame(this.animationReference);
        this.gameField.drawPausedMessage();
        break;
      case ENDING:
        SoundPlayer.pause(BACKGROUND_MUSIC);
        this.gameField.drawGameOverMessage();
        this.gameState = ENDED;
    }
  }

  animate(timestamp) {
    if (this.gameState !== ENDED) {
      if (timestamp - this.lastRender >= this.speed) {
        this.lastRender = timestamp;
        this.runGame();
      }
      this.animationReference = requestAnimationFrame((timestamp) => this.animate(timestamp));
    }
  }

  updatePoints() {
    const clearedRows = this.gameField.checkRows();
    if (clearedRows > 0) {
      this.levelPoints += clearedRows;
      this.points += clearedRows * 100 * this.level;
      document.getElementById('score').innerText = (this.points).toString();
      return this.levelPoints >= (5 * this.level);
    }
    return false;
  }

  increaseLevel() {
    this.level++;
    this.gameField.drawText(this.gameField.ctxMain, 'Level up!', 2);
    document.getElementById('level').innerText = (this.level).toString();
  }

  increaseSpeed() {
    this.speed = 1000 * (0.9 - (this.level - 1) * 0.007) ** (this.level - 1);
  }

  // runGame_(key) {
  //     this.gameField.updatePos(key);
  //     this.gameField.updateField();
  //     if (this.gameField.stackState === NOT_UPDATABLE) {
  //         this.gameState = ENDING;
  //     }
  //         // else if (this.gameField.fieldState === "update") {
  //         //     // console.log("here")
  //         //     this.gameState = "updating";
  //     // }
  //     else {
  //         let clearedRows = this.gameField.checkRows();
  //         this.levelPoints += clearedRows;
  //         this.points += clearedRows * 100 * this.level;
  //         document.getElementById("score").innerText = (this.points).toString();
  //         if (this.levelPoints >= (5 * this.level)) {
  //             this.level++;
  //             this.gameField.drawText(this.gameField.ctxMain, "Level up!", 2);
  //             document.getElementById("level").innerText = (this.level).toString();
  //             this.speed = 1000 * Math.pow((0.9 - (this.level - 1) * 0.007), this.level - 1);
  //             // this.tempSpeed = newSpeed;
  //         }
  //     }

  // }
}

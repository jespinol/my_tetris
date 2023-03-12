export default class SoundPlayer {
  static async play(sound, volumeLevel = 0.5, doLoop = false) {
    sound.volume = volumeLevel;
    sound.loop = doLoop;
    await sound.play();
  }

  static pause(sound) {
    if (!sound.pause()) {
      sound.pause();
    }
  }

  static fadeAudioOut(sound) {
    if (sound.volume > 0.5) {
      sound.volume = 0.5;
    }
    const volumeChange = 0.01;
    const targetVolume = 0.0;
    let currentVolume = sound.volume;
    const fadeAudio = setInterval(() => {
      currentVolume -= volumeChange;
      sound.volume = currentVolume.toFixed(1);
      if (sound.volume <= targetVolume) {
        clearInterval(fadeAudio);
      }
    }, 50);
  }

  static playWithVaryingVolRate(sound, currentRow) {
  static playOnEdgeFX(sound, currentRow) {
    const maxVolume = 2.0;
    const maxRate = 2.0;
    sound.volume = (maxVolume / (currentRow + 2)).toFixed(1);
    sound.playbackRate = (maxRate / (currentRow + 2)).toFixed(1);
    sound.loop = true;
    sound.play(sound);
  }
}

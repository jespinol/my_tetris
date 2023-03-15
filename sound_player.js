export default class SoundPlayer {
  // plays a sound with optional loop and volume settings
  static async playSound(sound, doLoop = false, volumeLevel = 0.5) {
    try {
      sound.volume = volumeLevel;
      sound.loop = doLoop;
      await sound.play();
    } catch (error) { /* empty */ }
  }

  // pauses a sound
  static pauseSound(sound) {
    try {
      sound.pause();
    } catch (error) { /* empty */ }
  }

  // fades out a sound
  static fadeSoundOut(sound) {
    try {
      const volumeChange = 0.01;
      const targetVolume = 0.0;
      let currentVolume = sound.volume;
      const fadeAudio = setInterval(() => {
        currentVolume -= volumeChange;
        sound.volume = currentVolume.toFixed(1);
        if (sound.volume <= targetVolume) {
          clearInterval(fadeAudio);
        }
      }, 25);
    } catch (error) { /* empty */ }
  }

  // plays a sound effect with varying volume and speed based on stack height
  static playOnEdgeSoundFX(sound, stackHeight) {
    try {
      const maxVolume = 2.0;
      const maxRate = 2.0;
      sound.volume = (maxVolume / (stackHeight + 2)).toFixed(1);
      sound.playbackRate = (maxRate / (stackHeight + 2)).toFixed(1);
      sound.loop = true;
      sound.play();
    } catch (error) { /* empty */ }
  }
}

import {SOUNDS} from "./constants.js";

const {BACKGROUND_MUSIC} = SOUNDS;

export default class SoundPlayer {

    static async play(sound, volumeLevel = 0.5, doLoop = false) {
        sound.volume = volumeLevel;
        sound.loop = doLoop;
        await sound.play();
    }

    static changeVolume(sound, volumeLevel) {
        sound.volume = volumeLevel;
    }

    static fadeAudioOut(sound) {
        let currentVolume = sound.volume;
        let volumeChange = 0.005;
        let targetVolume = 0;
        let fadeAudio = setInterval(function () {
            currentVolume -= volumeChange;
            sound.volume = currentVolume.toFixed(1);
            if (sound.volume <= targetVolume) {
                SoundPlayer.pause(sound);
                clearInterval(fadeAudio);
            }
        }, 50)
    }

    static pause(sound) {
        if (!sound.pause()) {
            sound.pause();
        }
    }
}
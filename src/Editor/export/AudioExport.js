var b64toBuff = require('base64-arraybuffer');
var toWav = require('audiobuffer-to-wav')

class AudioExport {
    static generateAudioFile = async (args) => {
        let {project, onProgress, soundInfo} = args;

        let audioArgs = {
            soundInfo: soundInfo,
            onProgress: onProgress,
        };

        return new Promise (resolve => {
            project.generateAudioTrack(audioArgs, audioBuffer => {
                if(!audioBuffer) {
                    resolve();
                } else {
                    var wavBuffer = toWav(audioBuffer);
                    resolve(new Uint8Array(wavBuffer));
                }
            });
        });
    }
}

export default AudioExport;

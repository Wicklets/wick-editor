var b64toBuff = require('base64-arraybuffer');
var toWav = require('audiobuffer-to-wav')

class AudioExport {
    static generateAudioFile = async (args) => {
        let {project, onProgress} = args;

        return new Promise (resolve => {
            project.generateAudioTrack({}, audioBuffer => {
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

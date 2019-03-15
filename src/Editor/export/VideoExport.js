class VideoExport {
  /**
   * Create a video from a Wick project.
   * @param {Wick.Project} project - the Wick project to create a video out of.
   * @param {function} done - Callback that passes the video file as a blob when the video is done rendering.
   */
  static renderProjectAsVideo (project, done) {
    // Steps to generate a video:
    // (1) Download ffmpeg and cache it in localforage (it's a huge file.)
    // (2) Get the image sequence and audio sequence from the project.
    // (3) Merge audio sequence into single audio track using ffmpeg OR by manually adding the buffers of the sounds together.
    // (4) Render a video from the image sequence using ffmpeg.
    // (5) Merge the video and audio files together using ffmpeg.
  }
}

export default VideoExport;

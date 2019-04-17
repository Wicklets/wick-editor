describe('Wick.Frame', function() {
    var TEST_SOUND_SRC_WAV = 'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=';
    var TEST_SOUND_SRC_MP3 = 'data:audio/mp3;base64,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VVVVVVVVVVVV//sQZMyP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk7o/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OC4yVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuOTguMlVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EGT/j/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZP+P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBk/4/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUFQRVRBR0VY0AcAAFAAAAACAAAAAAAAoAAAAAAAAAAADgAAAAAAAABBcnRpc3QAU291bmRCaWJsZS5jb20FAAAAAAAAAEdlbnJlAE90aGVyQVBFVEFHRVjQBwAAUAAAAAIAAAAAAACAAAAAAAAAAABUQUcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABTb3VuZEJpYmxlLmNvbQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADA==';

    describe('#constructor', function () {
        it('should instatiate correctly', function() {
            var frame = new Wick.Frame();
            expect(frame.start).to.equal(1);
            expect(frame.end).to.equal(1);
            expect(frame instanceof Wick.Base).to.equal(true);
            expect(frame instanceof Wick.Tickable).to.equal(true);
            expect(frame instanceof Wick.Frame).to.equal(true);
            expect(frame.classname).to.equal('Frame');
            expect(frame.scripts instanceof Array).to.equal(true);
            expect(frame.scripts.length).to.equal(0);
            expect(frame.clips instanceof Array).to.equal(true);
            expect(frame.clips.length).to.equal(0);
            expect(frame.paths instanceof Array).to.equal(true);
            expect(frame.paths.length).to.equal(0);
            expect(frame.tweens instanceof Array).to.equal(true);
            expect(frame.tweens.length).to.equal(0);

            expect(frame.start).to.equal(1);
            expect(frame.end).to.equal(1);
            expect(frame.length).to.equal(1);
            expect(frame.midpoint).to.equal(1);

            frame = new Wick.Frame(5);
            expect(frame.start).to.equal(5);
            expect(frame.end).to.equal(5);
            expect(frame.length).to.equal(1);
            expect(frame.midpoint).to.equal(5);

            frame = new Wick.Frame(5,10);
            expect(frame.start).to.equal(5);
            expect(frame.end).to.equal(10);
            expect(frame.length).to.equal(6);
            expect(frame.midpoint).to.equal(7.5);
        });
    });

    describe('#serialize', function () {
        it('should serialize correctly', function() {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            frame.addTween(new Wick.Tween());
            frame.addClip(new Wick.Clip());
            frame.addClip(new Wick.Button());
            frame.addPath(new Wick.Path());
            frame.identifier = 'foo';

            var data = frame.serialize();

            expect(data.classname).to.equal('Frame');
            expect(data.identifier).to.equal('foo');
            expect(data.start).to.equal(frame.start);
            expect(data.end).to.equal(frame.end);
            expect(data.clips.length).to.equal(2);
            expect(data.clips[0].classname).to.equal('Clip');
            expect(data.clips[1].classname).to.equal('Button');
            expect(data.paths[0].classname).to.equal('Path');
            expect(data.tweens.length).to.equal(1);
            expect(data.tweens[0].classname).to.equal('Tween');
        });
    });

    describe('#deserialize', function () {
        it('should deserialize correctly', function() {
            var data = {
                classname: 'Frame',
                identifier: 'foo',
                tweens: [new Wick.Tween().serialize()],
                clips: [
                    new Wick.Clip().serialize(),
                    new Wick.Button().serialize(),
                ],
                scripts: [],
                start: 4,
                end: 8,
                paths: [
                    new Wick.Path().serialize(),
                ],
            };
            var frame = Wick.Frame.deserialize(data);

            expect(frame instanceof Wick.Frame).to.equal(true);
            expect(frame.identifier).to.equal('foo');
            expect(frame.tweens.length).to.equal(1);
            expect(frame.tweens[0] instanceof Wick.Tween).to.equal(true);
            expect(frame.clips.length).to.equal(2);
            expect(frame.clips[0] instanceof Wick.Clip).to.equal(true);
            expect(frame.clips[1] instanceof Wick.Button).to.equal(true);
            expect(frame.paths[0] instanceof Wick.Path).to.equal(true);
            expect(frame.scripts.length).to.equal(0);
            expect(frame.start).to.equal(data.start);
            expect(frame.end).to.equal(data.end);
        });
    });

    describe('#inPosition', function () {
        it('inPosition should be calculated correctly', function() {
            var frame = new Wick.Frame();
            expect(frame.inPosition(1)).to.equal(true);
            expect(frame.inPosition(2)).to.equal(false);

            frame = new Wick.Frame(5,10);
            expect(frame.inPosition(1)).to.equal(false);
            expect(frame.inPosition(4)).to.equal(false);
            expect(frame.inPosition(5)).to.equal(true);
            expect(frame.inPosition(7)).to.equal(true);
            expect(frame.inPosition(10)).to.equal(true);
            expect(frame.inPosition(11)).to.equal(false);
        });
    });

    describe('#inRange', function () {
        it('inRange should be calculated correctly', function() {
            var frame = new Wick.Frame();
            expect(frame.inRange(1,1)).to.equal(true);
            expect(frame.inRange(1,2)).to.equal(true);
            expect(frame.inRange(2,2)).to.equal(false);
            expect(frame.inRange(2,3)).to.equal(false);
            expect(frame.inRange(3,10)).to.equal(false);

            frame = new Wick.Frame(5,10);
            expect(frame.inRange(1,1)).to.equal(false);
            expect(frame.inRange(1,4)).to.equal(false);
            expect(frame.inRange(1,5)).to.equal(true);
            expect(frame.inRange(5,5)).to.equal(true);
            expect(frame.inRange(5,10)).to.equal(true);
            expect(frame.inRange(4,6)).to.equal(true);
            expect(frame.inRange(9,11)).to.equal(true);
            expect(frame.inRange(10,11)).to.equal(true);
            expect(frame.inRange(11,15)).to.equal(false);
        });
    });

    describe('#contentful', function () {
        it('should determine contentful correctly', function() {
            var frameEmpty = new Wick.Frame();

            var frameOnePath = new Wick.Frame();
            frameOnePath.addPath(new Wick.Path());

            var frameOneClip = new Wick.Frame();
            frameOneClip.addClip(new Wick.Clip());

            var frameOneClipOnePath = new Wick.Frame();
            frameOneClipOnePath.addPath(new Wick.Path());
            frameOneClipOnePath.addClip(new Wick.Clip());

            expect(frameEmpty.contentful).to.equal(false);
            expect(frameOnePath.contentful).to.equal(true);
            expect(frameOneClip.contentful).to.equal(true);
            expect(frameOneClipOnePath.contentful).to.equal(true);
        });
    });

    describe('#getActiveTween', function () {
        it('should calculate active tween', function () {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            frame.end = 9;

            var tweenA = new Wick.Tween(1, new Wick.Transformation(0, 0, 1, 1, 0, 1), 0);
            var tweenB = new Wick.Tween(5, new Wick.Transformation(100, 200, 2, 0.5, 180, 0.0), 0);
            var tweenC = new Wick.Tween(9, new Wick.Transformation(100, 200, 2, 0.5, 180, 1.0), 0);
            frame.addTween(tweenA);
            frame.addTween(tweenB);
            frame.addTween(tweenC);

            // Existing tweens
            project.root.timeline.playheadPosition = 1;
            expect(frame.getActiveTween()).to.equal(tweenA);

            project.root.timeline.playheadPosition = 5;
            expect(frame.getActiveTween()).to.equal(tweenB);

            project.root.timeline.playheadPosition = 9;
            expect(frame.getActiveTween()).to.equal(tweenC);

            // Interpolated tweens
            project.root.timeline.playheadPosition = 3;
            var tweenAB = frame.getActiveTween();
            expect(tweenAB.playheadPosition).to.equal(3);
            expect(tweenAB.transform.x).to.be.closeTo(50, 0.01);
            expect(tweenAB.transform.y).to.be.closeTo(100, 0.01);
            expect(tweenAB.transform.scaleX).to.be.closeTo(1.5, 0.01);
            expect(tweenAB.transform.scaleY).to.be.closeTo(0.75, 0.01);
            expect(tweenAB.transform.rotation).to.be.closeTo(90, 0.01);
            expect(tweenAB.transform.opacity).to.be.closeTo(0.5, 0.01);

            project.root.timeline.playheadPosition = 7;
            var tweenBC = frame.getActiveTween();
            expect(tweenBC.playheadPosition).to.equal(7);
            expect(tweenBC.transform.x).to.be.closeTo(100, 0.01);
            expect(tweenBC.transform.y).to.be.closeTo(200, 0.01);
            expect(tweenBC.transform.scaleX).to.be.closeTo(2, 0.01);
            expect(tweenBC.transform.scaleY).to.be.closeTo(0.5, 0.01);
            expect(tweenBC.transform.rotation).to.be.closeTo(180, 0.01);
            expect(tweenBC.transform.opacity).to.be.closeTo(0.5, 0.01);
        });
    });

    describe('#applyTweenTransforms', function () {
        it('applyTweenTransforms should work correctly', function () {
            var project = new Wick.Project();

            var frame = project.activeFrame;
            var clip = new Wick.Clip();
            frame.addClip(clip);
            frame.addTween(new Wick.Tween(1, new Wick.Transformation(100, 200, 2, 0.5, 180, 0.25), 0));

            frame.applyTweenTransforms();

            expect(clip.transform.x).to.be.closeTo(100, 0.01);
            expect(clip.transform.y).to.be.closeTo(200, 0.01);
            expect(clip.transform.scaleX).to.be.closeTo(2, 0.01);
            expect(clip.transform.scaleY).to.be.closeTo(0.5, 0.01);
            expect(clip.transform.rotation).to.be.closeTo(180, 0.01);
            expect(clip.transform.opacity).to.be.closeTo(0.25, 0.01);
        });
    });

    describe('#tick', function () {
        it('script errors from child clips should bubble up', function() {
            var frame = new Wick.Frame();

            var child = new Wick.Clip();
            child.addScript('load', 'thisWillCauseAnError()');
            frame.addClip(child);

            var error = frame.tick();
            expect(error).to.not.equal(null);
            expect(error.message).to.equal('thisWillCauseAnError is not defined');
            expect(error.lineNumber).to.equal(1);
            expect(error.uuid).to.equal(child.uuid);
        });

        it('script errors from child frames should bubble up', function() {
            var frame = new Wick.Frame();

            var child = new Wick.Frame();
            child.addScript('load', 'thisWillCauseAnError()');
            frame.addClip(new Wick.Clip());
            frame.clips[0].timeline.addLayer(new Wick.Layer());
            frame.clips[0].timeline.layers[0].addFrame(child);

            var error = frame.tick();
            expect(error).to.not.equal(null);
            expect(error.message).to.equal('thisWillCauseAnError is not defined');
            expect(error.lineNumber).to.equal(1);
            expect(error.uuid).to.equal(child.uuid);
        });

        it('frames should have access to global API', function() {
            var project = new Wick.Project();

            var frame = project.activeFrame;

            frame.addScript('load', 'stop(); play();');
            var error = frame.tick();
            expect(error).to.equal(null);
        });

        describe('#project', function () {
            it('project should work as expected', function() {
                var project = new Wick.Project();

                var frame = project.activeFrame;

                frame.addScript('load', 'this.__project = project');
                var error = frame.tick();
                expect(error).to.equal(null);
                expect(frame.__project).to.equal(project.root);
                expect(frame.__project.width).to.equal(project.width);
                expect(frame.__project.height).to.equal(project.height);
                expect(frame.__project.framerate).to.equal(project.framerate);
                expect(frame.__project.backgroundColor).to.equal(project.backgroundColor);
                expect(frame.__project.name).to.equal(project.name);
            });
        });

        describe('#parent', function () {
            it('project should work as expected', function() {
                var project = new Wick.Project();

                var frame = project.activeFrame;

                frame.addScript('load', 'this.__parent = parent');
                var error = frame.tick();
                expect(error).to.equal(null);
                expect(frame.__parent).to.equal(frame.parentClip);
            });
        });

        it('frames should have access to other named objects', function() {
            var project = new Wick.Project();

            var clipA = new Wick.Clip();
            clipA.identifier = 'foo';
            project.activeFrame.addClip(clipA);

            var clipB = new Wick.Clip();
            clipB.identifier = 'bar';
            project.activeFrame.addClip(clipB);

            var clipC = new Wick.Clip();
            project.activeFrame.addClip(clipC);

            var frame = project.activeFrame;

            frame.addScript('load', 'this.__foo = foo; this.__bar = bar;');
            var error = frame.tick();
            expect(error).to.equal(null);
            expect(frame.__foo).to.equal(clipA);
            expect(frame.__bar).to.equal(clipB);
        });

        it('frames should not have access to other named objects on other frames', function() {
            var project = new Wick.Project();
            var frame = new Wick.Frame(2);
            project.root.timeline.activeLayer.addFrame(frame);
            project.root.timeline.playheadPosition = 2;

            var clipA = new Wick.Clip();
            clipA.identifier = 'foo';
            project.activeLayer.frames[0].addClip(clipA);

            var clipB = new Wick.Clip();
            clipB.identifier = 'bar';
            project.activeLayer.frames[0].addClip(clipB);

            frame.addScript('load', 'console.log(bar); this.__bar = bar;');
            var error = project.tick();
            expect(error).not.to.equal(null);
            expect(error.message).to.equal("bar is not defined");
        });

        it('should play/stop sounds', function() {
            var project = new Wick.Project();

            var frame1 = project.activeFrame;
            frame1.end = 5;
            var frame2 = new Wick.Frame(6,10);
            project.activeLayer.addFrame(frame2);
            var frame3 = new Wick.Frame(11,15);
            project.activeLayer.addFrame(frame3);

            var sound1 = new Wick.SoundAsset('test.wav', TEST_SOUND_SRC_WAV);
            var sound2 = new Wick.SoundAsset('test.mp3', TEST_SOUND_SRC_WAV);
            project.addAsset(sound1);
            project.addAsset(sound2);

            frame1.sound = sound1;
            frame2.sound = sound2;

            expect(frame1.isSoundPlaying()).to.equal(false);
            expect(frame2.isSoundPlaying()).to.equal(false);

            project.root.tick(); // playhead = 1

            expect(frame1.isSoundPlaying()).to.equal(true);
            expect(frame2.isSoundPlaying()).to.equal(false);

            project.root.tick(); // playhead = 2
            project.root.tick(); // playhead = 3
            project.root.tick(); // playhead = 4
            project.root.tick(); // playhead = 5
            project.root.tick(); // playhead = 6

            expect(frame1.isSoundPlaying()).to.equal(false);
            expect(frame2.isSoundPlaying()).to.equal(true);

            project.root.tick(); // playhead = 7
            project.root.tick(); // playhead = 8
            project.root.tick(); // playhead = 9
            project.root.tick(); // playhead = 10
            project.root.tick(); // playhead = 11

            expect(frame1.isSoundPlaying()).to.equal(false);
            expect(frame2.isSoundPlaying()).to.equal(false);
        });
    });
});

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

console.log('Testing FFmpeg...');
console.log('FFmpeg Path:', ffmpegPath);

ffmpeg.setFfmpegPath(ffmpegPath);

ffmpeg.getAvailableFormats(function(err, formats) {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('FFmpeg is working! Available formats:', Object.keys(formats).length);
  }
});

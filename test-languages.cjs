const { YoutubeTranscript } = require('youtube-transcript');

console.log('Testing available languages...');

// Test with a popular video that should have transcripts
const videoId = 'dQw4w9WgXcQ';

YoutubeTranscript.fetchTranscript(videoId)
  .then(transcript => {
    console.log('✅ Default fetch success!');
    console.log('Segments found:', transcript.length);
    if (transcript.length > 0) {
      console.log('First segment:', transcript[0]);
      console.log('Sample text:', transcript.slice(0, 3).map(t => t.text).join(' '));
    }
  })
  .catch(error => {
    console.log('❌ Default fetch error:', error.message);
    
    // Try with explicit language list
    console.log('\nTrying without language specification...');
    return YoutubeTranscript.fetchTranscript(videoId, {});
  })
  .then(transcript => {
    if (transcript && transcript.length > 0) {
      console.log('✅ No-lang success!');
      console.log('Segments found:', transcript.length);
      console.log('First segment:', transcript[0]);
    }
  })
  .catch(error => {
    console.log('❌ All attempts failed:', error.message);
  });
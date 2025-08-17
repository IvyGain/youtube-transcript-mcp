const { YoutubeTranscript } = require('youtube-transcript');

console.log('Testing YouTube Transcript library...');

YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ', { lang: 'en' })
  .then(transcript => {
    console.log('✅ Success!');
    console.log('Segments found:', transcript.length);
    console.log('\nFirst segment:', transcript[0]);
    console.log('\nFirst 200 chars:', 
      transcript.slice(0, 5).map(t => t.text).join(' ').substring(0, 200));
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
    
    // Try with another video
    console.log('\nTrying with another video...');
    return YoutubeTranscript.fetchTranscript('w3PpSk--25c', { lang: 'en' });
  })
  .then(transcript => {
    if (transcript) {
      console.log('✅ English Success!');
      console.log('Segments found:', transcript.length);
      console.log('\nFirst segment:', transcript[0]);
    }
  })
  .catch(error => {
    console.log('❌ English also failed:', error.message);
  });
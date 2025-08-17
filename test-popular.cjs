const { YoutubeTranscript } = require('youtube-transcript');

console.log('Testing with popular videos that should have transcripts...');

// List of popular videos that likely have transcripts
const testVideos = [
  'jNQXAC9IVRw', // Me at the zoo (first YouTube video)
  'kJQP7kiw5Fk', // Despacito
  'fJ9rUzIMcZQ', // Bohemian Rhapsody
  '9bZkp7q19f0'  // Gangnam Style
];

async function testVideo(videoId) {
  console.log(`\n--- Testing video: ${videoId} ---`);
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`✅ Success! Segments: ${transcript.length}`);
    if (transcript.length > 0) {
      console.log(`First segment: ${transcript[0].text}`);
      console.log(`Sample: ${transcript.slice(0, 3).map(t => t.text).join(' ')}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  return false;
}

async function runTests() {
  let successCount = 0;
  
  for (const videoId of testVideos) {
    const success = await testVideo(videoId);
    if (success) successCount++;
  }
  
  console.log(`\n=== Results: ${successCount}/${testVideos.length} videos had transcripts ===`);
}

runTests();
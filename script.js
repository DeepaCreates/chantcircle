// Elements
const chantAudio = document.getElementById('chant-audio');
const activeUsersEl = document.getElementById('active-users');
const chantTimerEl = document.getElementById('chant-timer');
const startBtn = document.getElementById('start-chant');
const stopBtn = document.getElementById('stop-chant');
const muteToggle = document.getElementById('mute-toggle');
const commentBox = document.getElementById('comment');
const submitCommentBtn = document.getElementById('submit-comment');
const commentsList = document.getElementById('comments-list');

let timer, timeLeft = 300;
let isMuted = true;
let mediaStream = null;
let audioContext = null;
let audioSources = [];
let gainNode = null;

// Simulate active users and chant synchronization
function updateActiveUsers(change) {
  const currentCount = parseInt(localStorage.getItem('activeUsers')) || 0;
  const newCount = Math.max(currentCount + change, 0);
  localStorage.setItem('activeUsers', newCount);
  broadcastChanterCount(newCount);
}

// Continuously update active user count across windows
function broadcastChanterCount(count) {
  localStorage.setItem('activeUsers', count);
  activeUsersEl.textContent = count;
}

// Listen for changes to active user count in other windows
window.addEventListener('storage', (event) => {
  if (event.key === 'activeUsers') {
    activeUsersEl.textContent = event.newValue || 0;
  }
});

// Start Chanting
function startChant() {
  chantAudio.play();
  stopBtn.disabled = false;
  startBtn.disabled = true;
  localStorage.setItem('chanting', 'true');
  updateActiveUsers(1);

  // Listen to others
  startListeningToOthers();

  // Timer logic
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      chantTimerEl.textContent = timeLeft;
    } else {
      stopChant();
    }
  }, 1000);
}

// Stop Chanting
function stopChant() {
  chantAudio.pause();
  stopBtn.disabled = true;
  startBtn.disabled = false;
  clearInterval(timer);
  localStorage.setItem('chanting', 'false');
  updateActiveUsers(-1);

  // Stop listening to others
  stopListeningToOthers();

  // If microphone is active, stop the stream
  if (mediaStream) {
    const tracks = mediaStream.getTracks();
    tracks.forEach((track) => track.stop());
    mediaStream = null;
  }
  muteToggle.textContent = 'Unmute Myself';
  isMuted = true;
}

// Unmute Myself (Enable microphone access)
muteToggle.addEventListener('click', async () => {
  if (isMuted) {
    try {
      // Request microphone access
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = mediaStream.getAudioTracks()[0];

      // Send audio track to the mix for others
      syncChantInput(audioTrack);

      muteToggle.textContent = 'Mute Myself';
      isMuted = false;
      console.log('Microphone is now active for broadcasting.');
    } catch (error) {
      alert('Microphone access denied. Please allow microphone permissions to be heard by others.');
    }
  } else {
    // Mute microphone
    if (mediaStream) {
      const tracks = mediaStream.getTracks();
      tracks.forEach((track) => track.stop());
      mediaStream = null;
    }
    muteToggle.textContent = 'Unmute Myself';
    isMuted = true;
    console.log('Microphone has been muted.');
  }
});

// Listen to Others
function startListeningToOthers() {
  if (!audioContext) {
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }

  // Simulate streams from other users
  const fakeStream = new Audio(`chant.mp3`);
  const source = audioContext.createMediaElementSource(fakeStream);
  source.connect(gainNode);
  fakeStream.play();

  audioSources.push(source);
}

function stopListeningToOthers() {
  audioSources.forEach((source) => {
    source.disconnect();
  });
  audioSources = [];
}

// Sync Chant Input (AI Sync Magic)
function syncChantInput(audioTrack) {
  const context = new AudioContext();
  const source = context.createMediaStreamSource(new MediaStream([audioTrack]));
  const gain = context.createGain();

  // Process chant audio
  source.connect(gain);
  gain.connect(context.destination);

  // Align chant audio to match the tempo
  const processor = context.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (event) => {
    const inputData = event.inputBuffer.getChannelData(0);
    const outputData = event.outputBuffer.getChannelData(0);

    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i]; // Basic pass-through for now
    }
  };

  source.connect(processor);
  processor.connect(context.destination);
}

// Display Comments
function loadComments() {
  const comments = JSON.parse(localStorage.getItem('comments')) || [];
  commentsList.innerHTML = '';
  comments.forEach(comment => {
    const li = document.createElement('li');
    li.textContent = `[${new Date(comment.timestamp).toLocaleString()}] ${comment.text}`;
    commentsList.appendChild(li);
  });
}

// Submit Feedback
submitCommentBtn.addEventListener('click', () => {
  const commentText = commentBox.value.trim();
  if (commentText) {
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    comments.push({ text: commentText, timestamp: Date.now() });
    localStorage.setItem('comments', JSON.stringify(comments));
    commentBox.value = '';
    loadComments();
  }
});

// Event Listeners
startBtn.addEventListener('click', startChant);
stopBtn.addEventListener('click', stopChant);

// Initialize App State
updateActiveUsers(0);
loadComments();

// Sync chant state
function syncChantState() {
  if (localStorage.getItem('chanting') === 'true') {
    chantAudio.play();
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    chantAudio.pause();
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}
syncChantState();

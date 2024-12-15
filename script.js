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
let isMuted = false;

// Simulate active users and chant synchronization
function updateActiveUsers(change) {
  const currentCount = parseInt(localStorage.getItem('activeUsers')) || 0;
  const newCount = Math.max(currentCount + change, 0);
  localStorage.setItem('activeUsers', newCount);
  activeUsersEl.textContent = newCount;
}

// Initialize active users count
updateActiveUsers(0);

// Synchronize chanting state
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

// Start Chanting
function startChant() {
  chantAudio.play();
  stopBtn.disabled = false;
  startBtn.disabled = true;
  localStorage.setItem('chanting', 'true');
  updateActiveUsers(1);

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
}

// Mute/Unmute Myself
muteToggle.addEventListener('click', () => {
  isMuted = !isMuted;
  chantAudio.muted = isMuted;
  muteToggle.textContent = isMuted ? 'Unmute Myself' : 'Mute Myself';
});

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
syncChantState();

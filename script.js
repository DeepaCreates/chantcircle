// Elements
const chantAudio = document.getElementById('chant-audio');
const activeUsersEl = document.getElementById('active-users');
const chantTimerEl = document.getElementById('chant-timer');
const startBtn = document.getElementById('start-chant');
const stopBtn = document.getElementById('stop-chant');
const muteToggle = document.getElementById('mute-toggle');
const commentBox = document.getElementById('comment');
const submitCommentBtn = document.getElementById('submit-comment');


let timer, timeLeft = 300;


// Simulate active users using localStorage
function updateActiveUsers(change) {
  const currentCount = parseInt(localStorage.getItem('activeUsers')) || 0;
  const newCount = Math.max(currentCount + change, 0);
  localStorage.setItem('activeUsers', newCount);
  activeUsersEl.textContent = newCount;
}


// Initialize active users count
updateActiveUsers(0);


// Start Chanting
function startChant() {
  chantAudio.play();
  stopBtn.disabled = false;
  startBtn.disabled = true;
  updateActiveUsers(1);
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
  updateActiveUsers(-1);
}


// Mute Toggle
muteToggle.addEventListener('click', () => {
  chantAudio.muted = !chantAudio.muted;
  muteToggle.textContent = chantAudio.muted ? 'Unmute Myself' : 'Mute Myself';
});


// Feedback Submission
submitCommentBtn.addEventListener('click', () => {
  const comment = commentBox.value.trim();
  if (comment) {
    alert('Thank you for your feedback: ' + comment);
    commentBox.value = '';
  }
});


// Event Listeners
startBtn.addEventListener('click', startChant);
stopBtn.addEventListener('click', stopChant);
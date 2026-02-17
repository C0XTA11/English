const vocabulary = [
  { word: 'apple', emoji: '🍎', sentence: 'I eat an apple every day.' },
  { word: 'book', emoji: '📘', sentence: 'This is my English book.' },
  { word: 'cat', emoji: '🐱', sentence: 'The cat is under the chair.' },
  { word: 'dog', emoji: '🐶', sentence: 'My dog is very friendly.' },
  { word: 'house', emoji: '🏠', sentence: 'My house is small and clean.' },
  { word: 'water', emoji: '💧', sentence: 'Please drink water.' },
  { word: 'sun', emoji: '☀️', sentence: 'The sun is bright today.' },
  { word: 'banana', emoji: '🍌', sentence: 'I like a yellow banana.' }
];

const roundEl = document.getElementById('round');
const totalRoundsEl = document.getElementById('total-rounds');
const starsEl = document.getElementById('stars');
const emojiEl = document.getElementById('emoji');
const wordEl = document.getElementById('word');
const sentenceEl = document.getElementById('sentence');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const progressFillEl = document.getElementById('progress-fill');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again');
const summaryEl = document.getElementById('summary');
const summaryTextEl = document.getElementById('summary-text');
const speakBtn = document.getElementById('speak-btn');
const soundToggleBtn = document.getElementById('sound-toggle');

const totalRounds = vocabulary.length;
let round = 0;
let stars = 0;
let canAnswer = true;
let soundOn = true;
let current = null;
let deck = [];

totalRoundsEl.textContent = totalRounds;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function speak(text) {
  if (!soundOn || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function buildOptions(correctWord) {
  const distractors = shuffle(vocabulary.filter((item) => item.word !== correctWord.word)).slice(0, 3);
  return shuffle([correctWord, ...distractors]);
}

function setFeedback(message, good = false) {
  feedbackEl.textContent = message;
  feedbackEl.style.color = good ? '#179763' : '#b3407b';
}

function updateProgress() {
  roundEl.textContent = Math.min(round + 1, totalRounds);
  starsEl.textContent = stars;
  progressFillEl.style.width = `${(round / totalRounds) * 100}%`;
}

function renderRound() {
  if (round >= totalRounds) {
    showSummary();
    return;
  }

  current = deck[round];
  canAnswer = true;
  nextBtn.disabled = true;
  setFeedback('Choose an answer to continue.');

  emojiEl.textContent = current.emoji;
  wordEl.textContent = current.word;
  sentenceEl.textContent = current.sentence;

  optionsEl.innerHTML = '';
  const options = buildOptions(current);

  options.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option';
    button.innerHTML = `<span>${item.emoji}</span> <span>${item.word}</span>`;

    button.addEventListener('click', () => {
      if (!canAnswer) return;
      canAnswer = false;

      const isCorrect = item.word === current.word;
      if (isCorrect) {
        stars += 1;
        button.classList.add('correct');
        setFeedback(`Fantastic! "${current.word}" is correct! ⭐`, true);
        speak(`Great! ${current.word}`);
      } else {
        button.classList.add('wrong');
        setFeedback(`Nice try! The right answer is "${current.word}".`, false);
        speak(`Try again next round. ${current.word}`);

        [...optionsEl.children].forEach((child) => {
          if (child.textContent.includes(current.word)) {
            child.classList.add('correct');
          }
        });
      }

      starsEl.textContent = stars;
      nextBtn.disabled = false;
    });

    optionsEl.appendChild(button);
  });

  updateProgress();
  speak(current.word);
}

function showSummary() {
  progressFillEl.style.width = '100%';
  summaryEl.classList.remove('hidden');
  summaryTextEl.textContent = `You got ${stars} out of ${totalRounds} stars. Keep practicing and you will become a word champion!`;
  nextBtn.disabled = true;
}

function resetGame() {
  round = 0;
  stars = 0;
  deck = shuffle(vocabulary);
  summaryEl.classList.add('hidden');
  updateProgress();
  renderRound();
}

nextBtn.addEventListener('click', () => {
  round += 1;
  renderRound();
});

restartBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

speakBtn.addEventListener('click', () => {
  if (current) {
    speak(current.word);
  }
});

soundToggleBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggleBtn.textContent = soundOn ? '🔊 Sound ON' : '🔈 Sound OFF';
  soundToggleBtn.setAttribute('aria-pressed', String(soundOn));
  if (!soundOn && 'speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
});

resetGame();

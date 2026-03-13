const WORDS = [
  { word: 'apple', emoji: '🍎', sentence: 'I eat an ___ after lunch.', blank: 'apple' },
  { word: 'book', emoji: '📘', sentence: 'She reads a ___ every night.', blank: 'book' },
  { word: 'cat', emoji: '🐱', sentence: 'The ___ is sleeping on the sofa.', blank: 'cat' },
  { word: 'dog', emoji: '🐶', sentence: 'My ___ likes to run in the park.', blank: 'dog' },
  { word: 'house', emoji: '🏠', sentence: 'Their ___ is near the school.', blank: 'house' },
  { word: 'water', emoji: '💧', sentence: 'Please drink more ___.', blank: 'water' },
  { word: 'sun', emoji: '☀️', sentence: 'The ___ is very bright today.', blank: 'sun' },
  { word: 'banana', emoji: '🍌', sentence: 'He buys a ___ at the store.', blank: 'banana' },
  { word: 'car', emoji: '🚗', sentence: 'The red ___ is very fast.', blank: 'car' },
  { word: 'tree', emoji: '🌳', sentence: 'A tall ___ grows in front of the house.', blank: 'tree' },
  { word: 'milk', emoji: '🥛', sentence: 'I drink ___ in the morning.', blank: 'milk' },
  { word: 'school', emoji: '🏫', sentence: 'We go to ___ at 8 a.m.', blank: 'school' },
  { word: 'fish', emoji: '🐟', sentence: 'The ___ swims in clean water.', blank: 'fish' },
  { word: 'bread', emoji: '🍞', sentence: 'They eat ___ for breakfast.', blank: 'bread' },
  { word: 'bird', emoji: '🐦', sentence: 'A small ___ sings in the tree.', blank: 'bird' },
  { word: 'phone', emoji: '📱', sentence: 'Her ___ rings loudly.', blank: 'phone' }
];

const MODE_LABELS = ['Emoji ➜ Word', 'Word ➜ Emoji', 'Listen ➜ Word', 'Fill the Blank'];

const els = {
  score: document.getElementById('score'),
  streak: document.getElementById('streak'),
  mode: document.getElementById('mode'),
  energyFill: document.getElementById('energy-fill'),
  energyValue: document.getElementById('energy-value'),
  prompt: document.getElementById('prompt'),
  question: document.getElementById('question'),
  options: document.getElementById('options'),
  feedback: document.getElementById('feedback'),
  gameOver: document.getElementById('game-over'),
  finalScore: document.getElementById('final-score'),
  rating: document.getElementById('rating'),
  playAgain: document.getElementById('play-again'),
  soundToggle: document.getElementById('sound-toggle'),
  audioBtn: document.getElementById('audio-btn'),
  card: document.getElementById('card')
};

const state = {
  score: 0,
  streak: 0,
  energy: 100,
  soundOn: true,
  modeIndex: 0,
  activeAnswer: '',
  canAnswer: true,
  timerId: null
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function randomWord(except = '') {
  const pool = except ? WORDS.filter((item) => item.word !== except) : WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function speak(text) {
  if (!state.soundOn || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.87;
  utterance.pitch = 1.07;
  utterance.lang = 'en-US';
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function setFeedback(text, type = '') {
  els.feedback.textContent = text;
  els.feedback.className = `feedback ${type}`.trim();
}

function updateEnergyBar() {
  const clamped = Math.max(0, Math.min(100, state.energy));
  els.energyFill.style.width = `${clamped}%`;
  els.energyValue.textContent = `${Math.round(clamped)}%`;
  els.energyFill.classList.toggle('low', clamped <= 28);
}

function buildOptions(correctWord, field = 'word') {
  const distractors = shuffle(WORDS.filter((item) => item.word !== correctWord.word)).slice(0, 3);
  return shuffle([correctWord, ...distractors]).map((item) => ({
    value: item.word,
    label: field === 'emoji' ? item.emoji : item.word
  }));
}

function renderQuestion() {
  const current = randomWord();
  const mode = state.modeIndex % 4;
  state.modeIndex += 1;

  els.mode.textContent = MODE_LABELS[mode];
  els.options.innerHTML = '';
  els.audioBtn.classList.add('hidden');
  els.card.classList.remove('pop');
  void els.card.offsetWidth;
  els.card.classList.add('pop');

  state.activeAnswer = current.word;
  state.canAnswer = true;

  if (mode === 0) {
    els.prompt.textContent = 'Choose the correct English word for this emoji:';
    els.question.textContent = current.emoji;
    buildOptions(current, 'word').forEach((opt) => createOption(opt));
  } else if (mode === 1) {
    els.prompt.textContent = 'Choose the matching emoji for this word:';
    els.question.textContent = current.word;
    buildOptions(current, 'emoji').forEach((opt) => createOption(opt));
  } else if (mode === 2) {
    els.prompt.textContent = 'Listen and pick the word you hear:';
    els.question.textContent = '🎧 Tap speaker & answer quickly!';
    els.audioBtn.classList.remove('hidden');
    els.audioBtn.onclick = () => speak(current.word);
    speak(current.word);
    buildOptions(current, 'word').forEach((opt) => createOption(opt));
  } else {
    els.prompt.textContent = 'Choose the missing word:';
    els.question.textContent = current.sentence.replace('___', '_____');
    buildOptions(current, 'word').forEach((opt) => createOption(opt));
  }
}

function createOption(option) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'option';
  btn.textContent = option.label;

  btn.addEventListener('click', () => handleAnswer(btn, option.value));
  els.options.appendChild(btn);
}

function handleAnswer(button, value) {
  if (!state.canAnswer) return;
  state.canAnswer = false;

  const correct = value === state.activeAnswer;
  if (correct) {
    state.score += 10 + state.streak;
    state.streak += 1;
    state.energy = Math.min(100, state.energy + 9);
    setFeedback('Great! +energy ⚡', 'good');
    button.classList.add('correct');
    speak('Great job');
  } else {
    state.streak = 0;
    state.energy -= 12;
    setFeedback('Oops! -energy 💥', 'bad');
    button.classList.add('wrong');
    [...els.options.children].forEach((child) => {
      if (child.textContent === state.activeAnswer || child.textContent === WORDS.find((w) => w.word === state.activeAnswer)?.emoji) {
        child.classList.add('correct');
      }
    });
  }

  els.score.textContent = state.score;
  els.streak.textContent = state.streak;
  updateEnergyBar();

  if (state.energy <= 0) {
    endGame();
    return;
  }

  setTimeout(() => {
    setFeedback('Next!');
    renderQuestion();
  }, 360);
}

function getRating(score) {
  if (score >= 420) return '🏆 Superstar Reader';
  if (score >= 260) return '🌟 Excellent Progress';
  if (score >= 140) return '💪 Strong Effort';
  return '🌱 Keep Practicing';
}

function endGame() {
  clearInterval(state.timerId);
  state.timerId = null;
  state.canAnswer = false;
  els.question.textContent = '⏰';
  els.options.innerHTML = '';
  els.audioBtn.classList.add('hidden');
  els.gameOver.classList.remove('hidden');
  els.finalScore.textContent = `Final Score: ${state.score}`;
  els.rating.textContent = `Rating: ${getRating(state.score)}`;
  setFeedback('Energy empty. Game over!', 'bad');
}

function startDrain() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.energy -= 1.1;
    updateEnergyBar();
    if (state.energy <= 0) {
      state.energy = 0;
      updateEnergyBar();
      endGame();
    }
  }, 220);
}

function resetGame() {
  state.score = 0;
  state.streak = 0;
  state.energy = 100;
  state.modeIndex = 0;
  state.canAnswer = true;

  els.score.textContent = '0';
  els.streak.textContent = '0';
  els.gameOver.classList.add('hidden');

  updateEnergyBar();
  setFeedback('Go!');
  renderQuestion();
  startDrain();
}

els.playAgain.addEventListener('click', resetGame);
els.soundToggle.addEventListener('click', () => {
  state.soundOn = !state.soundOn;
  els.soundToggle.textContent = state.soundOn ? '🔊' : '🔈';
  els.soundToggle.setAttribute('aria-pressed', String(state.soundOn));
  if (!state.soundOn && window.speechSynthesis) speechSynthesis.cancel();
});

resetGame();

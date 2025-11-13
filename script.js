document.addEventListener('DOMContentLoaded', () => {
    const phrasalVerbs = {
        A1: [
            { verb: 'come in', synonyms: ['enter', 'arrive', 'join'] },
            { verb: 'get up', synonyms: ['rise', 'stand', 'awaken'] },
            { verb: 'go away', synonyms: ['leave', 'depart', 'disappear'] },
            { verb: 'sit down', synonyms: ['take a seat', 'be seated', 'rest'] },
            { verb: 'stand up', synonyms: ['rise', 'get to your feet', 'be upright'] },
        ],
        A2: [
            { verb: 'look for', synonyms: ['search', 'seek', 'hunt'] },
            { verb: 'take off', synonyms: ['remove', 'depart', 'fly'] },
            { verb: 'turn on', synonyms: ['activate', 'start', 'initiate'] },
            { verb: 'fill in', synonyms: ['complete', 'provide information', 'substitute'] },
            { verb: 'get on', synonyms: ['board', 'enter', 'mount'] },
        ],
        B1: [
            { verb: 'break down', synonyms: ['fail', 'collapse', 'stop working'] },
            { verb: 'give up', synonyms: ['quit', 'surrender', 'abandon'] },
            { verb: 'find out', synonyms: ['discover', 'learn', 'ascertain'] },
            { verb: 'look forward to', synonyms: ['anticipate', 'await eagerly', 'be excited about'] },
            { verb: 'put off', synonyms: ['postpone', 'delay', 'reschedule'] },
        ],
        B2: [
            { verb: 'carry on', synonyms: ['continue', 'proceed', 'persist'] },
            { verb: 'look after', synonyms: ['care for', 'tend to', 'protect'] },
            { verb: 'run out of', synonyms: ['exhaust', 'deplete', 'use up'] },
            { verb: 'bring up', synonyms: ['raise a child', 'mention', 'introduce a topic'] },
            { verb: 'show off', synonyms: ['boast', 'brag', 'display proudly'] },
        ],
        C1: [
            { verb: 'come up with', synonyms: ['devise', 'invent', 'propose'] },
            { verb: 'get away with', synonyms: ['escape blame', 'avoid punishment', 'succeed dishonestly'] },
            { verb: 'put up with', synonyms: ['tolerate', 'endure', 'bear'] },
            { verb: 'catch up on', synonyms: ['do something that you did not have time for earlier', 'get up to date with', 'make up for lost time'] },
            { verb: 'drop out of', synonyms: ['abandon', 'quit', 'leave'] },
        ],
        C2: [
            { verb: 'cut down on', synonyms: ['reduce', 'lessen', 'decrease'] },
            { verb: 'look down on', synonyms: ['despise', 'scorn', 'disdain'] },
            { verb: 'settle for', synonyms: ['accept reluctantly', 'compromise on', 'be satisfied with less'] },
            { verb: 'get round to', synonyms: ['find time to do', 'finally manage to do', 'get to'] },
            { verb: 'live up to', synonyms: ['fulfill expectations', 'meet standards', 'satisfy'] },
        ],
    };

    const colors = [
        { primary: '#ff69b4', secondary: '#17e9e1' },
        { primary: '#7fffd4', secondary: '#ff6347' },
        { primary: '#f0e68c', secondary: '#9370db' },
        { primary: '#00fa9a', secondary: '#ff00ff' },
        { primary: '#ffa500', secondary: '#4169e1' },
        { primary: '#ff4757', secondary: '#2ed573' },
        { primary: '#5352ed', secondary: '#ffb142' }
    ];

    const levelSelect = document.getElementById('level');
    const durationSelect = document.getElementById('duration');
    const intervalSelect = document.getElementById('interval');
    const startBtn = document.getElementById('start-btn');
    const settingsDiv = document.querySelector('.settings');
    const challengeDiv = document.querySelector('.challenge');
    const phrasalVerbEl = document.querySelector('.phrasal-verb');
    const synonymEls = document.querySelectorAll('.synonym');
    const totalTimeEl = document.getElementById('total-time');
    const progressBarEl = document.getElementById('progress-bar');
    const progressBarContainer = document.querySelector('.progress-bar-container');

    let gameInterval;
    let gameTimeout;
    let totalTimeInterval;
    let progressBarInterval;

    startBtn.addEventListener('click', startGame);

    function startGame() {
        const level = levelSelect.value;
        const duration = parseInt(durationSelect.value, 10) * 1000;
        const interval = parseInt(intervalSelect.value, 10) * 1000;

        settingsDiv.style.display = 'none';
        startBtn.style.display = 'none';
        challengeDiv.style.display = 'block';

        let totalSeconds = 0;
        totalTimeEl.textContent = '00:00';
        totalTimeInterval = setInterval(() => {
            totalSeconds++;
            const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const seconds = (totalSeconds % 60).toString().padStart(2, '0');
            totalTimeEl.textContent = `${minutes}:${seconds}`;
        }, 1000);

        const availableVerbs = [...phrasalVerbs[level]];

        function displayNewChallenge() {
            clearInterval(progressBarInterval);
            let progress = 100;
            const startTime = Date.now();

            progressBarInterval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                progress = 100 - (elapsedTime / interval) * 100;
                progressBarEl.style.width = `${Math.max(0, progress)}%`;
            }, 50);

            if (availableVerbs.length === 0) {
                availableVerbs.push(...phrasalVerbs[level]);
            }

            const verbIndex = Math.floor(Math.random() * availableVerbs.length);
            const currentVerb = availableVerbs.splice(verbIndex, 1)[0];
            phrasalVerbEl.textContent = currentVerb.verb;

            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            phrasalVerbEl.style.color = randomColor.primary;
            progressBarEl.style.backgroundColor = randomColor.secondary;
            progressBarContainer.style.borderColor = randomColor.secondary;

            const allSynonyms = [].concat(...Object.values(phrasalVerbs).flat().map(v => v.synonyms));
            const correctSynonym = currentVerb.synonyms[Math.floor(Math.random() * currentVerb.synonyms.length)];

            let incorrect1, incorrect2;
            do {
                incorrect1 = allSynonyms[Math.floor(Math.random() * allSynonyms.length)];
            } while (currentVerb.synonyms.includes(incorrect1));
            do {
                incorrect2 = allSynonyms[Math.floor(Math.random() * allSynonyms.length)];
            } while (currentVerb.synonyms.includes(incorrect2) || incorrect2 === incorrect1);

            const options = [correctSynonym, incorrect1, incorrect2].sort(() => Math.random() - 0.5);

            synonymEls.forEach((el, index) => {
                el.textContent = options[index];
                el.style.borderColor = randomColor.secondary;
            });
        }

        displayNewChallenge();
        gameInterval = setInterval(displayNewChallenge, interval);
        gameTimeout = setTimeout(endGame, duration);
    }

    function endGame() {
        clearInterval(gameInterval);
        clearTimeout(gameTimeout);
        clearInterval(totalTimeInterval);
        clearInterval(progressBarInterval);

        challengeDiv.style.display = 'none';
        settingsDiv.style.display = 'flex';
        startBtn.style.display = 'block';
        startBtn.textContent = 'Play Again?';
    }
});

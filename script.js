document.addEventListener('DOMContentLoaded', () => {
    const phrasalVerbs = {
        A1: [
            { verb: 'come in', synonyms: ['enter', 'arrive', 'join'] },
            { verb: 'get up', synonyms: ['rise', 'stand', 'awaken'] },
            { verb: 'go away', synonyms: ['leave', 'depart', 'disappear'] },
        ],
        A2: [
            { verb: 'look for', synonyms: ['search', 'seek', 'hunt'] },
            { verb: 'take off', synonyms: ['remove', 'depart', 'fly'] },
            { verb: 'turn on', synonyms: ['activate', 'start', 'initiate'] },
        ],
        B1: [
            { verb: 'break down', synonyms: ['fail', 'collapse', 'stop working'] },
            { verb: 'give up', synonyms: ['quit', 'surrender', 'abandon'] },
            { verb: 'find out', synonyms: ['discover', 'learn', 'ascertain'] },
        ],
        B2: [
            { verb: 'carry on', synonyms: ['continue', 'proceed', 'persist'] },
            { verb: 'look after', synonyms: ['care for', 'tend to', 'protect'] },
            { verb: 'run out of', synonyms: ['exhaust', 'deplete', 'use up'] },
        ],
        C1: [
            { verb: 'come up with', synonyms: ['devise', 'invent', 'propose'] },
            { verb: 'get away with', synonyms: ['escape blame', 'avoid punishment', 'succeed dishonestly'] },
            { verb: 'put up with', synonyms: ['tolerate', 'endure', 'bear'] },
        ],
        C2: [
            { verb: 'cut down on', synonyms: ['reduce', 'lessen', 'decrease'] },
            { verb: 'look down on', synonyms: ['despise', 'scorn', 'disdain'] },
            { verb: 'settle for', synonyms: ['accept reluctantly', 'compromise on', 'be satisfied with less'] },
        ],
    };

    const levelSelect = document.getElementById('level');
    const durationSelect = document.getElementById('duration');
    const intervalSelect = document.getElementById('interval');
    const startBtn = document.getElementById('start-btn');
    const settingsDiv = document.querySelector('.settings');
    const challengeDiv = document.querySelector('.challenge');
    const phrasalVerbEl = document.querySelector('.phrasal-verb');
    const synonymEls = document.querySelectorAll('.synonym');

    let gameInterval;
    let gameTimeout;

    startBtn.addEventListener('click', startGame);

    function startGame() {
        const level = levelSelect.value;
        const duration = parseInt(durationSelect.value, 10) * 1000;
        const interval = parseInt(intervalSelect.value, 10) * 1000;

        settingsDiv.style.display = 'none';
        startBtn.style.display = 'none';
        challengeDiv.style.display = 'block';

        const availableVerbs = [...phrasalVerbs[level]];

        function displayNewChallenge() {
            if (availableVerbs.length === 0) {
                // Reset if we run out of verbs for that level
                availableVerbs.push(...phrasalVerbs[level]);
            }

            const verbIndex = Math.floor(Math.random() * availableVerbs.length);
            const currentVerb = availableVerbs.splice(verbIndex, 1)[0];

            phrasalVerbEl.textContent = currentVerb.verb;

            const allSynonyms = [].concat(...Object.values(phrasalVerbs).flat().map(v => v.synonyms));
            const correctSynonym = currentVerb.synonyms[Math.floor(Math.random() * currentVerb.synonyms.length)];

            // Get two random incorrect synonyms
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
            });
        }

        displayNewChallenge(); // Initial display
        gameInterval = setInterval(displayNewChallenge, interval);
        gameTimeout = setTimeout(endGame, duration);
    }

    function endGame() {
        clearInterval(gameInterval);
        clearTimeout(gameTimeout);

        challengeDiv.style.display = 'none';
        settingsDiv.style.display = 'flex';
        startBtn.style.display = 'block';
        startBtn.textContent = 'Play Again?';
    }
});

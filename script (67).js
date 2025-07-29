let score = 0;
let time = 30;
let gameLoop;
let emojiSpawnLoop;
let moveLoop;
let topScores = JSON.parse(localStorage.getItem('topScores_' + location.hostname) || '[]');
let playerPosition = 35;
let targetPosition = 35;
let isMovingLeft = false;
let isMovingRight = false;
let touchStartX = 0;
let gameStarted = false;
let isPaused = false;
let currentMode = 'medium';
let currentTheme = 'default';
let lastTime = performance.now();
let deltaTime = 0;
let emojiCount = 0;
let magnetActive = false;
let magnetTimeout;
let currentModifier = '';
let secondPlayerPosition = 55;

const modes = {
    easy: { initialTime: 50, goodPoints: [5, 6, 7], goodTime: [5, 6, 10], badPoints: [-6], badTime: [-7], emojiInterval: 800, bombChance: 0.2, magnetChance: 0.1 },
    medium: { initialTime: 30, goodPoints: [5, 6, 7], goodTime: [5, 6, 10], badPoints: [-6], badTime: [-7], emojiInterval: 600, bombChance: 0.4, magnetChance: 0.08 },
    hard: { initialTime: 15, goodPoints: [5, 6, 7], goodTime: [5, 6, 10], badPoints: [-6], badTime: [-7], emojiInterval: 400, bombChance: 0.6, magnetChance: 0.06 }
};

const themeEmojis = {
    default: ['😊', '🥳', '🌟', '🎉', '👍', '😍', '🎂', '🌸', '🌈', '💎', '🎁', '🎶', '🧲', '💣'],
    retro: ['🎱', '📼', '🎞️', '🎮', '📺', '💾', '🕹️', '📀', '💽', '🖥️', '🎧', '📡', '🧲', '💣'],
    ocean: ['🐠', '🐳', '🐬', '🪸', '🌊', '🐚', '🪼', '🐡', '🐙', '🦑', '🐢', '🌴', '🧲', '💣'],
    winter: ['❄️', '☃️', '🎄', '⛄', '🌨️', '🥶', '🎿', '🛷', '🌬️', '⛸️', '🧣', '🥐', '🧲', '💣'],
    summer: ['☀️', '🏖️', '🍉', '🏝️', '🌴', '🏊', '🎣', '🌺', '🏄', '🏕️', '🍹', '🌞', '🧲', '💣'],
    color: ['❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🤎', '🖤', '🩶', '🤍', '🩷', '🧲', '💣'],
    evening: ['🌙', '⭐', '🌌', '🌃', '🌠', '🌅', '🌄', '🌇', '🌃', '🌝', '🌞', '🧲', '💣'],
    halloween: ['👻', '🎃', '🕸️', '💀', '🕯️', '🍬', '🧙‍♀️', '🦇', '🕷️', '🎭', '⚰️', '🍭', '🧲', '💣'],
    neon: ['💡', '✨', '🔦', '💥', '🌈', '⚡', '💎', '🕒', '🔋', '🎮', '📱', '💾', '🧲', '💣'],
    time: ['⏰', '⌛', '⏳', '🕰️', '⏱️', '⏲️', '🕒', '🕛', '🕐', '🕓', '🕕', '🕗', '🧲', '💣']
};

const maxEmojis = 12;
const gameWidth = 90;
const playerWidth = 12;
const moveSpeed = 15;
const magnetRadius = 30;
const magnetPullStrength = 0.2;

window.onload = () => {
    if (window.innerWidth > 1023) return;
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainSection').style.display = 'none';
    const savedUsername = localStorage.getItem('savedUsername_' + location.hostname);
    const savedPassword = localStorage.getItem('savedPassword_' + location.hostname);
    if (savedUsername && savedPassword) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
        document.getElementById('saveCredentials').checked = true;
    }
    const loggedInUser = localStorage.getItem('loggedInUser_' + location.hostname);
    if (loggedInUser) login();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('gameArea').addEventListener('touchstart', handleTouchStart);
    document.getElementById('gameArea').addEventListener('touchmove', handleTouchMove);
    document.getElementById('gameArea').addEventListener('touchend', handleTouchEnd);
    applyTheme(currentTheme);
    document.querySelector('.tab-button[onclick="showSubTab(\'modes\', \'mode\')"]').classList.add('active');
    document.querySelector('.tab-button[onclick="showSubTab(\'index\', \'default\')"]').classList.add('active');
};

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const saveCredentials = document.getElementById('saveCredentials').checked;
    if (saveCredentials) {
        localStorage.setItem('savedUsername_' + location.hostname, username);
        localStorage.setItem('savedPassword_' + location.hostname, password);
    }
    const users = JSON.parse(localStorage.getItem('users_' + location.hostname) || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('loggedInUser_' + location.hostname, username);
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        document.getElementById('playerInfo').textContent = `Zalogowany: ${username}`;
        document.getElementById('playerInfo').style.display = 'block';
        document.getElementById('startGameBtn').style.display = 'inline-block';
        document.getElementById('topScoresBtn').style.display = 'inline-block';
        document.getElementById('modesBtn').style.display = 'inline-block';
        document.getElementById('indexBtn').style.display = 'inline-block';
        document.getElementById('gameArea').style.display = 'none';
        setMode(currentMode);
    } else {
        alert('Nieprawidłowa nazwa użytkownika lub hasło!');
    }
}

function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('users_' + location.hostname) || '[]');
    if (username && password) {
        if (!users.find(u => u.username === username)) {
            users.push({ username, password });
            localStorage.setItem('users_' + location.hostname, JSON.stringify(users));
            alert('Rejestracja udana! Zaloguj się.');
        } else {
            alert('Ta nazwa użytkownika już istnieje!');
        }
    } else {
        alert('Wypełnij wszystkie pola!');
    }
}

function logout() {
    localStorage.removeItem('loggedInUser_' + location.hostname);
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainSection').style.display = 'none';
    cancelAnimationFrame(gameLoop);
    cancelAnimationFrame(emojiSpawnLoop);
    cancelAnimationFrame(moveLoop);
    document.getElementById('score').textContent = '0';
    document.getElementById('time').textContent = '30';
    gameStarted = false;
    isPaused = false;
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.getElementById('gameArea').removeEventListener('touchstart', handleTouchStart);
    document.getElementById('gameArea').removeEventListener('touchmove', handleTouchMove);
    document.getElementById('gameArea').removeEventListener('touchend', handleTouchEnd);
    document.getElementById('gameArea').classList.remove('fullscreen');
    document.querySelector('.game-stats').style.display = 'none';
}

function showTab(tabId) {
    document.getElementById('topScoresSection').style.display = 'none';
    document.getElementById('modesTab').style.display = 'none';
    document.getElementById('indexTab').style.display = 'none';
    document.getElementById(tabId + 'Section').style.display = 'flex';
    document.getElementById('gameArea').style.display = 'none';
    cancelAnimationFrame(emojiSpawnLoop);
}

function hideTab(tabId) {
    document.getElementById(tabId + 'Section').style.display = 'none';
    document.getElementById('gameArea').style.display = 'none';
    gameStarted = false;
    isPaused = false;
    cancelAnimationFrame(gameLoop);
    cancelAnimationFrame(emojiSpawnLoop);
    cancelAnimationFrame(moveLoop);
    document.getElementById('score').textContent = '0';
    document.getElementById('time').textContent = modes[currentMode].initialTime;
    document.getElementById('gameArea').classList.remove('fullscreen');
    document.querySelector('.game-stats').style.display = 'none';
}

function showSubTab(tabId, subTab) {
    const tabContent = document.getElementById(tabId + 'Content');
    tabContent.querySelectorAll('.sub-tab').forEach(s => s.style.display = 'none');
    tabContent.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(subTab + 'SubTab').style.display = 'block';
    document.querySelector(`.tab-button[onclick="showSubTab('${tabId}', '${subTab}')"]`).classList.add('active');
}

function startGame() {
    if (!gameStarted && localStorage.getItem('loggedInUser_' + location.hostname)) {
        score = 0;
        time = modes[currentMode].initialTime;
        gameStarted = true;
        isPaused = false;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
        document.getElementById('gameArea').classList.add('fullscreen');
        document.querySelector('.game-stats').style.display = 'block';
        document.getElementById('stopButton').style.display = 'block';
        document.getElementById('score').textContent = score;
        document.getElementById('time').textContent = time;
        applyTheme(currentTheme);
        applyModifier(currentModifier);

        const player = document.createElement('div');
        player.classList.add('player');
        player.style.left = `${playerPosition}vw`;
        player.textContent = '🏀';
        document.getElementById('gameArea').appendChild(player);

        if (currentModifier === 'duet') {
            const secondPlayer = document.createElement('div');
            secondPlayer.classList.add('second-player');
            secondPlayer.style.left = `${secondPlayerPosition}vw`;
            secondPlayer.textContent = '🏀';
            document.getElementById('gameArea').appendChild(secondPlayer);
        }

        gameLoop = requestAnimationFrame(gameUpdate);
        emojiSpawnLoop = setInterval(spawnEmoji, modes[currentMode].emojiInterval);
        moveLoop = requestAnimationFrame(movePlayer);
    }
}

function stopGame() {
    if (gameStarted) {
        isPaused = true;
        cancelAnimationFrame(gameLoop);
        cancelAnimationFrame(emojiSpawnLoop);
        cancelAnimationFrame(moveLoop);
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        document.getElementById('stopButton').style.display = 'none';
        document.querySelector('.game-stats').style.display = 'none';
        saveScore();
        gameStarted = false;
    }
}

function gameUpdate(currentTime) {
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (!isPaused && gameStarted) {
        time -= deltaTime;
        document.getElementById('time').textContent = Math.max(0, Math.round(time));
        if (time <= 0) {
            stopGame();
        }
    }

    gameLoop = requestAnimationFrame(gameUpdate);
}

function spawnEmoji() {
    if (emojiCount < maxEmojis && gameStarted && !isPaused) {
        const emoji = document.createElement('div');
        emoji.classList.add('emoji');
        const randomEmoji = themeEmojis[currentTheme][Math.floor(Math.random() * (themeEmojis[currentTheme].length - 2))];
        const isBomb = Math.random() < modes[currentMode].bombChance;
        const isMagnet = Math.random() < modes[currentMode].magnetChance && randomEmoji !== '💣';
        emoji.textContent = isBomb ? '💣' : (isMagnet ? '🧲' : randomEmoji);
        emoji.style.left = `${Math.random() * (gameWidth - 5)}vw`;
        emoji.style.animationDuration = `${2.5 + Math.random() * 2}s`;
        document.getElementById('gameArea').appendChild(emoji);
        emojiCount++;

        emoji.addEventListener('animationend', () => {
            emoji.remove();
            emojiCount--;
        });

        if (isMagnet) {
            magnetTimeout = setTimeout(() => {
                magnetActive = true;
                setTimeout(() => { magnetActive = false; }, 5000);
            }, 0);
        }
    }
}

function movePlayer() {
    if (gameStarted && !isPaused) {
        if (isMovingLeft && playerPosition > 0) {
            playerPosition = Math.max(0, playerPosition - moveSpeed * deltaTime);
        }
        if (isMovingRight && playerPosition < gameWidth - playerWidth) {
            playerPosition = Math.min(gameWidth - playerWidth, playerPosition + moveSpeed * deltaTime);
        }

        const player = document.querySelector('.player');
        if (player) {
            player.style.left = `${playerPosition}vw`;

            if (currentModifier === 'duet') {
                const secondPlayer = document.querySelector('.second-player');
                secondPlayerPosition = playerPosition + 20;
                if (secondPlayerPosition > gameWidth - playerWidth) secondPlayerPosition = playerPosition - 20;
                if (secondPlayer) secondPlayer.style.left = `${secondPlayerPosition}vw`;
            }

            const emojis = document.querySelectorAll('.emoji');
            emojis.forEach(emoji => {
                const emojiRect = emoji.getBoundingClientRect();
                const playerRect = player.getBoundingClientRect();
                const isCollision = !(playerRect.right < emojiRect.left || playerRect.left > emojiRect.right || playerRect.bottom < emojiRect.top || playerRect.top > emojiRect.bottom);

                if (isCollision) {
                    const emojiText = emoji.textContent;
                    if (emojiText === '💣') {
                        score += modes[currentMode].badPoints[0];
                        time += modes[currentMode].badTime[0];
                    } else if (emojiText === '🧲') {
                        magnetActive = true;
                        setTimeout(() => { magnetActive = false; }, 5000);
                    } else {
                        const randomPoints = modes[currentMode].goodPoints[Math.floor(Math.random() * modes[currentMode].goodPoints.length)];
                        const randomTime = modes[currentMode].goodTime[Math.floor(Math.random() * modes[currentMode].goodTime.length)];
                        score += randomPoints;
                        time += randomTime;
                    }
                    document.getElementById('score').textContent = score;
                    document.getElementById('time').textContent = Math.max(0, Math.round(time));
                    emoji.remove();
                    emojiCount--;
                } else if (magnetActive) {
                    const dx = (playerRect.left + playerRect.width / 2) - (emojiRect.left + emojiRect.width / 2);
                    const dy = (playerRect.top + playerRect.height / 2) - (emojiRect.top + emojiRect.height / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < magnetRadius) {
                        const pullX = dx * magnetPullStrength;
                        const pullY = dy * magnetPullStrength;
                        emoji.style.transform = `translate(${pullX}px, ${pullY}px)`;
                    }
                }
            });
        }
    }
    moveLoop = requestAnimationFrame(movePlayer);
}

function handleKeyDown(e) {
    if (gameStarted && !isPaused) {
        if (e.key === 'ArrowLeft' || e.key === 'a') isMovingLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd') isMovingRight = true;
    }
}

function handleKeyUp(e) {
    if (gameStarted && !isPaused) {
        if (e.key === 'ArrowLeft' || e.key === 'a') isMovingLeft = false;
        if (e.key === 'ArrowRight' || e.key === 'd') isMovingRight = false;
    }
}

function handleTouchStart(e) {
    if (gameStarted && !isPaused) {
        touchStartX = e.touches[0].clientX;
    }
}

function handleTouchMove(e) {
    if (gameStarted && !isPaused) {
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        playerPosition += (deltaX / window.innerWidth) * 100;
        playerPosition = Math.max(0, Math.min(gameWidth - playerWidth, playerPosition));
        const player = document.querySelector('.player');
        if (player) player.style.left = `${playerPosition}vw`;
        touchStartX = touchX;

        if (currentModifier === 'duet') {
            const secondPlayer = document.querySelector('.second-player');
            secondPlayerPosition = playerPosition + 20;
            if (secondPlayerPosition > gameWidth - playerWidth) secondPlayerPosition = playerPosition - 20;
            if (secondPlayer) secondPlayer.style.left = `${secondPlayerPosition}vw`;
        }
    }
}

function handleTouchEnd() {
    if (gameStarted && !isPaused) {
        isMovingLeft = false;
        isMovingRight = false;
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '👁️';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '🔍';
    }
}

function setMode(mode) {
    currentMode = mode;
    time = modes[mode].initialTime;
    document.getElementById('time').textContent = time;
    hideTab('modes');
}

function setTheme(theme) {
    currentTheme = theme;
    applyTheme(theme);
    hideTab('modes');
}

function applyTheme(theme) {
    document.body.className = '';
    document.body.classList.add(`${theme}-mode`);
    const gameArea = document.getElementById('gameArea');
    if (gameArea) gameArea.className = 'gameArea';
    if (theme !== 'default') gameArea.classList.add(`${theme}-mode`);
}

function setModifier(modifier) {
    currentModifier = modifier;
    applyModifier(modifier);
    hideTab('modes');
}

function applyModifier(modifier) {
    const player = document.querySelector('.player');
    if (player) {
        player.className = 'player';
        if (modifier === 'biggerBasket') player.classList.add('bigger-player');
        else if (modifier === 'miniBasket') player.classList.add('mini-player');
    }
    if (modifier === 'duet') {
        const secondPlayer = document.querySelector('.second-player');
        if (!secondPlayer) {
            const newSecondPlayer = document.createElement('div');
            newSecondPlayer.classList.add('second-player');
            newSecondPlayer.style.left = `${secondPlayerPosition}vw`;
            newSecondPlayer.textContent = '🏀';
            document.getElementById('gameArea').appendChild(newSecondPlayer);
        }
    } else {
        const secondPlayer = document.querySelector('.second-player');
        if (secondPlayer) secondPlayer.remove();
    }
}

function saveScore() {
    const username = localStorage.getItem('loggedInUser_' + location.hostname);
    if (username && score > 0) {
        const scoreEntry = { username, score, date: new Date().toLocaleDateString() };
        topScores.push(scoreEntry);
        topScores.sort((a, b) => b.score - a.score);
        topScores = topScores.slice(0, 10);
        localStorage.setItem('topScores_' + location.hostname, JSON.stringify(topScores));
        updateTopScores();
    }
}

function updateTopScores() {
    const subTabs = ['easy', 'medium', 'hard'];
    subTabs.forEach(difficulty => {
        const table = document.getElementById(`${difficulty}TopScores`).querySelector('table');
        table.innerHTML = '<tr><th>Miejsce</th><th>Punkty</th><th>Data</th></tr>';
        const filteredScores = topScores.filter(s => s.difficulty === difficulty || !s.difficulty).slice(0, 5);
        filteredScores.forEach((score, index) => {
            const row = table.insertRow();
            row.insertCell(0).textContent = index + 1;
            row.insertCell(1).textContent = score.score;
            row.insertCell(2).textContent = score.date;
        });
    });
}
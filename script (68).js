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
    easy: { initialTime: 50, goodPoints: [5, 6, 7], goodTime: [5, 6, 8], badPoints: [-6], badTime: [-7], emojiInterval: 800, bombChance: 0.2, magnetChance: 0.1 },
    medium: { initialTime: 30, goodPoints: [5, 6, 7], goodTime: [5, 6, 8], badPoints: [-6], badTime: [-7], emojiInterval: 600, bombChance: 0.4, magnetChance: 0.08 },
    hard: { initialTime: 15, goodPoints: [5, 6, 7], goodTime: [5, 6, 8], badPoints: [-6], badTime: [-7], emojiInterval: 400, bombChance: 0.6, magnetChance: 0.06 }
};

const themeEmojis = {
    default: ['😊', '💣', '🧲'],
    retro: ['🎱', '💣', '🧲'],
    ocean: ['🐠', '💣', '🧲'],
    winter: ['❄️', '💣', '🧲'],
    summer: ['☀️', '💣', '🧲'],
    color: ['❤️', '💣', '🧲'],
    evening: ['🌙', '💣', '🧲'],
    halloween: ['👻', '💣', '🧲'],
    neon: ['💡', '💣', '🧲'],
    time: ['⏰', '💣', '🧲']
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
    updateTopScores();
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
    endGame();
}

function showTab(tabId) {
    document.getElementById('topScoresSection').style.display = 'none';
    document.getElementById('modesTab').style.display = 'none';
 link Tab(tabId + 'Section').style.display = 'flex';
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('gameArea').style.display = 'none';
    if (tabId === 'topScores') updateTopScores();
}

function hideTab(tabId) {
    document.getElementById(tabId + 'Section').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';
}

function showSubTab(tabId, subTabId) {
    const subTabs = document.querySelectorAll(`#${tabId}Content .sub-tab`);
    subTabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(subTabId + 'SubTab').style.display = 'block';

    const buttons = document.querySelectorAll(`#${tabId}Content .tab-button`);
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#${tabId}Content .tab-button[onclick="showSubTab('${tabId}', '${subTabId}')"]`).classList.add('active');

    if (tabId === 'topScores') updateTopScores(subTabId);
}

function updateTopScores(modeFilter = 'easy') {
    const tables = {
        easy: document.querySelector('#easyTopScores table'),
        medium: document.querySelector('#mediumTopScores table'),
        hard: document.querySelector('#hardTopScores table')
    };
    const table = tables[modeFilter];
    table.innerHTML = '<tr><th>Miejsce</th><th>Punkty</th><th>Data</th></tr>';
    const filteredScores = topScores.filter(s => s.mode === modeFilter);
    filteredScores.forEach((s, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${i + 1}</td><td>${s.score}</td><td>${new Date(s.timestamp).toLocaleString()}</td>`;
        table.appendChild(row);
    });
}

function startGame() {
    if (!gameStarted && localStorage.getItem('loggedInUser_' + location.hostname)) {
        score = 0;
        time = currentModifier === 'oneMinute' ? 60 : modes[currentMode].initialTime;
        document.getElementById('score').textContent = score;
        document.getElementById('time').textContent = time;
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = '';
        if (currentModifier === 'duet') {
            gameArea.innerHTML += '<div class="player" style="left: 35%; bottom: 2vh;">🧺</div>';
            gameArea.innerHTML += '<div class="second-player" style="left: 55%; bottom: 2vh;">🧺</div>';
            playerPosition = 35;
            secondPlayerPosition = 55;
        } else {
            let playerClass = 'player';
            if (currentModifier === 'biggerBasket') playerClass += ' bigger-player';
            if (currentModifier === 'miniBasket') playerClass += ' mini-player';
            gameArea.innerHTML += `<div class="${playerClass}" style="left: 35%; bottom: 2vh;">🧺</div>`;
            playerPosition = 35;
        }
        gameArea.style.display = 'block';
        document.getElementById('gameStats').style.display = 'flex';
        document.getElementById('mainSection').style.display = 'none';
        gameStarted = true;
        isPaused = false;

        lastTime = performance.now();
        gameLoop = requestAnimationFrame(updateGame);
        emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
    } else {
        alert('Musisz być zalogowany, aby rozpocząć grę!');
    }
}

function stopGame() {
    if (gameStarted && !isPaused) {
        endGame();
    }
}

function endGame() {
    cancelAnimationFrame(gameLoop);
    cancelAnimationFrame(emojiSpawnLoop);
    cancelAnimationFrame(moveLoop);
    if (magnetTimeout) clearTimeout(magnetTimeout);
    gameStarted = false;
    isPaused = false;
    magnetActive = false;
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('gameStats').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';
    const player = localStorage.getItem('loggedInUser_' + location.hostname);
    if (player && score > 0) {
        topScores.push({ player, score, mode: currentMode, timestamp: new Date().toISOString() });
        topScores.sort((a, b) => b.score - a.score);
        topScores = topScores.slice(0, 15);
        localStorage.setItem('topScores_' + location.hostname, JSON.stringify(topScores));
    }
}

function updateGame(timestamp) {
    if (!isPaused) {
        deltaTime = Math.min(0.1, (timestamp - lastTime) / 1000);
        lastTime = timestamp;
        time -= deltaTime;
        document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
        if (time <= 0) endGame();
        updateMovement();
    }
    if (gameStarted) gameLoop = requestAnimationFrame(updateGame);
}

let lastSpawn = 0;
function spawnEmoji(timestamp) {
    if (!isPaused && timestamp - lastSpawn >= modes[currentMode].emojiInterval && emojiCount < maxEmojis) {
        if (time > 0) {
            const emoji = document.createElement('div');
            emoji.className = 'emoji';
            const goodEmojis = themeEmojis[currentTheme].filter(e => e !== '💣' && e !== '🧲');
            const emojiData = Math.random() < modes[currentMode].bombChance ? { emoji: '💣', type: 'bad' } :
                            Math.random() < modes[currentMode].magnetChance ? { emoji: '🧲', type: 'magnet' } :
                            { emoji: goodEmojis[Math.floor(Math.random() * goodEmojis.length)], type: 'good' };
            emoji.textContent = emojiData.emoji;
            emoji.style.left = Math.random() * (gameWidth - 7) + '%';
            const baseDuration = 5;
            const durationMultiplier = { easy: 1.5, medium: 1, hard: 0.7 };
            emoji.style.animationDuration = `${baseDuration * durationMultiplier[currentMode]}s`;
            document.getElementById('gameArea').appendChild(emoji);
            emojiCount++;
            lastSpawn = timestamp;

            function animateEmoji() {
                const rect = emoji.getBoundingClientRect();
                const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
                let top = parseFloat(emoji.style.top || '-10') + (80 / parseFloat(emoji.style.animationDuration)) * deltaTime;
                emoji.style.top = `${top}vh`;

                if (top > 75) {
                    emoji.remove();
                    emojiCount--;
                } else {
                    const player = document.querySelector('.player');
                    const secondPlayer = document.querySelector('.second-player');
                    if (player || secondPlayer) {
                        const playerRect = player ? player.getBoundingClientRect() : null;
                        const secondPlayerRect = secondPlayer ? secondPlayer.getBoundingClientRect() : null;
                        const emojiX = (rect.left - gameAreaRect.left) / gameAreaRect.width * 100;

                        const checkCollision = (pRect) => {
                            if (pRect) {
                                const playerX = (pRect.left - gameAreaRect.left) / gameAreaRect.width * 100;
                                let collisionWidth = playerWidth;
                                if (currentModifier === 'biggerBasket') collisionWidth = 18;
                                else if (currentModifier === 'miniBasket') collisionWidth = 6;
                                return top >= 60 && top <= 68 &&
                                    emojiX >= playerX - (collisionWidth / 2) && emojiX <= playerX + (collisionWidth / 2);
                            }
                            return false;
                        };

                        if (magnetActive) {
                            const playerX = playerPosition;
                            const secondPlayerX = secondPlayerPosition;
                            const distances = [
                                Math.abs(emojiX - playerX),
                                secondPlayer ? Math.abs(emojiX - secondPlayerX) : Infinity
                            ];
                            const minDistance = Math.min(...distances);
                            const targetX = distances.indexOf(minDistance) === 0 ? playerX : secondPlayerX;
                            if (minDistance <= magnetRadius) {
                                const pullSpeed = magnetPullStrength * (1 - minDistance / magnetRadius) * deltaTime * 100;
                                const newX = parseFloat(emoji.style.left) + (targetX - emojiX) * pullSpeed;
                                emoji.style.left = `${Math.max(0, Math.min(gameWidth - 7, newX))}%`;
                            }
                        }

                        if ((player && checkCollision(playerRect)) || (secondPlayer && checkCollision(secondPlayerRect))) {
                            const modeData = modes[currentMode];
                            if (emojiData.type === 'magnet') {
                                magnetActive = true;
                                score += 10;
                                magnetTimeout = setTimeout(() => { magnetActive = false; }, 5000);
                            } else {
                                const points = emojiData.type === 'good' ? modeData.goodPoints[Math.floor(Math.random() * modeData.goodPoints.length)] : modeData.badPoints[0];
                                const timeChange = emojiData.type === 'good' ? modeData.goodTime[Math.floor(Math.random() * modeData.goodTime.length)] : modeData.badTime[0];
                                score += points;
                                time += timeChange;
                            }
                            document.getElementById('score').textContent = score;
                            document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
                            emoji.remove();
                            emojiCount--;
                        } else {
                            requestAnimationFrame(animateEmoji);
                        }
                    }
                }
            }
            requestAnimationFrame(animateEmoji);
        }
    }
    if (gameStarted && !isPaused) emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
}

function handleKeyDown(event) {
    if (gameStarted && !isPaused) {
        if (event.key === 'ArrowLeft') startMove('left');
        else if (event.key === 'ArrowRight') startMove('right');
    }
}

function handleKeyUp(event) {
    if (gameStarted && !isPaused) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') stopMove();
    }
}

function handleTouchStart(event) {
    if (gameStarted && !isPaused) {
        touchStartX = event.touches[0].clientX;
    }
}

function handleTouchMove(event) {
    if (gameStarted && !isPaused) {
        const touchX = event.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
        targetPosition = playerPosition + (deltaX / gameAreaRect.width) * 100;
        targetPosition = Math.max(0, Math.min(gameWidth - playerWidth, targetPosition));
        touchStartX = touchX;
        event.preventDefault();
    }
}

function handleTouchEnd() {
    if (gameStarted && !isPaused) {
        stopMove();
    }
}

function startMove(direction) {
    if (direction === 'left') isMovingLeft = true;
    else if (direction === 'right') isMovingRight = true;
    if (!moveLoop) moveLoop = requestAnimationFrame(updateMovement);
}

function stopMove() {
    isMovingLeft = false;
    isMovingRight = false;
    cancelAnimationFrame(moveLoop);
}

function updateMovement() {
    const player = document.querySelector('.player');
    const secondPlayer = document.querySelector('.second-player');
    if (player || secondPlayer) {
        let moveAmount = 0;
        if (isMovingLeft) moveAmount -= moveSpeed * deltaTime;
        if (isMovingRight) moveAmount += moveSpeed * deltaTime;
        playerPosition = Math.max(0, Math.min(gameWidth - playerWidth, playerPosition + moveAmount));
        if (player) player.style.left = `${playerPosition}%`;
        if (currentModifier === 'duet') {
            secondPlayerPosition = Math.max(0, Math.min(gameWidth - playerWidth, secondPlayerPosition + moveAmount));
            if (secondPlayer) secondPlayer.style.left = `${secondPlayerPosition}%`;
        }
        if (isMovingLeft || isMovingRight) moveLoop = requestAnimationFrame(updateMovement);
    }
}

function setMode(mode) {
    currentMode = mode;
    time = currentModifier === 'oneMinute' ? 60 : modes[mode].initialTime;
    document.getElementById('time').textContent = time;
}

function setTheme(theme) {
    currentTheme = theme;
    applyTheme(theme);
}

function setModifier(modifier) {
    currentModifier = modifier;
    time = modifier === 'oneMinute' ? 60 : modes[currentMode].initialTime;
    document.getElementById('time').textContent = time;
}

function applyTheme(theme) {
    document.body.className = theme + '-mode';
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
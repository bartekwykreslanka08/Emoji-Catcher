let score = 0;
let time = 30;
let gameLoop;
let emojiSpawnLoop;
let moveLoop;
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
let currentModifier = 'none';
let secondPlayerPosition = 55;

const modes = {
    easy: { initialTime: 50, goodPoints: [4, 5, 6, 5, 4, 6, 5, 4, 6, 5, 4, 6, 5], goodTime: [5, 6, 8, 6, 5, 7, 6, 5, 7, 6, 5, 8, 6], badPoints: [-5], badTime: [-6], emojiInterval: 800, bombChance: 0.2, magnetChance: 0.1 },
    medium: { initialTime: 30, goodPoints: [5, 6, 7, 6, 5, 7, 6, 5, 7, 6, 5, 7, 6], goodTime: [6, 7, 9, 7, 6, 8, 7, 6, 8, 7, 6, 9, 7], badPoints: [-6], badTime: [-7], emojiInterval: 600, bombChance: 0.4, magnetChance: 0.08 },
    hard: { initialTime: 15, goodPoints: [6, 7, 8, 7, 6, 8, 7, 6, 8, 7, 6, 9, 7], goodTime: [7, 8, 10, 8, 7, 9, 8, 7, 9, 8, 7, 10, 8], badPoints: [-7], badTime: [-8], emojiInterval: 400, bombChance: 0.6, magnetChance: 0.06 }
};

const themeEmojis = {
    default: ['😊', '🥳', '🌟', '🎉', '👍', '😍', '🎂', '🌸', '🌈', '💎', '🎁', '🎶', '🧲'],
    retro: ['🎱', '📼', '🎞️', '🎮', '📺', '💾', '🕹️', '📀', '💽', '🖥️', '🎧', '📡', '🧲'],
    ocean: ['🐠', '🐳', '🐬', '🪸', '🌊', '🐚', '🪼', '🐡', '🐙', '🦑', '🐢', '🌴', '🧲'],
    winter: ['❄️', '☃️', '🎄', '⛄', '🌨️', '🥶', '🎿', '🛷', '🌬️', '⛸️', '🧣', '🥐', '🧲'],
    summer: ['☀️', '🏖️', '🍉', '🏝️', '🌴', '🏊', '🎣', '🌺', '🏄', '🏕️', '🍹', '🌞', '🧲'],
    color: ['❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🤎', '🖤', '🩶', '🤍', '🩷', '🧲'],
    evening: ['🌙', '⭐', '🌌', '🌃', '🌠', '🌅', '🌄', '🌇', '🌃', '🌌', '🌝', '🌞', '🧲'],
    halloween: ['👻', '🎃', '🕸️', '💀', '🕯️', '🍬', '🧙‍♀️', '🦇', '🕷️', '🎭', '⚰️', '🍭', '🧲'],
    neon: ['💡', '✨', '🔦', '💥', '🌈', '⚡', '💎', '🕒', '🔋', '🎮', '📱', '💾', '🧲'],
    time: ['⏰', '⌛', '⏳', '🕰️', '⏱️', '⏲️', '🕒', '🕛', '🕐', '🕓', '🕕', '🕗', '🧲']
};

const maxEmojis = 12;
const gameWidth = 90;
const playerWidth = 12;
const moveSpeed = 15;
const magnetRadius = 35;
const magnetPullStrength = 1.5;

window.onload = () => {
    if (window.innerWidth > 1023) return;
    const loggedInUser = localStorage.getItem('loggedInUser_' + location.hostname);
    const savedUsername = localStorage.getItem('savedUsername_' + location.hostname);
    const savedPassword = localStorage.getItem('savedPassword_' + location.hostname);

    if (loggedInUser) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        document.getElementById('playerInfo').textContent = `Zalogowany: ${loggedInUser}`;
        document.getElementById('playerInfo').style.display = 'block';
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('mainSection').style.display = 'none';
        if (savedUsername && savedPassword) {
            document.getElementById('username').value = savedUsername;
            document.getElementById('password').value = savedPassword;
            document.getElementById('saveCredentials').checked = true;
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('gameArea').addEventListener('touchstart', handleTouchStart);
    document.getElementById('gameArea').addEventListener('touchmove', handleTouchMove);
    document.getElementById('gameArea').addEventListener('touchend', handleTouchEnd);
    applyTheme(currentTheme);

    document.querySelector('#levelSection .modes-tab-button[onclick="setMode(\'medium\')"]').classList.add('active');
    document.querySelector('#themeSection .modes-tab-button[onclick="setTheme(\'default\')"]').classList.add('active');
    document.querySelector('#modifierSection .modes-tab-button[onclick="setModifier(\'none\')"]').classList.add('active');
    updateGameModeInfo();
};

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const saveCredentials = document.getElementById('saveCredentials').checked;

    if (!username || !password) {
        alert('Wypełnij wszystkie pola!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users_' + location.hostname) || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('loggedInUser_' + location.hostname, username);
        if (saveCredentials) {
            localStorage.setItem('savedUsername_' + location.hostname, username);
            localStorage.setItem('savedPassword_' + location.hostname, password);
        } else {
            localStorage.removeItem('savedUsername_' + location.hostname);
            localStorage.removeItem('savedPassword_' + location.hostname);
        }
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        document.getElementById('playerInfo').textContent = `Zalogowany: ${username}`;
        document.getElementById('playerInfo').style.display = 'block';
        document.getElementById('startGameBtn').style.display = 'inline-block';
        document.getElementById('modesBtn').style.display = 'inline-block';
        document.getElementById('indexBtn').style.display = 'inline-block';
        setMode(currentMode);
        setTheme(currentTheme);
        updateGameModeInfo();
    } else {
        alert('Nieprawidłowa nazwa użytkownika lub hasło!');
    }
}

function register() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const users = JSON.parse(localStorage.getItem('users_' + location.hostname) || '[]');

    if (!username || !password) {
        alert('Wypełnij wszystkie pola!');
        return;
    }

    if (users.find(u => u.username === username)) {
        alert('Ta nazwa użytkownika już istnieje!');
    } else {
        users.push({ username, password });
        localStorage.setItem('users_' + location.hostname, JSON.stringify(users));
        alert('Rejestracja udana! Zaloguj się.');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
}

function logout() {
    localStorage.removeItem('loggedInUser_' + location.hostname);
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('mainSection').style.display = 'none';
    resetGame();
}

function startGame() {
    if (!gameStarted && localStorage.getItem('loggedInUser_' + location.hostname)) {
        score = 0;
        time = currentModifier === 'oneMinute' ? 60 : modes[currentMode].initialTime;
        document.getElementById('score').textContent = score;
        document.getElementById('time').textContent = time;
        updateGameModeInfo();
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = '';
        if (currentModifier === 'duet') {
            gameArea.innerHTML += '<div class="player" style="transform: translateX(30vw); bottom: 2vh;">🧺</div>';
            gameArea.innerHTML += '<div class="second-player" style="transform: translateX(50vw); bottom: 2vh;">🧺</div>';
            playerPosition = 30;
            secondPlayerPosition = 50;
        } else if (currentModifier === 'miniBasket') {
            gameArea.innerHTML += '<div class="player mini-player" style="transform: translateX(35vw); bottom: 2vh;">🧺</div>';
        } else {
            gameArea.innerHTML += `<div class="player ${currentModifier === 'biggerBasket' ? 'bigger-player' : ''}" style="transform: translateX(35vw); bottom: 2vh;">🧺</div>`;
        }
        gameArea.style.display = 'block';
        document.getElementById('gameStats').style.display = 'flex';
        document.getElementById('stopButton').style.display = 'inline-block';
        gameStarted = true;
        isPaused = false;

        let lastSpawn = performance.now();
        function gameLoopTimestamp(timestamp) {
            if (!isPaused) {
                deltaTime = Math.min(0.1, (timestamp - lastTime) / 1000);
                lastTime = timestamp;
                time -= deltaTime;
                document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
                if (time <= 0) endGame();
                handleMagnet();
                updatePlayerPosition();
                checkCollisions();
            }
            gameLoop = requestAnimationFrame(gameLoopTimestamp);
        }
        gameLoop = requestAnimationFrame(gameLoopTimestamp);

        function spawnEmoji(timestamp) {
            if (!isPaused && timestamp - lastSpawn >= modes[currentMode].emojiInterval && emojiCount < maxEmojis && time > 0) {
                const emoji = document.createElement('div');
                emoji.className = 'emoji';
                const goodEmojis = themeEmojis[currentTheme].filter(e => e !== '🧲');
                const bombChance = modes[currentMode].bombChance;
                const magnetChance = modes[currentMode].magnetChance;
                const emojiData = Math.random() < bombChance ? { emoji: '💣', type: 'bad', id: Date.now() + Math.random() } :
                    Math.random() < magnetChance ? { emoji: '🧲', type: 'magnet', id: Date.now() + Math.random() } :
                    { emoji: goodEmojis[Math.floor(Math.random() * goodEmojis.length)], type: 'good', id: Date.now() + Math.random() };
                emoji.textContent = emojiData.emoji;
                emoji.dataset.type = emojiData.type;
                emoji.dataset.id = emojiData.id;
                emoji.style.left = Math.random() * (gameWidth - 7) + 'vw';
                const baseDuration = 5;
                const durationMultiplier = { easy: 1.5, medium: 1, hard: 0.7 };
                emoji.style.animationDuration = `${baseDuration * durationMultiplier[currentMode]}s`;
                gameArea.appendChild(emoji);
                emojiCount++;

                emoji.addEventListener('animationend', () => {
                    if (emoji.parentElement) {
                        emoji.parentElement.removeChild(emoji);
                        emojiCount--;
                    }
                });

                lastSpawn = timestamp;
            }
            if (time > 0 && !isPaused) emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
        }
        emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
    }
}

function exitGame() {
    if (gameStarted) {
        cancelAnimationFrame(gameLoop);
        cancelAnimationFrame(emojiSpawnLoop);
        cancelAnimationFrame(moveLoop);
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('gameStats').style.display = 'none';
        document.getElementById('stopButton').style.display = 'none';
        gameStarted = false;
        isPaused = false;
        emojiCount = 0;
        magnetActive = false;
        clearTimeout(magnetTimeout);
        alert(`Gra zakończona! Twój wynik: ${score}`);
        resetGame();
    }
}

function endGame() {
    cancelAnimationFrame(gameLoop);
    cancelAnimationFrame(emojiSpawnLoop);
    cancelAnimationFrame(moveLoop);
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('gameStats').style.display = 'none';
    document.getElementById('stopButton').style.display = 'none';
    gameStarted = false;
    isPaused = false;
    emojiCount = 0;
    magnetActive = false;
    clearTimeout(magnetTimeout);
    alert(`Czas się skończył! Twój wynik: ${score}`);
}

function resetGame() {
    cancelAnimationFrame(gameLoop);
    cancelAnimationFrame(emojiSpawnLoop);
    cancelAnimationFrame(moveLoop);
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('gameStats').style.display = 'none';
    document.getElementById('stopButton').style.display = 'none';
    gameStarted = false;
    isPaused = false;
    score = 0;
    time = 30;
    playerPosition = 35;
    targetPosition = 35;
    emojiCount = 0;
    magnetActive = false;
    clearTimeout(magnetTimeout);
    currentMode = 'medium';
    currentTheme = 'default';
    currentModifier = 'none';
    document.getElementById('gameArea').innerHTML = '';
    updateGameModeInfo();
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('#levelSection .modes-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#levelSection .modes-tab-button[onclick="setMode('${mode}')"]`).classList.add('active');
    updateGameModeInfo();
}

function setTheme(theme) {
    currentTheme = theme;
    document.querySelectorAll('#themeSection .modes-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#themeSection .modes-tab-button[onclick="setTheme('${theme}')"]`).classList.add('active');
    applyTheme(theme);
    updateGameModeInfo();
}

function applyTheme(theme) {
    document.body.className = '';
    document.body.classList.add(`${theme}-mode`);
    const gameArea = document.getElementById('gameArea');
    gameArea.className = 'container';
    gameArea.classList.add(`${theme}-mode`);
}

function setModifier(modifier) {
    currentModifier = modifier;
    document.querySelectorAll('#modifierSection .modes-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#modifierSection .modes-tab-button[onclick="setModifier('${modifier}')"]`).classList.add('active');
    updateGameModeInfo();
}

function updateGameModeInfo() {
    const modeInfo = document.getElementById('gameModeInfo');
    const themeInfo = document.getElementById('themeInfo');
    modeInfo.textContent = `Tryb: ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} | Modyfikator: ${currentModifier === 'none' ? 'Brak' : currentModifier.charAt(0).toUpperCase() + currentModifier.slice(1)}`;
    themeInfo.textContent = `Wygląd: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`;
}

function toggleModes() {
    const modesTab = document.getElementById('modesTab');
    modesTab.style.display = modesTab.style.display === 'flex' ? 'none' : 'flex';
}

function toggleIndex() {
    const indexTab = document.getElementById('indexTab');
    indexTab.style.display = indexTab.style.display === 'flex' ? 'none' : 'flex';
}

function showTab(tab) {
    document.querySelectorAll('.index-tab').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.index-tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tab}Tab`).style.display = 'block';
    document.querySelector(`.index-tab-button[onclick="showTab('${tab}')"]`).classList.add('active');
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
        targetPosition = Math.max(0, Math.min(playerPosition + deltaX / (window.innerWidth / 100) * 2, gameWidth - playerWidth));
        touchStartX = touchX;
        updatePlayerPosition();
    }
}

function handleTouchEnd() {
    if (gameStarted && !isPaused) {
        isMovingLeft = false;
        isMovingRight = false;
    }
}

function updatePlayerPosition() {
    if (currentModifier === 'duet') {
        const player = document.querySelector('.player');
        const secondPlayer = document.querySelector('.second-player');
        player.style.transform = `translateX(${playerPosition}vw)`;
        secondPlayer.style.transform = `translateX(${secondPlayerPosition}vw)`;
    } else {
        const player = document.querySelector('.player');
        player.style.transform = `translateX(${playerPosition}vw)`;
    }
    if (isMovingLeft && !isMovingRight) targetPosition -= moveSpeed * deltaTime;
    if (isMovingRight && !isMovingLeft) targetPosition += moveSpeed * deltaTime;
    playerPosition = Math.max(0, Math.min(targetPosition, gameWidth - (currentModifier === 'biggerBasket' ? playerWidth * 1.5 : currentModifier === 'miniBasket' ? playerWidth / 2 : playerWidth)));
    if (currentModifier === 'duet') {
        secondPlayerPosition = Math.max(playerPosition + 20, Math.min(targetPosition + 20, gameWidth - playerWidth));
    }
}

function checkCollisions() {
    const emojis = document.querySelectorAll('.emoji');
    const playerRect = document.querySelector('.player').getBoundingClientRect();
    const secondPlayerRect = document.querySelector('.second-player')?.getBoundingClientRect();
    const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
    const playerCenter = (playerRect.left + playerRect.right) / 2;
    const secondPlayerCenter = secondPlayerRect ? (secondPlayerRect.left + secondPlayerRect.right) / 2 : null;

    emojis.forEach(emoji => {
        const rect = emoji.getBoundingClientRect();
        const emojiX = (rect.left - gameAreaRect.left) / (gameAreaRect.width / 100);
        const collisionWidth = currentModifier === 'biggerBasket' ? playerWidth * 1.5 / 2 : currentModifier === 'miniBasket' ? playerWidth / 2 : playerWidth / 2;

        if (currentModifier === 'duet') {
            if (Math.abs(emojiX - playerPosition) < collisionWidth || (secondPlayerRect && Math.abs(emojiX - secondPlayerPosition) < collisionWidth)) {
                handleCollision(emoji);
            }
        } else if (Math.abs(emojiX - playerPosition) < collisionWidth) {
            handleCollision(emoji);
        }
    });
}

function handleCollision(emoji) {
    const type = emoji.dataset.type;
    const id = emoji.dataset.id;

    if (type === 'good') {
        const points = modes[currentMode].goodPoints[Math.floor(Math.random() * modes[currentMode].goodPoints.length)];
        const timeBonus = modes[currentMode].goodTime[Math.floor(Math.random() * modes[currentMode].goodTime.length)];
        score += points;
        time += timeBonus / 10;
        document.getElementById('score').textContent = score;
        document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
    } else if (type === 'bad') {
        const points = modes[currentMode].badPoints[0];
        const timePenalty = modes[currentMode].badTime[0];
        score += points;
        time += timePenalty / 10;
        document.getElementById('score').textContent = score;
        document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
    } else if (type === 'magnet') {
        magnetActive = true;
        clearTimeout(magnetTimeout);
        magnetTimeout = setTimeout(() => magnetActive = false, 5000);
    }

    if (emoji.parentElement) {
        emoji.parentElement.removeChild(emoji);
        emojiCount--;
    }
}

function handleMagnet() {
    if (magnetActive) {
        const emojis = document.querySelectorAll('.emoji');
        const playerRect = document.querySelector('.player').getBoundingClientRect();
        const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
        const playerCenter = (playerRect.left + playerRect.right) / 2;

        emojis.forEach(emoji => {
            const rect = emoji.getBoundingClientRect();
            const emojiX = (rect.left - gameAreaRect.left) / (gameAreaRect.width / 100);
            const distance = Math.abs(emojiX - playerPosition);
            if (distance < magnetRadius) {
                const pull = (magnetRadius - distance) * magnetPullStrength * deltaTime;
                const newX = emojiX + (playerPosition > emojiX ? pull : -pull);
                emoji.style.left = Math.max(0, Math.min(newX, gameWidth - 7)) + 'vw';
                const collisionWidth = currentModifier === 'biggerBasket' ? playerWidth * 1.5 / 2 : currentModifier === 'miniBasket' ? playerWidth / 2 : playerWidth / 2;
                if (Math.abs(emojiX - playerPosition) < collisionWidth) {
                    handleCollision(emoji);
                }
            }
        });
    }
}
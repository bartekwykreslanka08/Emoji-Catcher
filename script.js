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
let currentModifier = localStorage.getItem('currentModifier_' + location.hostname) || 'none';
let secondPlayerPosition = 55;

const modes = {
    easy: { initialTime: 50, goodPoints: [4, 5, 6, 5, 4, 6, 5, 4, 6, 5, 4, 6, 5], goodTime: [5, 6, 8, 6, 5, 7, 6, 5, 7, 6, 5, 8, 6], badPoints: [-5], badTime: [-6], emojiInterval: 800, fallDuration: 7000, bombChance: 0.2, magnetChance: 0.1 },
    medium: { initialTime: 30, goodPoints: [5, 6, 7, 6, 5, 7, 6, 5, 7, 6, 5, 7, 6], goodTime: [6, 7, 9, 7, 6, 8, 7, 6, 8, 7, 6, 9, 7], badPoints: [-6], badTime: [-7], emojiInterval: 600, fallDuration: 5000, bombChance: 0.4, magnetChance: 0.08 },
    hard: { initialTime: 15, goodPoints: [6, 7, 8, 7, 6, 8, 7, 6, 8, 7, 6, 9, 7], goodTime: [7, 8, 10, 8, 7, 9, 8, 7, 9, 8, 7, 10, 8], badPoints: [-7], badTime: [-8], emojiInterval: 400, fallDuration: 3000, bombChance: 0.6, magnetChance: 0.06 }
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
const magnetRadius = 40;
const magnetPullStrength = 2.5;

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
    document.querySelector(`#modifierSection .modes-tab-button[onclick="setModifier('${currentModifier}')"]`).classList.add('active');
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
        setModifier(currentModifier); // Przywraca zapisany modyfikator
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
                deltaTime = Math.min(0.05, (timestamp - lastTime) / 1000);
                lastTime = timestamp;
                time -= deltaTime;
                document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
                if (time <= 0) endGame();
                handleMagnet();
                updatePlayerPosition();
                checkCollisions();
                updateEmojiAnimation(timestamp);
            }
            gameLoop = requestAnimationFrame(gameLoopTimestamp);
        }
        gameLoop = requestAnimationFrame(gameLoopTimestamp);

        function spawnEmoji(timestamp) {
            if (!isPaused && timestamp - lastSpawn >= modes[currentMode].emojiInterval && emojiCount < maxEmojis && time > 0) {
                const emoji = document.createElement('div');
                emoji.className = 'emoji active';
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
                emoji.dataset.startTime = timestamp;
                gameArea.appendChild(emoji);
                emojiCount++;
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
        clearTimeout(magnetTimeout);
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('gameStats').style.display = 'none';
        document.getElementById('stopButton').style.display = 'none';
        gameStarted = false;
        isPaused = false;
        emojiCount = 0;
        magnetActive = false;
        alert(`Gra zakończona! Twój wynik: ${score}`);
        resetGame();
    }
}

function endGame() {
    if (gameStarted) {
        cancelAnimationFrame(gameLoop);
        cancelAnimationFrame(emojiSpawnLoop);
        cancelAnimationFrame(moveLoop);
        clearTimeout(magnetTimeout);
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('gameStats').style.display = 'none';
        document.getElementById('stopButton').style.display = 'none';
        gameStarted = false;
        isPaused = false;
        emojiCount = 0;
        magnetActive = false;
        alert(`Czas się skończył! Twój wynik: ${score}`);
        resetGame();
    }
}

function resetGame() {
    cancelAnimationFrame(gameLoop);
    cancelAnimationFrame(emojiSpawnLoop);
    cancelAnimationFrame(moveLoop);
    clearTimeout(magnetTimeout);
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('gameStats').style.display = 'none';
    document.getElementById('stopButton').style.display = 'none';
    gameStarted = false;
    isPaused = false;
    score = 0;
    time = currentModifier === 'oneMinute' ? 60 : modes[currentMode].initialTime;
    playerPosition = 35;
    targetPosition = 35;
    emojiCount = 0;
    magnetActive = false;
    document.getElementById('gameArea').innerHTML = '';
    updateGameModeInfo();
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('#levelSection .modes-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#levelSection .modes-tab-button[onclick="setMode('${mode}')"]`).classList.add('active');
    updateGameModeInfo();
    localStorage.setItem('currentMode_' + location.hostname, currentMode);
}

function setTheme(theme) {
    currentTheme = theme;
    document.querySelectorAll('#themeSection .modes-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#themeSection .modes-tab-button[onclick="setTheme('${theme}')"]`).classList.add('active');
    applyTheme(theme);
    updateGameModeInfo();
    localStorage.setItem('currentTheme_' + location.hostname, currentTheme);
}

function setModifier(modifier) {
    currentModifier = modifier;
    document.querySelectorAll('#modifierSection .modes-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#modifierSection .modes-tab-button[onclick="setModifier('${modifier}')"]`).classList.add('active');
    updateGameModeInfo();
    localStorage.setItem('currentModifier_' + location.hostname, currentModifier);
    if (gameStarted) resetGame();
}

function applyTheme(theme) {
    document.body.className = '';
    document.body.classList.add(`${theme}-mode`);
    const gameArea = document.getElementById('gameArea');
    gameArea.className = 'container';
    gameArea.classList.add(`${theme}-mode`);
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
    const emojis = document.querySelectorAll('.emoji.active');
    const playerRect = document.querySelector('.player').getBoundingClientRect();
    const secondPlayerRect = document.querySelector('.second-player')?.getBoundingClientRect();
    const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();

    emojis.forEach(emoji => {
        const rect = emoji.getBoundingClientRect();
        const emojiX = (rect.left - gameAreaRect.left) / (gameAreaRect.width / 100);
        const collisionWidth = (currentModifier === 'biggerBasket' ? playerWidth * 1.5 : currentModifier === 'miniBasket' ? playerWidth / 2 : playerWidth) / 2;
        const collisionHeight = (currentModifier === 'biggerBasket' ? playerRect.height * 1.2 : currentModifier === 'miniBasket' ? playerRect.height * 0.8 : playerRect.height) / 2;

        if (currentModifier === 'duet') {
            const playerOverlap = (Math.abs(emojiX - playerPosition) < collisionWidth &&
                                 rect.bottom >= playerRect.top + collisionHeight &&
                                 rect.top <= playerRect.bottom - collisionHeight &&
                                 rect.right >= playerRect.left && rect.left <= playerRect.right);
            const secondPlayerOverlap = (secondPlayerRect && Math.abs(emojiX - secondPlayerPosition) < collisionWidth &&
                                       rect.bottom >= secondPlayerRect.top + collisionHeight &&
                                       rect.top <= secondPlayerRect.bottom - collisionHeight &&
                                       rect.right >= secondPlayerRect.left && rect.left <= secondPlayerRect.right);
            if (playerOverlap || secondPlayerOverlap) {
                handleCollision(emoji);
            }
        } else {
            if (Math.abs(emojiX - playerPosition) < collisionWidth &&
                rect.bottom >= playerRect.top + collisionHeight &&
                rect.top <= playerRect.bottom - collisionHeight &&
                rect.right >= playerRect.left && rect.left <= playerRect.right) {
                handleCollision(emoji);
            }
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
        magnetTimeout = setTimeout(() => { magnetActive = false; }, 5000);
    }

    if (emoji.parentElement) {
        emoji.classList.remove('active');
        setTimeout(() => {
            if (emoji.parentElement) {
                emoji.parentElement.removeChild(emoji);
                emojiCount--;
            }
        }, 300);
    }
}

function handleMagnet() {
    if (magnetActive) {
        const emojis = document.querySelectorAll('.emoji.active');
        const playerRect = document.querySelector('.player').getBoundingClientRect();
        const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
        const playerCenterX = (playerRect.left + playerRect.right) / 2;

        emojis.forEach(emoji => {
            const rect = emoji.getBoundingClientRect();
            const emojiX = (rect.left - gameAreaRect.left) / (gameAreaRect.width / 100);
            const distance = Math.abs(emojiX - playerPosition);
            const verticalOverlap = Math.min(playerRect.bottom, rect.bottom) - Math.max(playerRect.top, rect.top);

            if (distance < magnetRadius && verticalOverlap > 0) {
                emoji.classList.add('magnet-effect');
                const pull = (magnetRadius - distance) * magnetPullStrength * deltaTime;
                let newX = emojiX + (playerPosition > emojiX ? pull : -pull);
                newX = Math.max(0, Math.min(newX, gameWidth - 7));
                emoji.style.left = newX + 'vw';

                const collisionWidth = (currentModifier === 'biggerBasket' ? playerWidth * 1.5 : currentModifier === 'miniBasket' ? playerWidth / 2 : playerWidth) / 2;
                if (Math.abs(newX - playerPosition) < collisionWidth && verticalOverlap >= playerRect.height / 2) {
                    handleCollision(emoji);
                    emoji.classList.remove('magnet-effect');
                }
            } else {
                emoji.classList.remove('magnet-effect');
            }
        });
    }
}

function updateEmojiAnimation(timestamp) {
    const emojis = document.querySelectorAll('.emoji');
    const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
    emojis.forEach(emoji => {
        const startTime = parseFloat(emoji.dataset.startTime);
        const fallDuration = modes[currentMode].fallDuration;
        const progress = Math.min(1, (timestamp - startTime) / fallDuration);
        const yOffset = -10 + progress * (gameAreaRect.height + 10);
        emoji.style.transform = `translateY(${yOffset}px)`;
        if (progress >= 1 && emoji.classList.contains('active')) {
            if (emoji.parentElement) {
                emoji.classList.remove('active');
                setTimeout(() => {
                    if (emoji.parentElement) {
                        emoji.parentElement.removeChild(emoji);
                        emojiCount--;
                    }
                }, 300);
            }
        }
    });
}

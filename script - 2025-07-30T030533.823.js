let score = 0;
let time = 30;
let gameLoop;
let emojiSpawnLoop;
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
    easy: { initialTime: 60, goodPoints: [3, 4, 5], goodTime: [4, 5, 6], badPoints: [-2], badTime: [-3], emojiInterval: 1000, fallDuration: 4000, bombChance: 0.1, magnetChance: 0.03, zeroChance: 0.02, dollarChance: 0.015 },
    medium: { initialTime: 45, goodPoints: [4, 5, 6], goodTime: [5, 6, 7], badPoints: [-3], badTime: [-4], emojiInterval: 800, fallDuration: 3000, bombChance: 0.2, magnetChance: 0.03, zeroChance: 0.02, dollarChance: 0.015 },
    hard: { initialTime: 30, goodPoints: [5, 6, 7], goodTime: [6, 7, 8], badPoints: [-4], badTime: [-5], emojiInterval: 600, fallDuration: 2000, bombChance: 0.35, magnetChance: 0.03, zeroChance: 0.02, dollarChance: 0.015 },
    hardPlus: { initialTime: 20, goodPoints: [6, 7, 8], goodTime: [7, 8, 9], badPoints: [-5], badTime: [-6], emojiInterval: 400, fallDuration: 1500, bombChance: 0.5, magnetChance: 0.03, zeroChance: 0.02, dollarChance: 0.015 }
};

const themeEmojis = {
    default: ['😊', '🥳', '🌟', '🎉', '👍', '😍', '🎂', '🌸', '🌈', '💎', '🎁', '🎶'],
    retro: ['🎱', '📼', '🎞️', '🎮', '📺', '💾', '🕹️', '📀', '💽', '🖥️', '🎧', '📡'],
    ocean: ['🐠', '🐳', '🐬', '🪸', '🌊', '🐚', '🪼', '🐡', '🐙', '🦑', '🐢', '🌴'],
    winter: ['❄️', '☃️', '🎄', '⛄', '🌨️', '🥶', '🎿', '🛷', '🌬️', '⛸️', '🧣', '🥐'],
    summer: ['☀️', '🏖️', '🍉', '🏝️', '🌴', '🏊', '🎣', '🌺', '🏄', '🏕️', '🍹', '🌞'],
    color: ['❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🤎', '🖤', '🩶', '🤍', '🩷'],
    evening: ['🌙', '⭐', '🌌', '🌃', '🌠', '🌅', '🌄', '🌇', '🌃', '🌌', '🌝', '🌞'],
    halloween: ['👻', '🎃', '🕸️', '💀', '🕯️', '🍬', '🧙‍♀️', '🦇', '🕷️', '🎭', '⚰️', '🍭'],
    neon: ['💡', '✨', '🔦', '💥', '🌈', '⚡', '💎', '🕒', '🔋', '🎮', '📱', '💾'],
    time: ['⏰', '⌛', '⏳', '🕰️', '⏱️', '⏲️', '🕒', '🕛', '🕐', '🕓', '🕕', '🕗'],
    food: ['🍔', '🍕', '🍟', '🍣', '🍜', '🌮', '🍩', '🍫', '🍰', '🥐', '🥪', '🍦'],
    animals: ['🐱', '🐶', '🐴', '🐷', '🐍', '🐘', '🐧', '🦁', '🐯', '🐸', '🐺', '🐰'],
    vehicles: ['🚗', '✈️', '🚂', '🚚', '🚀', '🏍️', '🚲', '🛵', '🚢', '🚁', '🚜', '🛴']
};

const maxEmojis = 15; // Maksymalna liczba emoji na ekranie
const gameWidth = 90;
const playerWidth = 8; // Domyślna szerokość koszyka
const moveSpeed = 20; // Szybkość ruchu koszyka
const magnetHeight = 50;

window.onload = () => {
    if (window.innerWidth > 1023) return;
    const loggedInUser = localStorage.getItem('loggedInUser_' + location.hostname);
    const savedUsername = localStorage.getItem('savedUsername_' + location.hostname);
    const savedPassword = localStorage.getItem('savedPassword_' + location.hostname);

    if (loggedInUser) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        document.getElementById('playerInfo').textContent = `Logged in: ${loggedInUser}`;
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
        alert('Fill in all fields!');
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
        document.getElementById('playerInfo').textContent = `Logged in: ${username}`;
        document.getElementById('playerInfo').style.display = 'block';
        document.getElementById('startGameBtn').style.display = 'inline-block';
        document.getElementById('modesBtn').style.display = 'inline-block';
        document.getElementById('indexBtn').style.display = 'inline-block';
        setMode(currentMode);
        setTheme(currentTheme);
        setModifier(currentModifier);
        updateGameModeInfo();
    } else {
        alert('Invalid username or password!');
    }
}

function register() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const users = JSON.parse(localStorage.getItem('users_' + location.hostname) || '[]');

    if (!username || !password) {
        alert('Fill in all fields!');
        return;
    }

    if (users.find(u => u.username === username)) {
        alert('This username already exists!');
    } else {
        users.push({ username, password });
        localStorage.setItem('users_' + location.hostname, JSON.stringify(users));
        alert('Registration successful! Please log in.');
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

        lastTime = performance.now();
        function gameLoopTimestamp(timestamp) {
            if (!isPaused) {
                deltaTime = Math.min(0.1, (timestamp - lastTime) / 1000); // Limit deltaTime dla stabilności
                lastTime = timestamp;
                time -= deltaTime;
                document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
                handleMagnet();
                updatePlayerPosition();
                checkCollisions();
                updateEmojiAnimation();
            }
            if (time <= 0) {
                endGame();
            }
            gameLoop = requestAnimationFrame(gameLoopTimestamp);
        }
        gameLoop = requestAnimationFrame(gameLoopTimestamp);

        let lastSpawn = performance.now();
        function spawnEmoji(timestamp) {
            if (!isPaused && timestamp - lastSpawn >= modes[currentMode].emojiInterval && emojiCount < maxEmojis && time > 0) {
                const emoji = document.createElement('div');
                emoji.className = 'emoji active';
                let emojiText;
                const random = Math.random();
                if (random < modes[currentMode].bombChance) {
                    emojiText = '💣';
                } else if (random < modes[currentMode].bombChance + modes[currentMode].zeroChance) {
                    emojiText = '0️⃣';
                } else if (random < modes[currentMode].bombChance + modes[currentMode].zeroChance + modes[currentMode].dollarChance) {
                    emojiText = '💲';
                } else if (random < modes[currentMode].bombChance + modes[currentMode].zeroChance + modes[currentMode].dollarChance + modes[currentMode].magnetChance && currentModifier !== 'disco' && currentModifier !== 'numbers') {
                    emojiText = '🧲';
                } else if (currentModifier === 'disco') {
                    emojiText = '🪩';
                } else if (currentModifier === 'numbers') {
                    const numbers = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                    emojiText = numbers[Math.floor(Math.random() * numbers.length)];
                } else {
                    const goodEmojis = themeEmojis[currentTheme].filter(e => e !== '🧲' && e !== '🪩' && !['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'].includes(e));
                    emojiText = goodEmojis[Math.floor(Math.random() * goodEmojis.length)];
                }
                emoji.textContent = emojiText;
                emoji.style.left = Math.random() * (gameWidth - 6) + 'vw';
                emoji.style.top = '-6vh';
                emoji.style.transition = `top ${modes[currentMode].fallDuration / 1000}s linear, opacity 0.3s ease`;
                document.getElementById('gameArea').appendChild(emoji);
                emojiCount++;
                lastSpawn = timestamp;
            }
            if (time > 0) {
                emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
            }
        }
        emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
    }
}

function endGame() {
    cancelAnimationFrame(gameLoop);
    cancelAnimationFrame(emojiSpawnLoop);
    gameStarted = false;
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('gameStats').style.display = 'none';
    document.getElementById('stopButton').style.display = 'none';
    alert(`Game over! Your score: ${score}`);
    resetGame();
    document.getElementById('mainSection').style.display = 'block';
    document.getElementById('loginSection').style.display = 'none';
}

function exitGame() {
    if (gameStarted) {
        cancelAnimationFrame(gameLoop);
        cancelAnimationFrame(emojiSpawnLoop);
        gameStarted = false;
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('gameStats').style.display = 'none';
        document.getElementById('stopButton').style.display = 'none';
        resetGame();
    }
}

function resetGame() {
    score = 0;
    time = modes[currentMode].initialTime;
    emojiCount = 0;
    magnetActive = false;
    clearTimeout(magnetTimeout);
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = time;
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';
    playerPosition = 35;
    targetPosition = 35;
    isMovingLeft = false;
    isMovingRight = false;
    gameArea.style.display = 'none';
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
    touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    if (gameStarted && !isPaused) {
        const touchX = e.touches[0].clientX;
        const deltaX = (touchX - touchStartX) / window.innerWidth * 100;
        targetPosition = Math.max(0, Math.min(gameWidth - playerWidth, playerPosition + deltaX * 0.5)); // Wolniejszy ruch na touch
        touchStartX = touchX;
    }
}

function handleTouchEnd() {
    isMovingLeft = false;
    isMovingRight = false;
}

function updatePlayerPosition() {
    if (gameStarted && !isPaused) {
        if (isMovingLeft && !isMovingRight) {
            targetPosition = Math.max(0, playerPosition - moveSpeed * deltaTime * 60);
        }
        if (isMovingRight && !isMovingLeft) {
            targetPosition = Math.min(gameWidth - playerWidth, playerPosition + moveSpeed * deltaTime * 60);
        }
        if (currentModifier === 'duet') {
            secondPlayerPosition = targetPosition + 20;
            if (secondPlayerPosition > gameWidth - playerWidth) secondPlayerPosition = gameWidth - playerWidth;
            document.querySelector('.second-player').style.transform = `translateX(${secondPlayerPosition}vw)`;
        }
        playerPosition = Math.max(0, Math.min(gameWidth - playerWidth, targetPosition)); // Zapobiega wychodzeniu poza ekran
        document.querySelector('.player').style.transform = `translateX(${playerPosition}vw)`;
    }
}

function checkCollisions() {
    if (gameStarted && !isPaused) {
        const emojis = document.getElementsByClassName('emoji');
        const player = document.querySelector('.player');
        const playerRect = player.getBoundingClientRect();
        const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();

        for (let emoji of emojis) {
            const emojiRect = emoji.getBoundingClientRect();
            const adjustedPlayerRect = {
                left: playerRect.left - gameAreaRect.left,
                right: playerRect.right - gameAreaRect.left,
                top: playerRect.top - gameAreaRect.top,
                bottom: playerRect.bottom - gameAreaRect.top
            };
            const adjustedEmojiRect = {
                left: emojiRect.left - gameAreaRect.left,
                right: emojiRect.right - gameAreaRect.left,
                top: emojiRect.top - gameAreaRect.top,
                bottom: emojiRect.bottom - gameAreaRect.top
            };

            if (currentModifier === 'duet') {
                const secondPlayer = document.querySelector('.second-player');
                const secondPlayerRect = secondPlayer.getBoundingClientRect();
                const adjustedSecondPlayerRect = {
                    left: secondPlayerRect.left - gameAreaRect.left,
                    right: secondPlayerRect.right - gameAreaRect.left,
                    top: secondPlayerRect.top - gameAreaRect.top,
                    bottom: secondPlayerRect.bottom - gameAreaRect.top
                };

                if (doRectsOverlap(adjustedPlayerRect, adjustedEmojiRect) || doRectsOverlap(adjustedSecondPlayerRect, adjustedEmojiRect)) {
                    handleEmojiCollision(emoji);
                }
            } else {
                if (doRectsOverlap(adjustedPlayerRect, adjustedEmojiRect)) {
                    handleEmojiCollision(emoji);
                }
            }
        }
    }
}

function handleEmojiCollision(emoji) {
    const emojiText = emoji.textContent;
    if (emojiText === '💣') {
        score += modes[currentMode].badPoints[0];
        time += modes[currentMode].badTime[0];
    } else if (emojiText === '0️⃣') {
        score = Math.max(0, score - 10); // Mniejszy reset punktowy
        time = Math.max(5, time - 5); // Minimalny czas 5s
    } else if (emojiText === '💲') {
        score += 50;
        time += 20;
    } else if (emojiText === '🧲' && !magnetActive) {
        magnetActive = true;
        emoji.classList.add('magnet-effect');
        magnetTimeout = setTimeout(() => {
            magnetActive = false;
            emoji.classList.remove('magnet-effect');
        }, 5000); // 5 sekund działania magnesu
    } else if (currentModifier === 'disco' && emojiText === '🪩') {
        const randomPoints = Math.floor(Math.random() * 21) - 5; // -5 do +15
        const randomTime = Math.floor(Math.random() * 11) - 5; // -5 do +5
        score += randomPoints;
        time += randomTime > 0 ? randomTime : Math.min(randomTime, -1);
    } else if (currentModifier === 'numbers' && ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'].includes(emojiText)) {
        const value = parseInt(emojiText.replace(/️⃣/, '')) || 0;
        score += value * 2; // Podwójna wartość punktów
        time += value;
    } else {
        const goodEmojis = themeEmojis[currentTheme].filter(e => e !== '🧲' && e !== '🪩' && !['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'].includes(e));
        const index = goodEmojis.indexOf(emojiText);
        if (index !== -1) {
            const pointIndex = modes[currentMode].goodPoints[Math.floor(Math.random() * modes[currentMode].goodPoints.length)];
            const timeIndex = modes[currentMode].goodTime[Math.floor(Math.random() * modes[currentMode].goodTime.length)];
            score += pointIndex;
            time += timeIndex;
        }
    }
    emoji.style.opacity = '0';
    setTimeout(() => {
        emoji.remove();
        emojiCount--;
    }, 300);
    document.getElementById('score').textContent = Math.max(0, score); // Zapobiega ujemnym punktom
    document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
}

function doRectsOverlap(rect1, rect2) {
    return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}

function handleMagnet() {
    if (magnetActive) {
        const emojis = document.getElementsByClassName('emoji');
        const player = document.querySelector('.player');
        const playerRect = player.getBoundingClientRect();
        const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
        const playerCenterX = (playerRect.left + playerRect.right) / 2 - gameAreaRect.left;
        const playerY = playerRect.top - gameAreaRect.top;

        for (let emoji of emojis) {
            if (!emoji.classList.contains('magnet-effect')) {
                const emojiRect = emoji.getBoundingClientRect();
                const emojiX = (emojiRect.left + emojiRect.right) / 2 - gameAreaRect.left;
                const emojiY = emojiRect.top - gameAreaRect.top;
                const distance = Math.sqrt((playerCenterX - emojiX) ** 2 + (playerY - emojiY) ** 2);

                if (distance < magnetHeight) {
                    const angle = Math.atan2(playerY - emojiY, playerCenterX - emojiX);
                    const speed = 0.5 * (1 - distance / magnetHeight); // Szybsze przyciąganie bliżej
                    emoji.style.left = (parseFloat(emoji.style.left) + Math.cos(angle) * speed * 100) + 'vw';
                    emoji.style.top = (parseFloat(emoji.style.top) + Math.sin(angle) * speed * 100) + 'vh';
                    emoji.classList.add('magnet-effect');
                }
            }
        }
    }
}

function updateEmojiAnimation() {
    const emojis = document.getElementsByClassName('emoji');
    for (let emoji of emojis) {
        const top = parseFloat(emoji.style.top) || 0;
        if (top > 70) { // Po przekroczeniu dolnej krawędzi
            emoji.style.opacity = '0';
            setTimeout(() => {
                emoji.remove();
                emojiCount--;
            }, 300);
        }
    }
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('#levelSection .modes-tab-button, #modesContent #levelSection .modes-tab-button').forEach(button => button.classList.remove('active'));
    document.querySelectorAll(`#levelSection .modes-tab-button[onclick="setMode('${mode}')"], #modesContent #levelSection .modes-tab-button[onclick="setMode('${mode}')"]`).forEach(button => button.classList.add('active'));
    updateGameModeInfo();
}

function setTheme(theme) {
    currentTheme = theme;
    document.querySelectorAll('#themeSection .modes-tab-button, #modesContent #themeSection .modes-tab-button').forEach(button => button.classList.remove('active'));
    document.querySelectorAll(`#themeSection .modes-tab-button[onclick="setTheme('${theme}')"], #modesContent #themeSection .modes-tab-button[onclick="setTheme('${theme}')"]`).forEach(button => button.classList.add('active'));
    applyTheme(theme);
}

function applyTheme(theme) {
    document.body.className = theme + '-mode';
    document.getElementById('themeInfo').textContent = `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
}

function setModifier(modifier) {
    currentModifier = modifier;
    localStorage.setItem('currentModifier_' + location.hostname, modifier);
    document.querySelectorAll('#modifierSection .modes-tab-button, #modesContent #modifierSection .modes-tab-button').forEach(button => button.classList.remove('active'));
    document.querySelectorAll(`#modifierSection .modes-tab-button[onclick="setModifier('${modifier}')"], #modesContent #modifierSection .modes-tab-button[onclick="setModifier('${modifier}')"]`).forEach(button => button.classList.add('active'));
    updateGameModeInfo();
}

function toggleModes() {
    const modesTab = document.getElementById('modesTab');
    const indexTab = document.getElementById('indexTab');
    modesTab.style.display = modesTab.style.display === 'flex' ? 'none' : 'flex';
    indexTab.style.display = 'none';
    document.getElementById('mainSection').style.display = modesTab.style.display === 'flex' ? 'none' : 'block';
}

function toggleIndex() {
    const modesTab = document.getElementById('modesTab');
    const indexTab = document.getElementById('indexTab');
    indexTab.style.display = indexTab.style.display === 'flex' ? 'none' : 'flex';
    modesTab.style.display = 'none';
    document.getElementById('mainSection').style.display = indexTab.style.display === 'flex' ? 'none' : 'block';
}

function showTab(tab) {
    document.querySelectorAll('.index-tab').forEach(t => t.style.display = 'none');
    document.getElementById(`${tab}Tab`).style.display = 'block';
    document.querySelectorAll('.index-tab-button').forEach(button => button.classList.remove('active'));
    document.querySelector(`.index-tab-button[onclick="showTab('${tab}')"]`).classList.add('active');
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

function updateGameModeInfo() {
    document.getElementById('gameModeInfo').textContent = `Mode: ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`;
    document.getElementById('themeInfo').textContent = `Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`;
}
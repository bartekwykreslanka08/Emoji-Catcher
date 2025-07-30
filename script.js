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
let currentModifier = localStorage.getItem('currentModifier_' + location.hostname) || 'none';
let secondPlayerPosition = 55;

const modes = {
    easy: { initialTime: 50, goodPoints: [4, 5, 6], goodTime: [5, 6, 8], badPoints: [-5], badTime: [-6], emojiInterval: 800, fallDuration: 3000, bombChance: 0.1, dollarChance: 0.02, zeroChance: 0.025 },
    medium: { initialTime: 30, goodPoints: [5, 6, 7], goodTime: [6, 7, 9], badPoints: [-5], badTime: [-6], emojiInterval: 600, fallDuration: 2000, bombChance: 0.2, dollarChance: 0.02, zeroChance: 0.025 },
    hard: { initialTime: 15, goodPoints: [6, 7, 8], goodTime: [7, 8, 10], badPoints: [-5], badTime: [-6], emojiInterval: 400, fallDuration: 1500, bombChance: 0.3, dollarChance: 0.02, zeroChance: 0.025 },
    hardPlus: { initialTime: 10, goodPoints: [7, 8, 9], goodTime: [8, 9, 11], badPoints: [-5], badTime: [-6], emojiInterval: 300, fallDuration: 1200, bombChance: 0.5, dollarChance: 0.02, zeroChance: 0.025 }
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
    food: ['🍎', '🍕', '🍔', '🍟', '🥐', '🍫', '🍰', '🥗', '🍜', '🍩', '🍣', '🥓'],
    animals: ['🐶', '🐱', '🐰', '🦊', '🐼', '🐷', '🐴', '🐍', '🐘', '🐅', '🐺', '🦁'],
    vehicles: ['🚗', '🚓', '🚑', '✈️', '🚢', '🚲', '🛵', '🚜', '🚚', '🚀', '🛴', '🚁']
};

const maxEmojis = 12;
const gameWidth = 90;
const playerWidth = 12;
const moveSpeed = 15;

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
                deltaTime = (timestamp - lastTime) / 1000;
                lastTime = timestamp;
                time -= deltaTime;
                document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
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
                } else if (random < modes[currentMode].bombChance + modes[currentMode].dollarChance) {
                    emojiText = '💲';
                } else if (random < modes[currentMode].bombChance + modes[currentMode].dollarChance + modes[currentMode].zeroChance) {
                    emojiText = '0️⃣';
                } else if (currentModifier === 'disco') {
                    emojiText = '🪩';
                } else if (currentModifier === 'numbers') {
                    const numberEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                    emojiText = numberEmojis[Math.floor(Math.random() * numberEmojis.length)];
                } else {
                    const goodEmojis = themeEmojis[currentTheme].filter(e => e !== '💣' && e !== '💲' && e !== '0️⃣' && e !== '🪩');
                    emojiText = goodEmojis[Math.floor(Math.random() * goodEmojis.length)];
                }
                emoji.textContent = emojiText;
                emoji.style.left = Math.random() * (gameWidth - 6) + 'vw';
                emoji.style.top = '-6vh';
                emoji.style.transition = `top ${modes[currentMode].fallDuration / 1000}s linear, opacity 0.1s ease`;
                emoji.style.fontSize = '6.5vh'; // Dopasowanie do koszyka
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
        targetPosition = Math.max(0, Math.min(gameWidth - playerWidth, playerPosition + deltaX));
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
        playerPosition = targetPosition;
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
    } else if (emojiText === '💲') {
        score += 100;
        time += 50;
    } else if (emojiText === '0️⃣') {
        endGame();
        return;
    } else if (currentModifier === 'disco' && emojiText === '🪩') {
        const randomPoints = Math.floor(Math.random() * 11) - 5; // -5 do +5
        const randomTime = Math.floor(Math.random() * 11) - 5; // -5 do +5
        score += randomPoints;
        time += randomTime;
    } else if (currentModifier === 'numbers') {
        const numberValue = parseInt(emojiText.replace(/[^0-9]/g, ''));
        score += numberValue;
        time += numberValue;
    } else {
        const index = themeEmojis[currentTheme].indexOf(emojiText);
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
    }, 100);
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
}

function doRectsOverlap(rect1, rect2) {
    return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}

function updateEmojiAnimation() {
    const emojis = document.getElementsByClassName('emoji');
    for (let emoji of emojis) {
        const rect = emoji.getBoundingClientRect();
        const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
        if (rect.bottom >= gameAreaRect.bottom) {
            if (emoji.textContent === '💣') {
                score += modes[currentMode].badPoints[0];
                time += modes[currentMode].badTime[0];
            }
            emoji.remove();
            emojiCount--;
            document.getElementById('score').textContent = score;
            document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
        } else {
            let currentTop = parseFloat(emoji.style.top || '-6');
            currentTop += (100 / modes[currentMode].fallDuration) * deltaTime * 1000;
            emoji.style.top = `${currentTop}vh`;
        }
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('#levelSection .modes-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#levelSection .modes-tab-button[onclick="setMode('${mode}')"]`).classList.add('active');
    updateGameModeInfo();
    if (gameStarted) {
        exitGame();
        startGame();
    }
}

function setTheme(theme) {
    currentTheme = theme;
    document.querySelectorAll('#themeSection .modes-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#themeSection .modes-tab-button[onclick="setTheme('${theme}')"]`).classList.add('active');
    applyTheme(theme);
    updateGameModeInfo();
    if (gameStarted) {
        exitGame();
        startGame();
    }
}

function setModifier(modifier) {
    currentModifier = modifier;
    localStorage.setItem('currentModifier_' + location.hostname, modifier);
    document.querySelectorAll('#modifierSection .modes-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#modifierSection .modes-tab-button[onclick="setModifier('${modifier}')"]`).classList.add('active');
    updateGameModeInfo();
    if (gameStarted) {
        exitGame();
        startGame();
    }
}

function applyTheme(theme) {
    document.body.className = '';
    document.body.classList.add(theme + '-mode');
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
    document.getElementById(tab + 'Tab').style.display = 'block';
    document.querySelectorAll('.index-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.index-tab-button[onclick="showTab('${tab}')"]`).classList.add('active');
}

function updateGameModeInfo() {
    document.getElementById('gameModeInfo').textContent = `Mode: ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}`;
    document.getElementById('themeInfo').textContent = `Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`;
    if (currentModifier !== 'none') {
        document.getElementById('gameModeInfo').textContent += ` (${currentModifier.charAt(0).toUpperCase() + currentModifier.slice(1)})`;
    }
}

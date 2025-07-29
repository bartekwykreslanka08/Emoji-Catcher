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

function showTopScores() {
    document.getElementById('topScoresSection').style.display = 'flex';
    document.getElementById('gameArea').style.display = 'none';
    cancelAnimationFrame(emojiSpawnLoop);
    const loggedInUser = localStorage.getItem('loggedInUser_' + location.hostname);
    const userTopScores = topScores.filter(s => s.player === loggedInUser);
    const topScoresList = document.getElementById('topScoresList');
    topScoresList.innerHTML = '';
    ['easy', 'medium', 'hard'].forEach(mode => {
        const modeScores = userTopScores.filter(s => s.mode === mode).sort((a, b) => b.score - a.score).slice(0, 5);
        if (modeScores.length > 0) {
            topScoresList.innerHTML += `<h3 style="color: #8a95a5; font-size: 4.5vw;">${mode.charAt(0).toUpperCase() + mode.slice(1)}:</h3><ul>`;
            modeScores.forEach((s, i) => {
                topScoresList.innerHTML += `<li>${i + 1}. ${s.score} pkt (${new Date(s.timestamp).toLocaleDateString()})</li>`;
            });
            topScoresList.innerHTML += `</ul>`;
        }
    });
}

function hideTopScores() {
    document.getElementById('topScoresSection').style.display = 'none';
}

function toggleModes() {
    const modesTab = document.getElementById('modesTab');
    modesTab.style.display = modesTab.style.display === 'flex' ? 'none' : 'flex';
}

function toggleIndex() {
    const indexTab = document.getElementById('indexTab');
    indexTab.style.display = indexTab.style.display === 'flex' ? 'none' : 'flex';
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
        time = currentModifier === 'oneMinute' ? 60 : modes[currentMode].initialTime;
        document.getElementById('score').textContent = score;
        document.getElementById('time').textContent = time;
        cancelAnimationFrame(gameLoop);
        cancelAnimationFrame(emojiSpawnLoop);
        cancelAnimationFrame(moveLoop);
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
        document.querySelector('.game-stats').style.display = 'block';
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
            }
            gameLoop = requestAnimationFrame(gameLoopTimestamp);
        }
        gameLoop = requestAnimationFrame(gameLoopTimestamp);

        function spawnEmoji(timestamp) {
            if (!isPaused && timestamp - lastSpawn >= modes[currentMode].emojiInterval && emojiCount < maxEmojis) {
                if (time > 0) {
                    const emoji = document.createElement('div');
                    emoji.className = 'emoji';
                    const goodEmojis = themeEmojis[currentTheme].filter(e => e !== '🧲' && e !== '💣');
                    const bombChance = modes[currentMode].bombChance;
                    const magnetChance = modes[currentMode].magnetChance;
                    const emojiData = Math.random() < bombChance ? { emoji: '💣', type: 'bad' } :
                        Math.random() < magnetChance ? { emoji: '🧲', type: 'magnet' } :
                        { emoji: goodEmojis[Math.floor(Math.random() * goodEmojis.length)], type: 'good' };
                    emoji.textContent = emojiData.emoji;
                    emoji.style.left = Math.random() * (gameWidth - 7) + 'vw';
                    const baseDuration = 5;
                    const durationMultiplier = { easy: 1.5, medium: 1, hard: 0.7 };
                    emoji.style.animationDuration = `${baseDuration * durationMultiplier[currentMode]}s`;
                    gameArea.appendChild(emoji);
                    emojiCount++;

                    function animateEmoji() {
                        const rect = emoji.getBoundingClientRect();
                        const gameAreaRect = gameArea.getBoundingClientRect();
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
                                        const collisionZoneTop = 60;
                                        const collisionZoneBottom = 68;
                                        const collisionZoneLeft = playerX - (collisionWidth / 2);
                                        const collisionZoneRight = playerX + (collisionWidth / 2);

                                        return top >= collisionZoneTop && top <= collisionZoneBottom &&
                                            emojiX >= collisionZoneLeft && emojiX <= collisionZoneRight;
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
                                        emoji.style.left = `${Math.max(0, Math.min(gameWidth - 7, newX))}vw`;
                                    }
                                }

                                if ((player && checkCollision(playerRect)) || (secondPlayer && checkCollision(secondPlayerRect))) {
                                    const modeData = modes[currentMode];
                                    if (emojiData.type === 'magnet') {
                                        magnetActive = true;
                                        score += 10;
                                        document.getElementById('score').textContent = score;
                                        magnetTimeout = setTimeout(() => { magnetActive = false; }, 5000);
                                    } else {
                                        const points = emojiData.type === 'good' ? modeData.goodPoints[Math.floor(Math.random() * modeData.goodPoints.length)] : modeData.badPoints[0];
                                        const timeChange = emojiData.type === 'good' ? modeData.goodTime[Math.floor(Math.random() * modeData.goodTime.length)] : modeData.badTime[0];
                                        score += points;
                                        time += timeChange;
                                        document.getElementById('score').textContent = score;
                                        document.getElementById('time').textContent = Math.max(0, Math.round(time * 10) / 10);
                                    }
                                    emoji.remove();
                                    emojiCount--;
                                } else {
                                    requestAnimationFrame(animateEmoji);
                                }
                            } else {
                                requestAnimationFrame(animateEmoji);
                            }
                        }
                    }
                    requestAnimationFrame(animateEmoji);
                }
                lastSpawn = timestamp;
            }
            if (time > 0) emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
        }
        emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
    } else {
        alert('Musisz być zalogowany, aby rozpocząć grę!');
    }
}

function stopGame() {
    if (gameStarted && !isPaused) endGame();
}

function endGame() {
    cancelAnimationFrame(gameLoop);
    cancelAnimationFrame(emojiSpawnLoop);
    cancelAnimationFrame(moveLoop);
    gameStarted = false;
    document.getElementById('gameArea').style.display = 'none';
    const player = localStorage.getItem('loggedInUser_' + location.hostname);
    if (player) {
        topScores.push({ player, score, mode: currentMode, timestamp: new Date().toISOString() });
        topScores.sort((a, b) => b.score - a.score);
        topScores = topScores.slice(0, 15);
        localStorage.setItem('topScores_' + location.hostname, JSON.stringify(topScores));
    }
    document.getElementById('mainSection').style.display = 'block';
    document.querySelector('.game-stats').style.display = 'none';
}

function toggleGamePause() {
    isPaused = !isPaused;
    if (isPaused) cancelAnimationFrame(emojiSpawnLoop);
    else emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
}

function startMove(direction) {
    if (gameStarted && !isPaused) {
        if (direction === 'left') isMovingLeft = true;
        else if (direction === 'right') isMovingRight = true;
        updateMovement();
    }
}

function stopMove() {
    isMovingLeft = false;
    isMovingRight = false;
    cancelAnimationFrame(moveLoop);
}

function handleKeyDown(event) {
    if (gameStarted && !isPaused) {
        if (event.key === 'ArrowLeft') startMove('left');
        else if (event.key === 'ArrowRight') startMove('right');
        else if (event.key === 'p' || event.key === 'P') toggleGamePause();
    }
}

function handleKeyUp(event) {
    if (gameStarted && !isPaused) {
        if (event.key === 'ArrowLeft') stopMove();
        else if (event.key === 'ArrowRight') stopMove();
    }
}

function handleTouchStart(event) {
    if (gameStarted && !isPaused) touchStartX = event.touches[0].clientX;
}

function handleTouchMove(event) {
    if (gameStarted && !isPaused) {
        const touchX = event.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();
        const touchPosition = (touchX - gameAreaRect.left) / gameAreaRect.width * 100;
        targetPosition = Math.max(0, Math.min(gameWidth - playerWidth, playerPosition + (deltaX / gameAreaRect.width) * 100));
        if (currentModifier === 'duet') {
            secondPlayerPosition = targetPosition + 20;
            if (secondPlayerPosition > gameWidth - playerWidth) secondPlayerPosition = gameWidth - playerWidth;
            document.querySelector('.second-player').style.transform = `translateX(${secondPlayerPosition}vw)`;
        }
        playerPosition = targetPosition;
        const player = document.querySelector('.player');
        if (player) player.style.transform = `translateX(${playerPosition}vw)`;
        touchStartX = touchX;
        event.preventDefault();
    }
}

function handleTouchEnd() {
    if (gameStarted && !isPaused) {
        // Ruch zatrzymuje się po puszczeniu palca
    }
}

function updateMovement() {
    if (gameStarted && !isPaused) {
        const player = document.querySelector('.player');
        const secondPlayer = document.querySelector('.second-player');
        if (player || secondPlayer) {
            targetPosition = playerPosition + (isMovingLeft ? -moveSpeed * deltaTime : isMovingRight ? moveSpeed * deltaTime : 0);
            targetPosition = Math.max(0, Math.min(gameWidth - playerWidth, targetPosition));
            if (currentModifier === 'duet') {
                secondPlayerPosition = targetPosition + 20;
                if (secondPlayerPosition > gameWidth - playerWidth) secondPlayerPosition = gameWidth - playerWidth;
                if (secondPlayer) secondPlayer.style.transform = `translateX(${secondPlayerPosition}vw)`;
            }
            playerPosition = targetPosition;
            if (player) player.style.transform = `translateX(${playerPosition}vw)`;
            moveLoop = requestAnimationFrame(updateMovement);
        }
    }
}

function setMode(mode) {
    currentMode = mode;
    time = currentModifier === 'oneMinute' ? 60 : modes[mode].initialTime;
    document.getElementById('time').textContent = time;
    showSubTab('modes', 'mode');
}

function setTheme(theme) {
    currentTheme = theme;
    applyTheme(theme);
    showSubTab('modes', 'theme');
}

function applyTheme(theme) {
    document.body.className = '';
    document.body.classList.add(theme + '-mode');
}

function setModifier(modifier) {
    currentModifier = modifier;
    if (modifier === 'oneMinute') time = 60;
    else time = modes[currentMode].initialTime;
    document.getElementById('time').textContent = time;
    showSubTab('modes', 'modifier');
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

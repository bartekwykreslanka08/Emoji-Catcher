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
    easy: { initialTime: 50, goodPoints: [4, 5, 6, 5, 4, 6, 5, 4], goodTime: [5, 6, 8, 6, 5, 7, 6, 5], badPoints: [-5], badTime: [-6], emojiInterval: 800, bombChance: 0.3, magnetChance: 0.1 },
    medium: { initialTime: 30, goodPoints: [5, 6, 7, 6, 5, 7, 6, 5], goodTime: [6, 7, 9, 7, 6, 8, 7, 6], badPoints: [-6], badTime: [-7], emojiInterval: 600, bombChance: 0.4, magnetChance: 0.08 },
    hard: { initialTime: 15, goodPoints: [6, 7, 8, 7, 6, 8, 7, 6], goodTime: [7, 8, 10, 8, 7, 9, 8, 7], badPoints: [-7], badTime: [-8], emojiInterval: 400, bombChance: 0.5, magnetChance: 0.06 }
};

const themeEmojis = {
    default: ['😊', '🥳', '🌟', '🎉', '👍', '😍', '🎂', '🌸', '🧲'],
    retro: ['🎱', '📼', '🎞️', '🎮', '📺', '💾', '🕹️', '📀', '🧲'],
    ocean: ['🐠', '🐳', '🐬', '🪸', '🌊', '🐚', '🪼', '🐡', '🧲'],
    winter: ['❄️', '☃️', '🎄', '⛄', '🌨️', '🥶', '🎿', '🛷', '🧲'],
    summer: ['☀️', '🏖️', '🍉', '🏝️', '🌴', '🏊', '🎣', '🌺', '🧲'],
    color: ['❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🤎', '🖤', '🩶', '🤍', '🩷', '🧲'],
    evening: ['🌙', '⭐', '🌌', '🌃', '🌠', '🌅', '🌄', '🌇', '🧲'],
    halloween: ['👻', '🎃', '🕸️', '💀', '🕯️', '🍬', '🧙‍♀️', '🦇', '🧲']
};

const maxEmojis = 12;
const gameWidth = 80;
const playerWidth = 12;
const moveSpeed = 15;
const magnetRadius = 20;

window.onload = () => {
    const loadingScreen = document.querySelector('.loading-screen');
    setTimeout(() => {
        loadingScreen.style.display = 'none';
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
        if (loggedInUser) {
            login();
        }
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        document.getElementById('gameArea').addEventListener('touchstart', handleTouchStart);
        document.getElementById('gameArea').addEventListener('touchmove', handleTouchMove);
        document.getElementById('gameArea').addEventListener('touchend', handleTouchEnd);
        applyTheme(currentTheme);
        document.querySelector('.modes-tab-button[onclick="setMode(\'medium\')"]').classList.add('active');
        document.querySelector('.modes-tab-button[onclick="setTheme(\'default\')"]').classList.add('active');
    }, 2000);
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
    document.getElementById('topScoresSection').style.display = 'block';
    document.getElementById('gameArea').style.display = 'none';
    cancelAnimationFrame(emojiSpawnLoop);
    const loggedInUser = localStorage.getItem('loggedInUser_' + location.hostname);
    const userTopScores = topScores.filter(s => s.player === loggedInUser);
    const topScoresList = document.getElementById('topScoresList');
    topScoresList.innerHTML = '';
    ['easy', 'medium', 'hard'].forEach(mode => {
        const modeScores = userTopScores.filter(s => s.mode === mode).sort((a, b) => b.score - a.score).slice(0, 5);
        if (modeScores.length > 0) {
            topScoresList.innerHTML += `<h3 style="color: #8b95a1; font-size: 4.5vw;">${mode.charAt(0).toUpperCase() + mode.slice(1)}:</h3><ul>`;
            modeScores.forEach((s, i) => {
                topScoresList.innerHTML += `<li>${i + 1}. ${s.score} pkt (${new Date(s.timestamp).toLocaleDateString()})</li>`;
            });
            topScoresList.innerHTML += `</ul>`;
        }
    });
}

function backToMain() {
    document.getElementById('topScoresSection').style.display = 'none';
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
        } else {
            gameArea.innerHTML += `<div class="player ${currentModifier === 'biggerBasket' ? 'bigger-player' : ''}" style="transform: translateX(35vw); bottom: 2vh;">🧺</div>`;
        }
        gameArea.style.display = 'block';
        document.querySelector('.game-stats').style.display = 'block'; // Wyświetlanie ramki od razu
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
                if (time <= 0) {
                    endGame();
                }
            }
            gameLoop = requestAnimationFrame(gameLoopTimestamp);
        }
        gameLoop = requestAnimationFrame(gameLoopTimestamp);

        function spawnEmoji(timestamp) {
            if (!isPaused && timestamp - lastSpawn >= modes[currentMode].emojiInterval && emojiCount < maxEmojis) {
                if (time > 0) {
                    const emoji = document.createElement('div');
                    emoji.className = 'emoji';
                    const goodEmojis = themeEmojis[currentTheme].filter(e => e !== '🧲');
                    const bombChance = modes[currentMode].bombChance;
                    const magnetChance = modes[currentMode].magnetChance;
                    const emojiData = Math.random() < bombChance ? { emoji: '💣', type: 'bad' } :
                        Math.random() < magnetChance ? { emoji: '🧲', type: 'magnet' } :
                        { emoji: goodEmojis[Math.floor(Math.random() * goodEmojis.length)], type: 'good' };
                    emoji.textContent = emojiData.emoji;
                    emoji.style.left = Math.random() * (gameWidth - 7) + 'vw';
                    emoji.style.animationDuration = `${3 + Math.random() * 2}s`;
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
                                        const collisionZoneTop = 60;
                                        const collisionZoneBottom = 68;
                                        const collisionZoneLeft = playerX - (playerWidth / (currentModifier === 'biggerBasket' ? 1.5 : 2));
                                        const collisionZoneRight = playerX + (playerWidth / (currentModifier === 'biggerBasket' ? 1.5 : 2));

                                        return top >= collisionZoneTop && top <= collisionZoneBottom &&
                                            emojiX >= collisionZoneLeft && emojiX <= collisionZoneRight;
                                    }
                                    return false;
                                };

                                if (magnetActive) {
                                    const playerX = playerPosition;
                                    const distance = Math.abs(emojiX - playerX);
                                    if (distance <= magnetRadius) {
                                        const pullSpeed = 1.5 * (magnetRadius - distance) * deltaTime;
                                        if (emojiX < playerX) {
                                            emoji.style.left = `${Math.max(0, parseFloat(emoji.style.left) + pullSpeed)}vw`;
                                        } else {
                                            emoji.style.left = `${Math.min(gameWidth - 7, parseFloat(emoji.style.left) - pullSpeed)}vw`;
                                        }
                                    }
                                }

                                if ((player && checkCollision(playerRect)) || (secondPlayer && checkCollision(secondPlayerRect))) {
                                    const modeData = modes[currentMode];
                                    if (emojiData.type === 'magnet') {
                                        magnetActive = true;
                                        score += 10;
                                        document.getElementById('score').textContent = score;
                                        magnetTimeout = setTimeout(() => { magnetActive = false; }, 10000);
                                    } else {
                                        const points = emojiData.type === 'good' ? modeData.goodPoints[goodEmojis.indexOf(emojiData.emoji) % modeData.goodPoints.length] : modeData.badPoints[0];
                                        const timeChange = emojiData.type === 'good' ? modeData.goodTime[goodEmojis.indexOf(emojiData.emoji) % modeData.goodTime.length] : modeData.badTime[0];
                                        score += points;
                                        time += timeChange / 10;
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
    gameStarted = false;
    document.getElementById('gameArea').style.display = 'none';
    document.querySelector('.game-stats').style.display = 'none';
    document.getElementById('stopButton').style.display = 'none';
    const player = localStorage.getItem('loggedInUser_' + location.hostname);
    if (player) {
        topScores.push({ player, score, mode: currentMode, timestamp: new Date().toISOString() });
        topScores.sort((a, b) => b.score - a.score);
        topScores = topScores.slice(0, 15);
        localStorage.setItem('topScores_' + location.hostname, JSON.stringify(topScores));
    }
    showTopScores();
}

function toggleGamePause() {
    isPaused = !isPaused;
    if (isPaused) {
        cancelAnimationFrame(emojiSpawnLoop);
    } else {
        emojiSpawnLoop = requestAnimationFrame(spawnEmoji);
    }
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
    if (gameStarted && !isPaused) {
        touchStartX = event.touches[0].clientX;
    }
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
        if (player) {
            if (isMovingLeft && !isMovingRight) {
                targetPosition = Math.max(0, playerPosition - moveSpeed * deltaTime);
            } else if (isMovingRight && !isMovingLeft) {
                targetPosition = Math.min(gameWidth - playerWidth, playerPosition + moveSpeed * deltaTime);
            }
            if (currentModifier === 'duet') {
                secondPlayerPosition = targetPosition + 20;
                if (secondPlayerPosition > gameWidth - playerWidth) secondPlayerPosition = gameWidth - playerWidth;
                document.querySelector('.second-player').style.transform = `translateX(${secondPlayerPosition}vw)`;
            }
            playerPosition = targetPosition;
            player.style.transform = `translateX(${playerPosition}vw)`;
            moveLoop = requestAnimationFrame(updateMovement);
        }
    }
}

function setMode(mode) {
    if (!gameStarted) {
        currentMode = mode;
        document.querySelectorAll('.modes-tab-button[onclick^="setMode"]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.modes-tab-button[onclick="setMode('${mode}')"]`).classList.add('active');
        time = currentModifier === 'oneMinute' ? 60 : modes[mode].initialTime;
        document.getElementById('time').textContent = time;
    }
}

function setTheme(theme) {
    if (!gameStarted) {
        currentTheme = theme;
        document.querySelectorAll('.modes-tab-button[onclick^="setTheme"]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.modes-tab-button[onclick="setTheme('${theme}')"]`).classList.add('active');
        applyTheme(theme);
    }
}

function setModifier(modifier) {
    if (!gameStarted) {
        currentModifier = modifier;
        document.querySelectorAll('.modes-tab-button[onclick^="setModifier"]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.modes-tab-button[onclick="setModifier('${modifier}')"]`).classList.add('active');
        time = modifier === 'oneMinute' ? 60 : modes[currentMode].initialTime;
        document.getElementById('time').textContent = time;
    }
}

function toggleModes() {
    const modesTab = document.getElementById('modesTab');
    if (modesTab.style.display === 'none') {
        modesTab.style.display = 'flex';
        document.getElementById('indexTab').style.display = 'none';
    } else {
        modesTab.style.display = 'none';
    }
}

function toggleIndex() {
    const indexTab = document.getElementById('indexTab');
    if (indexTab.style.display === 'none') {
        indexTab.style.display = 'flex';
        document.getElementById('modesTab').style.display = 'none';
        showTab(currentTheme);
    } else {
        indexTab.style.display = 'none';
    }
}

function toggleLogin() {
    const loginSection = document.getElementById('loginSection');
    const mainSection = document.getElementById('mainSection');
    if (loginSection.style.display === 'none') {
        loginSection.style.display = 'block';
        mainSection.style.display = 'none';
    } else {
        loginSection.style.display = 'none';
        mainSection.style.display = 'block';
    }
}

function showTab(theme) {
    document.querySelectorAll('.index-tab').forEach(tab => tab.style.display = 'none');
    document.getElementById(`${theme}Tab`).style.display = 'block';
    document.querySelectorAll('.index-tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.index-tab-button[onclick="showTab('${theme}')"]`).classList.add('active');
}

function applyTheme(theme) {
    document.body.className = '';
    if (theme === 'retro') {
        document.body.classList.add('retro-mode');
    } else if (theme === 'ocean') {
        document.body.classList.add('ocean-mode');
    } else if (theme === 'winter') {
        document.body.classList.add('winter-mode');
    } else if (theme === 'summer') {
        document.body.classList.add('summer-mode');
    } else if (theme === 'color') {
        document.body.classList.add('color-mode');
    } else if (theme === 'evening') {
        document.body.classList.add('evening-mode');
    } else if (theme === 'halloween') {
        document.body.classList.add('halloween-mode');
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '🔍';
    }
}

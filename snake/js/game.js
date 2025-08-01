let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let gridSize = 25;
let tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let apple = { x: 5, y: 5 };
let combo = 0;
let highCombo = 0;
let nickname = '';

document.addEventListener('keydown', keyPush);

function startGame() {
    nickname = document.getElementById('nicknameInput').value.trim();
    if (nickname === '') return;
    document.getElementById('overlay').style.display = 'none';
    requestAnimationFrame(gameLoop);
    fetchScores();
}

function keyPush(evt) {
    switch(evt.keyCode) {
        case 37: velocity = { x: -1, y: 0 }; break;
        case 38: velocity = { x: 0, y: -1 }; break;
        case 39: velocity = { x: 1, y: 0 }; break;
        case 40: velocity = { x: 0, y: 1 }; break;
    }
}

function gameLoop() {
    let head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
    snake.unshift(head);
    if (head.x === apple.x && head.y === apple.y) {
        combo++;
        if (combo > highCombo) highCombo = combo;
        placeApple();
    } else {
        snake.pop();
    }

    if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount || snakeCollision()) {
        saveScore();
        combo = 0;
        snake = [{ x: 10, y: 10 }];
        velocity = { x: 0, y: 0 };
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function snakeCollision() {
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

function placeApple() {
    apple.x = Math.floor(Math.random() * tileCount);
    apple.y = Math.floor(Math.random() * tileCount);
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    ctx.fillStyle = 'white';
    for (let part of snake) {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
    }
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(apple.x * gridSize + gridSize / 2, apple.y * gridSize + gridSize / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    document.getElementById('combo').textContent = combo;
    document.getElementById('highCombo').textContent = highCombo;
}

function saveScore() {
    fetch('php/save_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `nickname=${encodeURIComponent(nickname)}&score=${highCombo}`
    }).then(() => fetchScores());
}

function fetchScores() {
    fetch('php/get_scores.php')
        .then(res => res.json())
        .then(data => {
            let ranking = document.getElementById('ranking');
            ranking.innerHTML = '';
            data.forEach((entry, index) => {
                ranking.innerHTML += `#${index + 1} - ${entry.nickname} : x${entry.score} <span class="date">${entry.date}</span><br>`;
            });
        });
}

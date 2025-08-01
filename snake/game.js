
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let food = randomPosition();
let combo = 0;
let highestCombo = 0;
let speed = 200;
let interval;
let nickname = "";
let ranking = [];

document.getElementById('startBtn').addEventListener('click', () => {
  nickname = document.getElementById('nicknameInput').value.trim().substring(0, 12);
  if (nickname === "") return;
  document.getElementById('startScreen').style.display = 'none';
  resetGame();
  interval = setInterval(gameLoop, speed);
  fetchRanking();
});

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 0, y: 0 };
  food = randomPosition();
  combo = 0;
  speed = 200;
  highestCombo = 0;
  updateComboDisplay();
}

function randomPosition() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
  return position;
}

function gameLoop() {
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(s => s.x === head.x && s.y === head.y)) {
    clearInterval(interval);
    if (combo > 0) saveScore(nickname, combo);
    setTimeout(() => {
      resetGame();
      interval = setInterval(gameLoop, speed);
    }, 1000);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    combo++;
    if (combo > highestCombo) highestCombo = combo;
    updateComboDisplay();
    food = randomPosition();
    if (snake.length === tileCount * tileCount) {
      clearInterval(interval);
      speed = Math.max(50, speed - 20);
      setTimeout(() => {
        resetGame();
        interval = setInterval(gameLoop, speed);
      }, 1000);
    }
  } else {
    snake.pop();
  }

  drawGame();
}

function drawGame() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  for (let x = 0; x < tileCount; x++) {
    for (let y = 0; y < tileCount; y++) {
      ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
  }

  ctx.fillStyle = "white";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  ctx.fillStyle = "#0f0";
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });
}

function updateComboDisplay() {
  document.getElementById('combo').textContent = `x${combo}`;
  document.getElementById('highestCombo').textContent = `highest: x${highestCombo}`;
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
      if (velocity.y === 0) velocity = { x: 0, y: -1 };
      break;
    case "ArrowDown":
    case "s":
      if (velocity.y === 0) velocity = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
    case "a":
      if (velocity.x === 0) velocity = { x: -1, y: 0 };
      break;
    case "ArrowRight":
    case "d":
      if (velocity.x === 0) velocity = { x: 1, y: 0 };
      break;
  }
});

function saveScore(name, score) {
  fetch('php/save_score.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `name=${encodeURIComponent(name)}&score=${score}`
  }).then(() => fetchRanking());
}

function fetchRanking() {
  fetch('php/get_scores.php')
    .then(res => res.json())
    .then(data => {
      const rankingEl = document.getElementById('ranking');
      rankingEl.innerHTML = "";
      data.forEach((entry, index) => {
        const li = document.createElement("li");
        li.innerHTML = `#${index + 1} - ${entry.name.padEnd(12)} : x${entry.score} <span style="color: #555; font-size: 0.75rem;">${entry.date}</span>`;
        rankingEl.appendChild(li);
      });
    });
}

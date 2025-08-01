
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxOiDOhHc14-7mz6K8tZD-L2M-yNEDnvs",
  authDomain: "snake-frack-one.firebaseapp.com",
  projectId: "snake-frack-one",
  storageBucket: "snake-frack-one.firebasestorage.app",
  messagingSenderId: "429155382978",
  appId: "1:429155382978:web:16f740d28fdd2de8fd6d5b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// save score to firestore
async function saveScore(nick, score) {
  try {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB'); // dd/mm/yyyy
    await addDoc(collection(db, "scores"), {
      nick,
      score,
      date: dateStr,
      timestamp: today.getTime()
    });
  } catch (e) {
    console.error("error adding score: ", e);
  }
}

// get top 10 scores from firestore
async function getTopScores() {
  const scoresRef = collection(db, "scores");
  const q = query(scoresRef, orderBy("score", "desc"), orderBy("timestamp", "asc"), limit(10));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}

window.saveScore = saveScore;
window.getTopScores = getTopScores;


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");
const modal = document.getElementById("name-modal");
const input = document.getElementById("player-name");
const ranking = document.getElementById("ranking");

const grid = 20;
const count = canvas.width / grid;
let snake = [];
let velocity = { x: 0, y: 0 };
let nextVelocity = { x: 0, y: 0 };
let food;
let foodTimer;
let score = 0;
let highscore = 0;
let baseSpeed = 90;
let speed = baseSpeed;
let player = "";
let interval;
let started = false;
let isAccelerating = false;
let topScores = [];

function setNickname() {
  player = input.value.trim() || "player";
  modal.style.display = "none";
  start();
}

function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * count),
      y: Math.floor(Math.random() * count),
    };
  } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y));
  return newFood;
}

function moveFoodRandomly() {
  foodTimer = setInterval(() => {
    if (!started) {
      food = spawnFood();
    } else {
      clearInterval(foodTimer);
    }
  }, 500);
}

function drawGrid() {
  ctx.strokeStyle = "#222";
  for (let i = 0; i <= count; i++) {
    ctx.beginPath();
    ctx.moveTo(i * grid, 0);
    ctx.lineTo(i * grid, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * grid);
    ctx.lineTo(canvas.width, i * grid);
    ctx.stroke();
  }
}

function drawSnake() {
  ctx.fillStyle = "white";
  snake.forEach((s) => {
    ctx.fillRect(s.x * grid, s.y * grid, grid, grid);
  });
}

function drawFood() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(food.x * grid + grid / 2, food.y * grid + grid / 2, grid / 3, 0, 2 * Math.PI);
  ctx.fill();
}

function update() {
  velocity = nextVelocity;
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= count || head.y >= count ||
    snake.some((s) => s.x === head.x && s.y === head.y)
  ) {
    clearInterval(interval);
    if (score > highscore) highscore = score;
    updateHighscore();
    updateRanking();
    reset();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    food = spawnFood();
    scoreDisplay.innerText = "combo x" + score;
    if (score > highscore) {
      highscore = score;
      updateHighscore();
    }
    if (snake.length >= count * count) {
      clearInterval(interval);
      speed -= 10;
      reset();
      interval = setInterval(loop, isAccelerating ? speed / 2 : speed);
    }
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawSnake();
  drawFood();
}

function loop() {
  update();
  draw();
}

function updateHighscore() {
  highscoreDisplay.innerText = "highest combo: x" + highscore;
}

function updateRanking() {
  if (highscore === 0) return;

  let existing = topScores.find(entry => entry.name === player);
  if (existing) {
    if (highscore > existing.score) {
      existing.score = highscore;
    }
  } else {
    topScores.push({ name: player, score: highscore });
  }

  topScores.sort((a, b) => b.score - a.score);
  topScores = topScores.slice(0, 10);

  ranking.innerHTML = "";
  topScores.forEach((entry, index) => {
    const name = entry.name.padEnd(14, ' ');
    const score = `x${entry.score}`.padStart(4, ' ');
    const li = document.createElement("li");
    li.innerText = `#${(index + 1)} - ${name}: ${score}`;
    ranking.appendChild(li);
  });
}

function reset() {
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 0, y: 0 };
  nextVelocity = { x: 0, y: 0 };
  food = spawnFood();
  score = 0;
  speed = baseSpeed;
  scoreDisplay.innerText = "combo x0";
  interval = setInterval(loop, isAccelerating ? speed / 2 : speed);
}

function start() {
  reset();
  moveFoodRandomly();
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (!started && ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    started = true;
  }
  if ((key === "arrowup" || key === "w") && velocity.y === 0) nextVelocity = { x: 0, y: -1 };
  if ((key === "arrowdown" || key === "s") && velocity.y === 0) nextVelocity = { x: 0, y: 1 };
  if ((key === "arrowleft" || key === "a") && velocity.x === 0) nextVelocity = { x: -1, y: 0 };
  if ((key === "arrowright" || key === "d") && velocity.x === 0) nextVelocity = { x: 1, y: 0 };

  if (key === " ") {
    if (!isAccelerating) {
      isAccelerating = true;
      clearInterval(interval);
      interval = setInterval(loop, speed / 2);
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === " ") {
    isAccelerating = false;
    clearInterval(interval);
    interval = setInterval(loop, speed);
  }
});


// add event listener to start button
document.getElementById("startBtn").addEventListener("click", () => {
  const input = document.getElementById("nameInput");
  const nickname = input.value.trim().slice(0, 12);

  if (nickname.length === 0) return;

  player = nickname;
  localStorage.setItem("nickname", player);

  document.getElementById("startScreen").style.display = "none";

  start();
});

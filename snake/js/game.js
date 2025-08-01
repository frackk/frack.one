
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxOiDOhHc14-7mz6K8tZD-L2M-yNEDnvs",
  authDomain: "snake-frack-one.firebaseapp.com",
  projectId: "snake-frack-one",
  storageBucket: "snake-frack-one.appspot.com",
  messagingSenderId: "429155382978",
  appId: "1:429155382978:web:16f740d28fdd2de8fd6d5b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const comboEl = document.getElementById("combo");
const highComboEl = document.getElementById("highCombo");
const rankingEl = document.getElementById("ranking");
const startScreen = document.getElementById("startScreen");
const nicknameInput = document.getElementById("nickname");

let snake, dx, dy, food, speed, nickname, combo, highCombo = 0, gameOver;
let gridSize = 20;
let tileCount = canvas.width / gridSize;

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 0; dy = 0;
  food = randomFood();
  combo = 0;
  speed = 200;
  gameOver = false;
  updateUI();
}

function randomFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function updateUI() {
  comboEl.textContent = "x" + combo;
  highComboEl.textContent = "x" + highCombo;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#333";
  for (let x = 0; x < canvas.width; x += gridSize) {
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.strokeRect(x, y, gridSize, gridSize);
    }
  }

  ctx.fillStyle = "white";
  snake.forEach(s => ctx.fillRect(s.x * gridSize, s.y * gridSize, gridSize, gridSize));
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/3, 0, 2 * Math.PI);
  ctx.fill();
}

function move() {
  if (dx === 0 && dy === 0) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount || snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver = true;
    setTimeout(() => {
      if (combo > highCombo) {
        highCombo = combo;
        submitScore(highCombo);
      }
      resetGame();
    }, 1000);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    combo++;
    food = randomFood();
    if (combo % 10 === 0) {
      speed = Math.max(50, speed - 10);
    }
  } else {
    snake.pop();
  }

  updateUI();
}

async function submitScore(score) {
  const now = new Date();
  await addDoc(collection(db, "scores"), {
    nickname: nickname,
    score: score,
    date: now.toISOString().split("T")[0]
  });
  loadRanking();
}

async function loadRanking() {
  const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
  const querySnapshot = await getDocs(q);
  rankingEl.innerHTML = "";
  let index = 1;
  querySnapshot.forEach(doc => {
    const { nickname, score, date } = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `#${index} - ${nickname.padEnd(12, "_")} : x${score} <span class="date">${date}</span>`;
    rankingEl.appendChild(li);
    index++;
  });
}

function loop() {
  if (!gameOver) {
    move();
    draw();
  }
  setTimeout(loop, speed);
}

document.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  if (key === "arrowup" || key === "w") { if (dy === 0) { dx = 0; dy = -1; } }
  if (key === "arrowdown" || key === "s") { if (dy === 0) { dx = 0; dy = 1; } }
  if (key === "arrowleft" || key === "a") { if (dx === 0) { dx = -1; dy = 0; } }
  if (key === "arrowright" || key === "d") { if (dx === 0) { dx = 1; dy = 0; } }
});

window.startGame = () => {
  nickname = nicknameInput.value.trim().substring(0, 12);
  if (!nickname) return;
  startScreen.style.display = "none";
  resetGame();
  loadRanking();
};

loop();

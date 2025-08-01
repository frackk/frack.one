
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// firebase config
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

// game variables
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
let box = 20;
let snake = [];
let direction = "right";
let food = {};
let score = 0;
let maxScore = 0;
let nickname = "";
let gameInterval;
let speed = 150;

document.getElementById("startButton").onclick = () => {
  const input = document.getElementById("nickname").value.trim().toLowerCase();
  if (input.length > 0 && input.length <= 12) {
    nickname = input;
    document.getElementById("startScreen").style.display = "none";
    startGame();
  }
};

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "w"].includes(key) && direction !== "down") direction = "up";
  if (["arrowdown", "s"].includes(key) && direction !== "up") direction = "down";
  if (["arrowleft", "a"].includes(key) && direction !== "right") direction = "left";
  if (["arrowright", "d"].includes(key) && direction !== "left") direction = "right";
});

function startGame() {
  snake = [{ x: 9 * box, y: 9 * box }];
  direction = "right";
  score = 0;
  speed = 150;
  placeFood();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
  updateRanking();
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#333";
  for (let x = 0; x < canvas.width; x += box)
    for (let y = 0; y < canvas.height; y += box)
      ctx.strokeRect(x, y, box, box);

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#fff" : "#aaa";
    ctx.fillRect(segment.x, segment.y, box, box);
  });

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 3, 0, Math.PI * 2);
  ctx.fill();

  let head = { ...snake[0] };
  if (direction === "right") head.x += box;
  if (direction === "left") head.x -= box;
  if (direction === "up") head.y -= box;
  if (direction === "down") head.y += box;

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width || head.y >= canvas.height ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    maxScore = Math.max(score, maxScore);
    if (score > 0) saveScore(score);
    return startGame();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    if (score > 0 && score % 10 === 0 && speed > 50) {
      clearInterval(gameInterval);
      speed -= 10;
      gameInterval = setInterval(draw, speed);
    }
    placeFood();
  } else {
    snake.pop();
  }

  ctx.fillStyle = "#fff";
  ctx.fillText("combo: x" + score, 10, 390);
  ctx.fillStyle = "#888";
  ctx.fillText("highest combo: x" + maxScore, 10, 380);
}

async function saveScore(points) {
  try {
    await addDoc(collection(db, "scores"), {
      name: nickname,
      points,
      date: new Date().toLocaleDateString("en-GB")
    });
    updateRanking();
  } catch (e) {
    console.error("error saving score:", e);
  }
}

async function updateRanking() {
  try {
    const q = query(collection(db, "scores"), orderBy("points", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const ranking = document.getElementById("ranking");
    ranking.innerHTML = "";
    querySnapshot.forEach((doc, i) => {
      const d = doc.data();
      const line = `#${i + 1} - ${d.name.padEnd(12)} : x${d.points}   ${d.date}`;
      const li = document.createElement("li");
      li.textContent = line;
      ranking.appendChild(li);
    });
  } catch (e) {
    console.error("error loading ranking:", e);
  }
}

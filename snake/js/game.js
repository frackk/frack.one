// snake v9 style + mysql backend (no firebase)
// all-lowercase comments & ids per user's style

// canvas & ui
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const rankingEl = document.getElementById('ranking');
const comboEl = document.getElementById('combo');
const highestEl = document.getElementById('highest');
const modal = document.getElementById('nickname-modal');
const input = document.getElementById('nickname-input');
const startBtn = document.getElementById('start-btn');
const backHomeLink = document.querySelector('.back-home');

// gameplay constants
const cell = 20; // grid size
const cols = Math.floor(canvas.width / cell);
const rows = Math.floor(canvas.height / cell);

// state
let snake, dir, pendingDir, foods, running, tickMs, speedLevel;
let combo = 0;
let highestCombo = 0;
let nick = '';
let startedMove = false; // until first move, food teleports
let accelerate = false;

// utilities
const randInt = (n) => Math.floor(Math.random()*n);
const same = (a,b) => a.x===b.x && a.y===b.y;

// foods logic (support 1 or sometimes 2 foods)
function spawnFoods(teleport=false){
  const want = Math.random() < 0.25 ? 2 : 1; // 25% chance to have 2
  foods = [];
  for (let i=0;i<want;i++){
    foods.push(randFreeCell());
  }
  if (teleport && !startedMove){
    clearTimeout(spawnFoods._t);
    spawnFoods._t = setTimeout(()=>spawnFoods(true), 120); // faster pre-start teleport
  }
}

// find a free cell not on snake or other foods
function randFreeCell(){
  let pos, tries=0;
  do {
    pos = { x: randInt(cols), y: randInt(rows) };
    tries++; if (tries>5000) break;
  } while (snake.some(s=> same(s,pos)) || (foods && foods.some(f=> same(f,pos))));
  return pos;
}

// sfx (random on eat, low volume)
const sfxFiles = [
  'audio/fatality.wav','audio/bubble.wav','audio/mcbow.wav',
  'audio/neverlose.wav','audio/skeet.wav','audio/cod.wav'
];
const sfx = sfxFiles.map(p=>{ const a=new Audio(p); a.volume=0.18; return a; });
function playEatSfx(){
  try{
    const i = Math.floor(Math.random()*sfx.length);
    if (sfx[i]) { sfx[i].currentTime = 0; sfx[i].play().catch(()=>{}); }
  }catch(e){}
}

// init
function init(){
  snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2)}];
  dir = {x:0,y:0};
  pendingDir = null;
  combo = 0;
  tickMs = 85; // slightly faster default
  speedLevel = 0;
  startedMove = false;
  spawnFoods(true);
  updateHud();
  if (!running) loop();
}

// draw subtle grid + foods + snake
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // grid
  ctx.strokeStyle = 'rgba(255,255,255,.08)';
  for (let x=0; x<cols; x++){
    ctx.beginPath();
    ctx.moveTo(x*cell+0.5, 0);
    ctx.lineTo(x*cell+0.5, canvas.height);
    ctx.stroke();
  }
  for (let y=0; y<rows; y++){
    ctx.beginPath();
    ctx.moveTo(0, y*cell+0.5);
    ctx.lineTo(canvas.width, y*cell+0.5);
    ctx.stroke();
  }

  // foods (white star-like dots)
  ctx.fillStyle = '#fff';
  if (Array.isArray(foods)){
    for (const f of foods){
      ctx.beginPath();
      ctx.arc(f.x*cell + cell/2, f.y*cell + cell/2, cell*0.25, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // snake
  for (let i=0;i<snake.length;i++){
    ctx.fillStyle = i===0 ? '#fff' : '#ddd';
    ctx.fillRect(snake[i].x*cell+1, snake[i].y*cell+1, cell-2, cell-2);
  }
}

// tick
function step(){
  // direction change handling
  if (pendingDir){
    dir = pendingDir; pendingDir = null;
    startedMove = true;
  }
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // no movement until player moves
  if (dir.x===0 && dir.y===0){
    return; // just draw
  }

  // collisions (walls or self)
  if (head.x<0 || head.y<0 || head.x>=cols || head.y>=rows || snake.some(s=> same(s,head))){
    if (highestCombo>0) maybeSave(highestCombo);
    init();
    return;
  }

  // advance
  snake.unshift(head);

  // eat check
  let ate = false;
  if (Array.isArray(foods)) {
    for (let i=0;i<foods.length;i++) {
      if (same(head, foods[i])) {
        ate = true;
        foods.splice(i,1);
        combo++;
        if (combo > highestCombo) highestCombo = combo;
        updateHud();
        playEatSfx();
        break;
      }
    }
  }
  if (ate) {
    if (foods.length === 0) {
      spawnFoods(false);
    } else if (foods.length === 1 && Math.random() < 0.15) {
      foods.push(randFreeCell());
    }
  } else {
    snake.pop();
  }

  // full map (win)
  if (snake.length >= cols*rows){
    tickMs = Math.max(40, tickMs-10);
    init();
    return;
  }
}

function updateHud(){
  comboEl.textContent = `combo x${combo}`;
  highestEl.textContent = `highest combo: x${highestCombo}`;
}

function loop(){
  running = true;
  const nowTick = Math.max(18, tickMs * (accelerate? 0.55 : 1));
  draw();
  step();
  setTimeout(loop, nowTick);
}

// input: wasd + arrows + hold space to accelerate
document.addEventListener('keydown', (e)=>{
  const k = e.key.toLowerCase();
  if (k==='f12' || (e.ctrlKey && e.shiftKey && (k==='i' || k==='j')) || (e.ctrlKey && k==='u')) {
    e.preventDefault(); e.stopPropagation(); return false;
  }
  if (k===' ') accelerate = true;

  if ((k==='arrowup'||k==='w') && dir.y!==1) pendingDir = {x:0,y:-1};
  if ((k==='arrowdown'||k==='s') && dir.y!==-1) pendingDir = {x:0,y:1};
  if ((k==='arrowleft'||k==='a') && dir.x!==1) pendingDir = {x:-1,y:0};
  if ((k==='arrowright'||k==='d') && dir.x!==-1) pendingDir = {x:1,y:0};
});
document.addEventListener('keyup', (e)=>{ if (e.key===' ') accelerate=false; });

// start flow
startBtn.addEventListener('click', setNickname);
input.addEventListener('keydown', (e)=>{ if (e.key==='Enter') setNickname(); });

function setNickname(){
  const v = (input.value||'').trim().toLowerCase().slice(0,12);
  if (!v) return;
  nick = v;
  modal.style.display = 'none';
  init();
  fetchTop();
  positionBackHome();
}

// mysql backend calls (php)
async function maybeSave(score){
  try{
    await fetch('php/save_score.php', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: new URLSearchParams({ name: nick, score: String(score) })
    });
    fetchTop();
  }catch(err){}
}

async function fetchTop(){
  try{
    const r = await fetch('php/get_scores.php');
    const data = await r.json();
    renderTop(Array.isArray(data)?data:[]);
  }catch(err){}
}

// render top with aligned lines and grey date
function renderTop(list){
  rankingEl.innerHTML = '';
  list.slice(0,10).forEach((row,i)=>{
    const rank = i+1;
    const nm = (row.name||'player').toLowerCase().slice(0,12);
    const pts = Number(row.score||0);
    const date = row.date_fmt || row.date || '';
    const namePadded = nm.padEnd(14, ' ');
    const scoreText = `x${pts}`;
    const lineText = `#${rank} - ${namePadded}: ${scoreText}`;
    const li = document.createElement('li');
    li.className = 'mono';
    li.style.whiteSpace = 'pre';
    const spanDate = document.createElement('span');
    spanDate.className = 'date';
    spanDate.textContent = ` ${date}`;
    li.textContent = lineText;
    li.appendChild(spanDate);
    rankingEl.appendChild(li);
  });
  positionBackHome();
}

// position back-home to the right of the game, aligned to canvas bottom
function positionBackHome(){
  const container = document.querySelector('.container');
  const canvasRect = canvas.getBoundingClientRect();
  const scoreboard = document.querySelector('.scoreboard');
  const sbRect = scoreboard.getBoundingClientRect();
  const contRect = container.getBoundingClientRect();
  const link = backHomeLink;
  if (!link) return;
  const left = (sbRect.left - contRect.left) + 8;
  const top = (canvasRect.bottom - contRect.top) - link.offsetHeight - 8;
  link.style.left = left + 'px';
  link.style.top  = top + 'px';
}

window.addEventListener('resize', positionBackHome);
setTimeout(positionBackHome, 0);

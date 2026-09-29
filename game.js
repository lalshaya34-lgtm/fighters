const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let player;
let enemies = [];

let gameRunning = true;
let spawnTimer = 0;
let score = 0;

function startGame() {
  player = new Player();
  enemies = [];
  gameRunning = true;
  score = 0;

  updateUI();
  showMessage("🦆 Defeat animals and upgrade your duck!");
}

function spawnEnemy() {
  // Stronger animals become available as you level up.
  let available = enemyTypes.filter((enemy, index) => {
    return index <= Math.min(
      enemyTypes.length - 1,
      Math.floor((player.level - 1) / 2)
    );
  });

  const type =
    available[Math.floor(Math.random() * available.length)];

  enemies.push(new Enemy(type));
}

function update() {
  if (!gameRunning) return;

  player.update();

  spawnTimer--;

  if (spawnTimer <= 0) {
    spawnEnemy();

    const difficulty =
      Math.max(600, CONFIG.enemySpawnTime - player.level * 70);

    spawnTimer = difficulty;
  }

  enemies.forEach(enemy => {
    enemy.update(player);
  });

  updateMessage();
  updateUI();
}

function drawBackground() {
  // sky
  ctx.fillStyle = "#79c9ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // clouds
  ctx.fillStyle = "rgba(255,255,255,0.8)";

  ctx.beginPath();
  ctx.arc(130, 80, 30, 0, Math.PI * 2);
  ctx.arc(165, 80, 40, 0, Math.PI * 2);
  ctx.arc(205, 80, 25, 0, Math.PI * 2);
  ctx.fill();

  // mountains
  ctx.fillStyle = "#5c9e4a";

  ctx.beginPath();
  ctx.moveTo(0, 330);
  ctx.lineTo(180, 160);
  ctx.lineTo(350, 330);
  ctx.lineTo(520, 140);
  ctx.lineTo(720, 330);
  ctx.lineTo(900, 180);
  ctx.lineTo(900, 500);
  ctx.lineTo(0, 500);
  ctx.fill();

  // grass
  ctx.fillStyle = "#49a942";
  ctx.fillRect(0, CONFIG.ground, canvas.width, 80);

  // dirt
  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(0, CONFIG.ground + 35, canvas.width, 50);
}

function draw() {
  drawBackground();

  enemies.forEach(enemy => enemy.draw(ctx));

  player.draw(ctx);

  // level progress
  const progress = player.xp / player.xpNeeded;

  ctx.fillStyle = "#111";
  ctx.fillRect(20, 20, 220, 18);

  ctx.fillStyle = "#a855f7";
  ctx.fillRect(20, 20, 220 * progress, 18);

  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText(
    `XP ${player.xp}/${player.xpNeeded}`,
    90,
    34
  );
}

function loop() {
  update();
  draw();

  requestAnimationFrame(loop);
}

function gameOver() {
  gameRunning = false;

  showMessage("💀 Your duck was defeated!");

  setTimeout(() => {
    if (
      confirm(
        "Your duck was defeated! Restart the fight?"
      )
    ) {
      startGame();
    }
  }, 200);
}

startGame();
loop();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const WORLD_WIDTH = 5000;

let player;
let enemies = [];

let cameraX = 0;
let spawnTimer = 0;

let gameRunning = true;

function startGame() {
  player = new Player();

  enemies = [];

  cameraX = 0;
  spawnTimer = 100;

  gameRunning = true;

  // Initial enemies
  spawnEnemy(700);
  spawnEnemy(1100);

  updateUI();

  showMessage(
    "🦆 Move with A/D or ←/→. Jump with W/↑. Attack with SPACE!"
  );
}

function spawnEnemy(customX) {
  let maxType = Math.min(
    enemyTypes.length,
    1 + Math.floor(player.level / 2)
  );

  const type =
    enemyTypes[
      Math.floor(Math.random() * maxType)
    ];

  let x;

  if (customX !== undefined) {
    x = customX;
  } else {
    // Spawn ahead of player
    x =
      player.x +
      700 +
      Math.random() * 700;

    x = Math.min(x, WORLD_WIDTH - 100);
  }

  enemies.push(new Enemy(type, x));
}

function updateCamera() {
  // Camera follows ONLY the player.
  // It never follows enemies.
  const target =
    player.x -
    CONFIG.width * 0.5;

  cameraX +=
    (target - cameraX) * 0.08;

  cameraX = Math.max(0, cameraX);

  cameraX = Math.min(
    WORLD_WIDTH - CONFIG.width,
    cameraX
  );
}

function update() {
  if (!gameRunning) return;

  player.update();

  updateCamera();

  spawnTimer--;

  if (spawnTimer <= 0) {
    // Don't spam enemies
    if (enemies.length < 5) {
      spawnEnemy();
    }

    spawnTimer = 500;
  }

  enemies.forEach(enemy => {
    enemy.update(player);
  });

  updateMessage();
  updateUI();
}

function drawBackground() {
  // Sky
  ctx.fillStyle = "#79c9ff";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Clouds
  ctx.fillStyle =
    "rgba(255,255,255,0.8)";

  const clouds = [
    { x: 150, y: 80 },
    { x: 600, y: 120 },
    { x: 1000, y: 70 },
    { x: 1450, y: 110 },
    { x: 2000, y: 60 }
  ];

  clouds.forEach(cloud => {
    const x = cloud.x - cameraX * 0.25;

    ctx.beginPath();

    ctx.arc(
      x,
      cloud.y,
      30,
      0,
      Math.PI * 2
    );

    ctx.arc(
      x + 35,
      cloud.y,
      40,
      0,
      Math.PI * 2
    );

    ctx.arc(
      x + 75,
      cloud.y,
      25,
      0,
      Math.PI * 2
    );

    ctx.fill();
  });

  // Mountains
  ctx.fillStyle = "#5c9e4a";

  for (let x = -500; x < WORLD_WIDTH; x += 500) {
    ctx.beginPath();

    ctx.moveTo(
      x - cameraX * 0.4,
      350
    );

    ctx.lineTo(
      x + 200 - cameraX * 0.4,
      150
    );

    ctx.lineTo(
      x + 500 - cameraX * 0.4,
      350
    );

    ctx.lineTo(
      x + 500 - cameraX * 0.4,
      500
    );

    ctx.lineTo(
      x - cameraX * 0.4,
      500
    );

    ctx.fill();
  }

  // Ground
  ctx.fillStyle = "#49a942";

  ctx.fillRect(
    0,
    CONFIG.ground,
    canvas.width,
    80
  );

  ctx.fillStyle = "#8b5a2b";

  ctx.fillRect(
    0,
    CONFIG.ground + 35,
    canvas.width,
    100
  );

  // World markers
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "18px Arial";

  for (
    let x = 500;
    x < WORLD_WIDTH;
    x += 500
  ) {
    const screenX = x - cameraX;

    if (
      screenX > -100 &&
      screenX < canvas.width + 100
    ) {
      ctx.fillText(
        `${x}m`,
        screenX,
        CONFIG.ground + 65
      );
    }
  }
}

function drawHUD() {
  // XP bar
  ctx.fillStyle = "#222";

  ctx.fillRect(
    20,
    20,
    250,
    20
  );

  ctx.fillStyle = "#a855f7";

  ctx.fillRect(
    20,
    20,
    250 *
      (player.xp / player.xpNeeded),
    20
  );

  ctx.fillStyle = "white";
  ctx.font = "13px Arial";

  ctx.fillText(
    `XP ${player.xp}/${player.xpNeeded}`,
    100,
    35
  );
}

function draw() {
  drawBackground();

  enemies.forEach(enemy => {
    enemy.draw(ctx, cameraX);
  });

  player.draw(ctx, cameraX);

  drawHUD();
}

function loop() {
  update();
  draw();

  requestAnimationFrame(loop);
}

function gameOver() {
  gameRunning = false;

  showMessage(
    "💀 Your duck was defeated!"
  );

  setTimeout(() => {
    const restart =
      confirm(
        "Your duck was defeated! Play again?"
      );

    if (restart) {
      startGame();
    }
  }, 300);
}

startGame();
loop();

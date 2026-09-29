class Player {
  constructor() {
    this.x = 300;
    this.y = CONFIG.ground - 70;

    this.width = 60;
    this.height = 70;

    this.vx = 0;
    this.vy = 0;

    this.health = 100;
    this.maxHealth = 100;

    this.level = 1;
    this.xp = 0;
    this.xpNeeded = 100;
    this.coins = 0;

    this.damage = 15;
    this.speed = 4;

    this.facing = 1;

    this.attackCooldown = 0;
    this.attackTimer = 0;
    this.invincible = 0;
  }

  update() {
    this.vx = 0;

    // Easy movement
    if (keys.ArrowLeft || keys.KeyA) {
      this.vx = -this.speed;
      this.facing = -1;
    }

    if (keys.ArrowRight || keys.KeyD) {
      this.vx = this.speed;
      this.facing = 1;
    }

    // Jump
    if (
      (keys.ArrowUp || keys.KeyW) &&
      this.y >= CONFIG.ground - this.height - 2
    ) {
      this.vy = -CONFIG.jumpPower;
    }

    // Attack
    if (
      (keys.Space || keys.KeyJ) &&
      this.attackCooldown <= 0
    ) {
      this.attack();
    }

    this.x += this.vx;

    this.vy += CONFIG.gravity;
    this.y += this.vy;

    if (this.y >= CONFIG.ground - this.height) {
      this.y = CONFIG.ground - this.height;
      this.vy = 0;
    }

    // Don't let duck leave the world
    this.x = Math.max(50, this.x);
    this.x = Math.min(WORLD_WIDTH - this.width, this.x);

    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }

    if (this.attackTimer > 0) {
      this.attackTimer--;
    }

    if (this.invincible > 0) {
      this.invincible--;
    }
  }

  attack() {
    this.attackCooldown = 28;
    this.attackTimer = 10;

    attackEnemies(this);
  }

  takeDamage(amount) {
    if (this.invincible > 0) return;

    this.health -= amount;
    this.invincible = 45;

    if (this.health <= 0) {
      this.health = 0;
      gameOver();
    }
  }

  gainXP(amount) {
    this.xp += amount;

    while (this.xp >= this.xpNeeded) {
      this.xp -= this.xpNeeded;

      this.level++;

      this.maxHealth += 15;
      this.health = this.maxHealth;
      this.damage += 3;

      this.xpNeeded = Math.floor(this.xpNeeded * 1.3);

      showMessage("⭐ LEVEL UP!");
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;

    if (
      this.invincible > 0 &&
      Math.floor(this.invincible / 5) % 2 === 0
    ) {
      return;
    }

    ctx.save();

    ctx.translate(screenX, this.y);

    if (this.facing === -1) {
      ctx.scale(-1, 1);
      ctx.translate(-this.width, 0);
    }

    // Body
    ctx.fillStyle = "#ffe135";

    ctx.beginPath();
    ctx.ellipse(30, 43, 28, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(38, 18, 22, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#111";

    ctx.beginPath();
    ctx.arc(45, 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#f97316";

    ctx.beginPath();
    ctx.moveTo(55, 20);
    ctx.lineTo(80, 27);
    ctx.lineTo(55, 34);
    ctx.fill();

    // Feet
    ctx.fillStyle = "#f97316";

    ctx.fillRect(15, 63, 18, 7);
    ctx.fillRect(40, 63, 18, 7);

    // Attack effect
    if (this.attackTimer > 0) {
      ctx.fillStyle = "#ff4444";
      ctx.font = "28px Arial";
      ctx.fillText("💥", 55, 60);
    }

    ctx.restore();
  }
}

class Player {
  constructor() {
    this.x = 150;
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
    this.speed = CONFIG.playerSpeed;

    this.attackCooldown = 0;
    this.attackTimer = 0;

    this.facing = 1;
    this.invincible = 0;
  }

  update() {
    this.vx = 0;

    if (keys.ArrowLeft) {
      this.vx = -this.speed;
      this.facing = -1;
    }

    if (keys.ArrowRight) {
      this.vx = this.speed;
      this.facing = 1;
    }

    if (
      keys.ArrowUp &&
      this.y >= CONFIG.ground - this.height - 2
    ) {
      this.vy = -CONFIG.jumpPower;
    }

    if (keys.Space && this.attackCooldown <= 0) {
      this.attack();
    }

    this.x += this.vx;
    this.y += this.vy;

    this.vy += CONFIG.gravity;

    if (this.y >= CONFIG.ground - this.height) {
      this.y = CONFIG.ground - this.height;
      this.vy = 0;
    }

    this.x = Math.max(0, Math.min(CONFIG.width - this.width, this.x));

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
    this.attackCooldown = 30;
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

      this.xpNeeded = Math.floor(this.xpNeeded * 1.35);

      showMessage("🦆 LEVEL UP!");
    }
  }

  draw(ctx) {
    if (this.invincible % 6 < 3) return;

    ctx.save();

    ctx.translate(this.x, this.y);

    if (this.facing === -1) {
      ctx.scale(-1, 1);
      ctx.translate(-this.width, 0);
    }

    // body
    ctx.fillStyle = CONFIG.colors.duck;
    ctx.beginPath();
    ctx.ellipse(30, 42, 28, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.beginPath();
    ctx.arc(38, 18, 22, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(45, 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // beak
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(55, 20);
    ctx.lineTo(78, 28);
    ctx.lineTo(55, 32);
    ctx.fill();

    // feet
    ctx.fillStyle = "#f97316";
    ctx.fillRect(15, 62, 18, 7);
    ctx.fillRect(40, 62, 18, 7);

    // attack
    if (this.attackTimer > 0) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 25px Arial";
      ctx.fillText("💥", 55, 55);
    }

    ctx.restore();
  }
}

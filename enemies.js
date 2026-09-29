const enemyTypes = [
  {
    name: "Rabbit",
    emoji: "🐰",
    health: 30,
    damage: 5,
    speed: 0.8,
    xp: 20,
    coins: 5
  },
  {
    name: "Chicken",
    emoji: "🐔",
    health: 40,
    damage: 7,
    speed: 0.9,
    xp: 25,
    coins: 7
  },
  {
    name: "Fox",
    emoji: "🦊",
    health: 65,
    damage: 10,
    speed: 1,
    xp: 45,
    coins: 12
  },
  {
    name: "Wolf",
    emoji: "🐺",
    health: 90,
    damage: 14,
    speed: 1.1,
    xp: 65,
    coins: 18
  },
  {
    name: "Bear",
    emoji: "🐻",
    health: 150,
    damage: 20,
    speed: 0.7,
    xp: 100,
    coins: 30
  }
];

class Enemy {
  constructor(type, x) {
    this.type = type;

    this.width = 65;
    this.height = 65;

    this.x = x;
    this.y = CONFIG.ground - this.height;

    this.health = type.health;
    this.maxHealth = type.health;

    this.damage = type.damage;
    this.speed = type.speed;

    this.attackCooldown = 0;
    this.hitFlash = 0;
  }

  update(player) {
    const distance = player.x - this.x;

    // Enemy only approaches if reasonably close.
    // This prevents enemies from dragging the camera around.
    if (Math.abs(distance) > 75) {
      this.x += Math.sign(distance) * this.speed;
    } else if (this.attackCooldown <= 0) {
      player.takeDamage(this.damage);
      this.attackCooldown = 80;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }

    if (this.hitFlash > 0) {
      this.hitFlash--;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    this.hitFlash = 8;

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    player.gainXP(this.type.xp);
    player.coins += this.type.coins;

    showMessage(
      `💥 ${this.type.name} defeated! +${this.type.xp} XP`
    );

    enemies = enemies.filter(enemy => enemy !== this);
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;

    // Don't draw things far outside the camera
    if (
      screenX < -100 ||
      screenX > CONFIG.width + 100
    ) {
      return;
    }

    ctx.save();

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.font = "55px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      this.type.emoji,
      screenX + this.width / 2,
      this.y + 53
    );

    // Health bar
    ctx.fillStyle = "#222";
    ctx.fillRect(
      screenX,
      this.y - 12,
      this.width,
      7
    );

    ctx.fillStyle = "#ef4444";

    ctx.fillRect(
      screenX,
      this.y - 12,
      this.width *
        Math.max(0, this.health / this.maxHealth),
      7
    );

    ctx.restore();
  }
}

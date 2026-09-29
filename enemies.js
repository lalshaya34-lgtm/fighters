const enemyTypes = [
  {
    name: "Rabbit",
    emoji: "🐰",
    health: 35,
    damage: 7,
    speed: 1.4,
    xp: 25,
    coins: 5
  },
  {
    name: "Chicken",
    emoji: "🐔",
    health: 45,
    damage: 9,
    speed: 1.7,
    xp: 30,
    coins: 7
  },
  {
    name: "Fox",
    emoji: "🦊",
    health: 70,
    damage: 13,
    speed: 2,
    xp: 50,
    coins: 12
  },
  {
    name: "Wolf",
    emoji: "🐺",
    health: 100,
    damage: 18,
    speed: 2.2,
    xp: 75,
    coins: 20
  },
  {
    name: "Bear",
    emoji: "🐻",
    health: 180,
    damage: 25,
    speed: 1.2,
    xp: 130,
    coins: 40
  }
];

class Enemy {
  constructor(type) {
    this.type = type;

    this.width = 65;
    this.height = 65;

    this.x =
      Math.random() < 0.5
        ? -this.width
        : CONFIG.width + this.width;

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

    if (Math.abs(distance) > 70) {
      this.x += Math.sign(distance) * this.speed;
    } else if (this.attackCooldown <= 0) {
      player.takeDamage(this.damage);
      this.attackCooldown = 70;
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
      `💥 ${this.type.name} defeated! +${this.type.xp} XP +${this.type.coins} 🪙`
    );

    enemies = enemies.filter(e => e !== this);
  }

  draw(ctx) {
    ctx.save();

    if (this.hitFlash > 0) {
      ctx.globalAlpha = 0.45;
    }

    ctx.font = "55px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      this.type.emoji,
      this.x + this.width / 2,
      this.y + 52
    );

    // health bar
    ctx.fillStyle = "#111";
    ctx.fillRect(this.x, this.y - 12, this.width, 7);

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(
      this.x,
      this.y - 12,
      this.width * Math.max(0, this.health / this.maxHealth),
      7
    );

    ctx.restore();
  }
}

const upgrades = [
  {
    id: "damage",
    name: "💪 Strong Wings",
    description: "+5 attack damage",
    cost: 30,

    buy() {
      if (player.coins < this.cost) return false;

      player.coins -= this.cost;
      player.damage += 5;
      return true;
    }
  },

  {
    id: "health",
    name: "❤️ Tough Duck",
    description: "+25 max health",
    cost: 40,

    buy() {
      if (player.coins < this.cost) return false;

      player.coins -= this.cost;
      player.maxHealth += 25;
      player.health += 25;
      return true;
    }
  },

  {
    id: "speed",
    name: "⚡ Fast Feet",
    description: "+0.7 movement speed",
    cost: 50,

    buy() {
      if (player.coins < this.cost) return false;

      player.coins -= this.cost;
      player.speed += 0.7;
      return true;
    }
  },

  {
    id: "heal",
    name: "🥚 Duck Egg",
    description: "Restore all health",
    cost: 25,

    buy() {
      if (player.coins < this.cost) return false;

      player.coins -= this.cost;
      player.health = player.maxHealth;
      return true;
    }
  }
];

function buyUpgrade(index) {
  if (upgrades[index].buy()) {
    showMessage("✅ Upgrade purchased!");
    updateUI();
  } else {
    showMessage("❌ Not enough coins!");
  }
}

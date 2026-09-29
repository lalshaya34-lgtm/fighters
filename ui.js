const healthElement = document.getElementById("health");
const levelElement = document.getElementById("level");
const coinsElement = document.getElementById("coins");
const messageElement = document.getElementById("message");
const upgradesElement = document.getElementById("upgrades");

function updateUI() {
  healthElement.textContent =
    `${Math.ceil(player.health)}/${player.maxHealth}`;

  levelElement.textContent = player.level;
  coinsElement.textContent = player.coins;

  upgradesElement.innerHTML = "";

  upgrades.forEach((upgrade, index) => {
    const div = document.createElement("div");
    div.className = "upgrade";

    div.innerHTML = `
      <strong>${upgrade.name}</strong>
      <br>
      <small>${upgrade.description}</small>
      <br>
      <button onclick="buyUpgrade(${index})">
        🪙 ${upgrade.cost}
      </button>
    `;

    upgradesElement.appendChild(div);
  });
}

let messageTimer = 0;

function showMessage(message) {
  messageElement.textContent = message;
  messageTimer = 120;
}

function updateMessage() {
  if (messageTimer > 0) {
    messageTimer--;

    if (messageTimer === 0) {
      messageElement.textContent = "";
    }
  }
}

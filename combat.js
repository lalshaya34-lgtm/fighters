function rectanglesOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function attackEnemies(player) {
  const attackBox = {
    x:
      player.facing === 1
        ? player.x + player.width - 5
        : player.x - 45,

    y: player.y + 15,

    width: 50,
    height: 40
  };

  enemies.forEach(enemy => {
    if (rectanglesOverlap(attackBox, enemy)) {
      enemy.takeDamage(player.damage);
    }
  });
}

const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyA", "KeyD", "KeyW"].includes(e.code)
  ) {
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// Mobile buttons
document.querySelectorAll("[data-key]").forEach(button => {
  const key = button.dataset.key;

  const press = (e) => {
    e.preventDefault();
    keys[key] = true;
  };

  const release = (e) => {
    e.preventDefault();
    keys[key] = false;
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

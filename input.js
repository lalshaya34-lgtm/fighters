const keys = {};

window.addEventListener("keydown", e => {
  keys[e.code] = true;

  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(e.code)
  ) {
    e.preventDefault();
  }
});

window.addEventListener("keyup", e => {
  keys[e.code] = false;
});

document.querySelectorAll("[data-key]").forEach(button => {
  const key = button.dataset.key;

  button.addEventListener("pointerdown", () => {
    keys[key] = true;
  });

  button.addEventListener("pointerup", () => {
    keys[key] = false;
  });

  button.addEventListener("pointerleave", () => {
    keys[key] = false;
  });
});

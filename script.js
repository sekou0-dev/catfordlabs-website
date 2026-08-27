const header = document.querySelector("[data-header]");
const year = document.querySelector("[data-year]");
const playfield = document.querySelector("[data-playfield]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const onScroll = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

if (playfield && !reduceMotion) {
  const tokens = [...playfield.querySelectorAll("[data-depth]")];

  playfield.addEventListener("pointermove", (event) => {
    const bounds = playfield.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    tokens.forEach((token) => {
      const depth = Number(token.dataset.depth);
      token.style.translate = `${x * depth * -320}px ${y * depth * -220}px`;
    });
  });

  playfield.addEventListener("pointerleave", () => {
    tokens.forEach((token) => {
      token.style.translate = "0 0";
    });
  });
}

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Year */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Header background once the page scrolls */
  const header = document.querySelector("[data-header]");
  const onScrollHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* Reveal on scroll */
  const reveals = [...document.querySelectorAll(".reveal")].filter((el) => !el.closest(".hero"));
  document.querySelectorAll(".hero .reveal").forEach((el, i) => {
    el.style.setProperty("--delay", `${120 + i * 110}ms`);
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Studio statement: words light up as you scroll past */
  const statement = document.querySelector("[data-statement]");
  let words = [];
  if (statement && !reduceMotion) {
    const text = statement.textContent.trim().replace(/\s+/g, " ");
    statement.setAttribute("aria-label", text);
    statement.textContent = "";
    text.split(" ").forEach((w, i, all) => {
      const span = document.createElement("span");
      span.className = "word";
      span.setAttribute("aria-hidden", "true");
      span.textContent = w;
      statement.appendChild(span);
      if (i < all.length - 1) statement.appendChild(document.createTextNode(" "));
    });
    words = [...statement.querySelectorAll(".word")];
  }

  /* Locktone sky parallax */
  const skyBg = document.querySelector(".feature-locktone .feature-bg");

  /* Highlight the nav item for the section in view */
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const navSections = navLinks
    .map((link) => [link, document.getElementById(link.dataset.nav)])
    .filter(([, section]) => section);

  const updateNav = (vh) => {
    if (!navSections.length) return;
    const line = vh * 0.4;
    let active = null;
    navSections.forEach(([link, section]) => {
      const r = section.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) active = link;
    });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) active = navSections[navSections.length - 1][0];
    navLinks.forEach((link) => {
      if (link === active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  let ticking = false;
  const onScrollEffects = () => {
    ticking = false;
    const vh = window.innerHeight;
    updateNav(vh);
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(progress * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
    }
    if (skyBg && !reduceMotion) {
      const r = skyBg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        skyBg.style.setProperty("--parallax", `${(p * -60).toFixed(1)}px`);
      }
    }
  };
  const requestScrollEffects = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScrollEffects);
    }
  };
  onScrollEffects();
  window.addEventListener("scroll", requestScrollEffects, { passive: true });
  window.addEventListener("resize", requestScrollEffects);

  /* Locktone: a reticle follows the pointer and locks onto screenshots */
  const locktone = document.querySelector(".feature-locktone");
  const reticle = document.querySelector("[data-reticle]");
  if (locktone && reticle && !reduceMotion) {
    let lockTimer = 0;
    let currentShot = null;
    locktone.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const box = locktone.getBoundingClientRect();
      reticle.style.setProperty("--rx", `${event.clientX - box.left}px`);
      reticle.style.setProperty("--ry", `${event.clientY - box.top}px`);
      locktone.classList.add("is-aiming");
      const shot = event.target.closest(".shot");
      if (shot !== currentShot) {
        currentShot = shot;
        clearTimeout(lockTimer);
        locktone.classList.remove("is-locked");
        if (shot) lockTimer = setTimeout(() => locktone.classList.add("is-locked"), 450);
      }
    });
    locktone.addEventListener("pointerleave", () => {
      clearTimeout(lockTimer);
      currentShot = null;
      locktone.classList.remove("is-aiming", "is-locked");
    });
  }

  /* Hero playfield: stars and brand shapes that drift and dodge the pointer */
  const canvas = document.querySelector("[data-hero-canvas]");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const colors = ["#ffdb47", "#ff6b47", "#2eb7ad", "#fbf6ec"];
  const kinds = ["circle", "square", "diamond", "pill"];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let stars = [];
  let shapes = [];
  const pointer = { x: -9999, y: -9999, tx: 0, ty: 0, px: 0, py: 0 };
  let running = false;
  let frame = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  const build = () => {
    const box = canvas.getBoundingClientRect();
    w = box.width;
    h = box.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const starCount = Math.round(Math.min(220, (w * h) / 6500));
    stars = Array.from({ length: starCount }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.4, 1.6),
      depth: rand(0.2, 1),
      tw: rand(0, Math.PI * 2),
    }));

    const small = w < 700;
    const shapeCount = small ? 6 : 10;
    shapes = Array.from({ length: shapeCount }, (_, i) => {
      const size = rand(small ? 14 : 18, small ? 34 : 54);
      return {
        x: rand(w * 0.35, w * 0.98),
        y: rand(h * 0.05, h * 0.95),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.14, 0.14),
        size,
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.004, 0.004),
        color: colors[i % colors.length],
        kind: kinds[i % kinds.length],
        ox: 0,
        oy: 0,
      };
    });
  };

  const roundRect = (x, y, wd, ht, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + wd, y, x + wd, y + ht, r);
    ctx.arcTo(x + wd, y + ht, x, y + ht, r);
    ctx.arcTo(x, y + ht, x, y, r);
    ctx.arcTo(x, y, x + wd, y, r);
    ctx.closePath();
  };

  const drawShape = (s) => {
    ctx.save();
    ctx.translate(s.x + s.ox, s.y + s.oy);
    ctx.rotate(s.rot);
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = w < 700 ? 12 : 24;
    ctx.globalAlpha = w < 700 ? 0.5 : 0.92;
    const z = s.size;
    if (s.kind === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, z / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.kind === "square") {
      roundRect(-z / 2, -z / 2, z, z, z * 0.26);
      ctx.fill();
    } else if (s.kind === "diamond") {
      ctx.rotate(Math.PI / 4);
      roundRect(-z / 3, -z / 3, (z * 2) / 3, (z * 2) / 3, z * 0.1);
      ctx.fill();
    } else {
      roundRect(-z * 0.75, -z * 0.32, z * 1.5, z * 0.64, z * 0.32);
      ctx.fill();
    }
    ctx.restore();
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    pointer.px += (pointer.tx - pointer.px) * 0.05;
    pointer.py += (pointer.ty - pointer.py) * 0.05;

    for (const s of stars) {
      s.tw += 0.02;
      const a = 0.35 + Math.sin(s.tw) * 0.25 * s.depth + 0.25 * s.depth;
      const x = (s.x + pointer.px * 18 * s.depth + w) % w;
      const y = (s.y + pointer.py * 12 * s.depth + h) % h;
      ctx.fillStyle = `rgba(251, 246, 236, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const s of shapes) {
      s.x += s.vx;
      s.y += s.vy;
      s.rot += s.vr;
      const m = s.size;
      if (s.x < -m) s.x = w + m;
      if (s.x > w + m) s.x = -m;
      if (s.y < -m) s.y = h + m;
      if (s.y > h + m) s.y = -m;

      const dx = s.x + s.ox - pointer.x;
      const dy = s.y + s.oy - pointer.y;
      const dist = Math.hypot(dx, dy);
      const reach = 160;
      if (dist < reach && dist > 0.01) {
        const push = (1 - dist / reach) * 6;
        s.ox += (dx / dist) * push;
        s.oy += (dy / dist) * push;
      }
      s.ox *= 0.94;
      s.oy *= 0.94;
      drawShape(s);
    }
  };

  const loop = () => {
    if (!running) return;
    draw();
    frame = requestAnimationFrame(loop);
  };

  const start = () => {
    if (running || reduceMotion) return;
    running = true;
    frame = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  build();
  draw();

  const hero = canvas.parentElement;
  hero.addEventListener("pointermove", (event) => {
    const box = canvas.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
    pointer.tx = pointer.x / w - 0.5;
    pointer.ty = pointer.y / h - 0.5;
  });
  hero.addEventListener("pointerleave", () => {
    pointer.x = -9999;
    pointer.y = -9999;
    pointer.tx = 0;
    pointer.ty = 0;
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      draw();
    }, 150);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? start() : stop();
    }).observe(hero);
  } else {
    start();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (hero.getBoundingClientRect().bottom > 0) start();
  });
})();

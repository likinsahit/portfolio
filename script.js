const body = document.body;
const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const particleCanvas = document.querySelector(".particle-field");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
  themeToggle.querySelector("span").textContent = "☀";
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  const isDark = body.classList.contains("dark");
  themeToggle.querySelector("span").textContent = isDark ? "☀" : "☾";
  localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
});

menuButton.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

mobileNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    mobileNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

const interactiveSelector = "a, button, .skill-card, .project-card, .contact-card, .about-cards article, .cert-grid article";
const interactiveElements = [...document.querySelectorAll(interactiveSelector)];

function setLocalPointerVars(event, element) {
  const rect = element.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  element.style.setProperty("--local-x", `${x}%`);
  element.style.setProperty("--local-y", `${y}%`);
}

interactiveElements.forEach((element) => {
  element.addEventListener("pointermove", (event) => setLocalPointerVars(event, element));
  element.addEventListener("pointerenter", () => body.classList.add("cursor-active"));
  element.addEventListener("pointerleave", () => {
    body.classList.remove("cursor-active");
    element.style.transform = "";
  });
});

const magneticElements = [...document.querySelectorAll(".btn, .theme-toggle, .menu-button")];
magneticElements.forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    if (reduceMotion.matches) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
  });

  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
});

function bootCursor() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || reduceMotion.matches) {
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    body.classList.add("cursor-ready");
    root.style.setProperty("--mouse-x", `${(mouseX / window.innerWidth) * 100}%`);
    root.style.setProperty("--mouse-y", `${(mouseY / window.innerHeight) * 100}%`);
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

function bootReveal() {
  const revealTargets = [
    ...document.querySelectorAll(
      ".section-heading, .about-cards article, .about-copy, .skill-card, .cert-grid article, .project-card, .timeline article, .contact-intro, .contact-card"
    ),
  ];

  revealTargets.forEach((element) => element.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((element) => observer.observe(element));
}

function bootParticles() {
  if (reduceMotion.matches || !particleCanvas) return;

  const context = particleCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let pointer = { x: -9999, y: -9999 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    particleCanvas.width = Math.floor(width * ratio);
    particleCanvas.height = Math.floor(height * ratio);
    particleCanvas.style.width = `${width}px`;
    particleCanvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(78, Math.max(34, Math.floor(width / 18)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      size: Math.random() * 1.8 + 0.7,
    }));
  }

  function drawLine(a, b, distance) {
    context.strokeStyle = `rgba(97, 87, 245, ${Math.max(0, 1 - distance / 150) * 0.16})`;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  function tick() {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const pointerDistance = Math.hypot(dx, dy);

      if (pointerDistance < 130) {
        particle.x -= dx * 0.006;
        particle.y -= dy * 0.006;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      context.fillStyle = body.classList.contains("dark")
        ? "rgba(139, 130, 255, 0.62)"
        : "rgba(97, 87, 245, 0.46)";
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      for (let next = index + 1; next < particles.length; next += 1) {
        const other = particles[next];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance < 150) drawLine(particle, other, distance);
      }
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
  });
  window.addEventListener("pointerleave", () => {
    pointer = { x: -9999, y: -9999 };
  });

  resize();
  tick();
}

bootCursor();
bootReveal();
bootParticles();

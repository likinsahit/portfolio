const body = document.body;
const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const particleCanvas = document.querySelector(".particle-field");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyTheme(theme, persist = true) {
  const isDark = theme === "dark";
  body.classList.toggle("dark", isDark);

  if (themeToggle) {
    const toggleIcon = themeToggle.querySelector("span");
    if (toggleIcon) {
      toggleIcon.textContent = isDark ? "☀" : "☾";
    }
  }

  if (persist) {
    localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
  }
}

function getTimeBasedTheme() {
  const currentHour = new Date().getHours();
  return currentHour >= 18 || currentHour < 6 ? "dark" : "light";
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");
  const themeToApply = savedTheme === "dark" || savedTheme === "light"
    ? savedTheme
    : getTimeBasedTheme();

  applyTheme(themeToApply, false);
}

initializeTheme();

themeToggle.addEventListener("click", () => {
  const isDark = !body.classList.contains("dark");
  applyTheme(isDark ? "dark" : "light");
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

// ============================================================================
// Dynamic Experience Calculator
// ============================================================================
// Calculates years and months of experience from July 15, 2019 to today
// Updates automatically on page load without manual updates required

/**
 * Calculates total years and months of experience from joining date
 * @param {Date} joiningDate - The date when employment started
 * @returns {Object} - Object with years and months properties
 */
function calculateExperience(joiningDate) {
  const today = new Date();
  let years = today.getFullYear() - joiningDate.getFullYear();
  let months = today.getMonth() - joiningDate.getMonth();

  // If current day is before the 15th of the month, subtract one month
  if (today.getDate() < joiningDate.getDate()) {
    months--;
  }

  // Handle negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months };
}

/**
 * Updates the experience display across multiple DOM elements
 * Formats output as "X Years Y Months" with proper singular/plural handling
 */
function updateExperience() {
  // Joining date: July 15, 2019
  const joiningDate = new Date(2019, 6, 15); // Month is 0-indexed, so 6 = July
  const { years, months } = calculateExperience(joiningDate);

  // Format with proper singular/plural handling
  const yearLabel = years === 1 ? "Year" : "Years";
  const monthLabel = months === 1 ? "Month" : "Months";
  const experienceText = `${years} ${yearLabel} ${months} ${monthLabel}`;

  // Update hero section experience text
  const experienceTextElement = document.getElementById("experienceText");
  if (experienceTextElement) {
    experienceTextElement.textContent = experienceText;
  }

  // Update stats grid experience years
  const experienceYearsElement = document.getElementById("experienceYears");
  if (experienceYearsElement) {
    experienceYearsElement.textContent = experienceText;
  }
}

// Call the experience update function immediately when page loads
updateExperience();

bootCursor();
bootReveal();
bootParticles();

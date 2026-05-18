import { gsap } from 'gsap';
import { ScrollyTelling } from '../js/ScrollyTelling.js';
import { JourneyTimeline } from '../js/JourneyTimeline.js';
import { InteractiveCards } from '../js/InteractiveCards.js';

export function initLandingEffects() {
  initAnimatedNavigation();
  initSquaresBackground();

  const scrollyTelling = new ScrollyTelling();
  const journey = new JourneyTimeline();
  const interactiveCards = new InteractiveCards();

  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  };

  initParticles();

  return {
    scrollyTelling,
    journey,
    interactiveCards
  };
}

function initParticles() {
  const particlesContainer = document.getElementById('particles-container');
  if (!particlesContainer) return;

  particlesContainer.innerHTML = '';

  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    particle.style.transform = `scale(${Math.random() * 1.5 + 0.5})`;
    particle.style.opacity = Math.random() * 0.4 + 0.1;
    particlesContainer.appendChild(particle);

    gsap.to(particle, {
      y: `-=${Math.random() * 100 + 50}`,
      x: `+=${(Math.random() - 0.5) * 50}`,
      duration: Math.random() * 20 + 20,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
}

function initAnimatedNavigation() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  const menuButton = nav.querySelector('.nav-menu-button');
  const expandThreshold = 80;
  let isExpanded = true;
  let lastScrollY = window.scrollY;
  let scrollPositionOnCollapse = 0;

  const setExpanded = (expanded) => {
    isExpanded = expanded;
    nav.dataset.expanded = String(expanded);
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', String(expanded));
    }
  };

  requestAnimationFrame(() => {
    nav.classList.add('is-ready');
  });

  window.addEventListener('scroll', () => {
    const latest = window.scrollY;
    const previous = lastScrollY;

    if (isExpanded && latest > previous && latest > 150) {
      setExpanded(false);
      scrollPositionOnCollapse = latest;
    } else if (!isExpanded && latest < previous && scrollPositionOnCollapse - latest > expandThreshold) {
      setExpanded(true);
    }

    lastScrollY = Math.max(latest, 0);
  }, { passive: true });

  nav.addEventListener('click', (event) => {
    if (isExpanded) return;
    event.preventDefault();
    setExpanded(true);
  });
}

function initSquaresBackground() {
  const canvas = document.getElementById('journey-squares-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const settings = {
    direction: 'diagonal',
    speed: 0.35,
    squareSize: 46,
    borderColor: 'rgba(255, 255, 255, 0.105)',
    hoverFillColor: 'rgba(255, 255, 255, 0.075)'
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gridOffset = { x: 0, y: 0 };
  let hoveredSquare = null;
  let animationFrame = null;
  let dpr = 1;

  const resizeCanvas = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGrid();
  };

  const drawGrid = () => {
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const squareSize = settings.squareSize;
    const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
    const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 0.55;

    for (let x = startX; x < width + squareSize; x += squareSize) {
      for (let y = startY; y < height + squareSize; y += squareSize) {
        const squareX = x - (gridOffset.x % squareSize);
        const squareY = y - (gridOffset.y % squareSize);
        const gridX = Math.floor((x - startX) / squareSize);
        const gridY = Math.floor((y - startY) / squareSize);

        if (hoveredSquare && gridX === hoveredSquare.x && gridY === hoveredSquare.y) {
          ctx.fillStyle = settings.hoverFillColor;
          ctx.fillRect(squareX, squareY, squareSize, squareSize);
        }

        ctx.strokeStyle = settings.borderColor;
        ctx.strokeRect(squareX, squareY, squareSize, squareSize);
      }
    }

    const centerGradient = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      0,
      width * 0.5,
      height * 0.45,
      Math.sqrt(width * width + height * height) * 0.58
    );
    centerGradient.addColorStop(0, 'rgba(29, 29, 31, 0)');
    centerGradient.addColorStop(0.62, 'rgba(29, 29, 31, 0.18)');
    centerGradient.addColorStop(1, 'rgba(3, 4, 11, 0.92)');
    ctx.fillStyle = centerGradient;
    ctx.fillRect(0, 0, width, height);

    const topWash = ctx.createLinearGradient(0, 0, 0, height);
    topWash.addColorStop(0, 'rgba(162, 194, 225, 0.06)');
    topWash.addColorStop(0.45, 'rgba(250, 218, 221, 0.025)');
    topWash.addColorStop(1, 'rgba(29, 29, 31, 0.08)');
    ctx.fillStyle = topWash;
    ctx.fillRect(0, 0, width, height);
  };

  const updateAnimation = () => {
    const speed = prefersReducedMotion ? 0 : settings.speed;

    if (settings.direction === 'diagonal') {
      gridOffset.x = (gridOffset.x - speed + settings.squareSize) % settings.squareSize;
      gridOffset.y = (gridOffset.y - speed + settings.squareSize) % settings.squareSize;
    }

    drawGrid();
    animationFrame = requestAnimationFrame(updateAnimation);
  };

  const updateHoveredSquare = (event) => {
    const rect = canvas.getBoundingClientRect();
    const isInside = event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInside) {
      hoveredSquare = null;
      return;
    }

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    hoveredSquare = {
      x: Math.floor((mouseX + (gridOffset.x % settings.squareSize)) / settings.squareSize),
      y: Math.floor((mouseY + (gridOffset.y % settings.squareSize)) / settings.squareSize)
    };
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', updateHoveredSquare, { passive: true });
  animationFrame = requestAnimationFrame(updateAnimation);

  return () => {
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('mousemove', updateHoveredSquare);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}

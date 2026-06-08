import "./styles.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hero = qs<HTMLElement>(".hero");
const media = qs<HTMLElement>("#media");
const maskSvg = qs<SVGSVGElement>("#maskSvg");
const guideSvg = qs<SVGSVGElement>("#guideSvg");
const sector = qs<SVGPolygonElement>("#maskSector");
const debugForm = qs<HTMLFormElement>("#debugForm");
const showGuide = qs<HTMLInputElement>("#showGuide");

const fields = {
  centerX: qs<HTMLInputElement>("#centerX"),
  centerY: qs<HTMLInputElement>("#centerY"),
  upperOpen: qs<HTMLInputElement>("#upperOpen"),
  lowerOpen: qs<HTMLInputElement>("#lowerOpen"),
  axisDeg: qs<HTMLInputElement>("#axisDeg"),
  travelFrom: qs<HTMLInputElement>("#travelFrom"),
  yOffset: qs<HTMLInputElement>("#yOffset"),
  duration: qs<HTMLInputElement>("#duration"),
  ease: qs<HTMLSelectElement>("#ease")
};

const out = {
  centerX: qs<HTMLOutputElement>("#centerXOut"),
  centerY: qs<HTMLOutputElement>("#centerYOut"),
  upperOpen: qs<HTMLOutputElement>("#upperOut"),
  lowerOpen: qs<HTMLOutputElement>("#lowerOut"),
  axisDeg: qs<HTMLOutputElement>("#axisOut"),
  travelFrom: qs<HTMLOutputElement>("#travelOut"),
  yOffset: qs<HTMLOutputElement>("#yOut"),
  duration: qs<HTMLOutputElement>("#durationOut")
};

const guides = {
  upperRay: qs<SVGLineElement>("#upperRay"),
  lowerRay: qs<SVGLineElement>("#lowerRay"),
  axisLine: qs<SVGLineElement>("#axisLine"),
  travelLine: qs<SVGLineElement>("#travelLine"),
  yLine: qs<SVGLineElement>("#yLine"),
  centerDot: qs<SVGCircleElement>("#centerDot"),
  travelDot: qs<SVGCircleElement>("#travelDot")
};

const state = { progress: 0 };
let config = readConfig();
let activeTween: gsap.core.Tween | null = null;

type Point = {
  x: number;
  y: number;
};

function qs<T extends Element>(selector: string) {
  const node = document.querySelector<T>(selector);

  if (!node) {
    throw new Error(`Missing element: ${selector}`);
  }

  return node;
}

function qsa<T extends Element>(selector: string) {
  return Array.from(document.querySelectorAll<T>(selector));
}

function initScroll() {
  const lenis = new Lenis({
    autoRaf: false,
    duration: 1.05,
    lerp: 0.12
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function uiTargets() {
  return ".nav-left, .brand, .nav-right, .title .line, .search, .tab, .bar";
}

function intro() {
  const tl = gsap.timeline({
    defaults: { duration: 0.9, ease: "power3.out" }
  });

  tl.fromTo(".nav-left, .brand, .nav-right", { y: -18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08 }, 0)
    .fromTo(".title .line", { y: 54, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.12 }, 0.18)
    .fromTo(".search", { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, 0.48)
    .fromTo(".tab", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06 }, 0.64)
    .fromTo(".bar", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center" }, 0.9);

  return tl;
}

function readConfig() {
  return {
    centerX: Number(fields.centerX.value),
    centerY: Number(fields.centerY.value),
    upperOpen: Number(fields.upperOpen.value),
    lowerOpen: Number(fields.lowerOpen.value),
    axisDeg: Number(fields.axisDeg.value),
    travelFrom: Number(fields.travelFrom.value),
    yOffset: Number(fields.yOffset.value),
    duration: Number(fields.duration.value),
    ease: fields.ease.value
  };
}

function box() {
  return {
    width: hero.clientWidth,
    height: hero.clientHeight
  };
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function center() {
  const { width, height } = box();

  return {
    x: (config.centerX / 100) * width,
    y: (config.centerY / 100) * height
  };
}

function pointOnRay(from: Point, deg: number, radius: number) {
  const rad = degToRad(deg);

  return {
    x: from.x + Math.cos(rad) * radius,
    y: from.y + Math.sin(rad) * radius
  };
}

function axis() {
  const rad = degToRad(config.axisDeg);

  return {
    x: Math.cos(rad),
    y: Math.sin(rad)
  };
}

function travel(progress = state.progress) {
  const { width } = box();
  const dir = axis();
  const distance = (config.travelFrom / 100) * width;
  const amount = 1 - progress;

  return {
    x: dir.x * distance * amount,
    y: dir.y * distance * amount
  };
}

function yOffset(progress = state.progress) {
  return -((config.yOffset / 100) * box().height) * (1 - progress);
}

function moved(point: Point) {
  const shift = travel();

  return {
    x: point.x + shift.x,
    y: point.y + shift.y + yOffset()
  };
}

function sectorPoints() {
  const { width, height } = box();
  const root = center();
  const radius = Math.hypot(width, height) * 2.4;
  const upperDeg = config.axisDeg - config.upperOpen * state.progress;
  const lowerDeg = config.axisDeg + config.lowerOpen * state.progress;
  const span = lowerDeg - upperDeg;

  if (span < 0.01) {
    const point = moved(root);
    return [point, point, point];
  }

  const steps = Math.max(6, Math.min(96, Math.ceil(span / 3)));
  const points = [moved(root)];

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    points.push(moved(pointOnRay(root, upperDeg + span * t, radius)));
  }

  return points;
}

function cssPolygon(points: Point[]) {
  const { width, height } = box();
  const coords = points.map((point) => `${(point.x / width) * 100}% ${(point.y / height) * 100}%`);

  return `polygon(${coords.join(", ")})`;
}

function svgPoints(points: Point[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function setLine(line: SVGLineElement, from: Point, to: Point) {
  line.setAttribute("x1", String(from.x));
  line.setAttribute("y1", String(from.y));
  line.setAttribute("x2", String(to.x));
  line.setAttribute("y2", String(to.y));
}

function setDot(dot: SVGCircleElement, point: Point) {
  dot.setAttribute("cx", String(point.x));
  dot.setAttribute("cy", String(point.y));
}

function renderGuides() {
  const { width, height } = box();
  const root = center();
  const radius = Math.hypot(width, height) * 1.6;
  const dropped = { x: root.x, y: root.y + yOffset(0) };
  const from = {
    x: dropped.x + travel(0).x,
    y: dropped.y + travel(0).y
  };

  setLine(guides.upperRay, root, pointOnRay(root, config.axisDeg - config.upperOpen, radius));
  setLine(guides.lowerRay, root, pointOnRay(root, config.axisDeg + config.lowerOpen, radius));
  setLine(guides.axisLine, dropped, pointOnRay(dropped, config.axisDeg, radius));
  setLine(guides.travelLine, from, dropped);
  setLine(guides.yLine, dropped, root);
  setDot(guides.centerDot, root);
  setDot(guides.travelDot, from);
}

function renderReadout() {
  out.centerX.textContent = `${config.centerX.toFixed(1)}%`;
  out.centerY.textContent = `${config.centerY.toFixed(1)}%`;
  out.upperOpen.textContent = `${Math.round(config.upperOpen)}deg`;
  out.lowerOpen.textContent = `${Math.round(config.lowerOpen)}deg`;
  out.axisDeg.textContent = `${Math.round(config.axisDeg)}deg`;
  out.travelFrom.textContent = `${config.travelFrom.toFixed(1)}%`;
  out.yOffset.textContent = `${config.yOffset > 0 ? "+" : ""}${config.yOffset.toFixed(1)}%`;
  out.duration.textContent = `${config.duration.toFixed(2)}s`;
}

function renderMask() {
  const { width, height } = box();
  const points = sectorPoints();
  const polygon = cssPolygon(points);

  maskSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  guideSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  media.style.clipPath = polygon;
  media.style.setProperty("-webkit-clip-path", polygon);
  sector.setAttribute("points", svgPoints(points));
  renderGuides();
  renderReadout();
}

function setUiHidden(hidden: boolean) {
  gsap.set(uiTargets(), { autoAlpha: hidden ? 0 : 1 });
}

function resetMask() {
  activeTween?.kill();
  config = readConfig();
  state.progress = 0;
  setUiHidden(true);
  document.body.classList.add("is-lock");
  renderMask();
}

function finalMask() {
  activeTween?.kill();
  config = readConfig();
  state.progress = 1;
  document.body.classList.remove("is-lock");
  setUiHidden(false);
  renderMask();
}

function playMask(withIntro = false) {
  activeTween?.kill();
  config = readConfig();
  state.progress = 0;
  setUiHidden(true);
  document.body.classList.add("is-lock");
  renderMask();

  activeTween = gsap.to(state, {
    progress: 1,
    duration: config.duration,
    ease: config.ease,
    onUpdate: renderMask,
    onComplete: () => {
      activeTween = null;
      renderMask();

      if (withIntro) {
        intro().eventCallback("onComplete", () => document.body.classList.remove("is-lock"));
      } else {
        document.body.classList.remove("is-lock");
        setUiHidden(false);
      }
    }
  });
}

if (!reduceMotion) {
  resetMask();
  initScroll();
  window.addEventListener("load", () => playMask(true));
} else {
  document.documentElement.classList.add("no-motion");
  finalMask();
}

debugForm.addEventListener("input", () => {
  config = readConfig();
  renderMask();
});

showGuide.addEventListener("change", () => {
  document.body.classList.toggle("show-guides", showGuide.checked);
});

qs<HTMLButtonElement>("#playMask").addEventListener("click", () => playMask(true));
qs<HTMLButtonElement>("#resetMask").addEventListener("click", resetMask);
qs<HTMLButtonElement>("#finalMask").addEventListener("click", finalMask);
window.addEventListener("resize", renderMask);

function initPeopleStats() {
  const number = document.querySelector<HTMLElement>("[data-people-number]");
  const dots = qsa<HTMLButtonElement>("[data-people-dot]");
  const values = ["7800", "54", "12"];
  let current = 0;
  let timer = 0;

  if (!number || dots.length === 0) {
    return;
  }

  function setActive(next: number) {
    dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === next));
  }

  function show(next: number) {
    if (next === current) {
      return;
    }

    const duration = reduceMotion ? 0 : 0.22;
    current = next;
    setActive(current);

    gsap.timeline()
      .to(number, { y: -18, autoAlpha: 0, duration, ease: "power2.out" })
      .set(number, { textContent: values[current], y: 18 })
      .to(number, { y: 0, autoAlpha: 1, duration, ease: "power2.out" });
  }

  function schedule() {
    window.clearInterval(timer);
    timer = window.setInterval(() => show((current + 1) % values.length), 3600);
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      show(dotIndex);
      schedule();
    });
  });

  setActive(current);
  schedule();
}

function initBenefitsSlider() {
  const slider = document.querySelector<HTMLElement>(".benefits-slider");
  const cards = qsa<HTMLElement>(".benefit-card");
  const prev = document.querySelector<HTMLButtonElement>("[data-benefits-prev]");
  const next = document.querySelector<HTMLButtonElement>("[data-benefits-next]");
  const gap = 39;
  let index = 0;
  let isMoving = false;
  let cardWidth = 0;
  let slots = [0, 0, 0];

  if (!slider || cards.length < 4 || !prev || !next) {
    return;
  }

  const sliderEl = slider;

  function cardAt(offset: number) {
    return (index + offset + cards.length) % cards.length;
  }

  function measure() {
    cardWidth = (sliderEl.clientWidth - gap * 2) / 3;
    slots = [0, cardWidth + gap, (cardWidth + gap) * 2];
  }

  function setCard(cardIndex: number, slot: number, alpha: number) {
    gsap.set(cards[cardIndex], {
      width: cardWidth,
      x: slots[slot],
      autoAlpha: alpha
    });
  }

  function layout() {
    measure();
    cards.forEach((card) => gsap.set(card, { width: cardWidth, autoAlpha: 0 }));
    setCard(cardAt(0), 0, 1);
    setCard(cardAt(1), 1, 1);
    setCard(cardAt(2), 2, 1);
  }

  function go(direction: 1 | -1) {
    if (isMoving) {
      return;
    }

    isMoving = true;
    measure();

    const duration = reduceMotion ? 0 : 0.56;
    const fadeDuration = reduceMotion ? 0 : 0.22;
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        index = (index + direction + cards.length) % cards.length;
        layout();
        isMoving = false;
      }
    });

    if (direction === 1) {
      const outgoing = cards[cardAt(0)];
      const firstMover = cards[cardAt(1)];
      const secondMover = cards[cardAt(2)];
      const incoming = cards[cardAt(3)];

      gsap.set(incoming, { width: cardWidth, x: slots[2], autoAlpha: 0 });
      tl.to(outgoing, { autoAlpha: 0, duration: fadeDuration, ease: "power2.out" }, 0)
        .to(firstMover, { x: slots[0], duration }, 0.1)
        .to(secondMover, { x: slots[1], duration }, 0.1)
        .to(incoming, { autoAlpha: 1, duration: fadeDuration, ease: "power2.out" }, 0.34);
    } else {
      const incoming = cards[cardAt(-1)];
      const firstMover = cards[cardAt(0)];
      const secondMover = cards[cardAt(1)];
      const outgoing = cards[cardAt(2)];

      gsap.set(incoming, { width: cardWidth, x: slots[0], autoAlpha: 0 });
      tl.to(outgoing, { autoAlpha: 0, duration: fadeDuration, ease: "power2.out" }, 0)
        .to(firstMover, { x: slots[1], duration }, 0.1)
        .to(secondMover, { x: slots[2], duration }, 0.1)
        .to(incoming, { autoAlpha: 1, duration: fadeDuration, ease: "power2.out" }, 0.34);
    }
  }

  layout();
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  window.addEventListener("resize", () => {
    if (!isMoving) {
      layout();
    }
  });
}

initPeopleStats();
initBenefitsSlider();

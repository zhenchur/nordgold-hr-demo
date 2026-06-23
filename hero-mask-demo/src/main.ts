import gsap from "gsap";
import "./styles.css";

type Point = {
  x: number;
  y: number;
};

type ShutterConfig = {
  centerX: number;
  centerY: number;
  upperOpen: number;
  lowerOpen: number;
  axisDeg: number;
  travelFrom: number;
  yOffset: number;
  duration: number;
  mediaScrollFactor: number;
  ease: string;
};

const defaultConfig: ShutterConfig = {
  centerX: 6.5,
  centerY: 77,
  upperOpen: 110,
  lowerOpen: 15,
  axisDeg: -19,
  travelFrom: 50,
  yOffset: 42,
  duration: 1,
  mediaScrollFactor: 0.35,
  ease: "power4.out"
};

const heroDepthEase = gsap.parseEase("power1.out");
const heroVacancyScrollSpeed = 1;
const heroMaskScrollSpeed = 1.15;
const heroRevealStartProgress = 0.82;
const innerNavRevealViewportProgress = 0.9;
const maskDegreesPerSegment = 4;
const maskMaxSegments = 64;

document.documentElement.classList.add("js");

function qs<T extends Element>(selector: string, root: ParentNode = document) {
  const node = root.querySelector<T>(selector);

  if (!node) {
    throw new Error(`Missing element: ${selector}`);
  }

  return node;
}

function readNumber(input: HTMLInputElement, fallback: number) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

const hero = qs<HTMLElement>(".hero");
const heroStage = qs<HTMLElement>("[data-hero-stage]");
const media = qs<HTMLElement>("#media");
const heroVisuals = qs<HTMLElement>("[data-hero-visuals]");
const vacancies = qs<HTMLElement>("#vacancies");
const heroCopy = qs<HTMLElement>("[data-hero-copy]");
const workerVisuals = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-depth-target]"));
const veil = qs<HTMLElement>(".veil");
const maskSvg = qs<SVGSVGElement>("#maskSvg");
const guideSvg = qs<SVGSVGElement>("#guideSvg");
const sector = qs<SVGPolygonElement>("#maskSector");
const debugForm = qs<HTMLFormElement>("#debugForm");
const showGuide = qs<HTMLInputElement>("#showGuide");

const fields = {
  backgroundColor: qs<HTMLInputElement>("#backgroundColor"),
  maskColor: qs<HTMLInputElement>("#maskColor"),
  centerX: qs<HTMLInputElement>("#centerX"),
  centerY: qs<HTMLInputElement>("#centerY"),
  upperOpen: qs<HTMLInputElement>("#upperOpen"),
  lowerOpen: qs<HTMLInputElement>("#lowerOpen"),
  axisDeg: qs<HTMLInputElement>("#axisDeg"),
  travelFrom: qs<HTMLInputElement>("#travelFrom"),
  yOffset: qs<HTMLInputElement>("#yOffset"),
  duration: qs<HTMLInputElement>("#duration"),
  mediaScrollFactor: qs<HTMLInputElement>("#mediaScrollFactor"),
  ease: qs<HTMLSelectElement>("#ease")
};

const out = {
  backgroundColor: qs<HTMLOutputElement>("#backgroundColorOut"),
  maskColor: qs<HTMLOutputElement>("#maskColorOut"),
  centerX: qs<HTMLOutputElement>("#centerXOut"),
  centerY: qs<HTMLOutputElement>("#centerYOut"),
  upperOpen: qs<HTMLOutputElement>("#upperOut"),
  lowerOpen: qs<HTMLOutputElement>("#lowerOut"),
  axisDeg: qs<HTMLOutputElement>("#axisOut"),
  travelFrom: qs<HTMLOutputElement>("#travelOut"),
  yOffset: qs<HTMLOutputElement>("#yOut"),
  duration: qs<HTMLOutputElement>("#durationOut"),
  mediaScrollFactor: qs<HTMLOutputElement>("#mediaScrollOut")
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

const state = {
  progress: 0,
  lineProgress: 0,
  heroScroll: 0,
  mediaY: 0,
  vacancyY: 0
};

const layout = {
  width: heroStage.clientWidth,
  height: heroStage.clientHeight,
  vacancyOffsetTop: vacancies.offsetTop
};

let config = readConfig();
let activeTween: gsap.core.Tween | null = null;
let heroMotionHintsActive = false;
let lastMaskClosed: boolean | null = null;
let lastInnerNavVisible: boolean | null = null;
let lastMaskPolygon = "";
let heroRevealHasPlayed = false;

function readConfig(): ShutterConfig {
  return {
    centerX: readNumber(fields.centerX, defaultConfig.centerX),
    centerY: readNumber(fields.centerY, defaultConfig.centerY),
    upperOpen: readNumber(fields.upperOpen, defaultConfig.upperOpen),
    lowerOpen: readNumber(fields.lowerOpen, defaultConfig.lowerOpen),
    axisDeg: readNumber(fields.axisDeg, defaultConfig.axisDeg),
    travelFrom: readNumber(fields.travelFrom, defaultConfig.travelFrom),
    yOffset: readNumber(fields.yOffset, defaultConfig.yOffset),
    duration: readNumber(fields.duration, defaultConfig.duration),
    mediaScrollFactor: readNumber(fields.mediaScrollFactor, defaultConfig.mediaScrollFactor),
    ease: fields.ease.value || defaultConfig.ease
  };
}

function applyColors() {
  document.documentElement.style.setProperty("--background-color", fields.backgroundColor.value);
  document.documentElement.style.setProperty("--mask-color", fields.maskColor.value);
}

function refreshLayout() {
  layout.width = heroStage.clientWidth;
  layout.height = heroStage.clientHeight;
  layout.vacancyOffsetTop = vacancies.offsetTop;
}

function box() {
  return {
    width: layout.width,
    height: layout.height,
    vacancyOffsetTop: layout.vacancyOffsetTop
  };
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function center() {
  const { width, height, vacancyOffsetTop } = box();
  const centerY = (config.centerY / 100) * height;
  const vacancyGap = Math.max(0, vacancyOffsetTop - centerY);
  const startX = (config.centerX / 100) * width;
  const finalX = width * -0.15;

  return {
    x: gsap.utils.interpolate(startX, finalX, state.lineProgress),
    y: vacancyOffsetTop - state.heroScroll * heroMaskScrollSpeed - vacancyGap
  };
}

function pointOnRay(from: Point, deg: number, radius: number) {
  const rad = degToRad(deg);

  return {
    x: from.x + Math.cos(rad) * radius,
    y: from.y + Math.sin(rad) * radius
  };
}

function maskAngles() {
  const upperDeg = config.axisDeg - config.upperOpen * state.progress;
  const lowerDeg = config.axisDeg + config.lowerOpen * state.progress;
  const rotation = -lowerDeg * state.lineProgress;

  return {
    upperDeg: upperDeg + rotation,
    lowerDeg: lowerDeg + rotation
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
  const { upperDeg, lowerDeg } = maskAngles();
  const span = lowerDeg - upperDeg;

  if (span < 0.01) {
    const point = moved(root);
    return [point, point, point];
  }

  const steps = Math.max(6, Math.min(maskMaxSegments, Math.ceil(span / maskDegreesPerSegment)));
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
  out.backgroundColor.textContent = fields.backgroundColor.value;
  out.maskColor.textContent = fields.maskColor.value;
  out.centerX.textContent = `${config.centerX.toFixed(1)}%`;
  out.centerY.textContent = `${config.centerY.toFixed(1)}%`;
  out.upperOpen.textContent = `${Math.round(config.upperOpen)}deg`;
  out.lowerOpen.textContent = `${Math.round(config.lowerOpen)}deg`;
  out.axisDeg.textContent = `${Math.round(config.axisDeg)}deg`;
  out.travelFrom.textContent = `${config.travelFrom.toFixed(1)}%`;
  out.yOffset.textContent = `${config.yOffset > 0 ? "+" : ""}${config.yOffset.toFixed(1)}%`;
  out.duration.textContent = `${config.duration.toFixed(2)}s`;
  out.mediaScrollFactor.textContent = `${config.mediaScrollFactor.toFixed(2)}x`;
}

function emitMaskState(isMaskClosed: boolean, innerNavVisible: boolean) {
  if (lastMaskClosed === isMaskClosed && lastInnerNavVisible === innerNavVisible) {
    return;
  }

  lastMaskClosed = isMaskClosed;
  lastInnerNavVisible = innerNavVisible;
}

function renderHeroDepth(progress: number) {
  const eased = heroDepthEase(gsap.utils.clamp(0, 1, progress));

  gsap.set(workerVisuals, {
    scale: gsap.utils.interpolate(1, 0.86, eased),
    transformOrigin: "50% 36%"
  });

  gsap.set(heroCopy, {
    scale: gsap.utils.interpolate(1, 0.88, eased),
    transformOrigin: "50% 48%"
  });

  gsap.set(veil, {
    "--veil-boost": gsap.utils.interpolate(0, 0.92, eased)
  });
}

function setHeroMotionHints(enabled: boolean) {
  if (heroMotionHintsActive === enabled) {
    return;
  }

  heroMotionHintsActive = enabled;
  media.style.willChange = enabled ? "clip-path" : "";
  heroVisuals.style.willChange = enabled ? "transform" : "";
  veil.style.willChange = enabled ? "transform" : "";
  vacancies.style.willChange = enabled ? "transform" : "";
  heroCopy.style.willChange = enabled ? "transform" : "";
  workerVisuals.forEach((visual) => {
    visual.style.willChange = enabled ? "transform" : "";
  });
}

function renderVacancyScroll(currentScroll: number) {
  state.heroScroll = currentScroll;
  state.vacancyY = -currentScroll * (heroVacancyScrollSpeed - 1);

  gsap.set(vacancies, {
    y: state.vacancyY
  });
}

function renderMediaScroll(currentScroll: number) {
  state.mediaY = -currentScroll * config.mediaScrollFactor;

  gsap.set([heroVisuals, veil], {
    y: state.mediaY
  });
}

function renderMask(options: { forceDebug?: boolean; updateReadout?: boolean } = {}) {
  const { width, height } = box();
  const points = sectorPoints();
  const polygon = cssPolygon(points);
  const shouldRenderDebugGeometry = options.forceDebug || showGuide.checked;
  const maskEdgeY = center().y;
  const isMaskClosed = state.lineProgress >= 1 && maskEdgeY <= 0;
  const innerNavRevealY = height * (1 - innerNavRevealViewportProgress);
  const shouldShowInnerNav = state.progress >= 1 && state.lineProgress > 0 && maskEdgeY <= innerNavRevealY;

  if (polygon !== lastMaskPolygon) {
    lastMaskPolygon = polygon;
    media.style.clipPath = polygon;
    media.style.setProperty("-webkit-clip-path", polygon);
  }

  hero.dataset.maskClosed = String(isMaskClosed);
  hero.style.setProperty("--hero-mask-edge-y", `${maskEdgeY}px`);
  emitMaskState(isMaskClosed, shouldShowInnerNav);

  if (shouldRenderDebugGeometry) {
    maskSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    guideSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    sector.setAttribute("points", svgPoints(points));
    renderGuides();
  }

  if (options.updateReadout) {
    renderReadout();
  }
}

function resetHeroReveal() {
  heroRevealHasPlayed = false;
}

function playHeroReveal() {
  if (heroRevealHasPlayed) {
    return;
  }

  heroRevealHasPlayed = true;
}

function resetMask() {
  activeTween?.kill();
  refreshLayout();
  config = readConfig();
  applyColors();
  state.progress = 0;
  state.lineProgress = 0;
  renderHeroDepth(0);
  renderMediaScroll(0);
  renderVacancyScroll(0);
  resetHeroReveal();
  document.body.classList.add("is-lock");
  renderMask({ forceDebug: true, updateReadout: true });
}

function finalMask() {
  activeTween?.kill();
  setHeroMotionHints(false);
  refreshLayout();
  config = readConfig();
  applyColors();
  state.progress = 1;
  state.lineProgress = 0;
  renderHeroDepth(0);
  renderMediaScroll(0);
  renderVacancyScroll(0);
  document.body.classList.remove("is-lock");
  playHeroReveal();
  renderMask({ forceDebug: true, updateReadout: true });
}

function playMask() {
  activeTween?.kill();
  setHeroMotionHints(true);
  refreshLayout();
  config = readConfig();
  applyColors();
  state.progress = 0;
  state.lineProgress = 0;
  renderHeroDepth(0);
  renderMediaScroll(0);
  renderVacancyScroll(0);
  resetHeroReveal();
  document.body.classList.add("is-lock");
  renderMask({ forceDebug: true, updateReadout: true });

  activeTween = gsap.to(state, {
    progress: 1,
    duration: config.duration,
    ease: config.ease,
    onUpdate: () => {
      renderMask();

      if (state.progress >= heroRevealStartProgress) {
        playHeroReveal();
      }
    },
    onComplete: () => {
      activeTween = null;
      renderMask({ forceDebug: true });
      document.body.classList.remove("is-lock");
      setHeroMotionHints(false);
      playHeroReveal();
    }
  });
}

function syncFormChanges() {
  refreshLayout();
  config = readConfig();
  applyColors();
  renderMediaScroll(state.heroScroll);
  renderMask({ forceDebug: true, updateReadout: true });
}

function boot() {
  qs<HTMLButtonElement>("#playMask").addEventListener("click", playMask);
  qs<HTMLButtonElement>("#resetMask").addEventListener("click", resetMask);
  qs<HTMLButtonElement>("#finalMask").addEventListener("click", finalMask);

  debugForm.addEventListener("input", syncFormChanges);
  showGuide.addEventListener("change", () => {
    document.body.classList.toggle("show-guides", showGuide.checked);
    renderMask({ forceDebug: true });
  });

  window.addEventListener("resize", () => {
    refreshLayout();
    renderMediaScroll(state.heroScroll);
    renderMask({ forceDebug: true });
  });

  resetMask();
  document.documentElement.classList.remove("is-booting");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finalMask();
    return;
  }

  requestAnimationFrame(() => playMask());
}

boot();

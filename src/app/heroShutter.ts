import { optional, qs, qsa, type CleanupRegistry } from "./dom";
import { gsap, ScrollTrigger } from "./gsapSetup";

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

type HeroShutterOptions = {
  cleanup: CleanupRegistry;
  onMaskState?: (state: {
    closed: boolean;
    edgeY: number;
    innerNavVisible: boolean;
    lineProgress: number;
    progress: number;
  }) => void;
  onRevealPlay?: () => void;
  onRevealReset?: () => void;
  root?: ParentNode;
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
export const heroMaskScrollSpeed = 1.15;
const heroRevealStartProgress = 0.82;
const innerNavRevealViewportProgress = 0.9;
const maskDegreesPerSegment = 4;
const maskMaxSegments = 64;

export function createHeroShutter({
  cleanup,
  onMaskState,
  onRevealPlay,
  onRevealReset,
  root = document
}: HeroShutterOptions) {
  const hero = qs<HTMLElement>(".hero", root);
  const heroStage = qs<HTMLElement>("[data-hero-stage]", root);
  const media = qs<HTMLElement>("#media", root);
  const heroVisuals = qs<HTMLElement>("[data-hero-visuals]", root);
  const vacancies = qs<HTMLElement>("#vacancies", root);
  const heroCopy = qs<HTMLElement>("[data-hero-copy]", root);
  const workerVisuals = qsa<HTMLElement>("[data-hero-depth-target]", root);
  const veil = qs<HTMLElement>(".veil", root);
  const maskSvg = optional<SVGSVGElement>("#maskSvg", root);
  const guideSvg = optional<SVGSVGElement>("#guideSvg", root);
  const sector = optional<SVGPolygonElement>("#maskSector", root);
  const debugForm = optional<HTMLFormElement>("#debugForm");
  const showGuide = optional<HTMLInputElement>("#showGuide");
  const fields = {
    centerX: optional<HTMLInputElement>("#centerX"),
    centerY: optional<HTMLInputElement>("#centerY"),
    upperOpen: optional<HTMLInputElement>("#upperOpen"),
    lowerOpen: optional<HTMLInputElement>("#lowerOpen"),
    axisDeg: optional<HTMLInputElement>("#axisDeg"),
    travelFrom: optional<HTMLInputElement>("#travelFrom"),
    yOffset: optional<HTMLInputElement>("#yOffset"),
    duration: optional<HTMLInputElement>("#duration"),
    mediaScrollFactor: optional<HTMLInputElement>("#mediaScrollFactor"),
    ease: optional<HTMLSelectElement>("#ease")
  };
  const out = {
    centerX: optional<HTMLOutputElement>("#centerXOut"),
    centerY: optional<HTMLOutputElement>("#centerYOut"),
    upperOpen: optional<HTMLOutputElement>("#upperOut"),
    lowerOpen: optional<HTMLOutputElement>("#lowerOut"),
    axisDeg: optional<HTMLOutputElement>("#axisOut"),
    travelFrom: optional<HTMLOutputElement>("#travelOut"),
    yOffset: optional<HTMLOutputElement>("#yOut"),
    duration: optional<HTMLOutputElement>("#durationOut"),
    mediaScrollFactor: optional<HTMLOutputElement>("#mediaScrollOut")
  };
  const guides = {
    upperRay: optional<SVGLineElement>("#upperRay", root),
    lowerRay: optional<SVGLineElement>("#lowerRay", root),
    axisLine: optional<SVGLineElement>("#axisLine", root),
    travelLine: optional<SVGLineElement>("#travelLine", root),
    yLine: optional<SVGLineElement>("#yLine", root),
    centerDot: optional<SVGCircleElement>("#centerDot", root),
    travelDot: optional<SVGCircleElement>("#travelDot", root)
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
  let debugRefreshCall: gsap.core.Tween | null = null;
  let heroMotionHintsActive = false;
  let heroScrollTrigger: ScrollTrigger | null = null;
  let lastMaskClosed: boolean | null = null;
  let lastInnerNavVisible: boolean | null = null;
  let lastMaskPolygon = "";
  let heroRevealHasPlayed = false;

  cleanup.add(() => activeTween?.kill());
  cleanup.add(() => debugRefreshCall?.kill());
  cleanup.add(() => setHeroMotionHints(false));

  function resetHeroReveal() {
    heroRevealHasPlayed = false;
    onRevealReset?.();
  }

  function playHeroReveal() {
    if (heroRevealHasPlayed) {
      return;
    }

    heroRevealHasPlayed = true;
    onRevealPlay?.();
  }

  function readConfig(): ShutterConfig {
    return {
      centerX: Number(fields.centerX?.value ?? defaultConfig.centerX),
      centerY: Number(fields.centerY?.value ?? defaultConfig.centerY),
      upperOpen: Number(fields.upperOpen?.value ?? defaultConfig.upperOpen),
      lowerOpen: Number(fields.lowerOpen?.value ?? defaultConfig.lowerOpen),
      axisDeg: Number(fields.axisDeg?.value ?? defaultConfig.axisDeg),
      travelFrom: Number(fields.travelFrom?.value ?? defaultConfig.travelFrom),
      yOffset: Number(fields.yOffset?.value ?? defaultConfig.yOffset),
      duration: Number(fields.duration?.value ?? defaultConfig.duration),
      mediaScrollFactor: Number(fields.mediaScrollFactor?.value ?? defaultConfig.mediaScrollFactor),
      ease: fields.ease?.value ?? defaultConfig.ease
    };
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

  function topAlignedMaskScrollDistance() {
    const { height, vacancyOffsetTop } = box();
    const centerY = (config.centerY / 100) * height;
    const vacancyGap = Math.max(0, vacancyOffsetTop - centerY);

    return Math.max(1, (vacancyOffsetTop - vacancyGap) / heroMaskScrollSpeed);
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
    const { upperRay, lowerRay, axisLine, travelLine, yLine, centerDot, travelDot } = guides;

    if (!upperRay || !lowerRay || !axisLine || !travelLine || !yLine || !centerDot || !travelDot) {
      return;
    }

    const { width, height } = box();
    const root = center();
    const radius = Math.hypot(width, height) * 1.6;
    const dropped = { x: root.x, y: root.y + yOffset(0) };
    const from = {
      x: dropped.x + travel(0).x,
      y: dropped.y + travel(0).y
    };

    setLine(upperRay, root, pointOnRay(root, config.axisDeg - config.upperOpen, radius));
    setLine(lowerRay, root, pointOnRay(root, config.axisDeg + config.lowerOpen, radius));
    setLine(axisLine, dropped, pointOnRay(dropped, config.axisDeg, radius));
    setLine(travelLine, from, dropped);
    setLine(yLine, dropped, root);
    setDot(centerDot, root);
    setDot(travelDot, from);
  }

  function renderReadout() {
    if (out.centerX) out.centerX.textContent = `${config.centerX.toFixed(1)}%`;
    if (out.centerY) out.centerY.textContent = `${config.centerY.toFixed(1)}%`;
    if (out.upperOpen) out.upperOpen.textContent = `${Math.round(config.upperOpen)}deg`;
    if (out.lowerOpen) out.lowerOpen.textContent = `${Math.round(config.lowerOpen)}deg`;
    if (out.axisDeg) out.axisDeg.textContent = `${Math.round(config.axisDeg)}deg`;
    if (out.travelFrom) out.travelFrom.textContent = `${config.travelFrom.toFixed(1)}%`;
    if (out.yOffset) out.yOffset.textContent = `${config.yOffset > 0 ? "+" : ""}${config.yOffset.toFixed(1)}%`;
    if (out.duration) out.duration.textContent = `${config.duration.toFixed(2)}s`;
    if (out.mediaScrollFactor) out.mediaScrollFactor.textContent = `${config.mediaScrollFactor.toFixed(2)}x`;
  }

  function emitMaskState(isMaskClosed: boolean, maskEdgeY: number, innerNavVisible: boolean) {
    if (lastMaskClosed === isMaskClosed && lastInnerNavVisible === innerNavVisible) {
      return;
    }

    lastMaskClosed = isMaskClosed;
    lastInnerNavVisible = innerNavVisible;
    onMaskState?.({
      closed: isMaskClosed,
      edgeY: maskEdgeY,
      innerNavVisible,
      lineProgress: state.lineProgress,
      progress: state.progress
    });
  }

  function renderHeroDepth(progress: number) {
    const eased = heroDepthEase(gsap.utils.clamp(0, 1, progress));

    if (workerVisuals.length > 0) {
      gsap.set(workerVisuals, {
        scale: gsap.utils.interpolate(1, 0.86, eased),
        transformOrigin: "50% 36%"
      });
    }

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
    const shouldRenderDebugGeometry = options.forceDebug || Boolean(showGuide?.checked);
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
    emitMaskState(isMaskClosed, maskEdgeY, shouldShowInnerNav);

    if (shouldRenderDebugGeometry && maskSvg && guideSvg && sector) {
      maskSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      guideSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      sector.setAttribute("points", svgPoints(points));
      renderGuides();
    }

    if (options.updateReadout) {
      renderReadout();
    }
  }

  function resetMask() {
    activeTween?.kill();
    refreshLayout();
    config = readConfig();
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
    state.progress = 1;
    state.lineProgress = 0;
    renderHeroDepth(0);
    renderMediaScroll(0);
    renderVacancyScroll(0);
    document.body.classList.remove("is-lock");
    playHeroReveal();
    renderMask({ forceDebug: true, updateReadout: true });
  }

  function syncShutterScroll(self: ScrollTrigger) {
    const currentScroll = Math.max(0, window.scrollY - self.start);

    setHeroMotionHints(true);
    renderMediaScroll(currentScroll);
    renderVacancyScroll(currentScroll);
    state.lineProgress = gsap.utils.clamp(0, 1, currentScroll / topAlignedMaskScrollDistance());
    renderHeroDepth(self.progress);
    renderMask();
  }

  function playMask() {
    activeTween?.kill();
    setHeroMotionHints(true);
    refreshLayout();
    config = readConfig();
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

  function initHeroScrollEffects() {
    heroScrollTrigger = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      pin: heroStage,
      pinSpacing: false,
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        refreshLayout();
        syncShutterScroll(self);
      },
      onUpdate: syncShutterScroll,
      onLeave: () => {
        state.lineProgress = 1;
        renderMediaScroll(box().height);
        renderVacancyScroll(box().height);
        renderHeroDepth(1);
        renderMask();
        setHeroMotionHints(false);
      },
      onLeaveBack: () => {
        state.lineProgress = 0;
        renderMediaScroll(0);
        renderVacancyScroll(0);
        renderHeroDepth(0);
        renderMask();
        setHeroMotionHints(false);
      }
    });

    cleanup.addKillable(heroScrollTrigger);
    cleanup.add(() => {
      heroScrollTrigger = null;
    });
  }

  function scheduleDebugRefresh() {
    debugRefreshCall?.kill();
    debugRefreshCall = gsap.delayedCall(0.08, () => {
      debugRefreshCall = null;
      ScrollTrigger.refresh();
    });
  }

  if (debugForm) cleanup.on(debugForm, "input", () => {
    refreshLayout();
    config = readConfig();
    renderMediaScroll(state.heroScroll);
    renderMask({ forceDebug: true, updateReadout: true });
    scheduleDebugRefresh();
  });

  if (showGuide) cleanup.on(showGuide, "change", () => {
    document.body.classList.toggle("show-guides", showGuide.checked);
    renderMask({ forceDebug: true });
  });

  const playMaskButton = optional<HTMLButtonElement>("#playMask");
  const resetMaskButton = optional<HTMLButtonElement>("#resetMask");
  const finalMaskButton = optional<HTMLButtonElement>("#finalMask");

  if (playMaskButton) cleanup.on(playMaskButton, "click", playMask);
  if (resetMaskButton) cleanup.on(resetMaskButton, "click", resetMask);
  if (finalMaskButton) cleanup.on(finalMaskButton, "click", finalMask);

  cleanup.on(window, "resize", () => {
    refreshLayout();
    renderMediaScroll(state.heroScroll);
    renderMask({ forceDebug: true });
  });

  return {
    finalMask,
    initHeroScrollEffects,
    playMask,
    resetMask
  };
}

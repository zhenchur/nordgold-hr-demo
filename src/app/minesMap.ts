import { mineLocations } from "./content";
import { type CleanupRegistry, optional, qsa } from "./dom";
import { gsap } from "./gsapSetup";
import { readMinesMotionSettings, type MinesMotionSettings, type MinesMotionPhaseSettings } from "./minesMotion";

type InitMinesMapOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
};

type MinesMapController = {
  replayText: () => void;
};

type MapPoint = {
  x: number;
  y: number;
};

const initialMineIndex = Math.min(4, mineLocations.length - 1);
const mapStarCenter: MapPoint = { x: 484, y: 398 };
const mapPointCenters: MapPoint[] = [
  { x: 54, y: 516 },
  { x: 358, y: 504 },
  { x: 791, y: 286 },
  { x: 210, y: 356 },
  { x: 648, y: 513 }
];
const starLineGap = 26;
const pointLineGap = 38;
const pointRevealFallbacks = {
  duration: 0.4,
  ease: "power3.out"
};
const pointRevealProperties = [
  "--mines-point-ring-scale",
  "--mines-point-ring-alpha",
  "--mines-point-mark-scale",
  "--mines-point-mark-alpha"
];

function normalizeMineIndex(index: number) {
  return (index + mineLocations.length) % mineLocations.length;
}

function getConnectorPoints(point: MapPoint) {
  const dx = point.x - mapStarCenter.x;
  const dy = point.y - mapStarCenter.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return null;
  }

  const unitX = dx / length;
  const unitY = dy / length;

  return {
    x1: mapStarCenter.x + unitX * starLineGap,
    y1: mapStarCenter.y + unitY * starLineGap,
    x2: point.x - unitX * pointLineGap,
    y2: point.y - unitY * pointLineGap
  };
}

function formatSvgNumber(value: number) {
  return value.toFixed(2);
}

function readRootCustomProperty(name: string) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function parseCssTime(value: string, fallback: number) {
  if (!value) {
    return fallback;
  }

  const numeric = Number.parseFloat(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return value.endsWith("ms") ? numeric / 1000 : numeric;
}

function readPointRevealMotion() {
  return {
    duration: parseCssTime(readRootCustomProperty("--motion-hover-text-duration"), pointRevealFallbacks.duration),
    ease: readRootCustomProperty("--motion-hover-gsap-ease") || pointRevealFallbacks.ease
  };
}

function getMotionText(target: HTMLElement) {
  return target.querySelector<HTMLElement>("[data-mines-motion-live]")?.textContent ?? target.textContent ?? "";
}

function ensureMotionLive(target: HTMLElement) {
  const existing = target.querySelector<HTMLElement>("[data-mines-motion-live]");

  if (existing) {
    return existing;
  }

  const live = document.createElement("span");
  live.className = "mines-motion-live";
  live.dataset.minesMotionLive = "true";
  live.textContent = target.textContent ?? "";

  target.classList.add("mines-motion-target");
  target.replaceChildren(live);

  return live;
}

function phaseFromVars(phase: MinesMotionPhaseSettings, settings: MinesMotionSettings) {
  return {
    autoAlpha: phase.opacity,
    rotationX: phase.rotateX,
    transformOrigin: settings.transformOrigin,
    transformPerspective: phase.perspective,
    transformStyle: "preserve-3d",
    yPercent: phase.yPercent,
    willChange: "transform, opacity"
  };
}

function phaseToVars(settings: MinesMotionSettings) {
  return {
    autoAlpha: 1,
    rotationX: 0,
    transformOrigin: settings.transformOrigin,
    yPercent: 0
  };
}

export function initMinesMap({ cleanup, reduceMotion }: InitMinesMapOptions) {
  const section = optional<HTMLElement>(".mines-section");

  if (!section || mineLocations.length === 0) {
    return;
  }

  const region = optional<HTMLElement>("[data-mines-region]", section);
  const title = optional<HTMLElement>("[data-mines-title]", section);
  const location = optional<HTMLElement>("[data-mines-location]", section);
  const method = optional<HTMLElement>("[data-mines-method]", section);
  const year = optional<HTMLElement>("[data-mines-year]", section);
  const vacancies = optional<HTMLElement>("[data-mines-vacancies]", section);
  const points = qsa<HTMLElement>("[data-mines-point]", section);
  const connector = optional<SVGLineElement>("[data-mines-connector]", section);
  const prev = optional<HTMLButtonElement>("[data-mines-prev]", section);
  const next = optional<HTMLButtonElement>("[data-mines-next]", section);

  if (!prev || !next) {
    return;
  }

  let activeIndex = initialMineIndex;
  let activeTimeline: gsap.core.Timeline | undefined;
  let activePointReveal: gsap.core.Tween | undefined;
  let activeGhosts: HTMLElement[] = [];
  let activeTargets: HTMLElement[] = [];

  const clearPointRevealVars = (items: HTMLElement[] = points) => {
    items.forEach((point) => {
      pointRevealProperties.forEach((property) => point.style.removeProperty(property));
    });
  };

  const revealActivePoint = (point: HTMLElement | undefined, animated: boolean) => {
    activePointReveal?.kill();
    activePointReveal = undefined;
    clearPointRevealVars();

    if (!point || reduceMotion || !animated) {
      return;
    }

    const motion = readPointRevealMotion();

    activePointReveal = gsap.fromTo(
      point,
      {
        "--mines-point-ring-scale": 0,
        "--mines-point-ring-alpha": 0,
        "--mines-point-mark-scale": 0,
        "--mines-point-mark-alpha": 0
      },
      {
        "--mines-point-ring-scale": 1,
        "--mines-point-ring-alpha": 1,
        "--mines-point-mark-scale": 1,
        "--mines-point-mark-alpha": 1,
        duration: motion.duration,
        ease: motion.ease,
        overwrite: true,
        onComplete: () => {
          clearPointRevealVars([point]);
          activePointReveal = undefined;
        }
      }
    );
  };

  const cleanupTextMotionArtifacts = () => {
    activeTargets.forEach((target) => {
      gsap.set(target, { clearProps: "perspective,transformStyle" });
      const live = target.querySelector<HTMLElement>("[data-mines-motion-live]");

      if (live) {
        gsap.set(live, { clearProps: "all" });
      }
    });
    activeTargets = [];
    activeGhosts.forEach((ghost) => ghost.remove());
    activeGhosts = [];
  };

  const disposeTextMotion = () => {
    activeTimeline?.kill();
    activeTimeline = undefined;
    cleanupTextMotionArtifacts();
  };

  const disposePointMotion = () => {
    activePointReveal?.kill();
    activePointReveal = undefined;
    clearPointRevealVars();
  };

  const setTextImmediately = (target: HTMLElement, value: string) => {
    const live = ensureMotionLive(target);

    live.textContent = value;
    gsap.set(target, { clearProps: "perspective,transformStyle" });
    gsap.set(live, { clearProps: "all" });
  };

  const animateTextChanges = (changes: Array<{ target: HTMLElement; value: string }>) => {
    disposeTextMotion();

    if (reduceMotion || changes.length === 0) {
      changes.forEach(({ target, value }) => setTextImmediately(target, value));
      return;
    }

    const settings = readMinesMotionSettings();
    const enterOffset = settings.phaseOffset;
    const phaseShift = Math.max(0, -enterOffset);

    const timeline = gsap.timeline({
      onComplete: () => {
        cleanupTextMotionArtifacts();
        activeTimeline = undefined;
      }
    });
    activeTimeline = timeline;

    changes.forEach(({ target, value }, index) => {
      const oldText = getMotionText(target);
      const live = ensureMotionLive(target);
      const ghost = document.createElement("span");
      const groupAt = index * settings.targetStagger;
      const exitAt = groupAt + phaseShift;
      const enterAt = exitAt + enterOffset;

      target.classList.add("mines-motion-target");
      ghost.className = "mines-motion-ghost";
      ghost.dataset.minesMotionGhost = "true";
      ghost.textContent = oldText;
      activeTargets.push(target);
      activeGhosts.push(ghost);
      target.append(ghost);

      live.textContent = value;

      gsap.set(target, {
        perspective: Math.max(settings.enter.perspective, settings.exit.perspective),
        transformStyle: "preserve-3d"
      });
      gsap.set(live, phaseFromVars(settings.enter, settings));
      gsap.set(ghost, {
        ...phaseToVars(settings),
        autoAlpha: 1,
        willChange: "transform, opacity"
      });

      timeline
        .to(ghost, {
          ...phaseFromVars(settings.exit, settings),
          duration: settings.exit.duration,
          ease: settings.exit.ease
        }, exitAt)
        .to(live, {
          ...phaseToVars(settings),
          duration: settings.enter.duration,
          ease: settings.enter.ease,
          clearProps: "transform,transformOrigin,opacity,visibility,willChange"
        }, enterAt);
    });
  };

  const setActiveMine = (nextIndex: number, animated = true) => {
    if (!animated) {
      disposeTextMotion();
    }

    activeIndex = normalizeMineIndex(nextIndex);
    const mine = mineLocations[activeIndex];
    const textChanges: Array<{ target: HTMLElement; value: string }> = [];

    const queueText = (target: HTMLElement | null, value: string) => {
      if (!target) {
        return;
      }

      if (!animated) {
        setTextImmediately(target, value);
        return;
      }

      if (getMotionText(target) === value) {
        return;
      }

      textChanges.push({ target, value });
    };

    queueText(region, mine.region);
    queueText(title, mine.title);
    queueText(location, mine.location);
    queueText(method, mine.method);
    queueText(year, mine.year);
    queueText(vacancies, `(${mine.vacancies})`);

    let activePoint: HTMLElement | undefined;

    points.forEach((point) => {
      const isActive = Number(point.dataset.minesPoint) === activeIndex;

      point.classList.toggle("is-active", isActive);

      if (isActive) {
        activePoint = point;
      }
    });
    revealActivePoint(activePoint, animated);

    const mapPoint = mapPointCenters[activeIndex];
    const connectorPoints = mapPoint ? getConnectorPoints(mapPoint) : null;

    if (connector && connectorPoints) {
      connector.setAttribute("x1", formatSvgNumber(connectorPoints.x1));
      connector.setAttribute("y1", formatSvgNumber(connectorPoints.y1));
      connector.setAttribute("x2", formatSvgNumber(connectorPoints.x2));
      connector.setAttribute("y2", formatSvgNumber(connectorPoints.y2));
    }

    if (animated) {
      animateTextChanges(textChanges);
    }
  };

  const replayText = () => {
    const targets = [region, title, location, method, year, vacancies].filter(
      (target): target is HTMLElement => Boolean(target)
    );

    animateTextChanges(targets.map((target) => ({ target, value: getMotionText(target) })));
  };

  cleanup.on(prev, "click", () => setActiveMine(activeIndex - 1));
  cleanup.on(next, "click", () => setActiveMine(activeIndex + 1));

  cleanup.add(() => {
    disposeTextMotion();
    disposePointMotion();
  });

  setActiveMine(activeIndex, false);

  return {
    replayText
  } satisfies MinesMapController;
}

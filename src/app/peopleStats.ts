import { peopleStats } from "./content";
import { optional, qsa, type CleanupRegistry } from "./dom";
import { gsap, ScrollTrigger } from "./gsapSetup";
import {
  getPeopleStatsPhaseFromVars,
  getPeopleStatsPhaseToVars,
  peopleStatsHoldDuration,
  readPeopleStatsMotionSettings,
  type PeopleStatsMotionSettings
} from "./peopleStatsMotion";

type PeopleStatsOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
};

type StatLayer = {
  caption: HTMLElement;
  captionParts: HTMLElement[];
  icon: HTMLImageElement;
  numberGroup: HTMLElement;
  numberParts: HTMLElement[];
  numberScale: HTMLElement;
  numberSlot: HTMLElement;
  root: HTMLElement;
};

function renderNumber(value: string) {
  const number = document.createElement("span");
  number.dataset.peopleNumber = "true";

  Array.from(value).forEach((char) => {
    const part = document.createElement("span");
    part.dataset.peopleNumberChar = "true";
    part.textContent = char;
    number.append(part);
  });

  return number;
}

function renderCaption(value: string) {
  const caption = document.createElement("p");
  caption.className = "people-stat-caption";
  caption.dataset.peopleCaption = "true";
  caption.setAttribute("aria-label", value.replace(/\n/g, " "));

  value.split("\n").forEach((line) => {
    const part = document.createElement("span");
    part.dataset.peopleCaptionLine = "true";
    part.textContent = line;
    caption.append(part);
  });

  return caption;
}

function createLayer(index: number) {
  const stat = peopleStats[index];
  const root = document.createElement("div");
  const numberSlot = document.createElement("div");
  const numberScale = document.createElement("div");
  const numberGroup = document.createElement("div");
  const unit = document.createElement("small");
  const meta = document.createElement("div");
  const line = document.createElement("span");
  const row = document.createElement("div");
  const caption = renderCaption(stat.caption);
  const icon = document.createElement("img");
  const number = renderNumber(stat.value);

  root.className = "people-stat-layer";
  root.dataset.peopleStatLayer = "true";
  root.setAttribute("aria-hidden", "true");

  numberSlot.className = "people-number-slot";
  numberSlot.setAttribute("aria-live", "polite");
  numberSlot.setAttribute("aria-atomic", "true");
  numberScale.className = "people-number-scale";
  numberScale.dataset.peopleNumberScale = "true";
  numberGroup.className = "people-number";
  numberGroup.dataset.peopleNumberGroup = "true";
  numberGroup.setAttribute("aria-label", `${stat.value} ${stat.unit}`);

  unit.dataset.peopleUnit = "true";
  unit.textContent = stat.unit;
  numberGroup.append(number, unit);
  numberScale.append(numberGroup);
  numberSlot.append(numberScale);

  meta.className = "people-stat-meta";
  line.className = "people-stat-line";
  line.setAttribute("aria-hidden", "true");
  row.className = "people-stat-row";

  icon.className = "people-stat-icon";
  icon.dataset.peopleIcon = "true";
  icon.src = stat.icon;
  icon.alt = "";

  row.append(caption, icon);
  meta.append(line, row);
  root.append(numberSlot, meta);

  return {
    caption,
    captionParts: qsa<HTMLElement>("[data-people-caption-line]", root),
    icon,
    numberGroup,
    numberParts: [...qsa<HTMLElement>("[data-people-number-char]", root), unit],
    numberScale,
    numberSlot,
    root
  };
}

function fitNumber(layer: StatLayer) {
  layer.numberScale.style.transform = "scale(1)";

  const available = layer.numberSlot.clientWidth;
  const needed = layer.numberGroup.scrollWidth;
  const scale = needed > available ? available / needed : 1;

  layer.numberScale.style.transform = `scale(${scale})`;
}

function getLayerMotionTargets(layer: StatLayer) {
  return [...layer.numberParts, ...layer.captionParts, layer.icon];
}

function setLayerReady(layer: StatLayer) {
  gsap.set([layer.root, layer.numberGroup, layer.caption, ...getLayerMotionTargets(layer)], {
    clearProps: "opacity,visibility,transform,transformOrigin,transformPerspective,transformStyle,willChange"
  });
}

function prepareLayerEnter(layer: StatLayer, settings: PeopleStatsMotionSettings) {
  const targets = getLayerMotionTargets(layer);

  gsap.set(layer.root, {
    autoAlpha: 1
  });
  gsap.set([layer.numberGroup, layer.caption], {
    transformPerspective: Math.max(settings.enter.perspective, settings.exit.perspective),
    transformStyle: "preserve-3d"
  });
  gsap.set(targets, getPeopleStatsPhaseFromVars(settings.enter, settings));
}

function animateLayerIn(timeline: gsap.core.Timeline, layer: StatLayer, settings: PeopleStatsMotionSettings, at: number) {
  timeline.to(getLayerMotionTargets(layer), {
    ...getPeopleStatsPhaseToVars(settings),
    duration: settings.enter.duration,
    ease: settings.enter.ease,
    stagger: { each: settings.targetStagger, from: "start" }
  }, at);
}

function animateLayerOut(timeline: gsap.core.Timeline, layer: StatLayer, settings: PeopleStatsMotionSettings, at: number) {
  timeline.to(getLayerMotionTargets(layer), {
    ...getPeopleStatsPhaseFromVars(settings.exit, settings),
    duration: settings.exit.duration,
    ease: settings.exit.ease,
    stagger: { each: settings.targetStagger, from: "start" }
  }, at);
}

export function initPeopleStats({ cleanup, reduceMotion }: PeopleStatsOptions) {
  const panel = optional<HTMLElement>(".people-panel");
  let current = 0;
  let timer: gsap.core.Tween | undefined;
  let resizeFrame = 0;
  let isChanging = false;
  let isPanelInViewport = false;
  let activeLayer: StatLayer | undefined;
  let activeTimeline: gsap.core.Timeline | undefined;

  if (!panel) {
    return;
  }

  const panelEl = panel;

  function setActiveLayer(layer: StatLayer) {
    panelEl.querySelectorAll<HTMLElement>("[data-people-stat-layer]").forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-hidden", "true");
    });

    layer.root.classList.add("is-active");
    layer.root.setAttribute("aria-hidden", "false");
    activeLayer = layer;
  }

  function show(next: number) {
    if (next === current || isChanging || !activeLayer) {
      return;
    }

    const outgoingLayer = activeLayer;
    const incomingLayer = createLayer(next);

    current = next;
    isChanging = true;
    activeTimeline?.kill();

    incomingLayer.root.classList.add("is-entering");
    outgoingLayer.root.classList.add("is-leaving");
    panelEl.append(incomingLayer.root);
    fitNumber(incomingLayer);

    if (reduceMotion) {
      outgoingLayer.root.remove();
      incomingLayer.root.classList.remove("is-entering");
      setLayerReady(incomingLayer);
      setActiveLayer(incomingLayer);
      isChanging = false;
      return;
    }

    const settings = readPeopleStatsMotionSettings();
    const phaseShift = Math.max(0, -settings.phaseOffset);
    const exitAt = phaseShift;
    const enterAt = exitAt + settings.phaseOffset;

    prepareLayerEnter(incomingLayer, settings);

    activeTimeline = gsap.timeline({
      onComplete: () => {
        outgoingLayer.root.remove();
        incomingLayer.root.classList.remove("is-entering");
        setLayerReady(incomingLayer);
        setActiveLayer(incomingLayer);
        isChanging = false;
      }
    });

    animateLayerOut(activeTimeline, outgoingLayer, settings, exitAt);
    animateLayerIn(activeTimeline, incomingLayer, settings, enterAt);
  }

  function canAutoplay() {
    return !reduceMotion
      && peopleStats.length >= 2
      && isPanelInViewport
      && document.visibilityState === "visible";
  }

  function stopAutoplay() {
    timer?.kill();
    timer = undefined;
  }

  function startAutoplay() {
    if (timer || !canAutoplay()) {
      return;
    }

    timer = gsap.delayedCall(peopleStatsHoldDuration, () => {
      timer = undefined;
      show((current + 1) % peopleStats.length);
      startAutoplay();
    });
  }

  function syncAutoplay() {
    if (canAutoplay()) {
      activeTimeline?.resume();
      startAutoplay();
      return;
    }

    stopAutoplay();
    activeTimeline?.pause();
  }

  panelEl.textContent = "";
  activeLayer = createLayer(current);
  panelEl.append(activeLayer.root);
  fitNumber(activeLayer);
  setLayerReady(activeLayer);
  setActiveLayer(activeLayer);

  const viewportTrigger = reduceMotion || peopleStats.length < 2 ? undefined : ScrollTrigger.create({
    trigger: panelEl,
    start: "top bottom",
    end: "bottom top",
    onEnter: () => {
      isPanelInViewport = true;
      syncAutoplay();
    },
    onEnterBack: () => {
      isPanelInViewport = true;
      syncAutoplay();
    },
    onLeave: () => {
      isPanelInViewport = false;
      syncAutoplay();
    },
    onLeaveBack: () => {
      isPanelInViewport = false;
      syncAutoplay();
    },
    onRefresh: (self) => {
      isPanelInViewport = self.isActive || ScrollTrigger.isInViewport(panelEl);
      syncAutoplay();
    }
  });

  if (viewportTrigger) {
    cleanup.addKillable(viewportTrigger);
  }

  syncAutoplay();

  cleanup.add(() => {
    activeTimeline?.kill();
    if (resizeFrame) {
      cancelAnimationFrame(resizeFrame);
    }
    stopAutoplay();
  });
  cleanup.on(document, "visibilitychange", syncAutoplay);
  const refitLayers = () => {
    panelEl.querySelectorAll<HTMLElement>("[data-people-stat-layer]").forEach((layerRoot) => {
      const numberGroup = optional<HTMLElement>("[data-people-number-group]", layerRoot);
      const numberScale = optional<HTMLElement>("[data-people-number-scale]", layerRoot);
      const numberSlot = optional<HTMLElement>(".people-number-slot", layerRoot);

      if (numberGroup && numberScale && numberSlot) {
        numberScale.style.transform = "scale(1)";
        const available = numberSlot.clientWidth;
        const needed = numberGroup.scrollWidth;
        const scale = needed > available ? available / needed : 1;
        numberScale.style.transform = `scale(${scale})`;
      }
    });
  };
  const scheduleRefit = () => {
    if (resizeFrame) {
      cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      refitLayers();
    });
  };
  const resizeObserver = new ResizeObserver(scheduleRefit);
  resizeObserver.observe(panelEl);
  cleanup.add(() => resizeObserver.disconnect());
}

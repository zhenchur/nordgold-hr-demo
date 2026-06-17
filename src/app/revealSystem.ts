import { qsa, type CleanupRegistry } from "./dom";
import { gsap, ScrollTrigger } from "./gsapSetup";
import { readMotionSettings, type TextMotionSettings } from "./motionSettings";
import { motionSelectors } from "./motionSelectors";
import { createElementRevealController, createWordRevealController, getRevealPartCount, type WordRevealController } from "./textRevealEffect";

type RevealSystemOptions = {
  cleanup: CleanupRegistry;
  deferViewportPlay?: boolean;
  reduceMotion: boolean;
  root?: ParentNode;
};

type RevealBuildOptions = {
  keepTriggers?: boolean;
  onReady?: () => void;
  suppressInitialPlay?: boolean;
};

type RevealTriggerState = {
  keepAlive: boolean;
  suppressPlay: boolean;
};

type RevealTriggerMode = "manual" | "viewport";
type RevealKind = "element" | "text";

type RevealController = {
  controller: WordRevealController;
  scope: string;
  trigger?: ScrollTrigger;
  triggerElement: HTMLElement;
  triggerMode: RevealTriggerMode;
};

const defaultScope = "page";
const readyDatasetKey = "revealReady";

function withDelay(settings: TextMotionSettings, delay: number) {
  if (delay === settings.delay) {
    return settings;
  }

  return {
    ...settings,
    delay
  };
}

function withTargetSplit(target: HTMLElement, settings: TextMotionSettings) {
  const rawSplitType = target.dataset.revealSplit;
  const splitType: TextMotionSettings["splitType"] | undefined =
    rawSplitType === "lines" || rawSplitType === "words" ? rawSplitType : undefined;

  if (!splitType) {
    return settings;
  }

  if (splitType === settings.splitType) {
    return settings;
  }

  return {
    ...settings,
    splitType
  };
}

function isRenderable(target: HTMLElement) {
  const styles = window.getComputedStyle(target);

  return styles.display !== "none" && target.getClientRects().length > 0;
}

function readTriggerMode(target: HTMLElement): RevealTriggerMode {
  return target.dataset.revealTrigger === "manual" ? "manual" : "viewport";
}

function readScope(target: HTMLElement) {
  return target.dataset.revealScope?.trim() || defaultScope;
}

function readKind(target: HTMLElement): RevealKind {
  return target.dataset.reveal === "text" || target.dataset.revealItemKind === "text" ? "text" : "element";
}

function isFadeOnly(target: HTMLElement) {
  return target.dataset.revealEffect === "fade";
}

function getAfterDelay(target: HTMLElement, settings: TextMotionSettings) {
  const sourceId = target.dataset.revealAfter?.trim();

  if (!sourceId) {
    return settings.delay;
  }

  const source = document.querySelector<HTMLElement>(`[data-reveal-id="${sourceId}"]`);
  return settings.delay + getRevealPartCount(source, settings) * settings.stagger;
}

function createSingleController(target: HTMLElement, settings: TextMotionSettings) {
  if (isFadeOnly(target)) {
    return createFadeRevealController(target, settings);
  }

  if (readKind(target) === "text") {
    return createWordRevealController({
      readyDatasetKey,
      settings,
      target
    });
  }

  return createElementRevealController({
    readyDatasetKey,
    settings,
    target
  });
}

function createFadeRevealController(target: HTMLElement, settings: TextMotionSettings): WordRevealController {
  const previousVisibility = target.style.visibility;
  const timeline = gsap.timeline({ paused: true }).fromTo(target, {
    autoAlpha: settings.fromOpacity,
    willChange: "opacity"
  }, {
    autoAlpha: 1,
    duration: settings.duration * 0.45,
    delay: settings.delay,
    ease: settings.ease,
    clearProps: "opacity,visibility,willChange"
  });

  target.style.visibility = "hidden";
  gsap.set(target, {
    autoAlpha: settings.fromOpacity,
    willChange: "opacity"
  });
  target.dataset[readyDatasetKey] = "true";

  function reset() {
    timeline.pause(0);
    gsap.set(target, {
      autoAlpha: settings.fromOpacity,
      willChange: "opacity"
    });
  }

  function play() {
    reset();
    timeline.restart();
  }

  function complete() {
    timeline.pause(timeline.duration());
    gsap.set(target, {
      autoAlpha: 1,
      clearProps: "opacity,visibility,willChange"
    });
    target.style.visibility = previousVisibility;
    target.dataset[readyDatasetKey] = "true";
  }

  return {
    complete,
    dispose() {
      timeline.kill();
      gsap.set(target, { clearProps: "opacity,visibility,willChange" });
      target.style.visibility = previousVisibility;
      delete target.dataset[readyDatasetKey];
    },
    play,
    reset,
    target
  };
}

function createGroupedController(target: HTMLElement, units: WordRevealController[]): WordRevealController {
  return {
    complete() {
      units.forEach((unit) => unit.complete());
    },
    dispose() {
      units.forEach((unit) => unit.dispose());
    },
    play() {
      units.forEach((unit) => unit.play());
    },
    reset() {
      units.forEach((unit) => unit.reset());
    },
    target
  };
}

function createRevealTrigger(
  target: HTMLElement,
  controller: WordRevealController,
  settings: TextMotionSettings,
  state: RevealTriggerState
) {
  const play = () => {
    if (state.suppressPlay) {
      return false;
    }

    controller.play();
    return true;
  };

  return ScrollTrigger.create({
    trigger: target,
    start: settings.start,
    end: settings.end,
    onEnter: (self) => {
      if (!play()) {
        return;
      }

      if (settings.once && !state.keepAlive) {
        self.kill();
      }
    },
    onEnterBack: (self) => {
      if (!play()) {
        return;
      }

      if (settings.once && !state.keepAlive) {
        self.kill();
      }
    }
  });
}

function getGroupItems(group: HTMLElement) {
  const explicitItems = qsa<HTMLElement>(motionSelectors.revealItem, group);

  if (explicitItems.length > 0) {
    return explicitItems.filter(isRenderable);
  }

  return Array.from(group.children).filter((child): child is HTMLElement => child instanceof HTMLElement && isRenderable(child));
}

function createGroupReveal(
  group: HTMLElement,
  settings: TextMotionSettings,
  triggerState: RevealTriggerState
): RevealController | undefined {
  const items = getGroupItems(group);

  if (items.length === 0) {
    return undefined;
  }

  const baseDelay = getAfterDelay(group, settings);
  const units = items.map((target, index) => createSingleController(
    target,
    withTargetSplit(target, withDelay(settings, baseDelay + settings.stagger * 2 * index))
  ));
  const controller = createGroupedController(group, units);
  const triggerMode = readTriggerMode(group);
  const trigger = triggerMode === "viewport"
    ? createRevealTrigger(group, controller, settings, triggerState)
    : undefined;

  return {
    controller,
    scope: readScope(group),
    trigger,
    triggerElement: group,
    triggerMode
  };
}

function createSingleReveal(
  target: HTMLElement,
  settings: TextMotionSettings,
  triggerState: RevealTriggerState,
  delay = getAfterDelay(target, settings)
): RevealController | undefined {
  if (!isRenderable(target)) {
    return undefined;
  }

  const triggerMode = readTriggerMode(target);
  const controller = createSingleController(target, withTargetSplit(target, withDelay(settings, delay)));
  const triggerElement = target.closest<HTMLElement>(motionSelectors.revealCard) ?? target;
  const trigger = triggerMode === "viewport"
    ? createRevealTrigger(triggerElement, controller, settings, triggerState)
    : undefined;

  return {
    controller,
    scope: readScope(target),
    trigger,
    triggerElement,
    triggerMode
  };
}

function getSequenceKey(target: HTMLElement) {
  const sequence = target.dataset.revealSequence?.trim();

  if (!sequence) {
    return undefined;
  }

  return [
    readTriggerMode(target),
    readScope(target),
    sequence,
    target.dataset.revealAfter?.trim() ?? ""
  ].join("::");
}

function collectGroupedTargets(root: ParentNode) {
  const groupedTargets = new Set<HTMLElement>();

  qsa<HTMLElement>(motionSelectors.revealGroup, root).forEach((group) => {
    getGroupItems(group).forEach((target) => groupedTargets.add(target));
  });

  return groupedTargets;
}

function collectSequenceTargets(targets: HTMLElement[]) {
  const sequences = new Map<string, HTMLElement[]>();
  const sequencedTargets = new Set<HTMLElement>();

  targets.forEach((target) => {
    const key = getSequenceKey(target);

    if (!key) {
      return;
    }

    sequencedTargets.add(target);
    const group = sequences.get(key);

    if (group) {
      group.push(target);
    } else {
      sequences.set(key, [target]);
    }
  });

  return { sequences, sequencedTargets };
}

function createSequenceReveal(
  targets: HTMLElement[],
  settings: TextMotionSettings,
  triggerState: RevealTriggerState
): RevealController | undefined {
  const renderableTargets = targets.filter(isRenderable);
  const firstTarget = renderableTargets[0];

  if (!firstTarget) {
    return undefined;
  }

  const baseDelay = getAfterDelay(firstTarget, settings);
  const units = renderableTargets.map((target, index) => createSingleController(
    target,
    withTargetSplit(target, withDelay(settings, baseDelay + settings.stagger * 2 * index))
  ));
  const controller = createGroupedController(firstTarget, units);
  const triggerMode = readTriggerMode(firstTarget);
  const trigger = triggerMode === "viewport"
    ? createRevealTrigger(firstTarget, controller, settings, triggerState)
    : undefined;

  return {
    controller,
    scope: readScope(firstTarget),
    trigger,
    triggerElement: firstTarget,
    triggerMode
  };
}

function isRevealController(item: RevealController | undefined): item is RevealController {
  return item !== undefined;
}

function markReady(root: ParentNode) {
  qsa<HTMLElement>(`${motionSelectors.reveal}, ${motionSelectors.revealItem}`, root).forEach((target) => {
    target.dataset[readyDatasetKey] = "true";
  });
}

export function initRevealSystem({ cleanup, deferViewportPlay = false, reduceMotion, root = document }: RevealSystemOptions) {
  let controllers: RevealController[] = [];
  let refreshCall: gsap.core.Tween | undefined;
  let viewportPlayDeferred = deferViewportPlay && !reduceMotion;
  let activeTriggerState: RevealTriggerState | undefined;

  const dispose = () => {
    refreshCall?.kill();
    refreshCall = undefined;
    controllers.forEach(({ controller, trigger }) => {
      trigger?.kill();
      controller.dispose();
    });
    controllers = [];
    activeTriggerState = undefined;
  };

  const scheduleRefresh = (onReady?: () => void) => {
    refreshCall?.kill();
    refreshCall = gsap.delayedCall(0, () => {
      ScrollTrigger.refresh();
      refreshCall = undefined;
      onReady?.();
    });
  };

  const build = ({ keepTriggers = false, onReady, suppressInitialPlay = false }: RevealBuildOptions = {}) => {
    dispose();

    if (reduceMotion) {
      markReady(root);
      onReady?.();
      return;
    }

    const settings = readMotionSettings();
    const triggerState = {
      keepAlive: keepTriggers,
      suppressPlay: suppressInitialPlay || viewportPlayDeferred
    };
    activeTriggerState = triggerState;
    const groupedTargets = collectGroupedTargets(root);
    const groupControllers = qsa<HTMLElement>(motionSelectors.revealGroup, root)
      .map((group) => createGroupReveal(group, settings, triggerState))
      .filter(isRevealController);
    const singleTargets = qsa<HTMLElement>(`${motionSelectors.revealText}, ${motionSelectors.revealElement}`, root)
      .filter((target) => !groupedTargets.has(target));
    const { sequences, sequencedTargets } = collectSequenceTargets(singleTargets);
    const sequenceControllers = Array.from(sequences.values())
      .map((targets) => createSequenceReveal(targets, settings, triggerState))
      .filter(isRevealController);
    const singleControllers = singleTargets
      .filter((target) => !sequencedTargets.has(target))
      .map((target) => createSingleReveal(target, settings, triggerState))
      .filter(isRevealController);

    controllers = [...groupControllers, ...sequenceControllers, ...singleControllers];

    scheduleRefresh(() => {
      if (!viewportPlayDeferred) {
        triggerState.suppressPlay = false;
      }

      onReady?.();
    });
  };

  const resumeViewportPlay = () => {
    viewportPlayDeferred = false;

    if (activeTriggerState) {
      activeTriggerState.suppressPlay = false;
    }

    scheduleRefresh();
  };

  const playScope = (scope: string) => {
    controllers.forEach(({ controller, scope: controllerScope, triggerMode }) => {
      if (triggerMode === "manual" && controllerScope === scope) {
        controller.play();
      }
    });
  };

  const resetScope = (scope: string) => {
    controllers.forEach(({ controller, scope: controllerScope, triggerMode }) => {
      if (triggerMode === "manual" && controllerScope === scope) {
        controller.reset();
      }
    });
  };

  const completeScope = (scope: string) => {
    controllers.forEach(({ controller, scope: controllerScope, triggerMode }) => {
      if (triggerMode === "manual" && controllerScope === scope) {
        controller.complete();
      }
    });
  };

  const replayVisible = () => {
    controllers.forEach(({ controller, triggerElement, triggerMode }) => {
      if (triggerMode === "viewport" && ScrollTrigger.isInViewport(triggerElement)) {
        controller.play();
      }
    });
  };

  build();
  cleanup.add(dispose);

  return {
    completeScope,
    rebuild: build,
    playScope,
    replayVisible,
    resumeViewportPlay,
    resetScope
  };
}

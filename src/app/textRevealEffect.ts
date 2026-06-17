import { gsap, SplitText } from "./gsapSetup";
import type { TextMotionSettings } from "./motionSettings";
import { motionSelectors } from "./motionSelectors";
import { getElementFromVars, getElementToVars, getWordFromVars, getWordToVars } from "./motionTransforms";

export type WordRevealController = {
  complete: () => void;
  dispose: () => void;
  play: () => void;
  reset: () => void;
  target: HTMLElement;
};

export type ElementRevealController = WordRevealController;

type WordRevealOptions = {
  readyDatasetKey: string;
  settings: TextMotionSettings;
  target: HTMLElement;
};

const wordClass = "motion-text-word";
const lineClass = "motion-text-line";

function getSplitParts(split: SplitText, settings: TextMotionSettings) {
  return (settings.splitType === "lines" ? split.lines : split.words) as HTMLElement[];
}

function applyPartsFrom(target: HTMLElement, parts: HTMLElement[], settings: TextMotionSettings) {
  gsap.set(target, {
    perspective: settings.perspective,
    transformStyle: "preserve-3d"
  });

  gsap.set(parts, {
    ...getWordFromVars(settings),
    opacity: settings.fromOpacity,
    willChange: "transform, opacity"
  });
}

function createPartsTimeline(parts: HTMLElement[], settings: TextMotionSettings) {
  return gsap.timeline({ paused: true }).fromTo(parts, {
    ...getWordFromVars(settings),
    opacity: settings.fromOpacity,
    willChange: "transform, opacity"
  }, {
    ...getWordToVars(settings),
    opacity: 1,
    duration: settings.duration,
    delay: settings.delay,
    stagger: { each: settings.stagger, from: 0 },
    ease: settings.ease,
    clearProps: "transform,transformOrigin,opacity,willChange"
  });
}

function applyElementFrom(target: HTMLElement, settings: TextMotionSettings) {
  gsap.set(target, {
    ...getElementFromVars(settings),
    autoAlpha: settings.fromOpacity,
    willChange: "transform, opacity"
  });
}

function getElementClearProps(target: HTMLElement) {
  return target.matches(motionSelectors.preserveTransform)
    ? "transformOrigin,transformStyle,transformPerspective,opacity,visibility,willChange"
    : "transform,transformOrigin,transformStyle,transformPerspective,opacity,visibility,willChange";
}

function createElementTimeline(target: HTMLElement, settings: TextMotionSettings) {
  return gsap.timeline({ paused: true }).fromTo(target, {
    ...getElementFromVars(settings),
    autoAlpha: settings.fromOpacity,
    willChange: "transform, opacity"
  }, {
    ...getElementToVars(settings),
    autoAlpha: 1,
    duration: settings.duration,
    delay: settings.delay,
    ease: settings.ease,
    clearProps: getElementClearProps(target)
  });
}

export function getRevealPartCount(target: HTMLElement | null, settings?: TextMotionSettings) {
  if (!target) {
    return 0;
  }

  const partSelector = settings?.splitType === "lines" ? `.${lineClass}` : `.${wordClass}`;
  const splitParts = target.querySelectorAll(partSelector).length;

  if (splitParts > 0) {
    return splitParts;
  }

  const text = target.textContent?.trim() ?? "";

  if (settings?.splitType === "lines") {
    return text === "" ? 0 : 1;
  }

  return text === "" ? 0 : text.split(/\s+/).length;
}

export function createElementRevealController({ readyDatasetKey, settings, target }: WordRevealOptions): ElementRevealController {
  const previousVisibility = target.style.visibility;
  const timeline = createElementTimeline(target, settings);

  target.style.visibility = "hidden";
  applyElementFrom(target, settings);
  target.dataset[readyDatasetKey] = "true";

  function reset() {
    timeline.pause(0);
    applyElementFrom(target, settings);
  }

  function play() {
    reset();
    timeline.restart();
  }

  function complete() {
    timeline.pause(timeline.duration());
    gsap.set(target, {
      ...getElementToVars(settings),
      autoAlpha: 1,
      clearProps: getElementClearProps(target)
    });
    target.style.visibility = previousVisibility;
    target.dataset[readyDatasetKey] = "true";
  }

  return {
    complete,
    dispose() {
      timeline.kill();
      gsap.set(target, { clearProps: getElementClearProps(target) });
      target.style.visibility = previousVisibility;
      delete target.dataset[readyDatasetKey];
    },
    play,
    reset,
    target
  };
}

export function createWordRevealController({ readyDatasetKey, settings, target }: WordRevealOptions): WordRevealController {
  const previousVisibility = target.style.visibility;
  let timeline: gsap.core.Timeline | undefined;
  let parts: HTMLElement[] = [];
  let isComplete = false;

  target.style.visibility = "hidden";

  const setReady = () => {
    target.dataset[readyDatasetKey] = "true";
  };

  function reset() {
    isComplete = false;
    timeline?.pause(0);
    if (parts.length > 0) {
      applyPartsFrom(target, parts, settings);
    }
  }

  function play() {
    reset();
    timeline?.restart();
  }

  function complete() {
    isComplete = true;
    timeline?.pause(timeline.duration());
    target.style.visibility = previousVisibility;
    setReady();

    if (parts.length > 0) {
      gsap.set(parts, {
        ...getWordToVars(settings),
        opacity: 1,
        clearProps: "transform,transformOrigin,opacity,willChange"
      });
    }

    gsap.set(target, { clearProps: "perspective,transformStyle" });
  }

  const split = SplitText.create(target, {
    type: settings.splitType,
    tag: "span",
    wordsClass: wordClass,
    linesClass: lineClass,
    aria: "auto",
    autoSplit: true,
    onSplit(self) {
      parts = getSplitParts(self, settings);
      target.style.visibility = previousVisibility;
      timeline = createPartsTimeline(parts, settings);
      timeline.eventCallback("onComplete", () => {
        isComplete = true;
        gsap.set(target, { clearProps: "perspective,transformStyle" });
      });

      if (isComplete) {
        complete();
      } else {
        applyPartsFrom(target, parts, settings);
        setReady();
      }

      return timeline;
    }
  });

  return {
    complete,
    dispose() {
      timeline?.kill();
      split.revert();
      split.kill();
      gsap.set(target, { clearProps: "perspective,transformStyle" });
      target.style.visibility = previousVisibility;
      delete target.dataset[readyDatasetKey];
    },
    play,
    reset,
    target
  };
}

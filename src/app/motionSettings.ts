import type { CleanupRegistry } from "./dom";

export type TextMotionSettings = {
  splitType: "words" | "lines";
  yPercent: number;
  stagger: number;
  duration: number;
  delay: number;
  ease: string;
  start: string;
  end: string;
  once: boolean;
  fromOpacity: number;
  fromRotateX: number;
  perspective: number;
  transformOrigin: string;
};

type MotionDebugState = TextMotionSettings & {
  showTriggerGuide: boolean;
  triggerLine: number;
};

const defaults = {
  splitType: "lines" as const,
  yPercent: 120,
  stagger: 0.03,
  duration: 1,
  delay: 0,
  ease: "power4.out",
  start: "top 90%",
  end: "bottom top",
  triggerLine: 90,
  once: true,
  fromOpacity: 0,
  fromRotateX: -90,
  perspective: 600,
  transformOrigin: "50% 0%"
};

const transformOrigins = new Set([
  "50% 50%",
  "50% 0%",
  "50% 100%",
  "0% 50%",
  "100% 50%",
  "0% 0%",
  "100% 0%",
  "0% 100%",
  "100% 100%"
]);

function readNumber(value: string | undefined, fallback: number) {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function writeOutput(scope: ParentNode, id: string, value: string | number) {
  const output = scope.querySelector<HTMLOutputElement>(`#${id}`);

  if (output) {
    output.textContent = String(value);
  }
}

function readTransformOrigin(value: string | undefined) {
  return value && transformOrigins.has(value) ? value : defaults.transformOrigin;
}

function readSplitType(value: string | undefined): TextMotionSettings["splitType"] {
  return value === "lines" ? "lines" : defaults.splitType;
}

function defaultMotionDebugState(): MotionDebugState {
  return {
    splitType: defaults.splitType,
    yPercent: defaults.yPercent,
    stagger: defaults.stagger,
    duration: defaults.duration,
    delay: defaults.delay,
    ease: defaults.ease,
    start: defaults.start,
    end: defaults.end,
    once: defaults.once,
    fromOpacity: defaults.fromOpacity,
    fromRotateX: defaults.fromRotateX,
    perspective: defaults.perspective,
    transformOrigin: defaults.transformOrigin,
    triggerLine: defaults.triggerLine,
    showTriggerGuide: false
  };
}

let currentMotionDebugState: MotionDebugState = defaultMotionDebugState();

function readMotionDebugState(debugScope: ParentNode): MotionDebugState {
  const duration = readNumber(debugScope.querySelector<HTMLInputElement>("#motionDuration")?.value, defaults.duration);
  const delay = readNumber(debugScope.querySelector<HTMLInputElement>("#motionDelay")?.value, defaults.delay);
  const stagger = readNumber(debugScope.querySelector<HTMLInputElement>("#motionStagger")?.value, defaults.stagger);
  const perspective = readNumber(debugScope.querySelector<HTMLInputElement>("#motionPerspective")?.value, defaults.perspective);
  const fromRotateX = readNumber(debugScope.querySelector<HTMLInputElement>("#motionRotateX")?.value, defaults.fromRotateX);
  const fromOpacity = readNumber(debugScope.querySelector<HTMLInputElement>("#motionOpacity")?.value, defaults.fromOpacity);
  const yPercent = readNumber(debugScope.querySelector<HTMLInputElement>("#motionYPercent")?.value, defaults.yPercent);
  const splitType = readSplitType(debugScope.querySelector<HTMLSelectElement>("#motionSplitMode")?.value);
  const transformOrigin = readTransformOrigin(debugScope.querySelector<HTMLSelectElement>("#motionOrigin")?.value);
  const triggerLine = clampNumber(readNumber(debugScope.querySelector<HTMLInputElement>("#motionTriggerLine")?.value, defaults.triggerLine), 0, 100);
  const ease = debugScope.querySelector<HTMLSelectElement>("#motionEase")?.value || defaults.ease;
  const showTriggerGuide = debugScope.querySelector<HTMLInputElement>("#motionTriggerGuide")?.checked ?? false;

  return {
    splitType,
    yPercent,
    stagger,
    duration,
    delay,
    ease,
    start: `top ${triggerLine}%`,
    end: defaults.end,
    once: defaults.once,
    fromOpacity,
    fromRotateX,
    perspective,
    transformOrigin,
    triggerLine,
    showTriggerGuide
  };
}

function toMotionSettings(state: MotionDebugState): TextMotionSettings {
  return {
    splitType: state.splitType,
    yPercent: state.yPercent,
    stagger: state.stagger,
    duration: state.duration,
    delay: state.delay,
    ease: state.ease,
    start: state.start,
    end: state.end,
    once: state.once,
    fromOpacity: state.fromOpacity,
    fromRotateX: state.fromRotateX,
    perspective: state.perspective,
    transformOrigin: state.transformOrigin
  };
}

function syncMotionDebugUi(debugScope: ParentNode) {
  const state = readMotionDebugState(debugScope);
  currentMotionDebugState = state;

  writeOutput(debugScope, "motionDurationOut", `${state.duration.toFixed(2)}s`);
  writeOutput(debugScope, "motionDelayOut", `${state.delay.toFixed(2)}s`);
  writeOutput(debugScope, "motionStaggerOut", state.stagger.toFixed(3));
  writeOutput(debugScope, "motionPerspectiveOut", state.perspective);
  writeOutput(debugScope, "motionRotateXOut", `${state.fromRotateX}°`);
  writeOutput(debugScope, "motionOpacityOut", state.fromOpacity);
  writeOutput(debugScope, "motionYPercentOut", state.yPercent);
  writeOutput(debugScope, "motionTriggerLineOut", `${state.triggerLine}%`);

  document.documentElement.style.setProperty("--motion-trigger-line-y", `${state.triggerLine}%`);
  document.documentElement.classList.toggle("show-motion-trigger-guide", state.showTriggerGuide);
}

export function readMotionSettings(): TextMotionSettings {
  return toMotionSettings(currentMotionDebugState);
}

type MotionDebugControlsOptions = {
  cleanup: CleanupRegistry;
  onApply: () => void;
  onReplay: () => void;
};

export function initMotionDebugControls({ cleanup, onApply, onReplay }: MotionDebugControlsOptions) {
  const form = document.querySelector<HTMLFormElement>("#motionDebugForm");
  const applyButton = document.querySelector<HTMLButtonElement>("#motionApply");
  const replayButton = document.querySelector<HTMLButtonElement>("#motionReplay");

  if (!form) {
    return;
  }

  const updateReadouts = () => {
    syncMotionDebugUi(form);
  };

  cleanup.on(form, "input", updateReadouts);
  cleanup.on(form, "change", updateReadouts);
  updateReadouts();

  if (applyButton) {
    cleanup.on(applyButton, "click", (event) => {
      event.preventDefault();
      onApply();
    });
  }

  if (replayButton) {
    cleanup.on(replayButton, "click", (event) => {
      event.preventDefault();
      onReplay();
    });
  }
}

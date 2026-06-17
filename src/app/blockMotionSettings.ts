import type { CleanupRegistry } from "./dom";

export type BlockMotionSettings = {
  yPercent: number;
  duration: number;
  delay: number;
  ease: string;
  start: string;
  end: string;
  once: boolean;
  fromOpacity: number;
  fromRotateX: number;
  fromScale: number;
  perspective: number;
  transformOrigin: string;
};

type BlockMotionDebugState = BlockMotionSettings & {
  showTriggerGuide: boolean;
  triggerLine: number;
};

const defaults = {
  yPercent: 15,
  duration: 1,
  delay: 0,
  ease: "power4.out",
  start: "top 100%",
  end: "bottom top",
  triggerLine: 100,
  once: true,
  fromOpacity: 1,
  fromRotateX: -20,
  fromScale: 0.9,
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

function defaultBlockMotionDebugState(): BlockMotionDebugState {
  return {
    yPercent: defaults.yPercent,
    duration: defaults.duration,
    delay: defaults.delay,
    ease: defaults.ease,
    start: defaults.start,
    end: defaults.end,
    once: defaults.once,
    fromOpacity: defaults.fromOpacity,
    fromRotateX: defaults.fromRotateX,
    fromScale: defaults.fromScale,
    perspective: defaults.perspective,
    transformOrigin: defaults.transformOrigin,
    triggerLine: defaults.triggerLine,
    showTriggerGuide: false
  };
}

let currentBlockMotionDebugState: BlockMotionDebugState = defaultBlockMotionDebugState();

function readBlockMotionDebugState(debugScope: ParentNode): BlockMotionDebugState {
  const duration = readNumber(debugScope.querySelector<HTMLInputElement>("#blockMotionDuration")?.value, defaults.duration);
  const delay = readNumber(debugScope.querySelector<HTMLInputElement>("#blockMotionDelay")?.value, defaults.delay);
  const perspective = readNumber(
    debugScope.querySelector<HTMLInputElement>("#blockMotionPerspective")?.value,
    defaults.perspective
  );
  const fromRotateX = readNumber(
    debugScope.querySelector<HTMLInputElement>("#blockMotionRotateX")?.value,
    defaults.fromRotateX
  );
  const fromOpacity = readNumber(
    debugScope.querySelector<HTMLInputElement>("#blockMotionOpacity")?.value,
    defaults.fromOpacity
  );
  const fromScale = readNumber(debugScope.querySelector<HTMLInputElement>("#blockMotionScale")?.value, defaults.fromScale);
  const yPercent = readNumber(debugScope.querySelector<HTMLInputElement>("#blockMotionYPercent")?.value, defaults.yPercent);
  const transformOrigin = readTransformOrigin(debugScope.querySelector<HTMLSelectElement>("#blockMotionOrigin")?.value);
  const triggerLine = clampNumber(
    readNumber(debugScope.querySelector<HTMLInputElement>("#blockMotionTriggerLine")?.value, defaults.triggerLine),
    0,
    100
  );
  const ease = debugScope.querySelector<HTMLSelectElement>("#blockMotionEase")?.value || defaults.ease;
  const showTriggerGuide = debugScope.querySelector<HTMLInputElement>("#blockMotionTriggerGuide")?.checked ?? false;

  return {
    yPercent,
    duration,
    delay,
    ease,
    start: `top ${triggerLine}%`,
    end: defaults.end,
    once: defaults.once,
    fromOpacity,
    fromRotateX,
    fromScale,
    perspective,
    transformOrigin,
    triggerLine,
    showTriggerGuide
  };
}

function toBlockMotionSettings(state: BlockMotionDebugState): BlockMotionSettings {
  return {
    yPercent: state.yPercent,
    duration: state.duration,
    delay: state.delay,
    ease: state.ease,
    start: state.start,
    end: state.end,
    once: state.once,
    fromOpacity: state.fromOpacity,
    fromRotateX: state.fromRotateX,
    fromScale: state.fromScale,
    perspective: state.perspective,
    transformOrigin: state.transformOrigin
  };
}

function syncBlockMotionDebugUi(debugScope: ParentNode) {
  const state = readBlockMotionDebugState(debugScope);
  currentBlockMotionDebugState = state;

  writeOutput(debugScope, "blockMotionDurationOut", `${state.duration.toFixed(2)}s`);
  writeOutput(debugScope, "blockMotionDelayOut", `${state.delay.toFixed(2)}s`);
  writeOutput(debugScope, "blockMotionPerspectiveOut", state.perspective);
  writeOutput(debugScope, "blockMotionRotateXOut", `${state.fromRotateX}deg`);
  writeOutput(debugScope, "blockMotionOpacityOut", state.fromOpacity);
  writeOutput(debugScope, "blockMotionScaleOut", state.fromScale.toFixed(2));
  writeOutput(debugScope, "blockMotionYPercentOut", state.yPercent);
  writeOutput(debugScope, "blockMotionTriggerLineOut", `${state.triggerLine}%`);

  document.documentElement.style.setProperty("--block-motion-trigger-line-y", `${state.triggerLine}%`);
  document.documentElement.classList.toggle("show-block-motion-trigger-guide", state.showTriggerGuide);
}

export function readBlockMotionSettings(): BlockMotionSettings {
  return toBlockMotionSettings(currentBlockMotionDebugState);
}

type BlockMotionDebugControlsOptions = {
  cleanup: CleanupRegistry;
  onApply: () => void;
  onReplay: () => void;
};

export function initBlockMotionDebugControls({ cleanup, onApply, onReplay }: BlockMotionDebugControlsOptions) {
  const form = document.querySelector<HTMLFormElement>("#blockMotionDebugForm");
  const applyButton = document.querySelector<HTMLButtonElement>("#blockMotionApply");
  const replayButton = document.querySelector<HTMLButtonElement>("#blockMotionReplay");

  if (!form) {
    return;
  }

  const updateReadouts = () => {
    syncBlockMotionDebugUi(form);
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

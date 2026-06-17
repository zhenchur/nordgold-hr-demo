import type { CleanupRegistry } from "./dom";

export type MinesMotionPhaseSettings = {
  duration: number;
  ease: string;
  opacity: number;
  perspective: number;
  rotateX: number;
  yPercent: number;
};

export type MinesMotionSettings = {
  enter: MinesMotionPhaseSettings;
  exit: MinesMotionPhaseSettings;
  phaseOffset: number;
  targetStagger: number;
  transformOrigin: string;
};

type MinesMotionDebugControlsOptions = {
  cleanup: CleanupRegistry;
  onReplay: () => void;
};

const minesMotionDefaults: MinesMotionSettings = {
  targetStagger: 0.035,
  phaseOffset: 0.1,
  transformOrigin: "50% 0%",
  enter: {
    duration: 0.3,
    ease: "power4.out",
    opacity: 0,
    perspective: 400,
    rotateX: -90,
    yPercent: 80
  },
  exit: {
    duration: 0.3,
    ease: "power3.out",
    opacity: 0,
    perspective: 3200,
    rotateX: 40,
    yPercent: -20
  }
};

function cloneMinesMotionSettings(settings: MinesMotionSettings): MinesMotionSettings {
  return {
    ...settings,
    enter: { ...settings.enter },
    exit: { ...settings.exit }
  };
}

let currentMinesMotionState: MinesMotionSettings = cloneMinesMotionSettings(minesMotionDefaults);

function readNumber(value: string | undefined, fallback: number) {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function writeOutput(scope: ParentNode, id: string, value: string | number) {
  const output = scope.querySelector<HTMLOutputElement>(`#${id}`);

  if (output) {
    output.textContent = String(value);
  }
}

function readPhase(debugScope: ParentNode, prefix: "enter" | "exit"): MinesMotionPhaseSettings {
  const defaults = minesMotionDefaults[prefix];
  const idPrefix = `minesMotion${prefix === "enter" ? "Enter" : "Exit"}`;

  return {
    duration: readNumber(debugScope.querySelector<HTMLInputElement>(`#${idPrefix}Duration`)?.value, defaults.duration),
    ease: debugScope.querySelector<HTMLSelectElement>(`#${idPrefix}Ease`)?.value || defaults.ease,
    opacity: readNumber(debugScope.querySelector<HTMLInputElement>(`#${idPrefix}Opacity`)?.value, defaults.opacity),
    perspective: readNumber(debugScope.querySelector<HTMLInputElement>(`#${idPrefix}Perspective`)?.value, defaults.perspective),
    rotateX: readNumber(debugScope.querySelector<HTMLInputElement>(`#${idPrefix}RotateX`)?.value, defaults.rotateX),
    yPercent: readNumber(debugScope.querySelector<HTMLInputElement>(`#${idPrefix}YPercent`)?.value, defaults.yPercent)
  };
}

function readMinesMotionDebugState(debugScope: ParentNode): MinesMotionSettings {
  return {
    targetStagger: readNumber(debugScope.querySelector<HTMLInputElement>("#minesMotionTargetStagger")?.value, minesMotionDefaults.targetStagger),
    phaseOffset: readNumber(debugScope.querySelector<HTMLInputElement>("#minesMotionPhaseOffset")?.value, minesMotionDefaults.phaseOffset),
    transformOrigin: minesMotionDefaults.transformOrigin,
    enter: readPhase(debugScope, "enter"),
    exit: readPhase(debugScope, "exit")
  };
}

function syncPhaseOutputs(debugScope: ParentNode, prefix: "Enter" | "Exit", phase: MinesMotionPhaseSettings) {
  writeOutput(debugScope, `minesMotion${prefix}DurationOut`, `${phase.duration.toFixed(2)}s`);
  writeOutput(debugScope, `minesMotion${prefix}YPercentOut`, phase.yPercent);
  writeOutput(debugScope, `minesMotion${prefix}RotateXOut`, `${phase.rotateX}°`);
  writeOutput(debugScope, `minesMotion${prefix}OpacityOut`, phase.opacity);
  writeOutput(debugScope, `minesMotion${prefix}PerspectiveOut`, phase.perspective);
}

function syncMinesMotionDebugUi(debugScope: ParentNode) {
  const state = readMinesMotionDebugState(debugScope);
  currentMinesMotionState = state;

  writeOutput(debugScope, "minesMotionTargetStaggerOut", state.targetStagger.toFixed(3));
  writeOutput(debugScope, "minesMotionPhaseOffsetOut", `${state.phaseOffset.toFixed(2)}s`);
  syncPhaseOutputs(debugScope, "Enter", state.enter);
  syncPhaseOutputs(debugScope, "Exit", state.exit);
}

export function readMinesMotionSettings(): MinesMotionSettings {
  return cloneMinesMotionSettings(currentMinesMotionState);
}

export function initMinesMotionDebugControls({ cleanup, onReplay }: MinesMotionDebugControlsOptions) {
  const form = document.querySelector<HTMLFormElement>("#minesMotionDebugForm");
  const replayButton = document.querySelector<HTMLButtonElement>("#minesMotionReplay");

  if (!form) {
    return;
  }

  const updateReadouts = () => syncMinesMotionDebugUi(form);

  cleanup.on(form, "input", updateReadouts);
  cleanup.on(form, "change", updateReadouts);
  updateReadouts();

  if (replayButton) {
    cleanup.on(replayButton, "click", (event) => {
      event.preventDefault();
      onReplay();
    });
  }
}

import colorLogo from "../assets/logo-color.svg";
import type { CleanupRegistry } from "./dom";
import { gsap } from "./gsapSetup";
import {
  getPeopleStatsPhaseFromVars,
  getPeopleStatsPhaseToVars,
  readPeopleStatsMotionSettings
} from "./peopleStatsMotion";

type BrandPreloaderOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
};

export type BrandPreloaderController = {
  finish: () => void;
  play: () => Promise<void>;
  replay: () => Promise<void>;
};

const clearMotionProps = "opacity,visibility,transform,transformOrigin,transformPerspective,transformStyle,willChange";
const defaultMotionSettings = readPeopleStatsMotionSettings();

type BrandPreloaderDebugState = {
  afterExitHoldDuration: number;
  enterDuration: number;
  enterEase: string;
  enterOpacity: number;
  enterPerspective: number;
  enterRotateX: number;
  enterYPercent: number;
  exitDuration: number;
  exitEase: string;
  exitOpacity: number;
  exitPerspective: number;
  exitRotateX: number;
  exitYPercent: number;
  holdDuration: number;
  targetStagger: number;
};

const defaults: BrandPreloaderDebugState = {
  afterExitHoldDuration: 0.1,
  enterDuration: 0.7,
  enterEase: defaultMotionSettings.enter.ease,
  enterOpacity: defaultMotionSettings.enter.opacity,
  enterPerspective: defaultMotionSettings.enter.perspective,
  enterRotateX: defaultMotionSettings.enter.rotateX,
  enterYPercent: 120,
  exitDuration: 0.7,
  exitEase: "power3.inOut",
  exitOpacity: defaultMotionSettings.exit.opacity,
  exitPerspective: defaultMotionSettings.exit.perspective,
  exitRotateX: 42,
  exitYPercent: -30,
  holdDuration: 0.5,
  targetStagger: 0.12
};

let currentDebugState: BrandPreloaderDebugState = { ...defaults };

function isHomeEntryPath() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  let path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (base && base !== "/" && path.startsWith(base)) {
    path = path.slice(base.length).replace(/\/+$/, "") || "/";
  }

  return path === "/";
}

function createTitleLine(text: string) {
  const line = document.createElement("span");
  line.className = "brand-preloader-title-line";
  line.dataset.brandPreloaderLine = "";
  line.textContent = text;
  return line;
}

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

function readDebugState(debugScope: ParentNode): BrandPreloaderDebugState {
  return {
    targetStagger: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderStagger")?.value,
      defaults.targetStagger
    ),
    enterDuration: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderEnterDuration")?.value,
      defaults.enterDuration
    ),
    enterEase: debugScope.querySelector<HTMLSelectElement>("#brandPreloaderEnterEase")?.value || defaults.enterEase,
    enterYPercent: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderEnterYPercent")?.value,
      defaults.enterYPercent
    ),
    enterRotateX: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderEnterRotateX")?.value,
      defaults.enterRotateX
    ),
    enterOpacity: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderEnterOpacity")?.value,
      defaults.enterOpacity
    ),
    enterPerspective: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderEnterPerspective")?.value,
      defaults.enterPerspective
    ),
    holdDuration: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderHoldDuration")?.value,
      defaults.holdDuration
    ),
    exitDuration: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderExitDuration")?.value,
      defaults.exitDuration
    ),
    exitEase: debugScope.querySelector<HTMLSelectElement>("#brandPreloaderExitEase")?.value || defaults.exitEase,
    exitYPercent: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderExitYPercent")?.value,
      defaults.exitYPercent
    ),
    exitRotateX: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderExitRotateX")?.value,
      defaults.exitRotateX
    ),
    exitOpacity: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderExitOpacity")?.value,
      defaults.exitOpacity
    ),
    exitPerspective: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderExitPerspective")?.value,
      defaults.exitPerspective
    ),
    afterExitHoldDuration: readNumber(
      debugScope.querySelector<HTMLInputElement>("#brandPreloaderAfterExitHold")?.value,
      defaults.afterExitHoldDuration
    )
  };
}

function syncDebugUi(debugScope: ParentNode) {
  const state = readDebugState(debugScope);
  currentDebugState = state;

  writeOutput(debugScope, "brandPreloaderStaggerOut", state.targetStagger.toFixed(3));
  writeOutput(debugScope, "brandPreloaderEnterDurationOut", `${state.enterDuration.toFixed(2)}s`);
  writeOutput(debugScope, "brandPreloaderEnterYPercentOut", state.enterYPercent);
  writeOutput(debugScope, "brandPreloaderEnterRotateXOut", `${state.enterRotateX}deg`);
  writeOutput(debugScope, "brandPreloaderEnterOpacityOut", state.enterOpacity);
  writeOutput(debugScope, "brandPreloaderEnterPerspectiveOut", state.enterPerspective);
  writeOutput(debugScope, "brandPreloaderHoldDurationOut", `${state.holdDuration.toFixed(2)}s`);
  writeOutput(debugScope, "brandPreloaderExitDurationOut", `${state.exitDuration.toFixed(2)}s`);
  writeOutput(debugScope, "brandPreloaderExitYPercentOut", state.exitYPercent);
  writeOutput(debugScope, "brandPreloaderExitRotateXOut", `${state.exitRotateX}deg`);
  writeOutput(debugScope, "brandPreloaderExitOpacityOut", state.exitOpacity);
  writeOutput(debugScope, "brandPreloaderExitPerspectiveOut", state.exitPerspective);
  writeOutput(debugScope, "brandPreloaderAfterExitHoldOut", `${state.afterExitHoldDuration.toFixed(2)}s`);
}

function readBrandPreloaderSettings() {
  const motionSettings = readPeopleStatsMotionSettings();

  motionSettings.targetStagger = currentDebugState.targetStagger;
  motionSettings.enter.duration = currentDebugState.enterDuration;
  motionSettings.enter.ease = currentDebugState.enterEase;
  motionSettings.enter.opacity = currentDebugState.enterOpacity;
  motionSettings.enter.perspective = currentDebugState.enterPerspective;
  motionSettings.enter.rotateX = currentDebugState.enterRotateX;
  motionSettings.enter.yPercent = currentDebugState.enterYPercent;
  motionSettings.exit.duration = currentDebugState.exitDuration;
  motionSettings.exit.ease = currentDebugState.exitEase;
  motionSettings.exit.opacity = currentDebugState.exitOpacity;
  motionSettings.exit.perspective = currentDebugState.exitPerspective;
  motionSettings.exit.rotateX = currentDebugState.exitRotateX;
  motionSettings.exit.yPercent = currentDebugState.exitYPercent;

  return {
    afterExitHoldDuration: currentDebugState.afterExitHoldDuration,
    holdDuration: currentDebugState.holdDuration,
    motionSettings
  };
}

export function initBrandPreloader({ cleanup, reduceMotion }: BrandPreloaderOptions): BrandPreloaderController | null {
  if (!isHomeEntryPath()) {
    return null;
  }

  const root = document.documentElement;
  let previousBodyVisibility = "";
  let activeTimeline: gsap.core.Timeline | undefined;
  let activeOverlay: HTMLElement | undefined;
  let activeTargets: HTMLElement[] = [];
  let playPromise: Promise<void> | undefined;

  const createOverlay = () => {
    const overlay = document.createElement("div");
    const grid = document.createElement("div");
    const logo = document.createElement("img");
    const title = document.createElement("p");
    const titleLineA = createTitleLine("Открываем");
    const titleLineB = createTitleLine("лучшее в тебе");

    overlay.className = "brand-preloader";
    overlay.dataset.brandPreloader = "";
    overlay.setAttribute("aria-hidden", "true");
    grid.className = "brand-preloader-grid";

    logo.className = "brand-preloader-logo";
    logo.src = colorLogo;
    logo.alt = "";

    title.className = "brand-preloader-title";
    title.append(titleLineA, titleLineB);
    grid.append(logo, title);
    overlay.append(grid);

    previousBodyVisibility = document.body.style.visibility;
    root.classList.add("is-brand-preloading");
    document.body.style.visibility = "visible";
    document.body.append(overlay);

    activeOverlay = overlay;
    activeTargets = [logo, titleLineA, titleLineB];

    return {
      logo,
      overlay,
      targets: activeTargets,
      title
    };
  };

  const finish = () => {
    if (!activeOverlay) {
      return;
    }

    activeTimeline?.kill();
    gsap.killTweensOf([activeOverlay, ...activeTargets]);
    gsap.set(activeTargets, { clearProps: clearMotionProps });
    activeOverlay.remove();
    activeOverlay = undefined;
    activeTargets = [];
    activeTimeline = undefined;
    root.classList.remove("is-brand-preloading");
    document.body.style.visibility = previousBodyVisibility;
  };

  cleanup.add(finish);

  const run = (removeOnComplete: boolean) => {
    finish();

    const { logo, overlay, targets, title } = createOverlay();
    const { afterExitHoldDuration, holdDuration, motionSettings } = readBrandPreloaderSettings();
    const maxPerspective = Math.max(motionSettings.enter.perspective, motionSettings.exit.perspective);
    gsap.set(overlay, { autoAlpha: 1 });
    gsap.set([logo, title], {
      transformPerspective: maxPerspective,
      transformStyle: "preserve-3d"
    });
    gsap.set(targets, getPeopleStatsPhaseFromVars(motionSettings.enter, motionSettings));

    return new Promise<void>((resolve) => {
      if (reduceMotion) {
        activeTimeline = gsap.timeline({
          onComplete: () => {
            if (removeOnComplete) {
              finish();
            }
            resolve();
          }
        }).to(overlay, {
          autoAlpha: 1,
          duration: afterExitHoldDuration,
          ease: "none"
        });
        return;
      }

      activeTimeline = gsap.timeline({
        onComplete: () => {
          if (removeOnComplete) {
            finish();
          }
          resolve();
        }
      });
      activeTimeline
        .to(
          targets,
          {
            ...getPeopleStatsPhaseToVars(motionSettings),
            duration: motionSettings.enter.duration,
            ease: motionSettings.enter.ease,
            stagger: { each: motionSettings.targetStagger, from: "start" }
          },
          0
        )
        .to(
          targets,
          {
            ...getPeopleStatsPhaseFromVars(motionSettings.exit, motionSettings),
            duration: motionSettings.exit.duration,
            ease: motionSettings.exit.ease,
            stagger: { each: motionSettings.targetStagger, from: "start" }
          },
          `+=${holdDuration}`
        )
        .to(overlay, { autoAlpha: 1, duration: afterExitHoldDuration, ease: "none" }, ">");
    });
  };

  const play = () => {
    if (playPromise) {
      return playPromise;
    }

    playPromise = run(false);
    return playPromise;
  };

  return {
    finish,
    play,
    replay: () => run(true)
  };
}

type BrandPreloaderDebugControlsOptions = {
  cleanup: CleanupRegistry;
  onReplay: () => void;
};

export function initBrandPreloaderDebugControls({ cleanup, onReplay }: BrandPreloaderDebugControlsOptions) {
  const form = document.querySelector<HTMLFormElement>("#brandPreloaderDebugForm");
  const applyButton = document.querySelector<HTMLButtonElement>("#brandPreloaderApply");
  const replayButton = document.querySelector<HTMLButtonElement>("#brandPreloaderReplay");

  if (!form) {
    return;
  }

  const updateReadouts = () => {
    syncDebugUi(form);
  };

  cleanup.on(form, "input", updateReadouts);
  cleanup.on(form, "change", updateReadouts);
  updateReadouts();

  if (applyButton) {
    cleanup.on(applyButton, "click", (event) => {
      event.preventDefault();
      updateReadouts();
    });
  }

  if (replayButton) {
    cleanup.on(replayButton, "click", (event) => {
      event.preventDefault();
      updateReadouts();
      onReplay();
    });
  }
}

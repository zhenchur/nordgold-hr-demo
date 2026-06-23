(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;
  const Lenis = window.Lenis;

  if (gsap) {
    gsap.registerPlugin(...[ScrollTrigger, SplitText].filter(Boolean));
  }

  const successSection = {
    kicker: "Направления",
    titleLines: ["Достигайте успехов", "вместе с нами"],
    sliderLabel: "Направления карьеры",
    slides: [
      {
        image: "./assets/success-slide-leaders.png",
        icon: "./assets/success-strategy-icon.svg",
        titleLines: ["Ответственность", "достойная стратегов"],
        text: "Станьте частью команды, где решения превращаются в результат. Ведите людей, развивайте процессы и влияйте на стратегию проектов."
      },
      {
        image: "./assets/success-slide-workers.png",
        icon: "./assets/success-strategy-icon.svg",
        titleLines: ["Рабочая смена", "с надежной опорой"],
        text: "Работайте с техникой, материалами и командой, где ценят точность, дисциплину, безопасность и практический опыт."
      },
      {
        image: "./assets/success-slide-students.png",
        icon: "./assets/success-strategy-icon.svg",
        titleLines: ["Первый опыт", "с настоящими задачами"],
        text: "Начните карьеру с практики на реальных проектах. Учитесь у наставников, пробуйте разные направления и находите свой путь в индустрии."
      },
      {
        image: "./assets/success-slide-workers-new.png",
        icon: "./assets/success-strategy-icon.svg",
        titleLines: ["Специалистам", "для важных задач"],
        text: "Применяйте экспертизу в производстве, инженерии и сервисных направлениях. Здесь ценят профессионализм, внимательность и устойчивый результат."
      },
      {
        image: "./assets/success-slide-shift-new.png",
        icon: "./assets/success-strategy-icon.svg",
        titleLines: ["Вахта", "с понятным маршрутом"],
        text: "Выбирайте стабильный график, организованный быт и поддержку на каждом этапе пути к производственной площадке."
      },
      {
        image: "./assets/success-slide-women-new.png",
        icon: "./assets/success-strategy-icon.svg",
        titleLines: ["Женщинам", "в сильной индустрии"],
        text: "Развивайтесь в профессиональной среде, где важны экспертиза, безопасность и равные возможности для роста."
      }
    ],
    copy: {
      icon: "./assets/success-strategy-icon.svg",
      titleLines: ["Ответственность", "достойная стратегов"],
      text: "Станьте частью команды, где решения превращаются в результат. Ведите людей, развивайте процессы и влияйте на стратегию проектов."
    },
    tabs: [
      { label: "Руководителям", count: 6, active: true },
      { label: "Рабочим", count: 4 },
      { label: "Студентам", count: 12 },
      { label: "Специалистам", count: 8 },
      { label: "Вахта", count: 10 },
      { label: "Женщинам", count: 6 },
      { label: "Все вакансии", count: 28, all: true }
    ]
  };

  const brandPattern = /\b__brand_never_match__\b/g;
  const lineBaseWidth = 148;
  const visibleTabCount = 3;
  const fixedCtaSlot = 3;
  const tabGap = 4;
  const copyLineClass = "motion-text-line";
  const tabDeckMotion = {
    duration: 0.32,
    ease: "power3.out"
  };
  const visualMotion = {
    enterDelay: 0.06,
    enterDuration: 0.74,
    enterEase: "power3.out",
    enterScale: 1.024,
    exitDuration: 0.52,
    exitEase: "sine.out",
    exitScale: 1.008
  };
  const copyMotion = {
    lineStagger: 0.035,
    transformOrigin: "50% 0%",
    enter: {
      duration: 0.3,
      ease: "power4.out",
      opacity: 0,
      perspective: 400,
      rotateX: -90,
      yPercent: 80
    }
  };
  const revealMotion = {
    delay: 0,
    duration: 1,
    ease: "power4.out",
    fromOpacity: 0,
    fromRotateX: -90,
    perspective: 600,
    stagger: 0.03,
    transformOrigin: "50% 0%",
    yPercent: 120
  };
  const blockMotion = {
    delay: 0,
    duration: 1.3,
    ease: "power4.out",
    fromOpacity: 1,
    fromRotateX: -20,
    fromScale: 0.9,
    perspective: 600,
    transformOrigin: "50% 0%",
    yPercent: 42
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

  function defaultHeadingMotionDebugState() {
    return {
      splitType: "lines",
      yPercent: revealMotion.yPercent,
      stagger: revealMotion.stagger,
      duration: 1.3,
      delay: revealMotion.delay,
      ease: revealMotion.ease,
      start: "top 90%",
      end: "bottom top",
      triggerLine: 90,
      once: true,
      fromOpacity: revealMotion.fromOpacity,
      fromRotateX: revealMotion.fromRotateX,
      perspective: revealMotion.perspective,
      transformOrigin: revealMotion.transformOrigin,
      showTriggerGuide: false
    };
  }

  function defaultTabMotionDebugState() {
    return {
      splitType: "lines",
      yPercent: revealMotion.yPercent,
      stagger: 0.01,
      duration: 1.1,
      delay: revealMotion.delay,
      ease: revealMotion.ease,
      start: "top 90%",
      end: "bottom top",
      triggerLine: 90,
      once: true,
      fromOpacity: revealMotion.fromOpacity,
      fromRotateX: revealMotion.fromRotateX,
      perspective: revealMotion.perspective,
      transformOrigin: revealMotion.transformOrigin,
      showTriggerGuide: false
    };
  }

  function defaultBlockMotionDebugState() {
    return {
      yPercent: blockMotion.yPercent,
      duration: blockMotion.duration,
      delay: blockMotion.delay,
      ease: blockMotion.ease,
      start: "top 100%",
      end: "bottom top",
      triggerLine: 100,
      once: true,
      fromOpacity: blockMotion.fromOpacity,
      fromRotateX: blockMotion.fromRotateX,
      fromScale: blockMotion.fromScale,
      perspective: blockMotion.perspective,
      transformOrigin: blockMotion.transformOrigin,
      showTriggerGuide: false
    };
  }

  let currentHeadingMotionDebugState = defaultHeadingMotionDebugState();
  let currentTabMotionDebugState = defaultTabMotionDebugState();
  let currentBlockMotionDebugState = defaultBlockMotionDebugState();

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function optional(selector, root = document) {
    return root.querySelector(selector);
  }

  function createCleanupRegistry() {
    const tasks = [];

    return {
      add(cleanup) {
        tasks.push(cleanup);
        return cleanup;
      },
      on(target, type, listener, options) {
        target.addEventListener(type, listener, options);
        return this.add(() => target.removeEventListener(type, listener, options));
      },
      run() {
        while (tasks.length > 0) {
          tasks.pop()?.();
        }
      }
    };
  }

  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  function rounded(strings, ...values) {
    return strings.reduce((acc, str, index) => {
      const value = values[index];
      return acc + str + (typeof value === "number" ? value.toFixed(4) : (value ?? ""));
    }, "");
  }

  function getSquirclePathParams({ cornerRadius, cornerSmoothing, preserveSmoothing, roundingAndSmoothingBudget }) {
    let p = (1 + cornerSmoothing) * cornerRadius;
    if (!preserveSmoothing) {
      const maxCornerSmoothing = roundingAndSmoothingBudget / cornerRadius - 1;
      cornerSmoothing = Math.min(cornerSmoothing, maxCornerSmoothing);
      p = Math.min(p, roundingAndSmoothingBudget);
    }
    const arcMeasure = 90 * (1 - cornerSmoothing);
    const arcSectionLength = Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);
    const angleAlpha = (90 - arcMeasure) / 2;
    const p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2));
    const angleBeta = 45 * cornerSmoothing;
    const c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
    const d = c * Math.tan(toRadians(angleBeta));
    let b = (p - arcSectionLength - c - d) / 3;
    let a = 2 * b;
    if (preserveSmoothing && p > roundingAndSmoothingBudget) {
      const p1ToP3MaxDistance = roundingAndSmoothingBudget - d - arcSectionLength - c;
      const minA = p1ToP3MaxDistance / 6;
      const maxB = p1ToP3MaxDistance - minA;
      b = Math.min(b, maxB);
      a = p1ToP3MaxDistance - b;
      p = Math.min(p, roundingAndSmoothingBudget);
    }
    return { a, arcSectionLength, b, c, cornerRadius, d, p };
  }

  function drawTopRightPath({ a, arcSectionLength, b, c, cornerRadius, d, p }) {
    return cornerRadius
      ? rounded`c ${a} 0 ${a + b} 0 ${a + b + c} ${d}
        a ${cornerRadius} ${cornerRadius} 0 0 1 ${arcSectionLength} ${arcSectionLength}
        c ${d} ${c} ${d} ${b + c} ${d} ${a + b + c}`
      : rounded`l ${p} 0`;
  }

  function drawBottomRightPath({ a, arcSectionLength, b, c, cornerRadius, d, p }) {
    return cornerRadius
      ? rounded`c 0 ${a} 0 ${a + b} ${-d} ${a + b + c}
        a ${cornerRadius} ${cornerRadius} 0 0 1 ${-arcSectionLength} ${arcSectionLength}
        c ${-c} ${d} ${-(b + c)} ${d} ${-(a + b + c)} ${d}`
      : rounded`l 0 ${p}`;
  }

  function drawBottomLeftPath({ a, arcSectionLength, b, c, cornerRadius, d, p }) {
    return cornerRadius
      ? rounded`c ${-a} 0 ${-(a + b)} 0 ${-(a + b + c)} ${-d}
        a ${cornerRadius} ${cornerRadius} 0 0 1 ${-arcSectionLength} ${-arcSectionLength}
        c ${-d} ${-c} ${-d} ${-(b + c)} ${-d} ${-(a + b + c)}`
      : rounded`l ${-p} 0`;
  }

  function drawTopLeftPath({ a, arcSectionLength, b, c, cornerRadius, d, p }) {
    return cornerRadius
      ? rounded`c 0 ${-a} 0 ${-(a + b)} ${d} ${-(a + b + c)}
        a ${cornerRadius} ${cornerRadius} 0 0 1 ${arcSectionLength} ${-arcSectionLength}
        c ${c} ${-d} ${b + c} ${-d} ${a + b + c} ${-d}`
      : rounded`l 0 ${-p}`;
  }

  function getSquircleSvgPath({ cornerRadius = 0, cornerSmoothing = 1, height, preserveSmoothing = true, width }) {
    const roundingAndSmoothingBudget = Math.min(width, height) / 2;
    const normalizedRadius = Math.min(cornerRadius, roundingAndSmoothingBudget);
    const params = getSquirclePathParams({
      cornerRadius: normalizedRadius,
      cornerSmoothing,
      preserveSmoothing,
      roundingAndSmoothingBudget
    });

    return `
      M ${width - params.p} 0
      ${drawTopRightPath(params)}
      L ${width} ${height - params.p}
      ${drawBottomRightPath(params)}
      L ${params.p} ${height}
      ${drawBottomLeftPath(params)}
      L 0 ${params.p}
      ${drawTopLeftPath(params)}
      Z
    `.replace(/[\t\s\n]+/g, " ").trim();
  }

  function supportsPathClip() {
    return (
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("clip-path", "path('M 0 0 H 1 V 1 H 0 Z')")
    );
  }

  function readNumber(value, fallback) {
    if (!value) {
      return fallback;
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function writeOutput(scope, id, value) {
    const output = optional(`#${id}`, scope);

    if (output) {
      output.textContent = String(value);
    }
  }

  function readTransformOrigin(value, fallback = revealMotion.transformOrigin) {
    return value && transformOrigins.has(value) ? value : fallback;
  }

  function toMotionSettings(state) {
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

  function toBlockMotionSettings(state) {
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

  function readHeadingMotionDebugState(debugScope) {
    const triggerLine = clampNumber(readNumber(optional("#headingMotionTriggerLine", debugScope)?.value, 90), 0, 100);
    const splitMode = optional("#headingMotionSplitMode", debugScope)?.value;

    return {
      splitType: splitMode === "words" ? "words" : "lines",
      yPercent: readNumber(optional("#headingMotionYPercent", debugScope)?.value, revealMotion.yPercent),
      stagger: readNumber(optional("#headingMotionStagger", debugScope)?.value, revealMotion.stagger),
      duration: readNumber(optional("#headingMotionDuration", debugScope)?.value, revealMotion.duration),
      delay: readNumber(optional("#headingMotionDelay", debugScope)?.value, revealMotion.delay),
      ease: optional("#headingMotionEase", debugScope)?.value || revealMotion.ease,
      start: `top ${triggerLine}%`,
      end: "bottom top",
      triggerLine,
      once: true,
      fromOpacity: readNumber(optional("#headingMotionOpacity", debugScope)?.value, revealMotion.fromOpacity),
      fromRotateX: readNumber(optional("#headingMotionRotateX", debugScope)?.value, revealMotion.fromRotateX),
      perspective: readNumber(optional("#headingMotionPerspective", debugScope)?.value, revealMotion.perspective),
      transformOrigin: readTransformOrigin(optional("#headingMotionOrigin", debugScope)?.value, revealMotion.transformOrigin),
      showTriggerGuide: optional("#headingMotionTriggerGuide", debugScope)?.checked ?? false
    };
  }

  function readTabMotionDebugState(debugScope) {
    const triggerLine = clampNumber(readNumber(optional("#tabMotionTriggerLine", debugScope)?.value, 90), 0, 100);

    return {
      splitType: "lines",
      yPercent: readNumber(optional("#tabMotionYPercent", debugScope)?.value, revealMotion.yPercent),
      stagger: readNumber(optional("#tabMotionStagger", debugScope)?.value, revealMotion.stagger),
      duration: readNumber(optional("#tabMotionDuration", debugScope)?.value, revealMotion.duration),
      delay: readNumber(optional("#tabMotionDelay", debugScope)?.value, revealMotion.delay),
      ease: optional("#tabMotionEase", debugScope)?.value || revealMotion.ease,
      start: `top ${triggerLine}%`,
      end: "bottom top",
      triggerLine,
      once: true,
      fromOpacity: readNumber(optional("#tabMotionOpacity", debugScope)?.value, revealMotion.fromOpacity),
      fromRotateX: readNumber(optional("#tabMotionRotateX", debugScope)?.value, revealMotion.fromRotateX),
      perspective: readNumber(optional("#tabMotionPerspective", debugScope)?.value, revealMotion.perspective),
      transformOrigin: readTransformOrigin(optional("#tabMotionOrigin", debugScope)?.value, revealMotion.transformOrigin),
      showTriggerGuide: optional("#tabMotionTriggerGuide", debugScope)?.checked ?? false
    };
  }

  function readBlockMotionDebugState(debugScope) {
    const triggerLine = clampNumber(readNumber(optional("#blockMotionTriggerLine", debugScope)?.value, 100), 0, 100);

    return {
      yPercent: readNumber(optional("#blockMotionYPercent", debugScope)?.value, blockMotion.yPercent),
      duration: readNumber(optional("#blockMotionDuration", debugScope)?.value, blockMotion.duration),
      delay: readNumber(optional("#blockMotionDelay", debugScope)?.value, blockMotion.delay),
      ease: optional("#blockMotionEase", debugScope)?.value || blockMotion.ease,
      start: `top ${triggerLine}%`,
      end: "bottom top",
      triggerLine,
      once: true,
      fromOpacity: readNumber(optional("#blockMotionOpacity", debugScope)?.value, blockMotion.fromOpacity),
      fromRotateX: readNumber(optional("#blockMotionRotateX", debugScope)?.value, blockMotion.fromRotateX),
      fromScale: readNumber(optional("#blockMotionScale", debugScope)?.value, blockMotion.fromScale),
      perspective: readNumber(optional("#blockMotionPerspective", debugScope)?.value, blockMotion.perspective),
      transformOrigin: readTransformOrigin(optional("#blockMotionOrigin", debugScope)?.value, blockMotion.transformOrigin),
      showTriggerGuide: optional("#blockMotionTriggerGuide", debugScope)?.checked ?? false
    };
  }

  function syncHeadingMotionDebugUi(debugScope) {
    const state = readHeadingMotionDebugState(debugScope);
    currentHeadingMotionDebugState = state;

    writeOutput(debugScope, "headingMotionDurationOut", `${state.duration.toFixed(2)}s`);
    writeOutput(debugScope, "headingMotionDelayOut", `${state.delay.toFixed(2)}s`);
    writeOutput(debugScope, "headingMotionStaggerOut", state.stagger.toFixed(3));
    writeOutput(debugScope, "headingMotionPerspectiveOut", state.perspective);
    writeOutput(debugScope, "headingMotionRotateXOut", `${state.fromRotateX}deg`);
    writeOutput(debugScope, "headingMotionOpacityOut", state.fromOpacity);
    writeOutput(debugScope, "headingMotionYPercentOut", state.yPercent);
    writeOutput(debugScope, "headingMotionTriggerLineOut", `${state.triggerLine}%`);

    document.documentElement.style.setProperty("--heading-motion-trigger-line-y", `${state.triggerLine}%`);
    document.documentElement.classList.toggle("show-heading-motion-trigger-guide", state.showTriggerGuide);
  }

  function syncTabMotionDebugUi(debugScope) {
    const state = readTabMotionDebugState(debugScope);
    currentTabMotionDebugState = state;

    writeOutput(debugScope, "tabMotionDurationOut", `${state.duration.toFixed(2)}s`);
    writeOutput(debugScope, "tabMotionDelayOut", `${state.delay.toFixed(2)}s`);
    writeOutput(debugScope, "tabMotionStaggerOut", state.stagger.toFixed(3));
    writeOutput(debugScope, "tabMotionPerspectiveOut", state.perspective);
    writeOutput(debugScope, "tabMotionRotateXOut", `${state.fromRotateX}deg`);
    writeOutput(debugScope, "tabMotionOpacityOut", state.fromOpacity);
    writeOutput(debugScope, "tabMotionYPercentOut", state.yPercent);
    writeOutput(debugScope, "tabMotionTriggerLineOut", `${state.triggerLine}%`);

    document.documentElement.style.setProperty("--tab-motion-trigger-line-y", `${state.triggerLine}%`);
    document.documentElement.classList.toggle("show-tab-motion-trigger-guide", state.showTriggerGuide);
  }

  function syncBlockMotionDebugUi(debugScope) {
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

  function readHeadingMotionSettings() {
    return toMotionSettings(currentHeadingMotionDebugState);
  }

  function readTabMotionSettings() {
    return toMotionSettings(currentTabMotionDebugState);
  }

  function readBlockMotionSettings() {
    return toBlockMotionSettings(currentBlockMotionDebugState);
  }

  function initHeadingMotionDebugControls({ cleanup, onApply, onReplay }) {
    const form = optional("#headingMotionDebugForm");
    const applyButton = optional("#headingMotionApply");
    const replayButton = optional("#headingMotionReplay");

    if (!form) {
      return;
    }

    const updateReadouts = () => syncHeadingMotionDebugUi(form);

    cleanup.on(form, "input", updateReadouts);
    cleanup.on(form, "change", updateReadouts);
    updateReadouts();

    if (applyButton) {
      cleanup.on(applyButton, "click", (event) => {
        event.preventDefault();
        updateReadouts();
        onApply?.();
      });
    }

    if (replayButton) {
      cleanup.on(replayButton, "click", (event) => {
        event.preventDefault();
        updateReadouts();
        onReplay?.();
      });
    }
  }

  function initTabMotionDebugControls({ cleanup, onApply, onReplay }) {
    const form = optional("#tabMotionDebugForm");
    const applyButton = optional("#tabMotionApply");
    const replayButton = optional("#tabMotionReplay");

    if (!form) {
      return;
    }

    const updateReadouts = () => syncTabMotionDebugUi(form);

    cleanup.on(form, "input", updateReadouts);
    cleanup.on(form, "change", updateReadouts);
    updateReadouts();

    if (applyButton) {
      cleanup.on(applyButton, "click", (event) => {
        event.preventDefault();
        updateReadouts();
        onApply?.();
      });
    }

    if (replayButton) {
      cleanup.on(replayButton, "click", (event) => {
        event.preventDefault();
        updateReadouts();
        onReplay?.();
      });
    }
  }

  function initBlockMotionDebugControls({ cleanup, onApply, onReplay }) {
    const form = optional("#blockMotionDebugForm");
    const applyButton = optional("#blockMotionApply");
    const replayButton = optional("#blockMotionReplay");

    if (!form) {
      return;
    }

    const updateReadouts = () => syncBlockMotionDebugUi(form);

    cleanup.on(form, "input", updateReadouts);
    cleanup.on(form, "change", updateReadouts);
    updateReadouts();

    if (applyButton) {
      cleanup.on(applyButton, "click", (event) => {
        event.preventDefault();
        updateReadouts();
        onApply?.();
      });
    }

    if (replayButton) {
      cleanup.on(replayButton, "click", (event) => {
        event.preventDefault();
        updateReadouts();
        onReplay?.();
      });
    }
  }

  function initDebugDockShortcut({ cleanup, root = document }) {
    const dock = optional(".debug-dock", root);

    if (!dock) {
      return;
    }

    const panels = qsa(".motion-debug", dock);
    const isShortcut = (event) =>
      event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && event.code === "KeyI";
    const closePanels = () => {
      panels.forEach((panel) => {
        panel.open = false;
      });
    };
    const setOpen = (open) => {
      dock.classList.toggle("is-open", open);
      dock.setAttribute("aria-hidden", open ? "false" : "true");

      if (!open) {
        closePanels();
      }
    };

    setOpen(false);

    panels.forEach((panel) => {
      cleanup.on(panel, "toggle", () => {
        if (!panel.open) {
          return;
        }

        optional(".motion-debug-form", panel)?.scrollTo({ top: 0 });
        panels.forEach((otherPanel) => {
          if (otherPanel !== panel) {
            otherPanel.open = false;
          }
        });
      });
    });

    cleanup.on(window, "keydown", (event) => {
      if (event.isComposing || !isShortcut(event)) {
        return;
      }

      event.preventDefault();
      setOpen(!dock.classList.contains("is-open"));
    });
  }

  function readPixelRadius(value) {
    if (!value || value.includes("%")) {
      return null;
    }

    const match = value.match(/^-?\d*\.?\d+px/);
    if (!match) {
      return null;
    }

    const radius = Number.parseFloat(match[0]);
    return Number.isFinite(radius) ? radius : null;
  }

  function initSmoothCorners({ cleanup, root = document, selector = ".success-slider, .success-arrow, .success-tab" }) {
    if (!supportsPathClip()) {
      return { refresh: () => undefined };
    }

    const elements = new Set();
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => updateElement(entry.target));
    });

    function getMatchingElements(scope) {
      const items = [];

      if (scope instanceof HTMLElement && scope.matches(selector)) {
        items.push(scope);
      }

      items.push(...qsa(selector, scope));
      return items;
    }

    function updateElement(element) {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const styles = window.getComputedStyle(element);
      const radius = readNumber(element.dataset.cornerRadius, readPixelRadius(styles.borderTopLeftRadius) ?? 0);

      if (width <= 0 || height <= 0 || radius < 4) {
        element.style.removeProperty("clip-path");
        return;
      }

      const path = getSquircleSvgPath({
        cornerRadius: radius,
        cornerSmoothing: readNumber(element.dataset.cornerSmoothing, 1),
        height,
        preserveSmoothing: element.dataset.preserveSmoothing !== "false",
        width
      });

      element.style.clipPath = `path('${path}')`;
    }

    function observeElement(element) {
      if (elements.has(element)) {
        updateElement(element);
        return;
      }

      elements.add(element);
      observer.observe(element);
      updateElement(element);
    }

    function unobserveElement(element) {
      if (!elements.delete(element)) {
        return;
      }

      observer.unobserve(element);
      element.style.removeProperty("clip-path");
    }

    const refresh = () => {
      getMatchingElements(root).forEach(observeElement);
    };

    const mutationObserver = new MutationObserver((entries) => {
      entries.forEach((entry) => {
        entry.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            getMatchingElements(node).forEach(observeElement);
          }
        });
        entry.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            getMatchingElements(node).forEach(unobserveElement);
          }
        });
      });
    });

    refresh();
    mutationObserver.observe(root, { childList: true, subtree: true });

    cleanup.add(() => {
      mutationObserver.disconnect();
      observer.disconnect();
      elements.forEach((element) => element.style.removeProperty("clip-path"));
    });

    return { refresh };
  }

  function createLineBreakFragment(lines) {
    const fragment = document.createDocumentFragment();

    lines.forEach((line, index) => {
      if (index > 0) {
        fragment.append(document.createElement("br"));
      }

      fragment.append(document.createTextNode(line));
    });

    return fragment;
  }

  function renderCopyTitle(target, lines) {
    target.replaceChildren(createLineBreakFragment(lines));
  }

  function renderPixelatedBrandText(target, text) {
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    Array.from(text.matchAll(brandPattern)).forEach((match) => {
      const brandText = match[0];
      const index = match.index ?? 0;

      if (index > lastIndex) {
        fragment.append(document.createTextNode(text.slice(lastIndex, index)));
      }

      const brand = document.createElement("span");
      brand.className = "brand-text-pixel";
      brand.dataset.pixelateText = brandText;
      brand.dataset.pixelateKind = "text";
      brand.dataset.pixelSize = "12";
      brand.textContent = brandText;
      fragment.append(brand);
      lastIndex = index + brandText.length;
    });

    if (lastIndex < text.length) {
      fragment.append(document.createTextNode(text.slice(lastIndex)));
    }

    target.replaceChildren(fragment.childNodes.length > 0 ? fragment : document.createTextNode(text));
  }

  function renderSuccessTabs(root) {
    const tabs = successSection.tabs.map((tab, index) => {
      const link = document.createElement("a");
      const shell = document.createElement("span");
      const label = document.createElement("span");
      const count = document.createElement("small");

      link.className = `success-tab${tab.active ? " is-active" : ""}${tab.all ? " success-tab-all" : ""}`;
      link.href = "#vacancies";
      link.dataset.revealItem = "true";
      if (tab.all) {
        link.dataset.successCta = "all";
      } else {
        link.dataset.successTab = String(index);
      }
      link.dataset.motionPreserveTransform = "true";
      shell.className = "success-tab-motion-shell";
      label.textContent = tab.label;
      count.textContent = `(${tab.count})`;

      shell.append(label, count);
      link.append(shell);
      return link;
    });

    root.replaceChildren(...tabs);
  }

  function ensureArrowShell(arrow) {
    let shell = optional(".success-arrow-shell", arrow);

    if (shell) {
      return shell;
    }

    shell = document.createElement("span");
    shell.className = "success-arrow-shell";
    shell.setAttribute("aria-hidden", "true");
    arrow.append(shell);
    return shell;
  }

  function initSuccessSection() {
    const section = optional(".success-section");

    if (!section) {
      return;
    }

    const kicker = optional(".success-kicker", section);
    const title = optional(".success-head h2", section);
    const slider = optional(".success-slider", section);
    const baseVisual = optional(".success-bg-base", section);
    const copyIcon = optional(".success-copy-head img", section);
    const copyTitle = optional(".success-copy h3", section);
    const copyText = optional(".success-copy p", section);
    const controls = optional(".success-controls", section);
    const tabs = optional(".success-tabs", section);
    const initialSlide = successSection.slides[0] ?? successSection.copy;

    if (kicker) {
      kicker.textContent = successSection.kicker;
    }

    if (title) {
      title.replaceChildren(createLineBreakFragment(successSection.titleLines));
    }

    if (slider) {
      slider.setAttribute("aria-label", successSection.sliderLabel);
    }

    if (baseVisual && "image" in initialSlide) {
      baseVisual.src = initialSlide.image;
    }

    if (copyIcon) {
      copyIcon.src = initialSlide.icon;
    }

    if (copyTitle) {
      renderCopyTitle(copyTitle, initialSlide.titleLines);
    }

    if (copyText) {
      renderPixelatedBrandText(copyText, initialSlide.text);
    }

    if (controls) {
      controls.dataset.reveal = "group";
      controls.dataset.revealTrigger = "viewport";
      controls.hidden = false;
      controls.setAttribute("aria-hidden", "false");
      qsa(".success-arrow", controls).forEach((arrow) => {
        arrow.dataset.revealItem = "true";
        arrow.dataset.motionPreserveTransform = "true";
        ensureArrowShell(arrow);
      });
    }

    if (tabs) {
      tabs.dataset.reveal = "group";
      tabs.dataset.revealTrigger = "viewport";
      renderSuccessTabs(tabs);
    }
  }

  function getLineWidth(tab) {
    const width = typeof tab === "number" ? tab : tab.offsetWidth;

    return Math.min(lineBaseWidth, Math.max(60, width - 36));
  }

  function ensureSuccessVisuals(section, slides) {
    const baseVisual = optional(".success-bg-base", section);
    const createdVisuals = [];

    if (!baseVisual || slides.length === 0) {
      return { createdVisuals, visuals: [] };
    }

    baseVisual.classList.add("success-bg-visual", "is-active");
    baseVisual.dataset.successVisual = "0";
    baseVisual.src = slides[0].image;

    let visuals = qsa("[data-success-visual]", section);
    let anchor = visuals[visuals.length - 1] ?? baseVisual;

    for (let index = visuals.length; index < slides.length; index += 1) {
      const clone = baseVisual.cloneNode(true);
      clone.classList.remove("is-active");
      clone.dataset.successVisual = String(index);
      clone.src = slides[index].image;
      clone.removeAttribute("id");
      anchor.after(clone);
      anchor = clone;
      createdVisuals.push(clone);
    }

    visuals = qsa("[data-success-visual]", section);
    visuals.forEach((visual, index) => {
      visual.src = slides[index]?.image ?? slides[0].image;
      gsap.set(visual, { autoAlpha: index === 0 ? 1 : 0, scale: 1, zIndex: index === 0 ? 1 : 0 });
      visual.classList.toggle("is-active", index === 0);
    });

    return { createdVisuals, visuals };
  }

  function ensureLineElement(root) {
    const children = Array.from(root.children);
    const firstLine = children.find((child) => child.tagName === "SPAN");

    children.forEach((child) => {
      if (child !== firstLine) {
        child.remove();
      }
    });

    if (firstLine) {
      return firstLine;
    }

    const line = document.createElement("span");
    root.append(line);
    return line;
  }

  function initGalleryMotion({ cleanup, reduceMotion }) {
    const section = optional(".success-section");

    if (!section || !gsap) {
      return;
    }

    const tabRoot = optional(".success-tabs", section);
    const lineRoot = optional(".success-tab-line", section);
    const prevArrow = optional("[data-success-prev]", section);
    const nextArrow = optional("[data-success-next]", section);
    const copyIcon = optional(".success-copy-head img", section);
    const copyTitle = optional(".success-copy h3", section);
    const copyText = optional(".success-copy p", section);
    const successStar = optional(".success-star-frame", section);
    const successStarOuter = optional(".success-star-outer", section);
    const successStarInner = optional(".success-star-inner", section);
    const slides = successSection.slides;

    if (!tabRoot || !lineRoot) {
      return;
    }

    const tabContainer = tabRoot;
    const lineEl = ensureLineElement(lineRoot);
    const tabs = qsa(".success-tab", tabContainer);
    const imageTabs = qsa("[data-success-tab]", tabContainer);
    const ctaTab = optional("[data-success-cta]", tabContainer);
    const maxWindowStart = Math.max(0, imageTabs.length - visibleTabCount);

    lineRoot.removeAttribute("data-reveal");
    lineRoot.removeAttribute("data-reveal-trigger");
    delete lineRoot.dataset.revealReady;
    gsap.set(lineRoot, { clearProps: "opacity,transform,visibility,willChange" });
    if (tabs.length === 0 || imageTabs.length === 0 || slides.length === 0) {
      return;
    }

    const { createdVisuals, visuals } = ensureSuccessVisuals(section, slides);
    let currentIndex = Math.max(0, imageTabs.findIndex((tab) => tab.classList.contains("is-active")));
    let windowStart = 0;
    let displayedIndex = currentIndex;
    let hoverIndex = null;
    let copyTimeline;
    let activeCopyParts = [];
    let activeCopySplits = [];
    let starTween;
    let visualTimeline;
    let lineTween;
    let deckTween;

    if (currentIndex >= slides.length) {
      currentIndex = 0;
    }
    displayedIndex = currentIndex;
    const lastSlideIndex = Math.min(slides.length, imageTabs.length) - 1;
    let starRotation = 0;

    function isVisibleIndex(index) {
      return index >= windowStart && index < windowStart + visibleTabCount;
    }

    function getTabIndex(tab) {
      return Number.parseInt(tab.dataset.successTab ?? "-1", 10);
    }

    function getDeckLayout() {
      const width = tabContainer.clientWidth;
      const columnCount = visibleTabCount + 1;
      const tabWidth = Math.max(1, (width - tabGap * (columnCount - 1)) / columnCount);
      const step = tabWidth + tabGap;

      return { step, tabWidth };
    }

    function getDeckVars(index, layout) {
      const visibleSlot = index - windowStart;

      if (visibleSlot >= 0 && visibleSlot < visibleTabCount) {
        return {
          autoAlpha: 1,
          pointerEvents: "auto",
          scale: 1,
          transformOrigin: "50% 100%",
          width: layout.tabWidth,
          x: visibleSlot * layout.step,
          y: 0,
          zIndex: 30 + visibleSlot
        };
      }

      if (index < windowStart) {
        const depth = Math.min(3, windowStart - index);

        return {
          autoAlpha: depth === 3 ? 0.34 : 0.72,
          pointerEvents: "none",
          scale: Math.max(0.82, 0.94 - depth * 0.035),
          transformOrigin: "50% 100%",
          width: layout.tabWidth,
          x: 0,
          y: 0,
          zIndex: 12 - depth
        };
      }

      const depth = Math.min(3, index - (windowStart + visibleTabCount - 1));

      return {
        autoAlpha: depth === 3 ? 0.34 : 0.72,
        pointerEvents: "none",
        scale: Math.max(0.82, 0.94 - depth * 0.035),
        transformOrigin: "50% 100%",
        width: layout.tabWidth,
        x: layout.step * (visibleTabCount - 1),
        y: 0,
        zIndex: 12 - depth
      };
    }

    function getCtaVars(layout) {
      return {
        autoAlpha: 1,
        pointerEvents: "auto",
        scale: 1,
        transformOrigin: "50% 100%",
        width: layout.tabWidth,
        x: layout.step * fixedCtaSlot,
        y: 0,
        zIndex: 42
      };
    }

    function updateArrowState() {
      if (prevArrow) {
        const disabled = windowStart === 0 && currentIndex <= 0;

        prevArrow.disabled = disabled;
        prevArrow.setAttribute("aria-disabled", String(disabled));
      }

      if (nextArrow) {
        const disabled = windowStart >= maxWindowStart && currentIndex >= lastSlideIndex;

        nextArrow.disabled = disabled;
        nextArrow.setAttribute("aria-disabled", String(disabled));
      }
    }

    function renderSlideCopy(next) {
      const slide = slides[next];

      if (!slide) {
        return;
      }

      if (copyIcon) {
        copyIcon.src = slide.icon;
      }

      if (copyTitle) {
        renderCopyTitle(copyTitle, slide.titleLines);
      }

      if (copyText) {
        renderPixelatedBrandText(copyText, slide.text);
      }
    }

    function getCopyMotionTargets() {
      return [copyIcon, copyTitle, copyText].filter(Boolean);
    }

    function getCopyTextTargets() {
      return [copyTitle, copyText].filter(Boolean);
    }

    function clearCopyMotionArtifacts(targets = getCopyMotionTargets()) {
      gsap.set(targets, {
        clearProps: "opacity,visibility,transform,transformOrigin,transformPerspective,transformStyle,willChange"
      });

      gsap.set(getCopyTextTargets(), { clearProps: "perspective,transformStyle" });
    }

    function revertCopySplits() {
      activeCopySplits.forEach((split) => {
        split.revert();
        split.kill();
      });
      activeCopySplits = [];
      activeCopyParts = [];
    }

    function createCopyLineTargets() {
      const lineTargets = [];

      if (!SplitText || typeof SplitText.create !== "function") {
        return getCopyTextTargets();
      }

      getCopyTextTargets().forEach((target) => {
        const split = SplitText.create(target, {
          aria: "auto",
          linesClass: copyLineClass,
          tag: "span",
          type: "lines"
        });

        activeCopySplits.push(split);
        lineTargets.push(...split.lines);
      });

      activeCopyParts = lineTargets;
      return lineTargets;
    }

    function disposeCopyMotion() {
      const targets = [...getCopyMotionTargets(), ...activeCopyParts];

      copyTimeline?.kill();
      copyTimeline = undefined;
      gsap.killTweensOf(targets);
      clearCopyMotionArtifacts(targets);
      revertCopySplits();
    }

    function getSuccessCopyEnterFromVars(settings) {
      return {
        autoAlpha: settings.enter.opacity,
        rotationX: settings.enter.rotateX,
        transformOrigin: settings.transformOrigin,
        transformPerspective: settings.enter.perspective,
        transformStyle: "preserve-3d",
        yPercent: settings.enter.yPercent,
        willChange: "transform, opacity"
      };
    }

    function getSuccessCopyEnterToVars(settings) {
      return {
        autoAlpha: 1,
        rotationX: 0,
        transformOrigin: settings.transformOrigin,
        yPercent: 0
      };
    }

    function animateSlideCopy(next, animated = true) {
      disposeCopyMotion();
      const copyTargets = getCopyMotionTargets();

      if (reduceMotion || !animated || copyTargets.length === 0) {
        renderSlideCopy(next);
        clearCopyMotionArtifacts(copyTargets);
        return;
      }

      const settings = copyMotion;

      gsap.set(copyTargets, { autoAlpha: 0 });
      renderSlideCopy(next);
      const lineTargets = createCopyLineTargets();
      const enterTargets = [copyIcon, ...lineTargets].filter(Boolean);
      const textTargets = getCopyTextTargets();

      gsap.set(textTargets, {
        autoAlpha: 1,
        perspective: settings.enter.perspective,
        transformStyle: "preserve-3d"
      });
      gsap.set(enterTargets, getSuccessCopyEnterFromVars(settings));

      copyTimeline = gsap.timeline({
        onComplete: () => {
          revertCopySplits();
          clearCopyMotionArtifacts(copyTargets);
          copyTimeline = undefined;
        }
      });

      copyTimeline.to(
        enterTargets,
        {
          ...getSuccessCopyEnterToVars(settings),
          duration: settings.enter.duration,
          ease: settings.enter.ease,
          stagger: { each: settings.lineStagger, from: "start" }
        },
        0
      );
    }

    function rotateSuccessStar(animated = true) {
      const starParts = [successStarOuter, successStarInner].filter(Boolean);

      if (!successStar || starParts.length === 0) {
        return;
      }

      starRotation += 90;
      starTween?.kill();

      if (reduceMotion || !animated) {
        gsap.set(starParts, { rotation: starRotation, transformOrigin: "50% 50%", willChange: "" });
        return;
      }

      starTween = gsap.timeline({
        onComplete: () => {
          gsap.set(starParts, { willChange: "" });
          starTween = undefined;
        }
      });

      gsap.set(starParts, {
        transformOrigin: "50% 50%",
        willChange: "transform"
      });

      starTween.to(
        successStarOuter,
        {
          rotation: starRotation,
          duration: 0.46,
          ease: "power3.out",
          overwrite: true
        },
        0
      );
      starTween.to(
        successStarInner,
        {
          rotation: starRotation,
          duration: 0.24,
          ease: "power3.out",
          overwrite: true
        },
        0
      );
    }

    function showVisual(next, previous, animated = true) {
      if (visuals.length === 0) {
        return;
      }

      visualTimeline?.kill();

      const incoming = visuals[next];
      const outgoing = visuals[previous];

      visuals.forEach((visual, visualIndex) => {
        visual.classList.toggle("is-active", visualIndex === next);
        if (visualIndex !== next && visualIndex !== previous) {
          gsap.set(visual, { autoAlpha: 0, scale: 1, zIndex: 0 });
        }
      });

      if (!incoming || reduceMotion || !animated || next === previous) {
        gsap.set(visuals, { autoAlpha: (index) => (index === next ? 1 : 0), scale: 1, zIndex: 0 });
        if (incoming) {
          gsap.set(incoming, { zIndex: 1 });
        }
        return;
      }

      gsap.set(incoming, {
        autoAlpha: 0,
        scale: visualMotion.enterScale,
        transformOrigin: "50% 50%",
        willChange: "transform, opacity",
        zIndex: 1
      });

      if (outgoing) {
        gsap.set(outgoing, {
          autoAlpha: 1,
          scale: 1,
          transformOrigin: "50% 50%",
          willChange: "transform, opacity",
          zIndex: 0
        });
      }

      visualTimeline = gsap.timeline({
        onComplete: () => {
          gsap.set(visuals, { willChange: "" });
        }
      });

      if (outgoing) {
        visualTimeline.to(
          outgoing,
          {
            autoAlpha: 0,
            scale: visualMotion.exitScale,
            duration: visualMotion.exitDuration,
            ease: visualMotion.exitEase,
            force3D: true,
            overwrite: "auto"
          },
          0
        );
      }

      visualTimeline.to(
        incoming,
        {
          autoAlpha: 1,
          scale: 1,
          duration: visualMotion.enterDuration,
          ease: visualMotion.enterEase,
          force3D: true,
          overwrite: "auto"
        },
        visualMotion.enterDelay
      );
    }

    function moveLine(tab, animated = true) {
      const tabIndex = getTabIndex(tab);
      const layout = getDeckLayout();
      const slot = Math.max(0, Math.min(visibleTabCount - 1, tabIndex - windowStart));
      const width = getLineWidth(layout.tabWidth);
      const x = slot * layout.step + (layout.tabWidth - width) / 2;
      const duration = animated && !reduceMotion ? tabDeckMotion.duration : 0;

      lineTween?.kill();

      if (duration === 0) {
        gsap.set(lineEl, {
          autoAlpha: 1,
          x,
          scaleX: width / lineBaseWidth,
          transformOrigin: "left center",
          willChange: ""
        });
        return;
      }

      lineTween = gsap.to(lineEl, {
        autoAlpha: 1,
        x,
        scaleX: width / lineBaseWidth,
        duration,
        ease: tabDeckMotion.ease,
        overwrite: true,
        transformOrigin: "left center",
        onStart: () => {
          lineEl.style.willChange = "transform";
        },
        onComplete: () => {
          lineEl.style.willChange = "";
          lineTween = undefined;
        }
      });
    }

    function syncDisplayedTab(animated = true) {
      imageTabs.forEach((tab, tabIndex) => {
        tab.classList.toggle("is-active", tabIndex === displayedIndex);
      });

      moveLine(imageTabs[displayedIndex], animated);
      updateArrowState();
    }

    function updateDeck(animated = true) {
      const layout = getDeckLayout();
      const duration = animated && !reduceMotion ? tabDeckMotion.duration : 0;

      deckTween?.kill();
      deckTween = undefined;
      gsap.killTweensOf(tabs);

      tabs.forEach((tab) => {
        if (tab === ctaTab) {
          const vars = getCtaVars(layout);

          tab.classList.add("is-deck-visible");
          tab.classList.remove("is-deck-stacked", "is-active");
          tab.tabIndex = 0;

          if (duration === 0) {
            gsap.set(tab, { ...vars, overwrite: true });
            return;
          }

          deckTween = gsap.to(tab, {
            ...vars,
            duration,
            ease: tabDeckMotion.ease,
            force3D: true,
            overwrite: true
          });
          return;
        }

        const tabIndex = getTabIndex(tab);
        const isVisible = isVisibleIndex(tabIndex);
        const vars = getDeckVars(tabIndex, layout);

        tab.classList.toggle("is-deck-visible", isVisible);
        tab.classList.toggle("is-deck-stacked", !isVisible);
        tab.classList.toggle("is-active", tabIndex === displayedIndex);
        tab.tabIndex = isVisible ? 0 : -1;

        if (duration === 0) {
          gsap.set(tab, { ...vars, overwrite: true });
          return;
        }

        deckTween = gsap.to(tab, {
          ...vars,
          duration,
          ease: tabDeckMotion.ease,
          force3D: true,
          overwrite: true
        });
      });

      updateArrowState();
      moveLine(imageTabs[displayedIndex], animated);
    }

    function showImageTab(next, animated = true) {
      const tab = imageTabs[next];

      if (!tab || !isVisibleIndex(next)) {
        return;
      }

      if (next === displayedIndex) {
        syncDisplayedTab(animated);
        return;
      }

      const previousIndex = displayedIndex;
      displayedIndex = next;
      animateSlideCopy(next, animated);
      showVisual(next, previousIndex, animated);
      syncDisplayedTab(animated);
    }

    function shiftDeck(direction) {
      if (direction === 0) {
        return;
      }

      const previousIndex = currentIndex;
      const previousDisplayIndex = displayedIndex;
      hoverIndex = null;

      if (direction > 0) {
        if (windowStart < maxWindowStart) {
          const oldStart = windowStart;

          windowStart += 1;

          if (currentIndex === oldStart) {
            currentIndex = windowStart;
          }
        } else if (currentIndex < lastSlideIndex) {
          currentIndex += 1;
        } else {
          return;
        }
      } else if (windowStart > 0) {
        const oldEnd = windowStart + visibleTabCount - 1;

        windowStart -= 1;

        if (currentIndex === oldEnd) {
          currentIndex = windowStart + visibleTabCount - 1;
        }
      } else if (currentIndex > 0) {
        currentIndex -= 1;
      } else {
        return;
      }

      displayedIndex = currentIndex;

      if (displayedIndex !== previousDisplayIndex) {
        animateSlideCopy(displayedIndex, true);
        showVisual(displayedIndex, previousDisplayIndex, true);
      } else if (currentIndex !== previousIndex) {
        syncDisplayedTab(true);
      }

      rotateSuccessStar();
      updateDeck(true);
    }

    tabs.forEach((tab) => {
      cleanup.on(tab, "click", (event) => event.preventDefault());
    });

    imageTabs.forEach((tab, tabIndex) => {
      cleanup.on(tab, "pointerenter", () => {
        if (!isVisibleIndex(tabIndex)) {
          return;
        }

        hoverIndex = tabIndex;
        showImageTab(tabIndex);
        rotateSuccessStar();
      });

      cleanup.on(tab, "pointerleave", () => {
        if (hoverIndex !== tabIndex) {
          return;
        }

        hoverIndex = null;
        showImageTab(currentIndex);
      });
    });

    if (prevArrow) {
      cleanup.on(prevArrow, "click", () => shiftDeck(-1));
    }

    if (nextArrow) {
      cleanup.on(nextArrow, "click", () => shiftDeck(1));
    }

    renderSlideCopy(currentIndex);
    clearCopyMotionArtifacts();
    if (successStarOuter || successStarInner) {
      gsap.set([successStarOuter, successStarInner].filter(Boolean), {
        rotation: starRotation,
        transformOrigin: "50% 50%"
      });
    }
    showVisual(currentIndex, currentIndex, false);
    updateDeck(false);

    cleanup.on(window, "resize", () => updateDeck(false));
    cleanup.add(() => {
      disposeCopyMotion();
      starTween?.kill();
      visualTimeline?.kill();
      lineTween?.kill();
      deckTween?.kill();
      const killTargets = [lineEl, successStar, successStarOuter, successStarInner, ...visuals, ...tabs].filter(Boolean);
      gsap.killTweensOf(killTargets);
      gsap.set([lineEl, ...visuals], { clearProps: "all" });
      if (successStarOuter || successStarInner) {
        gsap.set([successStarOuter, successStarInner].filter(Boolean), {
          clearProps: "transform,transformOrigin,willChange"
        });
      }
      createdVisuals.forEach((visual) => visual.remove());
    });

    return {
      refreshDeck() {
        updateDeck(false);
      }
    };
  }

  function initTextHoverSystem({ cleanup, reduceMotion, root = document }) {
    let controllers = [];

    const dispose = () => {
      controllers.forEach((controller) => controller.dispose());
      controllers = [];
      qsa("[data-motion-hover-trigger]", root).forEach((trigger) => {
        if (!trigger.querySelector("[data-motion-hover-ready]")) {
          trigger.removeAttribute("data-motion-hover-trigger");
        }
      });
    };

    const build = () => {
      dispose();

      if (reduceMotion) {
        return;
      }

      controllers = qsa(".success-tab-motion-shell > span", root)
        .filter((target) => target.textContent?.trim())
        .map((target) => {
          const trigger = target.closest("a, button, [role='button'], [role='link']") || target;
          const text = target.textContent?.trim() ?? "";
          const wrapper = document.createElement("span");

          wrapper.dataset.motionHoverText = "";

          while (target.firstChild) {
            wrapper.append(target.firstChild);
          }

          target.setAttribute("data-text", text);
          target.setAttribute("data-motion-hover-inner", "");
          target.setAttribute("data-motion-hover-ready", "true");
          trigger.setAttribute("data-motion-hover-trigger", "");
          target.replaceChildren(wrapper);

          return {
            dispose() {
              while (wrapper.firstChild) {
                target.append(wrapper.firstChild);
              }

              wrapper.remove();
              target.removeAttribute("data-text");
              target.removeAttribute("data-motion-hover-inner");
              target.removeAttribute("data-motion-hover-ready");
            }
          };
        });
    };

    build();
    cleanup.add(dispose);

    return {
      rebuild: build
    };
  }

  const revealReadyDatasetKey = "revealReady";
  const defaultRevealScope = "page";
  const motionSelectors = {
    block: "[data-block-motion]",
    preserveTransform: "[data-motion-preserve-transform='true']",
    reveal: "[data-reveal]",
    revealElement: '[data-reveal="element"]',
    revealGroup: '[data-reveal="group"]',
    revealItem: "[data-reveal-item]",
    revealText: '[data-reveal="text"]'
  };

  function getHeadingMotionSettings(overrides = {}) {
    return {
      ...readHeadingMotionSettings(),
      ...overrides
    };
  }

  function getTabMotionSettings(overrides = {}) {
    return {
      ...readTabMotionSettings(),
      ...overrides
    };
  }

  function getBlockRevealSettings() {
    return {
      ...readBlockMotionSettings()
    };
  }

  function withDelay(settings, delay) {
    if (delay === settings.delay) {
      return settings;
    }

    return {
      ...settings,
      delay
    };
  }

  function withTargetSplit(target, settings) {
    const rawSplitType = target.dataset.revealSplit;

    if (rawSplitType !== "lines" && rawSplitType !== "words") {
      return settings;
    }

    if (rawSplitType === settings.splitType) {
      return settings;
    }

    return {
      ...settings,
      splitType: rawSplitType
    };
  }

  function isRenderable(target) {
    const styles = window.getComputedStyle(target);

    return styles.display !== "none" && target.getClientRects().length > 0;
  }

  function readTriggerMode(target) {
    return target.dataset.revealTrigger === "manual" ? "manual" : "viewport";
  }

  function readScope(target) {
    return target.dataset.revealScope?.trim() || defaultRevealScope;
  }

  function readKind(target) {
    return target.dataset.reveal === "text" || target.dataset.revealItemKind === "text" ? "text" : "element";
  }

  function readStart(target, fallback) {
    const triggerLine = target.dataset.revealTriggerLine;

    if (triggerLine) {
      return `top ${triggerLine}%`;
    }

    return target.dataset.revealStart?.trim() || fallback;
  }

  function readTargetSettings(target, baseSettings) {
    return {
      ...baseSettings,
      delay: readNumber(target.dataset.revealDelay, baseSettings.delay),
      duration: readNumber(target.dataset.revealDuration, baseSettings.duration),
      stagger: readNumber(target.dataset.revealStagger, baseSettings.stagger),
      start: readStart(target, baseSettings.start)
    };
  }

  function getRevealPartCount(target, settings) {
    if (!target) {
      return 0;
    }

    const partSelector = settings.splitType === "words" ? ".motion-text-word" : ".motion-text-line";
    const splitPartCount = target.querySelectorAll(partSelector).length;

    if (splitPartCount > 0) {
      return splitPartCount;
    }

    const text = target.textContent?.trim() ?? "";

    if (settings.splitType === "lines") {
      return text === "" ? 0 : 1;
    }

    return text === "" ? 0 : text.split(/\s+/).length;
  }

  function getAfterDelay(target, settings) {
    const sourceId = target.dataset.revealAfter?.trim();

    if (!sourceId) {
      return settings.delay;
    }

    const source = document.querySelector(`[data-reveal-id="${sourceId}"]`);
    return settings.delay + getRevealPartCount(source, settings) * settings.stagger;
  }

  function getElementOffset(settings) {
    return Math.round(settings.yPercent * 0.25);
  }

  function getWordFromVars(settings) {
    return {
      rotationX: settings.fromRotateX,
      transformOrigin: settings.transformOrigin,
      yPercent: settings.yPercent
    };
  }

  function getWordToVars(settings) {
    return {
      rotationX: 0,
      transformOrigin: settings.transformOrigin,
      yPercent: 0
    };
  }

  function getElementFromVars(settings) {
    return {
      rotationX: settings.fromRotateX,
      transformOrigin: settings.transformOrigin,
      transformPerspective: settings.perspective,
      transformStyle: "preserve-3d",
      y: getElementOffset(settings)
    };
  }

  function getElementToVars(settings) {
    return {
      rotationX: 0,
      transformOrigin: settings.transformOrigin,
      transformPerspective: settings.perspective,
      transformStyle: "preserve-3d",
      y: 0
    };
  }

  function getElementClearProps(target) {
    return target.matches(motionSelectors.preserveTransform)
      ? "transformOrigin,transformStyle,transformPerspective,opacity,visibility,willChange"
      : "transform,transformOrigin,transformStyle,transformPerspective,opacity,visibility,willChange";
  }

  function readGsapNumber(value, fallback) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function markReady(root) {
    qsa(`${motionSelectors.reveal}, ${motionSelectors.revealItem}, ${motionSelectors.block}`, root).forEach((target) => {
      target.dataset[revealReadyDatasetKey] = "true";
    });
  }

  function applyTextFrom(target, parts, settings) {
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

  function createTextRevealController(target, settings) {
    if (!SplitText || typeof SplitText.create !== "function") {
      return createElementRevealController(target, settings);
    }

    const previousVisibility = target.style.visibility;

    target.style.visibility = "hidden";

    const split = SplitText.create(target, {
      aria: "auto",
      linesClass: copyLineClass,
      tag: "span",
      type: settings.splitType,
      wordsClass: "motion-text-word"
    });
    const parts = settings.splitType === "words" && split.words ? split.words : split.lines;
    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        gsap.set(target, { clearProps: "perspective,transformStyle" });
        gsap.set(parts, { clearProps: "transform,transformOrigin,opacity,willChange" });
      }
    });

    target.style.visibility = previousVisibility;
    applyTextFrom(target, parts, settings);
    target.dataset[revealReadyDatasetKey] = "true";

    timeline.to(parts, {
      ...getWordToVars(settings),
      opacity: 1,
      duration: settings.duration,
      delay: settings.delay,
      ease: settings.ease,
      stagger: { each: settings.stagger, from: "start" }
    });

    function reset() {
      timeline.pause(0);
      applyTextFrom(target, parts, settings);
    }

    function play() {
      reset();
      timeline.restart();
    }

    function complete() {
      timeline.pause(timeline.duration());
      target.style.visibility = previousVisibility;
      target.dataset[revealReadyDatasetKey] = "true";
      gsap.set(parts, {
        ...getWordToVars(settings),
        opacity: 1,
        clearProps: "transform,transformOrigin,opacity,willChange"
      });
      gsap.set(target, { clearProps: "perspective,transformStyle" });
    }

    return {
      complete,
      dispose() {
        timeline.kill();
        split.revert();
        split.kill();
        gsap.set(target, { clearProps: "perspective,transformStyle" });
        target.style.visibility = previousVisibility;
        delete target.dataset[revealReadyDatasetKey];
      },
      play,
      reset,
      target
    };
  }

  function applyElementFrom(target, settings) {
    gsap.set(target, {
      ...getElementFromVars(settings),
      autoAlpha: settings.fromOpacity,
      willChange: "transform, opacity"
    });
  }

  function createElementRevealController(target, settings) {
    const previousVisibility = target.style.visibility;
    const clearProps = getElementClearProps(target);
    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        target.style.visibility = previousVisibility;
      }
    });

    target.style.visibility = "hidden";
    applyElementFrom(target, settings);
    target.dataset[revealReadyDatasetKey] = "true";

    timeline.to(target, {
      ...getElementToVars(settings),
      autoAlpha: 1,
      duration: settings.duration,
      delay: settings.delay,
      ease: settings.ease,
      clearProps
    });

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
        clearProps
      });
      target.style.visibility = previousVisibility;
      target.dataset[revealReadyDatasetKey] = "true";
    }

    return {
      complete,
      dispose() {
        timeline.kill();
        gsap.set(target, { clearProps });
        target.style.visibility = previousVisibility;
        delete target.dataset[revealReadyDatasetKey];
      },
      play,
      reset,
      target
    };
  }

  function createPreservedElementRevealController(target, settings) {
    const previousVisibility = target.style.visibility;
    const finalState = {
      opacity: readGsapNumber(gsap.getProperty(target, "opacity"), 1),
      y: readGsapNumber(gsap.getProperty(target, "y"), 0)
    };
    const clearProps = "transformOrigin,transformStyle,transformPerspective,willChange";
    const timeline = gsap.timeline({
      paused: true,
      onComplete: restoreFinalState
    });

    target.style.visibility = "hidden";
    applyFrom();
    target.dataset[revealReadyDatasetKey] = "true";

    timeline.to(target, {
      ...getElementToVars(settings),
      autoAlpha: finalState.opacity,
      y: finalState.y,
      duration: settings.duration,
      delay: settings.delay,
      ease: settings.ease,
      clearProps
    });

    function applyFrom() {
      gsap.set(target, {
        ...getElementFromVars(settings),
        autoAlpha: settings.fromOpacity,
        y: finalState.y + getElementOffset(settings),
        willChange: "transform, opacity"
      });
    }

    function restoreFinalState() {
      gsap.set(target, {
        autoAlpha: finalState.opacity,
        rotationX: 0,
        transformOrigin: settings.transformOrigin,
        transformPerspective: settings.perspective,
        transformStyle: "preserve-3d",
        y: finalState.y,
        clearProps
      });
      target.style.visibility = previousVisibility;
      target.dataset[revealReadyDatasetKey] = "true";
    }

    function reset() {
      timeline.pause(0);
      applyFrom();
    }

    function play() {
      reset();
      timeline.restart();
    }

    function complete() {
      timeline.pause(timeline.duration());
      restoreFinalState();
    }

    return {
      complete,
      dispose() {
        timeline.kill();
        restoreFinalState();
        delete target.dataset[revealReadyDatasetKey];
      },
      play,
      reset,
      target
    };
  }

  function getTabMotionOwner(target) {
    return target.closest(".success-arrow, .success-tab");
  }

  function getTabMotionFromVars(settings) {
    return {
      "--tab-motion-alpha": settings.fromOpacity,
      "--tab-motion-origin": settings.transformOrigin,
      "--tab-motion-perspective": `${settings.perspective}px`,
      "--tab-motion-rotate-x": `${settings.fromRotateX}deg`,
      "--tab-motion-y": `${getElementOffset(settings)}px`
    };
  }

  function getTabMotionToVars(settings) {
    return {
      "--tab-motion-alpha": 1,
      "--tab-motion-origin": settings.transformOrigin,
      "--tab-motion-perspective": `${settings.perspective}px`,
      "--tab-motion-rotate-x": "0deg",
      "--tab-motion-y": "0px"
    };
  }

  function createTabShellRevealController(target, settings) {
    const owner = getTabMotionOwner(target);
    const timeline = gsap.timeline({
      paused: true,
      onComplete: restoreFinalState
    });

    owner?.dataset && (owner.dataset[revealReadyDatasetKey] = "true");
    target.dataset[revealReadyDatasetKey] = "true";
    applyFrom();

    timeline.to(target, {
      ...getTabMotionToVars(settings),
      duration: settings.duration,
      delay: settings.delay,
      ease: settings.ease
    });

    function applyFrom() {
      owner?.dataset && (owner.dataset[revealReadyDatasetKey] = "true");
      target.dataset[revealReadyDatasetKey] = "true";
      gsap.set(target, {
        ...getTabMotionFromVars(settings),
        willChange: "transform, opacity"
      });
    }

    function restoreFinalState() {
      owner?.dataset && (owner.dataset[revealReadyDatasetKey] = "true");
      target.dataset[revealReadyDatasetKey] = "true";
      gsap.set(target, {
        ...getTabMotionToVars(settings),
        willChange: ""
      });
    }

    function reset() {
      timeline.pause(0);
      applyFrom();
    }

    function play() {
      reset();
      timeline.restart();
    }

    function complete() {
      timeline.pause(timeline.duration());
      restoreFinalState();
    }

    return {
      complete,
      dispose() {
        timeline.kill();
        restoreFinalState();
      },
      play,
      reset,
      target
    };
  }

  function createDeckGroupRevealController(group, items, settings) {
    const finalStates = items.map((item) => ({
      opacity: readGsapNumber(gsap.getProperty(item, "opacity"), 1),
      y: readGsapNumber(gsap.getProperty(item, "y"), 0)
    }));
    const offset = getElementOffset(settings);
    const timeline = gsap.timeline({
      paused: true,
      onComplete: restoreFinalState
    });

    group.dataset[revealReadyDatasetKey] = "true";
    items.forEach((item) => {
      item.dataset[revealReadyDatasetKey] = "true";
    });

    function applyFrom() {
      gsap.set(items, {
        autoAlpha: 0,
        y: (index) => (finalStates[index]?.y ?? 0) + offset,
        willChange: "transform, opacity"
      });
    }

    function restoreFinalState() {
      gsap.set(items, {
        autoAlpha: (index) => finalStates[index]?.opacity ?? 1,
        y: (index) => finalStates[index]?.y ?? 0,
        willChange: ""
      });
    }

    applyFrom();
    timeline.to(items, {
      autoAlpha: (index) => finalStates[index]?.opacity ?? 1,
      y: (index) => finalStates[index]?.y ?? 0,
      duration: settings.duration * 0.64,
      delay: settings.delay,
      ease: settings.ease,
      force3D: true,
      stagger: { each: settings.stagger * 2, from: "start" }
    });

    function reset() {
      timeline.pause(0);
      applyFrom();
    }

    function play() {
      reset();
      timeline.restart();
    }

    function complete() {
      timeline.pause(timeline.duration());
      restoreFinalState();
      group.dataset[revealReadyDatasetKey] = "true";
    }

    return {
      complete,
      dispose() {
        timeline.kill();
        restoreFinalState();
        delete group.dataset[revealReadyDatasetKey];
        items.forEach((item) => {
          delete item.dataset[revealReadyDatasetKey];
        });
      },
      play,
      reset,
      target: group
    };
  }

  function createBlockRevealController(target, settings) {
    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        gsap.set(target, {
          clearProps: "opacity,visibility,transform,transformOrigin,transformPerspective,transformStyle,willChange"
        });
      }
    });

    function applyFrom() {
      gsap.set(target, {
        autoAlpha: settings.fromOpacity,
        rotationX: settings.fromRotateX,
        scale: settings.fromScale,
        transformOrigin: settings.transformOrigin,
        transformPerspective: settings.perspective,
        transformStyle: "preserve-3d",
        yPercent: settings.yPercent,
        willChange: "transform, opacity"
      });
    }

    applyFrom();
    target.dataset[revealReadyDatasetKey] = "true";

    timeline.to(target, {
      autoAlpha: 1,
      rotationX: 0,
      scale: 1,
      yPercent: 0,
      duration: settings.duration,
      delay: settings.delay,
      ease: settings.ease
    });

    function reset() {
      timeline.pause(0);
      applyFrom();
    }

    function play() {
      reset();
      timeline.restart();
    }

    function complete() {
      timeline.pause(timeline.duration());
      gsap.set(target, {
        autoAlpha: 1,
        rotationX: 0,
        scale: 1,
        yPercent: 0,
        clearProps: "opacity,visibility,transform,transformOrigin,transformPerspective,transformStyle,willChange"
      });
      target.dataset[revealReadyDatasetKey] = "true";
    }

    return {
      complete,
      dispose() {
        timeline.kill();
        gsap.set(target, {
          clearProps: "opacity,visibility,transform,transformOrigin,transformPerspective,transformStyle,willChange"
        });
        delete target.dataset[revealReadyDatasetKey];
      },
      play,
      reset,
      target
    };
  }

  function createGroupedController(target, units) {
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

  function createSingleController(target, settings) {
    if (readKind(target) === "text") {
      return createTextRevealController(target, settings);
    }

    return createElementRevealController(target, settings);
  }

  function createRevealTrigger(target, controller, settings, state) {
    const play = () => {
      if (state.suppressPlay) {
        return false;
      }

      controller.play();
      return true;
    };

    if (!ScrollTrigger) {
      requestAnimationFrame(play);
      return undefined;
    }

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

  function getGroupItems(group) {
    const explicitItems = qsa(motionSelectors.revealItem, group);

    if (explicitItems.length > 0) {
      return explicitItems.filter(isRenderable);
    }

    return Array.from(group.children).filter((child) => child instanceof HTMLElement && isRenderable(child));
  }

  function createGroupReveal(group, baseSettings, triggerState) {
    const items = getGroupItems(group);

    if (items.length === 0) {
      group.dataset[revealReadyDatasetKey] = "true";
      return undefined;
    }

    const settings = readTargetSettings(group, baseSettings);
    const controller = group.classList.contains("success-tabs")
      ? createDeckGroupRevealController(group, items, settings)
      : createGroupedController(
          group,
          items.map((target, index) => {
            const itemSettings = withTargetSplit(
              target,
              withDelay(readTargetSettings(target, settings), getAfterDelay(group, settings) + settings.stagger * 2 * index)
            );
            return createSingleController(target, itemSettings);
          })
        );
    const triggerMode = readTriggerMode(group);
    const trigger = triggerMode === "viewport" ? createRevealTrigger(group, controller, settings, triggerState) : undefined;

    group.dataset[revealReadyDatasetKey] = "true";

    return {
      controller,
      scope: readScope(group),
      trigger,
      triggerElement: group,
      triggerMode
    };
  }

  function createSingleReveal(target, baseSettings, triggerState, delay = getAfterDelay(target, baseSettings)) {
    if (!isRenderable(target)) {
      return undefined;
    }

    const settings = withTargetSplit(target, withDelay(readTargetSettings(target, baseSettings), delay));
    const triggerMode = readTriggerMode(target);
    const controller = createSingleController(target, settings);
    const trigger = triggerMode === "viewport" ? createRevealTrigger(target, controller, settings, triggerState) : undefined;

    return {
      controller,
      scope: readScope(target),
      trigger,
      triggerElement: target,
      triggerMode
    };
  }

  function createBlockReveal(target, baseSettings, triggerState) {
    if (!isRenderable(target)) {
      return undefined;
    }

    const settings = readTargetSettings(target, baseSettings);
    const triggerMode = readTriggerMode(target);
    const controller = createBlockRevealController(target, settings);
    const trigger = triggerMode === "viewport" ? createRevealTrigger(target, controller, settings, triggerState) : undefined;

    return {
      controller,
      scope: readScope(target),
      trigger,
      triggerElement: target,
      triggerMode
    };
  }

  function isRevealController(item) {
    return item !== undefined;
  }

  function collectGroupedTargets(root) {
    const groupedTargets = new Set();

    qsa(motionSelectors.revealGroup, root).forEach((group) => {
      getGroupItems(group).forEach((target) => groupedTargets.add(target));
    });

    return groupedTargets;
  }

  function initHeadingMotion({ cleanup, reduceMotion, root = document }) {
    let controllers = [];
    let refreshCall;

    const dispose = () => {
      refreshCall?.kill();
      refreshCall = undefined;
      controllers.forEach(({ controller, trigger }) => {
        trigger?.kill();
        controller.dispose();
      });
      controllers = [];
    };

    const scheduleRefresh = (onReady) => {
      if (!ScrollTrigger) {
        onReady?.();
        return;
      }

      refreshCall?.kill();
      refreshCall = gsap.delayedCall(0, () => {
        ScrollTrigger.refresh();
        refreshCall = undefined;
        onReady?.();
      });
    };

    const build = ({ keepTriggers = false, onReady, suppressInitialPlay = false } = {}) => {
      dispose();

      const heads = qsa(".success-head", root).filter(isRenderable);
      const textTargets = qsa(".success-kicker, .success-head h2", root);

      if (!gsap || reduceMotion) {
        textTargets.forEach((target) => {
          target.dataset[revealReadyDatasetKey] = "true";
        });
        onReady?.();
        return;
      }

      const triggerState = {
        keepAlive: keepTriggers,
        suppressPlay: suppressInitialPlay
      };

      const baseSettings = getHeadingMotionSettings();
      controllers = heads
        .map((head, headIndex) => {
          const targets = [optional(".success-kicker", head), optional("h2", head)].filter(
            (target) => target instanceof HTMLElement && isRenderable(target)
          );

          if (targets.length === 0) {
            return undefined;
          }

          const units = targets.map((target, targetIndex) => {
            const targetSettings = withTargetSplit(
              target,
              withDelay(
                readTargetSettings(target, baseSettings),
                getAfterDelay(target, baseSettings) + baseSettings.stagger * 2 * targetIndex
              )
            );

            return createTextRevealController(target, targetSettings);
          });
          const controller = createGroupedController(head, units);
          const trigger = createRevealTrigger(head, controller, baseSettings, triggerState);

          return {
            controller,
            scope: "heading",
            trigger,
            triggerElement: head,
            triggerMode: "viewport",
            refreshPriority: headIndex
          };
        })
        .filter(isRevealController);
      scheduleRefresh(onReady);
    };

    const replayVisible = () => {
      if (!ScrollTrigger) {
        return;
      }

      controllers.forEach(({ controller, triggerElement, triggerMode }) => {
        if (triggerMode === "viewport" && ScrollTrigger.isInViewport(triggerElement)) {
          controller.play();
        }
      });
    };

    build();
    cleanup.add(dispose);

    return {
      build,
      rebuild: build,
      replayVisible,
      dispose
    };
  }

  function initTabMotion({ cleanup, onBeforeBuild, onComplete, reduceMotion, root = document }) {
    let controllers = [];
    let refreshCall;

    const dispose = () => {
      refreshCall?.kill();
      refreshCall = undefined;
      controllers.forEach(({ controller, trigger }) => {
        trigger?.kill();
        controller.dispose();
      });
      controllers = [];
    };

    const scheduleRefresh = (onReady) => {
      if (!ScrollTrigger) {
        onReady?.();
        return;
      }

      refreshCall?.kill();
      refreshCall = gsap.delayedCall(0, () => {
        ScrollTrigger.refresh();
        refreshCall = undefined;
        onReady?.();
      });
    };

    const getPanelRevealRoots = (panel) =>
      qsa(".success-arrow, .success-tab", panel).filter((target) => target instanceof HTMLElement);

    const getPanelTargets = (panel) =>
      qsa(".success-arrow-shell, .success-tab-motion-shell", panel).filter(
        (target) => target instanceof HTMLElement && isRenderable(target)
      );

    function createTimedController(target, units, duration) {
      const controller = createGroupedController(target, units);
      let completeCall;

      const scheduleComplete = () => {
        completeCall?.kill();
        completeCall = gsap.delayedCall(duration, () => {
          completeCall = undefined;
          onComplete?.();
        });
      };

      return {
        complete() {
          completeCall?.kill();
          completeCall = undefined;
          controller.complete();
          onComplete?.();
        },
        dispose() {
          completeCall?.kill();
          completeCall = undefined;
          controller.dispose();
        },
        play() {
          controller.play();
          scheduleComplete();
        },
        reset() {
          completeCall?.kill();
          completeCall = undefined;
          controller.reset();
        },
        target
      };
    }

    const build = ({ keepTriggers = false, onReady, suppressInitialPlay = false } = {}) => {
      dispose();

      const panels = qsa(".success-panel", root).filter(isRenderable);
      onBeforeBuild?.();
      const revealRoots = panels.flatMap(getPanelRevealRoots);
      revealRoots.forEach((target) => {
        target.dataset[revealReadyDatasetKey] = "true";
      });
      const allTargets = panels.flatMap(getPanelTargets);

      if (!gsap || reduceMotion) {
        allTargets.forEach((target) => {
          target.dataset[revealReadyDatasetKey] = "true";
          gsap?.set(target, getTabMotionToVars(getTabMotionSettings()));
        });
        onReady?.();
        return;
      }

      const triggerState = {
        keepAlive: keepTriggers,
        suppressPlay: suppressInitialPlay
      };
      const baseSettings = getTabMotionSettings();

      controllers = panels
        .map((panel, panelIndex) => {
          const targets = getPanelTargets(panel);

          if (targets.length === 0) {
            return undefined;
          }

          let totalDuration = 0;
          const units = targets.map((target, targetIndex) => {
            const owner = getTabMotionOwner(target);
            const settingsTarget = owner instanceof HTMLElement ? owner : target;
            const targetSettings = withDelay(
              readTargetSettings(settingsTarget, baseSettings),
              getAfterDelay(settingsTarget, baseSettings) + baseSettings.stagger * 2 * targetIndex
            );

            totalDuration = Math.max(totalDuration, targetSettings.delay + targetSettings.duration);
            return createTabShellRevealController(target, targetSettings);
          });
          const controller = createTimedController(panel, units, totalDuration + 0.03);
          const trigger = createRevealTrigger(panel, controller, baseSettings, triggerState);

          return {
            controller,
            scope: "tabs",
            trigger,
            triggerElement: panel,
            triggerMode: "viewport",
            refreshPriority: panelIndex
          };
        })
        .filter(isRevealController);
      scheduleRefresh(onReady);
    };

    const replayVisible = () => {
      if (!ScrollTrigger) {
        return;
      }

      controllers.forEach(({ controller, triggerElement, triggerMode }) => {
        if (triggerMode === "viewport" && ScrollTrigger.isInViewport(triggerElement)) {
          controller.play();
        }
      });
    };

    build();
    cleanup.add(dispose);

    return {
      build,
      rebuild: build,
      replayVisible,
      dispose
    };
  }

  function initBlockMotion({ cleanup, reduceMotion, root = document }) {
    const media = window.matchMedia("(min-width: 1280px)");
    let controllers = [];
    let refreshCall;

    const dispose = () => {
      refreshCall?.kill();
      refreshCall = undefined;
      controllers.forEach(({ controller, trigger }) => {
        trigger?.kill();
        controller.dispose();
      });
      controllers = [];
    };

    const scheduleRefresh = () => {
      if (!ScrollTrigger) {
        return;
      }

      refreshCall?.kill();
      refreshCall = gsap.delayedCall(0, () => {
        ScrollTrigger.refresh();
        refreshCall = undefined;
      });
    };

    const build = () => {
      dispose();

      const targets = qsa(motionSelectors.block, root);

      if (!gsap || reduceMotion || !media.matches) {
        targets.forEach((target) => {
          gsap?.set(target, {
            clearProps: "opacity,visibility,transform,transformOrigin,transformPerspective,transformStyle,willChange"
          });
        });
        return;
      }

      const settings = getBlockRevealSettings();
      const triggerState = {
        keepAlive: false,
        suppressPlay: false
      };

      controllers = targets
        .map((target) => createBlockReveal(target, settings, triggerState))
        .filter(isRevealController);
      scheduleRefresh();
    };

    const replayVisible = () => {
      if (!ScrollTrigger) {
        return;
      }

      controllers.forEach(({ controller, triggerElement }) => {
        if (ScrollTrigger.isInViewport(triggerElement)) {
          controller.play();
        }
      });
    };

    build();
    cleanup.on(media, "change", build);
    cleanup.add(dispose);

    return {
      rebuild: build,
      replayVisible
    };
  }

  function initSmoothScroll({ cleanup, reduceMotion }) {
    if (!gsap || !Lenis || reduceMotion) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.05,
      lerp: 0.12
    });
    const raf = (time) => lenis.raf(time * 1000);
    const resizeLenis = () => lenis.resize();

    lenis.on("scroll", () => ScrollTrigger?.update());
    ScrollTrigger?.addEventListener("refresh", resizeLenis);
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(raf);

    cleanup.add(() => {
      ScrollTrigger?.removeEventListener("refresh", resizeLenis);
      gsap.ticker.remove(raf);
      lenis.destroy();
    });
  }

  function initSpacerMarkMotion({ cleanup, reduceMotion, root = document }) {
    const mark = optional(".telegram-spacer-mark", root);

    if (!mark || !gsap) {
      return;
    }

    const frame = optional(".telegram-spacer-mark-frame", mark);
    const core = optional(".telegram-spacer-mark-core", mark);

    if (!frame || !core) {
      return;
    }

    gsap.set([frame, core], {
      rotation: 0,
      svgOrigin: "20 20"
    });

    if (reduceMotion) {
      gsap.set([frame, core], { clearProps: "willChange" });
      return;
    }

    const timeline = gsap.timeline({
      repeat: -1,
      defaults: {
        ease: "power3.inOut"
      }
    });

    timeline.to(
      frame,
      {
        rotation: "+=90",
        svgOrigin: "20 20",
        duration: 0.46
      },
      0
    );
    timeline.to(
      core,
      {
        rotation: "+=90",
        svgOrigin: "20 20",
        duration: 0.46
      },
      0.2
    );
    timeline.to({}, { duration: 0.54 });

    cleanup.add(() => timeline.kill());
  }

  async function waitForFonts() {
    if (!("fonts" in document)) {
      return;
    }

    try {
      await document.fonts.ready;
    } catch {
      // Font loading failure should not block the local demo.
    }
  }

  async function settleDemo() {
    await waitForFonts();
    const resetScroll = () => window.scrollTo(0, 0);

    resetScroll();
    requestAnimationFrame(() => {
      resetScroll();
      window.dispatchEvent(new Event("resize"));
      ScrollTrigger?.refresh();
    });
    window.setTimeout(() => {
      resetScroll();
      ScrollTrigger?.refresh();
    }, 120);
    window.setTimeout(() => {
      resetScroll();
      ScrollTrigger?.refresh();
    }, 520);
  }

  document.documentElement.classList.add("js", "no-pixelation");
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
  window.addEventListener("pageshow", () => {
    window.setTimeout(() => window.scrollTo(0, 0), 0);
  });

  const cleanup = createCleanupRegistry();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    document.documentElement.classList.add("no-motion");
  }

  initSuccessSection();
  initSpacerMarkMotion({ cleanup, reduceMotion });
  const galleryMotion = initGalleryMotion({ cleanup, reduceMotion });
  const textHover = initTextHoverSystem({ cleanup, reduceMotion });
  initSmoothScroll({ cleanup, reduceMotion });
  const smoothCorners = initSmoothCorners({ cleanup });
  const headingMotionSystem = initHeadingMotion({ cleanup, reduceMotion });
  const tabMotionSystem = initTabMotion({
    cleanup,
    onBeforeBuild: () => galleryMotion?.refreshDeck(),
    onComplete: () => galleryMotion?.refreshDeck(),
    reduceMotion
  });
  const blockMotionSystem = initBlockMotion({ cleanup, reduceMotion });
  initDebugDockShortcut({ cleanup });
  initHeadingMotionDebugControls({
    cleanup,
    onApply: () => {
      headingMotionSystem?.rebuild();
      textHover?.rebuild();
    },
    onReplay: () => {
      headingMotionSystem?.rebuild({
        keepTriggers: true,
        onReady: () => {
          headingMotionSystem?.replayVisible();
        },
        suppressInitialPlay: true
      });
      textHover?.rebuild();
    }
  });
  initTabMotionDebugControls({
    cleanup,
    onApply: () => {
      tabMotionSystem?.rebuild();
    },
    onReplay: () => {
      tabMotionSystem?.rebuild({
        keepTriggers: true,
        onReady: () => {
          tabMotionSystem?.replayVisible();
        },
        suppressInitialPlay: true
      });
    }
  });
  initBlockMotionDebugControls({
    cleanup,
    onApply: () => {
      blockMotionSystem?.rebuild();
    },
    onReplay: () => {
      blockMotionSystem?.rebuild();
      blockMotionSystem?.replayVisible();
    }
  });
  smoothCorners.refresh();
  void settleDemo();
})();

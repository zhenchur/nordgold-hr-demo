import "./styles.css";
import { initBenefitsSlider } from "./app/benefitsSlider";
import { initBlockMotion } from "./app/blockMotion";
import { initBlockMotionDebugControls } from "./app/blockMotionSettings";
import { initBrandPreloader, initBrandPreloaderDebugControls } from "./app/brandPreloader";
import { createCleanupRegistry, qsa } from "./app/dom";
import { ScrollTrigger } from "./app/gsapSetup";
import { createHeroShutter } from "./app/heroShutter";
import { initInnerNavReveal } from "./app/innerNav";
import { initMinesBackgroundMotion } from "./app/minesBackgroundMotion";
import { initMinesMap } from "./app/minesMap";
import { initMinesMotionDebugControls } from "./app/minesMotion";
import { initMotionDebugControls } from "./app/motionSettings";
import { initPageStartPolicy } from "./app/pageStartPolicy";
import { initPageTransition } from "./app/pageTransition";
import { initPeopleStats } from "./app/peopleStats";
import { initPixelation, initPixelationDebugControls } from "./app/pixelation";
import { initRevealSystem } from "./app/revealSystem";
import { initScroll } from "./app/scrollSetup";
import { initSmoothCorners } from "./app/smoothCorners";
import { initSuccessSection } from "./app/successSection";
import { initSuccessTabs } from "./app/successTabs";
import { initTextHoverSystem } from "./app/textHoverSystem";
import { initVacancyTabs } from "./app/vacancyTabs";

document.documentElement.classList.add("js");

const cleanup = createCleanupRegistry();
const pageStart = initPageStartPolicy();
pageStart.resetToTop();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const enableDebugTools = import.meta.env.DEV;
const enablePixelation = false;
const brandPreloader = initBrandPreloader({ cleanup, reduceMotion });

document.documentElement.classList.toggle("no-pixelation", !enablePixelation);

if (!enableDebugTools) {
  qsa<HTMLElement>(
    ".debug-dock, .debug, .motion-debug, .motion-trigger-guide, .block-motion-trigger-guide, .layout-debug-panel, .layout-grid-overlay"
  ).forEach((element) => element.remove());
}

if (!enablePixelation) {
  document.querySelector<HTMLElement>("#pixelationDebugPanel")?.remove();
}

const smoothCorners = initSmoothCorners({ cleanup });
let appDidBoot = false;

const markAppReady = () => {
  appDidBoot = true;
  document.documentElement.classList.remove("is-booting");
};

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const waitForFonts = async () => {
  if (!("fonts" in document)) {
    return;
  }

  try {
    await document.fonts.ready;
  } catch {
    // Font loading failure should not block the page boot sequence.
  }
};

let routeCleanup = createCleanupRegistry();
let minesMap: ReturnType<typeof initMinesMap> | null = null;
let reveal: ReturnType<typeof initRevealSystem> | null = null;
let textHover: ReturnType<typeof initTextHoverSystem> | null = null;
let innerNav: ReturnType<typeof initInnerNavReveal> | undefined;
let blockMotion: ReturnType<typeof initBlockMotion> | null = null;
let heroShutter: ReturnType<typeof createHeroShutter> | null = null;
let pixelation: ReturnType<typeof initPixelation> | null = null;

const getRouteRoot = (path: "/" | "/page2"): ParentNode => {
  return qsa<HTMLElement>('[data-barba="container"]').find((container) => container.dataset.routePage === path) ?? document;
};

const disposeRouteSystems = () => {
  routeCleanup.run();
  routeCleanup = createCleanupRegistry();
  minesMap = null;
  reveal = null;
  textHover = null;
  innerNav = undefined;
  blockMotion = null;
  heroShutter = null;
  pixelation = null;
};

const mountRouteSystems = (path: "/" | "/page2") => {
  disposeRouteSystems();

  const routeRoot = getRouteRoot(path);

  textHover = initTextHoverSystem({ cleanup: routeCleanup, reduceMotion, root: routeRoot });
  pixelation = enablePixelation ? initPixelation({ cleanup: routeCleanup, root: routeRoot }) : null;

  if (path === "/") {
    initVacancyTabs({ cleanup: routeCleanup, reduceMotion });
    initPeopleStats({ cleanup: routeCleanup, reduceMotion });
    initBenefitsSlider({ cleanup: routeCleanup });
    initSuccessSection();
    initSuccessTabs({ cleanup: routeCleanup, reduceMotion });
    initMinesBackgroundMotion({ cleanup: routeCleanup, reduceMotion });
    minesMap = initMinesMap({ cleanup: routeCleanup, reduceMotion });
    textHover?.rebuild();
  }

  reveal = initRevealSystem({ cleanup: routeCleanup, deferViewportPlay: true, reduceMotion, root: routeRoot });
  innerNav = initInnerNavReveal({ cleanup: routeCleanup, reduceMotion, root: routeRoot });
  blockMotion = initBlockMotion({ cleanup: routeCleanup, reduceMotion, root: routeRoot });
  const mountedHeroShutter = createHeroShutter({
    cleanup: routeCleanup,
    onMaskState: ({ innerNavVisible }) => innerNav?.setHeroMaskState(innerNavVisible),
    onRevealPlay: () => reveal?.playScope("hero"),
    onRevealReset: () => reveal?.resetScope("hero"),
    root: routeRoot
  });
  heroShutter = mountedHeroShutter;

  if (!reduceMotion) {
    mountedHeroShutter.initHeroScrollEffects();
  } else {
    mountedHeroShutter.finalMask();
  }

  ScrollTrigger.refresh();
};

const settleMountedRoute = (path: "/" | "/page2") => {
  if (!appDidBoot) {
    return;
  }

  if (!heroShutter) {
    ScrollTrigger.refresh();
    return;
  }

  if (path === "/") {
    pageStart.resetToTop();
  } else {
    window.scrollTo(0, 0);
  }

  if (reduceMotion) {
    reveal?.resumeViewportPlay();
    heroShutter?.finalMask();
    ScrollTrigger.refresh();
    return;
  }

  const mountedHeroShutter = heroShutter;
  mountedHeroShutter?.resetMask();
  ScrollTrigger.refresh();
  reveal?.resumeViewportPlay();

  void nextFrame().then(() => {
    if (heroShutter !== mountedHeroShutter) {
      return;
    }

    mountedHeroShutter?.playMask();
    ScrollTrigger.update();
  });
};

if (!reduceMotion) {
  initScroll(cleanup);
} else {
  document.documentElement.classList.add("no-motion");
}

const pageTransition = initPageTransition({
  cleanup,
  reduceMotion,
  onBeforeLeave: () => {
    disposeRouteSystems();
  },
  onBeforeEnter: () => {
    smoothCorners.refresh();
  },
  onRouteChange: (path) => {
    mountRouteSystems(path);
    settleMountedRoute(path);
  }
});

const playBrandPreloader = async () => {
  if (pageTransition.getCurrentPath() !== "/") {
    brandPreloader?.finish();
    return;
  }

  await brandPreloader?.play();
};

const initMotionDebug = () => {
  if (!enableDebugTools) {
    return;
  }

  initMotionDebugControls({
    cleanup,
    onApply: () => {
      reveal?.rebuild();
      textHover?.rebuild();
    },
    onReplay: () => {
      reveal?.rebuild({
        keepTriggers: true,
        suppressInitialPlay: true,
        onReady: () => {
          reveal?.replayVisible();
        }
      });
      textHover?.rebuild();
      requestAnimationFrame(() => {
        reveal?.playScope("hero");
      });
    }
  });

  initMinesMotionDebugControls({
    cleanup,
    onReplay: () => minesMap?.replayText()
  });

  initBlockMotionDebugControls({
    cleanup,
    onApply: () => {
      blockMotion?.rebuild();
    },
    onReplay: () => {
      blockMotion?.rebuild();
      blockMotion?.replayVisible();
    }
  });

  initBrandPreloaderDebugControls({
    cleanup,
    onReplay: () => {
      if (pageTransition.getCurrentPath() !== "/") {
        return;
      }

      void brandPreloader?.replay();
    }
  });

  if (pixelation) {
    initPixelationDebugControls({
      cleanup,
      pixelation
    });
  }
};

initMotionDebug();

if (!reduceMotion) {
  let didStartHeroExperience = false;
  const runHeroExperience = (force = false) => {
    if (didStartHeroExperience && !force) {
      return;
    }

    didStartHeroExperience = true;

    void (async () => {
      await waitForFonts();
      await nextFrame();

      if (!heroShutter) {
        await playBrandPreloader();
        ScrollTrigger.refresh();
        markAppReady();
        await nextFrame();
        brandPreloader?.finish();
        return;
      }

      if (pageTransition.getCurrentPath() === "/") {
        pageStart.resetToTop();
      } else {
        window.scrollTo(0, 0);
      }

      const mountedHeroShutter = heroShutter;
      mountedHeroShutter.resetMask();
      ScrollTrigger.refresh();
      await playBrandPreloader();
      reveal?.resumeViewportPlay();
      markAppReady();
      await nextFrame();
      brandPreloader?.finish();
      mountedHeroShutter.playMask();
      ScrollTrigger.update();
    })();
  };

  if (document.readyState === "complete") {
    runHeroExperience();
  } else {
    cleanup.on(window, "load", () => runHeroExperience());
  }

  cleanup.on(window, "pageshow", (event) => {
    runHeroExperience((event as PageTransitionEvent).persisted);
  });
} else {
  let didStartReducedMotionExperience = false;
  const runReducedMotionExperience = (force = false) => {
    if (didStartReducedMotionExperience && !force) {
      return;
    }

    didStartReducedMotionExperience = true;

    void (async () => {
      await waitForFonts();
      await nextFrame();
      await playBrandPreloader();

      if (pageTransition.getCurrentPath() === "/") {
        pageStart.resetToTop();
      } else {
        window.scrollTo(0, 0);
      }

      heroShutter?.finalMask();
      reveal?.resumeViewportPlay();
      ScrollTrigger.refresh();
      markAppReady();
      await nextFrame();
      brandPreloader?.finish();
    })();
  };

  if (document.readyState === "complete") {
    runReducedMotionExperience();
  } else {
    cleanup.on(window, "load", () => runReducedMotionExperience());
  }

  cleanup.on(window, "pageshow", (event) => {
    runReducedMotionExperience((event as PageTransitionEvent).persisted);
  });
}

if (import.meta.hot) {
  import.meta.hot.dispose(cleanup.run);
}

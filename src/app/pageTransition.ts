import barba from "@barba/core";
import type { CleanupRegistry } from "./dom";
import { optional, qsa } from "./dom";
import { gsap, ScrollTrigger } from "./gsapSetup";
import { renderPage2Container } from "./page2Page";

type PageTransitionOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
  onBeforeLeave?: (path: RoutePath) => void;
  onBeforeEnter?: (path: RoutePath, container: HTMLElement) => void;
  onBeforeNavigate?: (path: RoutePath, currentPath: RoutePath) => void;
  onRouteChange?: (path: RoutePath) => void;
};

type RoutePath = "/" | "/page2";

type PageTransitionSettings = {
  duration: number;
  oldY: number;
  nextY: number;
  darkOpacity: number;
  ease: string;
};

const defaultSettings: PageTransitionSettings = {
  duration: 0.9,
  oldY: -20,
  nextY: 100,
  darkOpacity: 0.5,
  ease: "expo.inOut"
};

const settings: PageTransitionSettings = {
  ...defaultSettings
};

function basePath() {
  const base = import.meta.env.BASE_URL || "/";
  return base === "/" ? "" : base.replace(/\/+$/, "");
}

function routeUrl(path: RoutePath) {
  const base = basePath();
  return path === "/" ? (base ? `${base}/` : "/") : `${base}/page2/`;
}

function normalizePath(path: string): RoutePath {
  const base = basePath();
  let cleanPath = path.split("?")[0]?.split("#")[0] || "/";
  cleanPath = cleanPath.replace(/\/+$/, "") || "/";

  if (base && cleanPath.startsWith(base)) {
    cleanPath = cleanPath.slice(base.length).replace(/\/+$/, "") || "/";
  }

  return cleanPath === "/page2" ? "/page2" : "/";
}

function clipPolygon(leftTop: number, rightTop: number) {
  return `polygon(0% ${leftTop}%, 100% ${rightTop}%, 100% 100%, 0% 100%)`;
}

const routeClipStart = clipPolygon(100, 40);
const routeClipMid = clipPolygon(60, 0);
const routeClipFull = clipPolygon(0, 0);
const routeClipHidden = clipPolygon(100, 100);
const routeClipFastDuration = 0.22;
const routeClipSlowDuration = 0.76;
const routeClipHoldDuration = 0.22;

function shapeHomeContainer(container: HTMLElement) {
  container.classList.add("route-page", "route-page-home");
  container.classList.remove("route-page2");
  container.dataset.routePage = "/";
  container.dataset.barbaNamespace = "home";
  syncRouteLinks(container);
}

function shapePage2Container(container: HTMLElement) {
  container.classList.add("route-page", "route-page2");
  container.classList.remove("route-page-home");
  container.dataset.routePage = "/page2";
  container.dataset.barbaNamespace = "page2";
  renderPage2Container(container);
  syncRouteLinks(container);
}

function shapeContainerForPath(container: HTMLElement, path: RoutePath) {
  if (path === "/page2") {
    shapePage2Container(container);
    return;
  }

  shapeHomeContainer(container);
}

function syncRouteLinks(root: ParentNode) {
  qsa<HTMLAnchorElement>(".brand, .inner-brand, [data-route-home]", root).forEach((link) => {
    link.href = routeUrl("/");
    link.dataset.routeHome = "";
  });
}

function ensureTransitionLayer() {
  let layer = optional<HTMLElement>("[data-transition-wrap]");

  if (!layer) {
    layer = document.createElement("div");
    layer.className = "page-transition-layer";

    const dark = document.createElement("div");
    dark.className = "page-transition-dark";
    layer.append(dark);
    document.body.append(layer);
  }

  layer.dataset.transitionWrap = "";

  let dark = optional<HTMLElement>("[data-transition-dark]", layer);

  if (!dark) {
    dark = document.createElement("div");
    dark.className = "page-transition-dark";
    layer.append(dark);
  }

  dark.dataset.transitionDark = "";

  let shutter = optional<HTMLElement>("[data-transition-shutter]", layer);

  if (!shutter) {
    shutter = document.createElement("div");
    shutter.className = "page-transition-shutter";
    layer.append(shutter);
  }

  shutter.dataset.transitionShutter = "";

  return {
    dark,
    layer,
    shutter
  };
}

function readNumber(root: ParentNode, id: string, fallback: number) {
  const input = optional<HTMLInputElement>(`#${id}`, root);
  const parsed = Number.parseFloat(input?.value ?? "");

  return Number.isFinite(parsed) ? parsed : fallback;
}

function writeOutput(root: ParentNode, id: string, value: string | number) {
  const output = optional<HTMLOutputElement>(`#${id}`, root);

  if (output) {
    output.value = String(value);
    output.textContent = String(value);
  }
}

function syncDebugOutputs(root: ParentNode) {
  writeOutput(root, "pageTransitionDurationOut", `${settings.duration.toFixed(2)}s`);
  writeOutput(root, "pageTransitionOldYOut", `${settings.oldY}vh`);
  writeOutput(root, "pageTransitionNextYOut", `${settings.nextY}vh`);
  writeOutput(root, "pageTransitionDarkOut", settings.darkOpacity.toFixed(2));
}

export function initPageTransition({
  cleanup,
  reduceMotion,
  onBeforeLeave,
  onBeforeEnter,
  onBeforeNavigate,
  onRouteChange
}: PageTransitionOptions) {
  const initialContainer = optional<HTMLElement>('[data-barba="container"]');

  if (!initialContainer) {
    throw new Error("Missing Barba page container");
  }

  const { dark, layer, shutter } = ensureTransitionLayer();
  let currentPath = normalizePath(window.location.pathname);

  shapeContainerForPath(initialContainer, currentPath);

  function cleanupPageStyles(page: HTMLElement) {
    gsap.set(page, {
      clearProps:
        "position,top,right,bottom,left,zIndex,transform,clipPath,-webkit-clip-path,willChange,opacity,visibility,pointerEvents"
    });
  }

  function cleanupLayer() {
    gsap.set(layer, { clearProps: "position,top,right,bottom,left,inset,zIndex" });
    gsap.set(dark, { autoAlpha: 0, clearProps: "position,top,right,bottom,left,inset,zIndex" });
    gsap.set(shutter, {
      autoAlpha: 0,
      clipPath: routeClipHidden,
      webkitClipPath: routeClipHidden,
      clearProps: "position,top,right,bottom,left,inset,zIndex,clip-path,-webkit-clip-path,willChange"
    });
    layer.style.pointerEvents = "none";
  }

  function resetPage(page: HTMLElement) {
    window.scrollTo(0, 0);
    cleanupPageStyles(page);
  }

  function settleRoute(path: RoutePath, page: HTMLElement) {
    currentPath = path;
    resetPage(page);
    document.documentElement.classList.remove("rk-is-transitioning");
    gsap.set(dark, { autoAlpha: 0 });
    cleanupLayer();
    ScrollTrigger.refresh();
    onRouteChange?.(path);
  }

  function runPageLeaveAnimation(current: HTMLElement, onLeaveComplete?: () => void) {
    const timeline = gsap.timeline({
      defaults: {
        ease: settings.ease
      },
      onComplete: () => {
        onLeaveComplete?.();
        current.remove();
      }
    });

    if (reduceMotion) {
      timeline.set(current, { autoAlpha: 0 });
      return timeline;
    }

    const duration = Math.max(0.05, settings.duration);

    document.documentElement.classList.add("rk-is-transitioning");

    timeline.set(current, { position: "relative", zIndex: 1, pointerEvents: "none", willChange: "transform" }, 0);
    timeline.set(layer, { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2 }, 0);
    timeline.set(shutter, { autoAlpha: 0, clipPath: routeClipHidden, webkitClipPath: routeClipHidden }, 0);
    timeline.fromTo(
      dark,
      { autoAlpha: 0 },
      { autoAlpha: settings.darkOpacity, duration, ease: settings.ease },
      0
    );
    timeline.fromTo(
      current,
      { y: "0vh", force3D: false },
      { y: `${settings.oldY}vh`, duration, ease: settings.ease, force3D: false },
      0
    );
    timeline.set(dark, { autoAlpha: 0 }, duration);

    return timeline;
  }

  function runPageEnterAnimation(next: HTMLElement) {
    const timeline = gsap.timeline({
      defaults: {
        ease: settings.ease
      }
    });

    if (reduceMotion) {
      timeline.set(next, { autoAlpha: 1 });
      timeline.call(() => resetPage(next), undefined, 0);
      return timeline;
    }

    const duration = Math.max(0.05, settings.duration);

    timeline.add("startEnter", 0);
    timeline.set(
      next,
      {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3,
        autoAlpha: 1,
        pointerEvents: "none",
        willChange: "clip-path",
        clipPath: routeClipStart,
        webkitClipPath: routeClipStart,
        force3D: false
      },
      "startEnter"
    );
    timeline.fromTo(
      next,
      { y: `${settings.nextY}vh`, force3D: false },
      { y: "0vh", duration, clearProps: "transform", ease: settings.ease, force3D: false },
      "startEnter"
    );
    timeline.to(
      next,
      { clipPath: routeClipMid, webkitClipPath: routeClipMid, duration: routeClipFastDuration, ease: settings.ease },
      "startEnter"
    );
    timeline.to(
      next,
      {
        clipPath: routeClipFull,
        webkitClipPath: routeClipFull,
        duration: routeClipSlowDuration,
        ease: settings.ease
      },
      `startEnter+=${routeClipFastDuration}`
    );
    timeline.to(
      next,
      {
        clipPath: routeClipFull,
        webkitClipPath: routeClipFull,
        duration: routeClipHoldDuration,
        ease: settings.ease
      },
      `startEnter+=${routeClipFastDuration + routeClipSlowDuration}`
    );
    timeline.call(() => {
      gsap.set(next, { clearProps: "will-change,clip-path,-webkit-clip-path" });
      resetPage(next);
    });

    return timeline;
  }

  function getRouteLinkTarget(eventTarget: EventTarget | null): RoutePath | null {
    if (!(eventTarget instanceof Element)) {
      return null;
    }

    if (eventTarget.closest(".debug-dock")) {
      return null;
    }

    if (
      eventTarget.closest(
        "[data-benefits-prev], [data-benefits-next], [data-success-prev], [data-success-next], [data-mines-prev], [data-mines-next], [data-vacancy-tab], .mines-country"
      )
    ) {
      return null;
    }

    const homeLink = eventTarget.closest<HTMLElement>(".brand, .inner-brand, [data-route-home]");
    if (homeLink) {
      return "/";
    }

    const trigger = eventTarget.closest<HTMLElement>(
      ".job-btn, .links button, .career button, .lang, .nav-compact-left button, .nav-compact-right button, .inner-job-btn, .inner-menu, .inner-career, .inner-icon-btn, .search button, .tab-hot, .success-tab, .mines-vacancy, [data-route-page2]"
    );

    if (!trigger) {
      return null;
    }

    if (trigger instanceof HTMLAnchorElement && trigger.href.startsWith("tel:")) {
      return null;
    }

    return "/page2";
  }

  function goTo(path: RoutePath) {
    if (path === currentPath || document.documentElement.classList.contains("rk-is-transitioning")) {
      return;
    }

    void barba.go(routeUrl(path));
  }

  function replay() {
    goTo(currentPath === "/page2" ? "/" : "/page2");
  }

  function bindDebugPanel() {
    const form = optional<HTMLFormElement>("#pageTransitionDebugForm");
    const replayButton = optional<HTMLButtonElement>("#pageTransitionReplay");
    const applyButton = optional<HTMLButtonElement>("#pageTransitionApply");

    if (!form) {
      return;
    }

    const apply = () => {
      settings.duration = readNumber(form, "pageTransitionDuration", defaultSettings.duration);
      settings.oldY = readNumber(form, "pageTransitionOldY", defaultSettings.oldY);
      settings.nextY = readNumber(form, "pageTransitionNextY", defaultSettings.nextY);
      settings.darkOpacity = readNumber(form, "pageTransitionDark", defaultSettings.darkOpacity);
      settings.ease = optional<HTMLSelectElement>("#pageTransitionEase", form)?.value || defaultSettings.ease;
      syncDebugOutputs(form);
    };

    cleanup.on(form, "input", apply);
    cleanup.on(form, "change", apply);
    cleanup.on(applyButton ?? form, "click", (event) => {
      if (event.target === applyButton) {
        apply();
      }
    });
    if (replayButton) {
      cleanup.on(replayButton, "click", () => {
        apply();
        replay();
      });
    }

    apply();
  }

  barba.hooks.beforeEnter((data) => {
    const next = data.next.container as HTMLElement;
    const path = normalizePath(data.next.url.path);

    shapeContainerForPath(next, path);
    onBeforeEnter?.(path, next);

    if (!reduceMotion) {
      gsap.set(next, { position: "fixed", top: 0, left: 0, right: 0, bottom: 0 });
    }
  });

  barba.hooks.afterEnter((data) => {
    const next = data.next.container as HTMLElement;
    const path = normalizePath(data.next.url.path);

    settleRoute(path, next);
  });

  barba.init({
    debug: true,
    timeout: 7000,
    preventRunning: true,
    transitions: [
      {
        name: "default",
        sync: true,
        once(data) {
          const next = data.next.container as HTMLElement;
          const path = normalizePath(window.location.pathname);

          shapeContainerForPath(next, path);
          settleRoute(path, next);
        },
        leave(data) {
          const leavingPath = currentPath;
          const nextPath = normalizePath(data.next.url.path);

          onBeforeNavigate?.(nextPath, leavingPath);

          return runPageLeaveAnimation(data.current.container as HTMLElement, () => {
            onBeforeLeave?.(leavingPath);
          });
        },
        enter(data) {
          return runPageEnterAnimation(data.next.container as HTMLElement);
        }
      }
    ]
  });

  cleanup.on(document, "click", (event) => {
    if (event.defaultPrevented) {
      return;
    }

    const path = getRouteLinkTarget(event.target);

    if (!path) {
      return;
    }

    event.preventDefault();
    goTo(path);
  });

  cleanup.on(document, "submit", (event) => {
    if (!(event.target instanceof HTMLFormElement) || !event.target.matches(".search")) {
      return;
    }

    event.preventDefault();
    goTo("/page2");
  });

  cleanup.add(() => barba.destroy());
  bindDebugPanel();

  return {
    getCurrentPath: () => currentPath,
    goTo,
    replay
  };
}

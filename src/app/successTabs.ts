import { optional, qsa, type CleanupRegistry } from "./dom";
import { gsap, SplitText } from "./gsapSetup";
import { renderPixelatedBrandText } from "./pixelation";
import { successSection } from "./content";
import {
  getSuccessCopyEnterFromVars,
  getSuccessCopyEnterToVars,
  readSuccessCopyMotionSettings
} from "./successCopyMotion";

type SuccessTabsOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
};

const lineBaseWidth = 148;
const copyLineClass = "motion-text-line";

type SuccessSlide = (typeof successSection.slides)[number];

const visualMotion = {
  enterDelay: 0.06,
  enterDuration: 0.74,
  enterEase: "power3.out",
  enterScale: 1.024,
  exitDuration: 0.52,
  exitEase: "sine.out",
  exitScale: 1.008
};

function getLineWidth(tab: HTMLElement) {
  return Math.min(lineBaseWidth, Math.max(60, tab.offsetWidth - 36));
}

function createLineBreakFragment(lines: string[]) {
  const fragment = document.createDocumentFragment();

  lines.forEach((line, index) => {
    if (index > 0) {
      fragment.append(document.createElement("br"));
    }

    fragment.append(document.createTextNode(line));
  });

  return fragment;
}

function renderCopyTitle(target: HTMLElement, lines: string[]) {
  target.replaceChildren(createLineBreakFragment(lines));
}

function ensureSuccessVisuals(section: HTMLElement, slides: SuccessSlide[]) {
  const baseVisual = optional<HTMLImageElement>(".success-bg-base", section);
  const createdVisuals: HTMLImageElement[] = [];

  if (!baseVisual || slides.length === 0) {
    return { createdVisuals, visuals: [] as HTMLImageElement[] };
  }

  baseVisual.classList.add("success-bg-visual", "is-active");
  baseVisual.dataset.successVisual = "0";
  baseVisual.src = slides[0].image;

  let visuals = qsa<HTMLImageElement>("[data-success-visual]", section);
  let anchor = visuals[visuals.length - 1] ?? baseVisual;

  for (let index = visuals.length; index < slides.length; index += 1) {
    const clone = baseVisual.cloneNode(true) as HTMLImageElement;
    clone.classList.remove("is-active");
    clone.dataset.successVisual = String(index);
    clone.src = slides[index].image;
    clone.removeAttribute("id");
    anchor.after(clone);
    anchor = clone;
    createdVisuals.push(clone);
  }

  visuals = qsa<HTMLImageElement>("[data-success-visual]", section);
  visuals.forEach((visual, index) => {
    visual.src = slides[index]?.image ?? slides[0].image;
    gsap.set(visual, { autoAlpha: index === 0 ? 1 : 0, scale: 1, zIndex: index === 0 ? 1 : 0 });
    visual.classList.toggle("is-active", index === 0);
  });

  return { createdVisuals, visuals };
}

function ensureLineElement(root: HTMLElement) {
  const children = Array.from(root.children);
  const firstLine = children.find((child): child is HTMLSpanElement => child.tagName === "SPAN");

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

export function initSuccessTabs({ cleanup, reduceMotion }: SuccessTabsOptions) {
  const section = optional<HTMLElement>(".success-section");

  if (!section) {
    return;
  }

  const tabRoot = optional<HTMLElement>(".success-tabs", section);
  const lineRoot = optional<HTMLElement>(".success-tab-line", section);
  const copyIcon = optional<HTMLImageElement>(".success-copy-head img", section);
  const copyTitle = optional<HTMLElement>(".success-copy h3", section);
  const copyText = optional<HTMLElement>(".success-copy p", section);
  const successStar = optional<HTMLElement>(".success-star-frame", section);
  const slides = successSection.slides;

  if (!tabRoot || !lineRoot) {
    return;
  }

  const tabContainer = tabRoot;
  const lineEl = ensureLineElement(lineRoot);
  const tabs = qsa<HTMLElement>(".success-tab", tabContainer);
  const imageTabs = qsa<HTMLElement>("[data-success-tab]", tabContainer);

  lineRoot.removeAttribute("data-reveal");
  lineRoot.removeAttribute("data-reveal-trigger");
  delete lineRoot.dataset.revealReady;
  gsap.set(lineRoot, { clearProps: "opacity,transform,visibility,willChange" });
  if (tabs.length === 0 || imageTabs.length === 0 || slides.length === 0) {
    return;
  }

  const { createdVisuals, visuals } = ensureSuccessVisuals(section, slides);
  let currentIndex = Math.max(0, imageTabs.findIndex((tab) => tab.classList.contains("is-active")));
  let copyTimeline: gsap.core.Timeline | undefined;
  let activeCopyParts: HTMLElement[] = [];
  let activeCopySplits: SplitText[] = [];
  let starTween: gsap.core.Tween | undefined;
  let visualTimeline: gsap.core.Timeline | undefined;
  let lineTween: gsap.core.Tween | undefined;

  if (currentIndex >= slides.length) {
    currentIndex = 0;
  }
  let starRotation = 0;

  function renderSlideCopy(next: number) {
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
    return [copyIcon, copyTitle, copyText].filter((target): target is HTMLElement | HTMLImageElement =>
      Boolean(target)
    );
  }

  function getCopyTextTargets() {
    return [copyTitle, copyText].filter((target): target is HTMLElement => Boolean(target));
  }

  function clearCopyMotionArtifacts(targets: Array<HTMLElement | HTMLImageElement> = getCopyMotionTargets()) {
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
    const lineTargets: HTMLElement[] = [];

    getCopyTextTargets().forEach((target) => {
      const split = SplitText.create(target, {
        aria: "auto",
        linesClass: copyLineClass,
        tag: "span",
        type: "lines"
      });

      activeCopySplits.push(split);
      lineTargets.push(...(split.lines as HTMLElement[]));
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

  function animateSlideCopy(next: number, animated = true) {
    disposeCopyMotion();
    const copyTargets = getCopyMotionTargets();

    if (reduceMotion || !animated || copyTargets.length === 0) {
      renderSlideCopy(next);
      clearCopyMotionArtifacts(copyTargets);
      return;
    }

    const settings = readSuccessCopyMotionSettings();

    gsap.set(copyTargets, { autoAlpha: 0 });
    renderSlideCopy(next);
    const lineTargets = createCopyLineTargets();
    const enterTargets = [copyIcon, ...lineTargets].filter((target): target is HTMLElement | HTMLImageElement =>
      Boolean(target)
    );
    const textTargets = getCopyTextTargets();

    gsap.set(textTargets, {
      autoAlpha: 1,
      perspective: settings.enter.perspective,
      transformStyle: "preserve-3d"
    });
    gsap.set(enterTargets, getSuccessCopyEnterFromVars(settings));

    copyTimeline = gsap.timeline({
      onComplete: () => {
        clearCopyMotionArtifacts(enterTargets);
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
    if (!successStar) {
      return;
    }

    starRotation += 90;
    starTween?.kill();

    if (reduceMotion || !animated) {
      gsap.set(successStar, { rotation: starRotation, transformOrigin: "50% 50%", willChange: "" });
      return;
    }

    starTween = gsap.to(successStar, {
      rotation: starRotation,
      duration: 0.28,
      ease: "power3.out",
      overwrite: true,
      transformOrigin: "50% 50%",
      onStart: () => {
        successStar.style.willChange = "transform";
      },
      onComplete: () => {
        successStar.style.willChange = "";
        starTween = undefined;
      }
    });
  }

  function showVisual(next: number, previous: number, animated = true) {
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
      gsap.set(visuals, { autoAlpha: (index: number) => (index === next ? 1 : 0), scale: 1, zIndex: 0 });
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

  function moveLine(tab: HTMLElement, animated = true) {
    const tabRect = tab.getBoundingClientRect();
    const rootRect = tabContainer.getBoundingClientRect();
    const width = getLineWidth(tab);
    const x = tabRect.left - rootRect.left + (tabRect.width - width) / 2;
    const duration = animated && !reduceMotion ? 0.32 : 0;

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
      ease: "power3.out",
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

  function showImageTab(next: number, animated = true) {
    const tab = imageTabs[next];

    if (!tab) {
      return;
    }

    if (next === currentIndex) {
      moveLine(tab, animated);
      return;
    }

    const previousIndex = currentIndex;
    currentIndex = next;
    tabs.forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    animateSlideCopy(next, animated);
    showVisual(next, previousIndex, animated);
    moveLine(tab, animated);
  }

  imageTabs.forEach((tab, tabIndex) => {
    const activateTab = () => showImageTab(tabIndex);

    cleanup.on(tab, "pointerenter", activateTab);
    cleanup.on(tab, "focus", activateTab);
  });

  imageTabs.forEach((tab) => {
    cleanup.on(tab, "pointerenter", () => rotateSuccessStar());
  });

  renderSlideCopy(currentIndex);
  clearCopyMotionArtifacts();
  if (successStar) {
    gsap.set(successStar, { rotation: starRotation, transformOrigin: "50% 50%" });
  }
  showVisual(currentIndex, currentIndex, false);
  moveLine(imageTabs[currentIndex], false);

  cleanup.on(window, "resize", () => showImageTab(currentIndex, false));
  cleanup.add(() => {
    disposeCopyMotion();
    starTween?.kill();
    visualTimeline?.kill();
    lineTween?.kill();
    const killTargets = [lineEl, successStar, ...visuals].filter(
      (target): target is HTMLElement | HTMLImageElement => Boolean(target)
    );
    gsap.killTweensOf(killTargets);
    gsap.set([lineEl, ...visuals], { clearProps: "all" });
    if (successStar) {
      gsap.set(successStar, { clearProps: "transform,transformOrigin,willChange" });
    }
    createdVisuals.forEach((visual) => visual.remove());
  });
}

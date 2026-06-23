import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import "./styles.css";

type RevealTarget = HTMLElement & {
  dataset: DOMStringMap;
};

const revealMotion = {
  delay: 0,
  duration: 1,
  ease: "power4.out",
  fromOpacity: 0,
  fromRotateX: -90,
  perspective: 600,
  groupStagger: 0.03,
  textStagger: 0.1,
  start: "top 90%",
  end: "bottom top",
  transformOrigin: "50% 0%",
  yPercent: 120
};

const blockMotion = {
  delay: 0,
  duration: 1,
  ease: "power4.out",
  fromOpacity: 1,
  fromRotateX: -20,
  fromScale: 0.9,
  perspective: 600,
  start: "top 100%",
  end: "bottom top",
  transformOrigin: "50% 0%",
  yPercent: 15
};

const minesScrollMotion = {
  mediaScrollFactor: 0.35,
  start: "top bottom",
  end: "bottom top",
  scrub: true
};

gsap.registerPlugin(ScrollTrigger, SplitText);
document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function qsa<T extends Element>(selector: string, root: ParentNode = document) {
  return Array.from(root.querySelectorAll<T>(selector));
}

function initSmoothScroll() {
  const lenis = new Lenis({
    autoRaf: false,
    duration: 1.05,
    lerp: 0.12
  });
  const raf = (time: number) => lenis.raf(time * 1000);

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(raf);
  ScrollTrigger.addEventListener("refresh", () => lenis.resize());
}

function setRevealReady(target: RevealTarget) {
  target.dataset.revealReady = "true";
}

function revealText(target: RevealTarget) {
  const previousVisibility = target.style.visibility;

  target.style.visibility = "hidden";

  const split = SplitText.create(target, {
    aria: "auto",
    linesClass: "motion-text-line",
    tag: "span",
    type: "lines"
  });
  const parts = split.lines as HTMLElement[];

  target.style.visibility = previousVisibility;

  gsap.set(target, {
    perspective: revealMotion.perspective,
    transformStyle: "preserve-3d"
  });
  gsap.set(parts, {
    opacity: revealMotion.fromOpacity,
    rotationX: revealMotion.fromRotateX,
    transformOrigin: revealMotion.transformOrigin,
    willChange: "transform, opacity",
    yPercent: revealMotion.yPercent
  });
  setRevealReady(target);

  const tween = gsap.fromTo(parts, {
    opacity: revealMotion.fromOpacity,
    rotationX: revealMotion.fromRotateX,
    transformOrigin: revealMotion.transformOrigin,
    willChange: "transform, opacity",
    yPercent: revealMotion.yPercent
  }, {
    clearProps: "transform,transformOrigin,opacity,willChange",
    delay: revealMotion.delay,
    duration: revealMotion.duration,
    ease: revealMotion.ease,
    opacity: 1,
    rotationX: 0,
    stagger: { each: revealMotion.textStagger, from: "start" },
    yPercent: 0
  });
  tween.pause(0);

  ScrollTrigger.create({
    trigger: target,
    start: revealMotion.start,
    end: revealMotion.end,
    once: true,
    onEnter: () => tween.restart(true)
  });
}

function revealElement(target: RevealTarget, delay = revealMotion.delay) {
  gsap.set(target, {
    autoAlpha: revealMotion.fromOpacity,
    rotationX: revealMotion.fromRotateX,
    transformOrigin: revealMotion.transformOrigin,
    transformPerspective: revealMotion.perspective,
    transformStyle: "preserve-3d",
    willChange: "transform, opacity",
    y: Math.round(revealMotion.yPercent * 0.25)
  });
  setRevealReady(target);

  const tween = gsap.to(target, {
    autoAlpha: 1,
    clearProps: "transform,transformOrigin,transformStyle,transformPerspective,opacity,visibility,willChange",
    delay,
    duration: revealMotion.duration,
    ease: revealMotion.ease,
    rotationX: 0,
    y: 0
  });
  tween.pause(0);

  ScrollTrigger.create({
    trigger: target.closest("[data-reveal-card]") ?? target,
    start: revealMotion.start,
    end: revealMotion.end,
    once: true,
    onEnter: () => tween.restart(true)
  });
}

function revealGroup(group: RevealTarget) {
  const items = qsa<RevealTarget>("[data-reveal-item]", group);
  const targets = items.length > 0 ? items : qsa<RevealTarget>(":scope > *", group);
  const timeline = gsap.timeline({ paused: true });

  targets.forEach((target, index) => {
    const at = revealMotion.groupStagger * 2 * index;

    gsap.set(target, {
      autoAlpha: revealMotion.fromOpacity,
      rotationX: revealMotion.fromRotateX,
      transformOrigin: revealMotion.transformOrigin,
      transformPerspective: revealMotion.perspective,
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
      y: Math.round(revealMotion.yPercent * 0.25)
    });
    setRevealReady(target);
    timeline.to(
      target,
      {
        autoAlpha: 1,
        clearProps: "transform,transformOrigin,transformStyle,transformPerspective,opacity,visibility,willChange",
        duration: revealMotion.duration,
        ease: revealMotion.ease,
        rotationX: 0,
        y: 0
      },
      at
    );
  });

  setRevealReady(group);
  ScrollTrigger.create({
    trigger: group,
    start: revealMotion.start,
    end: revealMotion.end,
    once: true,
    onEnter: () => timeline.restart(true)
  });
}

function initRevealMotion() {
  qsa<RevealTarget>("[data-reveal='text']").forEach(revealText);
  qsa<RevealTarget>("[data-reveal='element']").forEach((target) => revealElement(target));
  qsa<RevealTarget>("[data-reveal='group']").forEach(revealGroup);
}

function initBlockMotion() {
  qsa<RevealTarget>("[data-block-motion]").forEach((target, index) => {
    gsap.set(target, {
      autoAlpha: blockMotion.fromOpacity,
      rotationX: blockMotion.fromRotateX,
      scale: blockMotion.fromScale,
      transformOrigin: blockMotion.transformOrigin,
      transformPerspective: blockMotion.perspective,
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
      yPercent: blockMotion.yPercent
    });

    const timeline = gsap.timeline({ paused: true }).to(target, {
      autoAlpha: 1,
      clearProps: "transform,transformOrigin,transformStyle,transformPerspective,opacity,visibility,willChange",
      delay: blockMotion.delay,
      duration: blockMotion.duration,
      ease: blockMotion.ease,
      rotationX: 0,
      scale: 1,
      yPercent: 0
    });

    ScrollTrigger.create({
      trigger: target,
      start: blockMotion.start,
      end: blockMotion.end,
      refreshPriority: index,
      once: true,
      onEnter: () => timeline.restart(true)
    });
  });
}

function initParallaxBlocks() {
  qsa<HTMLElement>("[data-parallax-block]").forEach((section) => {
    const plane = section.querySelector<HTMLElement>(".scroll-plane");

    if (!plane) {
      return;
    }

    gsap.fromTo(
      plane,
      {
        y: () => -(section.offsetHeight + window.innerHeight) * (1 - minesScrollMotion.mediaScrollFactor) * 0.28
      },
      {
        y: 0,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: section,
          start: minesScrollMotion.start,
          end: minesScrollMotion.end,
          scrub: minesScrollMotion.scrub,
          invalidateOnRefresh: true
        }
      }
    );
  });
}

async function boot() {
  if ("fonts" in document) {
    await document.fonts.ready.catch(() => undefined);
  }

  if (reduceMotion) {
    document.documentElement.classList.add("no-motion");
    qsa<RevealTarget>("[data-reveal], [data-reveal-item]").forEach(setRevealReady);
    document.documentElement.classList.remove("is-booting");
    return;
  }

  initSmoothScroll();
  initRevealMotion();
  initBlockMotion();
  initParallaxBlocks();
  ScrollTrigger.refresh();
  document.documentElement.classList.remove("is-booting");
}

void boot();

import { optional, type CleanupRegistry } from "./dom";
import { gsap } from "./gsapSetup";

type MinesBackgroundMotionOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
  root?: ParentNode;
};

const heroMediaScrollFactor = 0.35;

function getBackgroundTravel(section: HTMLElement, background: HTMLElement) {
  const availableHeight = background.offsetHeight + background.offsetTop - section.clientHeight;

  return Math.max(0, availableHeight);
}

function getSlowScrollTravel(section: HTMLElement, background: HTMLElement) {
  const sectionScrollDistance = section.offsetHeight + window.innerHeight;
  const targetTravel = sectionScrollDistance * (1 - heroMediaScrollFactor);

  return Math.min(getBackgroundTravel(section, background), targetTravel);
}

export function initMinesBackgroundMotion({ cleanup, reduceMotion, root = document }: MinesBackgroundMotionOptions) {
  const section = optional<HTMLElement>(".mines-section", root);
  const background = section ? optional<HTMLElement>(".mines-bg", section) : undefined;

  if (!section || !background) {
    return;
  }

  if (reduceMotion) {
    gsap.set(background, { clearProps: "transform,willChange" });
    return;
  }

  gsap.set(background, { willChange: "transform" });

  const tween = gsap.fromTo(
    background,
    {
      y: () => -getSlowScrollTravel(section, background)
    },
    {
      y: 0,
      ease: "none",
      force3D: true,
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      }
    }
  );

  cleanup.add(() => {
    tween.kill();
    gsap.set(background, { clearProps: "transform,willChange" });
  });
}

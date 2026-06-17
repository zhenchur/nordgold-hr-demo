import { optional, qs, type CleanupRegistry } from "./dom";
import { gsap, ScrollTrigger } from "./gsapSetup";

type InnerNavOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
  root?: ParentNode;
};

export function initInnerNavReveal({ cleanup, reduceMotion, root = document }: InnerNavOptions) {
  const hero = qs<HTMLElement>(".hero", root);
  const innerNav = optional<HTMLElement>(".inner-nav", root);

  if (!innerNav) {
    return;
  }

  const nav = innerNav;
  let isVisible = false;
  let isHeroMaskClosed = hero.dataset.maskClosed === "true";
  let isPinnedVisible = false;

  function hiddenY() {
    const top = Number.parseFloat(window.getComputedStyle(nav).top) || 0;
    return -(nav.offsetHeight + top + 20);
  }

  function shouldShowNav() {
    return isPinnedVisible || isHeroMaskClosed;
  }

  function setVisible(visible: boolean, force = false) {
    if (!force && visible === isVisible) {
      return;
    }

    isVisible = visible;

    gsap.to(nav, {
      autoAlpha: visible ? 1 : 0,
      duration: reduceMotion ? 0 : 0.28,
      ease: "power2.out",
      overwrite: true,
      pointerEvents: visible ? "auto" : "none",
      y: visible ? 0 : hiddenY()
    });
  }

  const setHeroMaskState = (closed: boolean) => {
    isHeroMaskClosed = closed;
    setVisible(shouldShowNav());
  };

  const setPinnedVisible = (visible: boolean) => {
    isPinnedVisible = visible;
    setVisible(shouldShowNav(), true);
  };

  gsap.set(nav, {
    autoAlpha: 0,
    pointerEvents: "none",
    y: hiddenY()
  });

  cleanup.addKillable(ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: () => ScrollTrigger.maxScroll(window) + 1,
    invalidateOnRefresh: true,
    onUpdate: () => setVisible(shouldShowNav()),
    onLeave: () => setVisible(shouldShowNav()),
    onLeaveBack: () => {
      isPinnedVisible = false;
      setVisible(false);
    },
    onRefresh: () => setVisible(shouldShowNav(), true)
  }));

  return {
    setHeroMaskState,
    setPinnedVisible
  };
}

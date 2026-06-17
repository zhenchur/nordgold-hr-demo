import Lenis from "lenis";
import type { CleanupRegistry } from "./dom";
import { gsap, ScrollTrigger } from "./gsapSetup";

export function initScroll(cleanup: CleanupRegistry) {
  const lenis = new Lenis({
    autoRaf: false,
    duration: 1.05,
    lerp: 0.12
  });
  const raf = (time: number) => lenis.raf(time * 1000);
  const resizeLenis = () => lenis.resize();

  lenis.on("scroll", ScrollTrigger.update);
  ScrollTrigger.addEventListener("refresh", resizeLenis);
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(raf);

  cleanup.add(() => {
    ScrollTrigger.removeEventListener("refresh", resizeLenis);
    gsap.ticker.remove(raf);
    lenis.destroy();
  });
}

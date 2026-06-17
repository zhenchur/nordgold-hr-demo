import { vacancyTabs } from "./content";
import { optional, qsa, type CleanupRegistry } from "./dom";
import { gsap } from "./gsapSetup";
import heroShiftImage from "../assets/hero-vacancy-shift.png";
import heroInternshipImage from "../assets/hero-vacancy-internship.png";
import heroOfficeImage from "../assets/hero-vacancy-office.png";
import heroWomenImage from "../assets/hero-vacancy-women.png";

type VacancyTabsOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
};

type HeroVisual = {
  slug: string;
  image: string;
};

const lineBaseWidth = 148;

const heroVisuals: HeroVisual[] = [
  {
    slug: "shift",
    image: heroShiftImage
  },
  {
    slug: "internship",
    image: heroInternshipImage
  },
  {
    slug: "office",
    image: heroOfficeImage
  },
  {
    slug: "women",
    image: heroWomenImage
  }
];

const mediaMotion = {
  enterDelay: 0.06,
  enterDuration: 0.74,
  enterEase: "power3.out",
  enterScale: 1.024,
  exitDuration: 0.52,
  exitEase: "sine.out",
  exitScale: 1.008
};

function createImage(src: string, className: string) {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.alt = "";
  image.draggable = false;
  return image;
}

function createHeroVisual(config: HeroVisual, index: number) {
  const root = document.createElement("div");
  root.className = `hero-visual hero-visual--${config.slug}${index === 0 ? " is-active" : ""}`;
  root.dataset.heroGeneratedVisual = "";
  root.dataset.vacancyVisual = String(index);
  root.append(createImage(config.image, "hero-visual-image"));
  return root;
}

function ensureVisualRoot(media: HTMLElement) {
  const existing = optional<HTMLElement>("[data-hero-visuals]", media);

  if (existing) {
    return existing;
  }

  const root = document.createElement("div");
  root.className = "hero-visuals";
  root.dataset.heroVisuals = "";
  root.setAttribute("aria-hidden", "true");
  media.prepend(root);
  return root;
}

function ensureHeroVisuals(media: HTMLElement) {
  const root = ensureVisualRoot(media);

  qsa<HTMLElement>(".bg, .worker-promo", media).forEach((node) => node.remove());
  root.replaceChildren(...heroVisuals.map(createHeroVisual));

  const visuals = qsa<HTMLElement>("[data-vacancy-visual]", root);
  visuals.forEach((visual, index) => {
    gsap.set(visual, {
      autoAlpha: index === 0 ? 1 : 0,
      zIndex: index === 0 ? 1 : 0
    });
  });

  return visuals;
}

function createTab(tab: (typeof vacancyTabs)[number], tabIndex: number) {
  const link = document.createElement("button");
  const label = document.createElement("span");
  const count = document.createElement("small");

  link.className = `tab${tabIndex === 0 ? " is-active" : ""}${tab.hot ? " tab-hot" : ""}`;
  link.type = "button";
  link.dataset.reveal = "element";
  link.dataset.revealTrigger = "manual";
  link.dataset.revealScope = "hero";
  link.dataset.revealSequence = "hero-ui";
  link.dataset.revealAfter = "hero-title";
  label.textContent = tab.label;
  count.textContent = `(${tab.count})`;

  if (typeof tab.visualIndex === "number") {
    link.dataset.vacancyTab = String(tab.visualIndex);
  } else {
    link.dataset.vacancyCta = "all";
  }

  link.append(label, count);
  return link;
}

function getLineWidth(tab: HTMLElement) {
  return Math.min(lineBaseWidth, Math.max(60, tab.offsetWidth - 36));
}

export function initVacancyTabs({ cleanup, reduceMotion }: VacancyTabsOptions) {
  const vac = optional<HTMLElement>("#vacancies");
  const bar = optional<HTMLElement>("[data-vacancy-bar]");
  const media = optional<HTMLElement>("#media");

  if (!vac || !bar || !media) {
    return;
  }

  const barEl = bar;
  const visuals = ensureHeroVisuals(media);

  qsa<HTMLElement>(".tab", vac).forEach((tab) => tab.remove());
  vacancyTabs.forEach((tab, tabIndex) => {
    vac.insertBefore(createTab(tab, tabIndex), bar);
  });

  const tabs = qsa<HTMLElement>(".tab", vac);
  const imageTabs = qsa<HTMLElement>("[data-vacancy-tab]", vac);
  let currentIndex = 0;
  let visibleVisualIndex = 0;
  let visualTimeline: gsap.core.Timeline | undefined;
  let barTween: gsap.core.Tween | undefined;

  if (imageTabs.length === 0) {
    return;
  }

  function showVisual(next: number, previous: number, animated = true) {
    const incoming = visuals[next];
    const outgoing = visuals[previous];

    if (!incoming) {
      return;
    }

    visualTimeline?.kill();

    visuals.forEach((visual, visualIndex) => {
      visual.classList.toggle("is-active", visualIndex === next);

      if (visualIndex !== next && visualIndex !== previous) {
        gsap.set(visual, { autoAlpha: 0, scale: 1, zIndex: 0 });
      }
    });

    if (!animated || next === previous) {
      gsap.set(visuals, {
        autoAlpha: (visualIndex: number) => (visualIndex === next ? 1 : 0),
        scale: 1,
        zIndex: 0
      });
      gsap.set(incoming, { zIndex: 1 });
      return;
    }

    gsap.killTweensOf([incoming, outgoing].filter((visual): visual is HTMLElement => Boolean(visual)));
    gsap.set(incoming, {
      autoAlpha: 0,
      scale: mediaMotion.enterScale,
      transformOrigin: "50% 50%",
      willChange: "transform, opacity",
      zIndex: 2
    });

    if (outgoing) {
      gsap.set(outgoing, {
        autoAlpha: 1,
        scale: 1,
        transformOrigin: "50% 50%",
        willChange: "transform, opacity",
        zIndex: 1
      });
    }

    visualTimeline = gsap.timeline({
      onComplete: () => {
        visuals.forEach((visual, visualIndex) => {
          gsap.set(visual, {
            autoAlpha: visualIndex === next ? 1 : 0,
            scale: 1,
            willChange: "",
            zIndex: visualIndex === next ? 1 : 0
          });
        });
      }
    });

    if (outgoing) {
      visualTimeline.to(
        outgoing,
        {
          autoAlpha: 0,
          scale: mediaMotion.exitScale,
          duration: mediaMotion.exitDuration,
          ease: mediaMotion.exitEase,
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
        duration: mediaMotion.enterDuration,
        ease: mediaMotion.enterEase,
        force3D: true,
        overwrite: "auto"
      },
      mediaMotion.enterDelay
    );
  }

  function moveBar(tab: HTMLElement, animated = true) {
    const width = getLineWidth(tab);
    const x = tab.offsetLeft + (tab.offsetWidth - width) / 2;
    const duration = animated && !reduceMotion ? 0.32 : 0;

    barTween?.kill();

    if (duration === 0) {
      gsap.set(barEl, {
        autoAlpha: 1,
        x,
        scaleX: width / lineBaseWidth,
        transformOrigin: "left center",
        willChange: ""
      });
      return;
    }

    barTween = gsap.to(barEl, {
      autoAlpha: 1,
      x,
      scaleX: width / lineBaseWidth,
      duration,
      ease: "power3.out",
      overwrite: true,
      transformOrigin: "left center",
      onStart: () => {
        barEl.style.willChange = "transform";
      },
      onComplete: () => {
        barEl.style.willChange = "";
        barTween = undefined;
      }
    });
  }

  function showImageTab(next: number, animated = true) {
    const tab = imageTabs[next];

    if (!tab) {
      return;
    }

    const shouldAnimate = animated && next !== visibleVisualIndex;

    currentIndex = next;
    tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    moveBar(tab, animated);

    if (next === visibleVisualIndex) {
      return;
    }

    const previousIndex = visibleVisualIndex;
    visibleVisualIndex = next;
    showVisual(next, previousIndex, shouldAnimate);
  }

  imageTabs.forEach((tab, tabIndex) => {
    const activateTab = () => showImageTab(tabIndex);

    cleanup.on(tab, "pointerenter", activateTab);
    cleanup.on(tab, "focus", activateTab);
  });

  moveBar(imageTabs[currentIndex], false);
  cleanup.on(window, "resize", () => moveBar(imageTabs[currentIndex], false));
  cleanup.add(() => {
    visualTimeline?.kill();
    barTween?.kill();
    gsap.killTweensOf([barEl, ...visuals]);
  });
}

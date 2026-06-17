import { qsa, type CleanupRegistry } from "./dom";
import { gsap, ScrollTrigger } from "./gsapSetup";
import { readBlockMotionSettings, type BlockMotionSettings } from "./blockMotionSettings";

type BlockMotionOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
  root?: ParentNode;
};

type BlockMotionItem = {
  target: HTMLElement;
  timeline: gsap.core.Timeline;
  trigger: ScrollTrigger;
};

const blockMotionSelector = "[data-block-motion]";
const desktopQuery = "(min-width: 1280px)";
const clearBlockMotionProps = "opacity,visibility,transform,transformOrigin,transformPerspective,transformStyle,willChange";

function getBlockFromVars(settings: BlockMotionSettings) {
  return {
    autoAlpha: settings.fromOpacity,
    rotationX: settings.fromRotateX,
    scale: settings.fromScale,
    transformOrigin: settings.transformOrigin,
    transformPerspective: settings.perspective,
    transformStyle: "preserve-3d",
    yPercent: settings.yPercent,
    willChange: "transform, opacity"
  };
}

function getBlockToVars(settings: BlockMotionSettings) {
  return {
    autoAlpha: 1,
    rotationX: 0,
    scale: 1,
    transformOrigin: settings.transformOrigin,
    transformPerspective: settings.perspective,
    transformStyle: "preserve-3d",
    yPercent: 0
  };
}

function clearBlockMotion(target: HTMLElement) {
  gsap.set(target, { clearProps: clearBlockMotionProps });
}

function createBlockTimeline(target: HTMLElement, settings: BlockMotionSettings) {
  gsap.killTweensOf(target);
  gsap.set(target, getBlockFromVars(settings));

  return gsap.timeline({
    paused: true,
    onComplete: () => {
      clearBlockMotion(target);
    }
  }).fromTo(
    target,
    getBlockFromVars(settings),
    {
      ...getBlockToVars(settings),
      delay: settings.delay,
      duration: settings.duration,
      ease: settings.ease,
      force3D: true,
      overwrite: true
    },
    0
  );
}

export function initBlockMotion({ cleanup, reduceMotion, root = document }: BlockMotionOptions) {
  const media = window.matchMedia(desktopQuery);
  let items: BlockMotionItem[] = [];
  let refreshCall: gsap.core.Tween | undefined;

  const dispose = () => {
    refreshCall?.kill();
    refreshCall = undefined;

    items.forEach(({ target, timeline, trigger }) => {
      trigger.kill();
      timeline.kill();
      clearBlockMotion(target);
    });

    items = [];
  };

  const scheduleRefresh = () => {
    refreshCall?.kill();
    refreshCall = gsap.delayedCall(0, () => {
      ScrollTrigger.refresh();
      refreshCall = undefined;
    });
  };

  const build = () => {
    dispose();

    const targets = qsa<HTMLElement>(blockMotionSelector, root);

    if (reduceMotion || !media.matches) {
      targets.forEach(clearBlockMotion);
      return;
    }

    const settings = readBlockMotionSettings();

    items = targets.map((target, index) => {
      const timeline = createBlockTimeline(target, settings);
      const trigger = ScrollTrigger.create({
        trigger: target,
        start: settings.start,
        end: settings.end,
        refreshPriority: index,
        onEnter: (self) => {
          timeline.restart(true);

          if (settings.once) {
            self.kill();
          }
        },
        onEnterBack: (self) => {
          timeline.restart(true);

          if (settings.once) {
            self.kill();
          }
        }
      });

      return {
        target,
        timeline,
        trigger
      };
    });

    scheduleRefresh();
  };

  const replayVisible = () => {
    items.forEach(({ target, timeline }) => {
      if (ScrollTrigger.isInViewport(target)) {
        timeline.restart(true);
      }
    });
  };

  build();
  cleanup.on(media, "change", () => build());
  cleanup.add(dispose);

  return {
    rebuild: build,
    replayVisible
  };
}

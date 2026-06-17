import { qsa, type Cleanup, type CleanupRegistry } from "./dom";
import { motionSelectors } from "./motionSelectors";

type TextHoverOptions = {
  cleanup: CleanupRegistry;
  reduceMotion: boolean;
  root?: ParentNode;
};

type HoverController = {
  dispose: Cleanup;
};

const autoHoverTextSelector = [
  ".job-btn > span",
  ".links button > span",
  ".career > span",
  ".career button > span",
  ".phone > span",
  ".inner-job-btn > span",
  ".inner-menu > span:first-child",
  ".inner-career > span:first-child",
  ".mine-breadcrumb-link > span",
  ".mine-cta > span",
  ".tab > span",
  ".success-tab > span",
  ".mines-country > span",
  ".mines-vacancy-label"
].join(",");

const explicitHoverTextSelector = motionSelectors.hoverTarget;

function getHoverTargets(root: ParentNode) {
  const targets = [
    ...qsa<HTMLElement>(explicitHoverTextSelector, root),
    ...qsa<HTMLElement>(autoHoverTextSelector, root)
  ];

  return Array.from(new Set(targets)).filter((target) => target.textContent?.trim());
}

function getTrigger(target: HTMLElement) {
  const explicit = target.closest<HTMLElement>(motionSelectors.hoverTrigger);

  if (explicit) {
    return explicit;
  }

  const search = target.closest<HTMLElement>(".search");

  if (search) {
    return search;
  }

  return target.closest<HTMLElement>("a, button, [role='button'], [role='link']") || target;
}

function createHoverController(target: HTMLElement): HoverController {
  const trigger = getTrigger(target);
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
}

export function initTextHoverSystem({ cleanup, reduceMotion, root = document }: TextHoverOptions) {
  let controllers: HoverController[] = [];

  const dispose = () => {
    controllers.forEach((controller) => controller.dispose());
    controllers = [];
    qsa<HTMLElement>(motionSelectors.hoverTrigger, root).forEach((trigger) => {
      if (!trigger.querySelector(motionSelectors.hoverReady)) {
        trigger.removeAttribute("data-motion-hover-trigger");
      }
    });
  };

  const build = () => {
    dispose();

    if (reduceMotion) {
      return;
    }

    controllers = getHoverTargets(root).map(createHoverController);
  };

  build();
  cleanup.add(dispose);

  return {
    rebuild: build
  };
}

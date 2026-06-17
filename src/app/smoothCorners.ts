import { getSvgPath } from "figma-squircle";
import type { CleanupRegistry } from "./dom";

type SmoothCornersOptions = {
  cleanup: CleanupRegistry;
  root?: ParentNode;
  selector?: string;
};

type SmoothCornersController = {
  refresh: () => void;
};

const DEFAULT_SELECTOR = [
  "[data-squircle]",
  ".job-btn",
  ".career",
  ".career a",
  ".career button",
  ".phone",
  ".lang",
  ".search",
  ".search button",
  ".tab",
  ".inner-nav",
  ".check",
  ".inner-job-btn",
  ".inner-menu",
  ".inner-career",
  ".inner-icon-btn",
  ".benefits-arrow",
  ".success-slider",
  ".success-arrow",
  ".success-tab",
  ".mines-card",
  ".mines-country",
  ".mines-arrow",
  ".mines-vacancy"
].join(",");

const DEFAULT_SMOOTHING = 1;
const MIN_RADIUS = 4;

function supportsPathClip() {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("clip-path", "path('M 0 0 H 1 V 1 H 0 Z')")
  );
}

function readNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readPixelRadius(value: string) {
  if (!value || value.includes("%")) return null;
  const match = value.match(/^-?\d*\.?\d+px/);
  if (!match) return null;

  const radius = Number.parseFloat(match[0]);
  return Number.isFinite(radius) ? radius : null;
}

function getCornerRadius(element: HTMLElement) {
  const explicit = element.dataset.cornerRadius;
  if (explicit) return readNumber(explicit, 0);

  const styles = window.getComputedStyle(element);
  return readPixelRadius(styles.borderTopLeftRadius) ?? 0;
}

function updateSquircle(element: HTMLElement) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const radius = getCornerRadius(element);

  if (width <= 0 || height <= 0 || radius < MIN_RADIUS) {
    element.style.removeProperty("clip-path");
    return;
  }

  const smoothing = readNumber(element.dataset.cornerSmoothing, DEFAULT_SMOOTHING);
  const path = getSvgPath({
    width,
    height,
    cornerRadius: radius,
    cornerSmoothing: Math.max(0, Math.min(1, smoothing)),
    preserveSmoothing: element.dataset.preserveSmoothing !== "false"
  });

  element.style.clipPath = `path('${path}')`;
}

function getMatchingElements(root: ParentNode, selector: string) {
  const elements: HTMLElement[] = [];

  if (root instanceof HTMLElement && root.matches(selector)) {
    elements.push(root);
  }

  elements.push(...Array.from(root.querySelectorAll<HTMLElement>(selector)));
  return elements;
}

export function initSmoothCorners({
  cleanup,
  root = document,
  selector = DEFAULT_SELECTOR
}: SmoothCornersOptions): SmoothCornersController {
  if (!supportsPathClip()) {
    return { refresh: () => undefined };
  }

  const elements = new Set<HTMLElement>();

  const observer = new ResizeObserver((entries) => {
    entries.forEach((entry) => updateSquircle(entry.target as HTMLElement));
  });

  const observeElement = (element: HTMLElement) => {
    if (elements.has(element)) {
      updateSquircle(element);
      return;
    }

    elements.add(element);
    observer.observe(element);
    updateSquircle(element);
  };

  const unobserveElement = (element: HTMLElement) => {
    if (!elements.delete(element)) {
      return;
    }

    observer.unobserve(element);
    element.style.removeProperty("clip-path");
  };

  const refresh = () => {
    getMatchingElements(root, selector).forEach(observeElement);
  };

  const mutationObserver = new MutationObserver((entries) => {
    entries.forEach((entry) => {
      entry.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          getMatchingElements(node, selector).forEach(observeElement);
        }
      });
      entry.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          getMatchingElements(node, selector).forEach(unobserveElement);
        }
      });
    });
  });

  refresh();
  mutationObserver.observe(root, { childList: true, subtree: true });

  cleanup.add(() => {
    mutationObserver.disconnect();
    observer.disconnect();
    elements.forEach((element) => element.style.removeProperty("clip-path"));
  });

  return { refresh };
}

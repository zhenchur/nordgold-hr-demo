import { optional, qsa, type CleanupRegistry } from "./dom";

type PixelationOptions = {
  cleanup: CleanupRegistry;
  root?: ParentNode;
};

const targetSelector = "[data-pixelate-image], [data-pixelate-text]";
const canvasClass = "pixelate-canvas";
const readyClass = "is-pixelated-ready";
const imageCache = new Map<HTMLImageElement, Promise<HTMLImageElement>>();
const brandPattern = /Nordgold/gi;

type PixelationKind = "logo" | "mark" | "text";

const pixelationDefaults: Record<PixelationKind, number> = {
  logo: 8,
  mark: 8,
  text: 12
};

const pixelationSizes: Record<PixelationKind, number> = {
  ...pixelationDefaults
};

function getTargets(root: ParentNode) {
  const targets: HTMLElement[] = [];

  if (root instanceof HTMLElement && root.matches(targetSelector)) {
    targets.push(root);
  }

  targets.push(...qsa<HTMLElement>(targetSelector, root));
  return targets;
}

function ensureCanvas(target: HTMLElement) {
  let canvas = target.querySelector<HTMLCanvasElement>(`:scope > canvas.${canvasClass}`);

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = canvasClass;
    canvas.setAttribute("aria-hidden", "true");
    target.append(canvas);
  }

  return canvas;
}

function readPixelSize(target: HTMLElement, fallback: number) {
  const dataValue = Number.parseFloat(target.dataset.pixelSize ?? "");
  const cssValue = Number.parseFloat(getComputedStyle(target).getPropertyValue("--pixel-size"));
  const kind = readPixelationKind(target);

  if (Number.isFinite(dataValue) && dataValue > 0) {
    return dataValue;
  }

  if (Number.isFinite(cssValue) && cssValue > 0) {
    return cssValue;
  }

  return kind ? pixelationSizes[kind] : fallback;
}

function readPixelationKind(target: HTMLElement): PixelationKind | undefined {
  const value = target.dataset.pixelateKind;

  return value === "logo" || value === "mark" || value === "text" ? value : undefined;
}

function getVisibleColor(target: HTMLElement) {
  let element: HTMLElement | null = target.parentElement ?? target;

  while (element) {
    const color = getComputedStyle(element).color;

    if (color !== "transparent" && !color.includes("rgba(0, 0, 0, 0)")) {
      return color;
    }

    element = element.parentElement;
  }

  return "#ffffff";
}

function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const outputWidth = Math.max(1, Math.round(width * dpr));
  const outputHeight = Math.max(1, Math.round(height * dpr));

  if (canvas.width !== outputWidth) {
    canvas.width = outputWidth;
  }

  if (canvas.height !== outputHeight) {
    canvas.height = outputHeight;
  }

  const styleWidth = `${width}px`;
  const styleHeight = `${height}px`;

  if (canvas.style.width !== styleWidth) {
    canvas.style.width = styleWidth;
  }

  if (canvas.style.height !== styleHeight) {
    canvas.style.height = styleHeight;
  }

  return { dpr, outputHeight, outputWidth };
}

function drawPixelated(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  pixelSize: number,
  drawSource: (context: CanvasRenderingContext2D) => void
) {
  const { dpr, outputHeight, outputWidth } = fitCanvas(canvas, width, height);
  const scaledPixel = Math.max(1, Math.round(pixelSize * dpr));
  const lowWidth = Math.max(1, Math.ceil(outputWidth / scaledPixel));
  const lowHeight = Math.max(1, Math.ceil(outputHeight / scaledPixel));
  const sourceCanvas = document.createElement("canvas");
  const lowCanvas = document.createElement("canvas");
  const sourceContext = sourceCanvas.getContext("2d");
  const lowContext = lowCanvas.getContext("2d");
  const outputContext = canvas.getContext("2d");

  if (!sourceContext || !lowContext || !outputContext) {
    return;
  }

  sourceCanvas.width = outputWidth;
  sourceCanvas.height = outputHeight;
  lowCanvas.width = lowWidth;
  lowCanvas.height = lowHeight;

  sourceContext.save();
  sourceContext.scale(dpr, dpr);
  drawSource(sourceContext);
  sourceContext.restore();

  lowContext.clearRect(0, 0, lowWidth, lowHeight);
  lowContext.imageSmoothingEnabled = true;
  lowContext.drawImage(sourceCanvas, 0, 0, lowWidth, lowHeight);

  outputContext.clearRect(0, 0, outputWidth, outputHeight);
  outputContext.imageSmoothingEnabled = false;
  outputContext.drawImage(lowCanvas, 0, 0, outputWidth, outputHeight);
}

function waitForImage(image: HTMLImageElement) {
  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve(image);
  }

  const cached = imageCache.get(image);

  if (cached) {
    return cached;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const cleanup = () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
    const handleLoad = () => {
      cleanup();
      resolve(image);
    };
    const handleError = () => {
      cleanup();
      reject(new Error(`Failed to load pixelated image: ${image.currentSrc || image.src}`));
    };

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
  });

  imageCache.set(image, promise);
  return promise;
}

function renderImageTarget(target: HTMLElement) {
  const image = target.querySelector<HTMLImageElement>(":scope > img");
  const rect = target.getBoundingClientRect();

  if (!image || rect.width < 1 || rect.height < 1) {
    return;
  }

  const canvas = ensureCanvas(target);
  const pixelSize = readPixelSize(target, 8);

  void waitForImage(image).then((loadedImage) => {
    drawPixelated(canvas, rect.width, rect.height, pixelSize, (context) => {
      context.drawImage(loadedImage, 0, 0, rect.width, rect.height);
    });
    target.classList.add(readyClass);
  });
}

function renderTextTarget(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const text = target.dataset.pixelateText || target.textContent?.trim() || "";

  if (rect.width < 1 || rect.height < 1 || text.length === 0) {
    return;
  }

  if (target.dataset.pixelateText !== text) {
    target.dataset.pixelateText = text;
  }

  const canvas = ensureCanvas(target);
  const style = getComputedStyle(target);
  const fontSize = Number.parseFloat(style.fontSize) || rect.height;
  const pixelSize = readPixelSize(target, 10);
  const color = getVisibleColor(target);

  drawPixelated(canvas, rect.width, rect.height, pixelSize, (context) => {
    context.font = style.font;
    context.fillStyle = color;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";

    const textContext = context as CanvasRenderingContext2D & { letterSpacing?: string };
    if (style.letterSpacing !== "normal") {
      textContext.letterSpacing = style.letterSpacing;
    }

    const metrics = context.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
    const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
    const y = Math.max(ascent, (rect.height + ascent - descent) / 2);

    context.fillText(text, 0, y);
  });

  target.classList.add(readyClass);
}

function renderTarget(target: HTMLElement) {
  if (target.hasAttribute("data-pixelate-image")) {
    renderImageTarget(target);
    return;
  }

  if (target.hasAttribute("data-pixelate-text")) {
    renderTextTarget(target);
  }
}

export function initPixelation({ cleanup, root = document }: PixelationOptions) {
  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target instanceof HTMLElement) {
        renderTarget(entry.target);
      }
    });
  });
  let refreshFrame = 0;
  const observed = new Set<HTMLElement>();

  const refresh = () => {
    refreshFrame = 0;
    getTargets(root).forEach((target) => {
      if (!observed.has(target)) {
        observed.add(target);
        resizeObserver.observe(target);
      }

      renderTarget(target);
    });
  };

  const queueRefresh = () => {
    if (refreshFrame) {
      return;
    }

    refreshFrame = window.requestAnimationFrame(refresh);
  };

  const mutationObserver = new MutationObserver(queueRefresh);

  mutationObserver.observe(root, {
    attributes: true,
    attributeFilter: ["class", "style", "src", "data-pixel-size", "data-pixelate-text"],
    childList: true,
    characterData: true,
    subtree: true
  });

  queueRefresh();

  if ("fonts" in document) {
    void document.fonts.ready.then(queueRefresh).catch(() => undefined);
  }

  cleanup.on(window, "resize", queueRefresh);
  cleanup.add(() => {
    if (refreshFrame) {
      window.cancelAnimationFrame(refreshFrame);
    }

    resizeObserver.disconnect();
    mutationObserver.disconnect();
  });

  const setPixelSize = (kind: PixelationKind, value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    pixelationSizes[kind] = value;
    qsa<HTMLElement>(`[data-pixelate-kind="${kind}"]`, root).forEach((target) => {
      target.dataset.pixelSize = String(value);
    });
    queueRefresh();
  };

  return { refresh: queueRefresh, setPixelSize };
}

type PixelationController = ReturnType<typeof initPixelation>;

type PixelationDebugOptions = {
  cleanup: CleanupRegistry;
  pixelation: PixelationController;
  root?: ParentNode;
};

function readNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(value ?? "");

  return Number.isFinite(parsed) ? parsed : fallback;
}

function writeOutput(root: ParentNode, id: string, value: string | number) {
  const output = root.querySelector<HTMLOutputElement>(`#${id}`);

  if (output) {
    output.value = String(value);
    output.textContent = String(value);
  }
}

function readPixelationDebugState(root: ParentNode) {
  return {
    logo: readNumber(root.querySelector<HTMLInputElement>("#pixelationLogoSize")?.value, pixelationDefaults.logo),
    mark: readNumber(root.querySelector<HTMLInputElement>("#pixelationMarkSize")?.value, pixelationDefaults.mark),
    text: readNumber(root.querySelector<HTMLInputElement>("#pixelationTextSize")?.value, pixelationDefaults.text)
  };
}

function syncPixelationDebugOutputs(root: ParentNode) {
  const state = readPixelationDebugState(root);

  writeOutput(root, "pixelationTextSizeOut", `${state.text}px`);
  writeOutput(root, "pixelationLogoSizeOut", `${state.logo}px`);
  writeOutput(root, "pixelationMarkSizeOut", `${state.mark}px`);
}

export function initPixelationDebugControls({ cleanup, pixelation, root = document }: PixelationDebugOptions) {
  const form = optional<HTMLFormElement>("#pixelationDebugForm", root);
  const resetButton = optional<HTMLButtonElement>("#pixelationReset", root);

  if (!form) {
    return;
  }

  const apply = () => {
    const state = readPixelationDebugState(form);

    pixelation.setPixelSize("text", state.text);
    pixelation.setPixelSize("logo", state.logo);
    pixelation.setPixelSize("mark", state.mark);
    syncPixelationDebugOutputs(form);
  };

  const reset = () => {
    const textInput = optional<HTMLInputElement>("#pixelationTextSize", form);
    const logoInput = optional<HTMLInputElement>("#pixelationLogoSize", form);
    const markInput = optional<HTMLInputElement>("#pixelationMarkSize", form);

    if (textInput) {
      textInput.value = String(pixelationDefaults.text);
    }

    if (logoInput) {
      logoInput.value = String(pixelationDefaults.logo);
    }

    if (markInput) {
      markInput.value = String(pixelationDefaults.mark);
    }

    apply();
  };

  cleanup.on(form, "input", apply);
  if (resetButton) {
    cleanup.on(resetButton, "click", reset);
  }

  apply();
}

export function renderPixelatedBrandText(target: HTMLElement, text: string) {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  Array.from(text.matchAll(brandPattern)).forEach((match) => {
    const brandText = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      fragment.append(document.createTextNode(text.slice(lastIndex, index)));
    }

    const brand = document.createElement("span");
    brand.className = "brand-text-pixel";
    brand.dataset.pixelateText = brandText;
    brand.dataset.pixelateKind = "text";
    brand.dataset.pixelSize = String(pixelationSizes.text);
    brand.textContent = brandText;
    fragment.append(brand);
    lastIndex = index + brandText.length;
  });

  if (lastIndex < text.length) {
    fragment.append(document.createTextNode(text.slice(lastIndex)));
  }

  target.replaceChildren(fragment.childNodes.length > 0 ? fragment : document.createTextNode(text));
}

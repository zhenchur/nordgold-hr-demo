import { successSection } from "./content";
import { optional } from "./dom";
import { renderPixelatedBrandText } from "./pixelation";

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

function renderSuccessTabs(root: HTMLElement) {
  const tabs = successSection.tabs.map((tab, index) => {
    const link = document.createElement("a");
    const label = document.createElement("span");
    const count = document.createElement("small");

    link.className = `success-tab${tab.active ? " is-active" : ""}${tab.all ? " success-tab-all" : ""}`;
    link.href = "#vacancies";
    link.dataset.revealItem = "true";
    if (tab.all) {
      link.dataset.successCta = "all";
    } else {
      link.dataset.successTab = String(index);
    }
    link.dataset.motionPreserveTransform = "true";
    label.textContent = tab.label;
    count.textContent = `(${tab.count})`;

    link.append(label, count);
    return link;
  });

  root.replaceChildren(...tabs);
}

export function initSuccessSection() {
  const section = optional<HTMLElement>(".success-section");

  if (!section) {
    return;
  }

  const kicker = optional<HTMLElement>(".success-kicker", section);
  const title = optional<HTMLElement>(".success-head h2", section);
  const slider = optional<HTMLElement>(".success-slider", section);
  const baseVisual = optional<HTMLImageElement>(".success-bg-base", section);
  const copyIcon = optional<HTMLImageElement>(".success-copy-head img", section);
  const copyTitle = optional<HTMLElement>(".success-copy h3", section);
  const copyText = optional<HTMLElement>(".success-copy p", section);
  const controls = optional<HTMLElement>(".success-controls", section);
  const tabs = optional<HTMLElement>(".success-tabs", section);
  const cardCount = successSection.tabs.filter((tab) => !tab.all).length;
  const initialSlide = successSection.slides[0] ?? successSection.copy;

  if (kicker) {
    kicker.textContent = successSection.kicker;
  }

  if (title) {
    title.replaceChildren(createLineBreakFragment(successSection.titleLines));
  }

  if (slider) {
    slider.setAttribute("aria-label", successSection.sliderLabel);
  }

  if (baseVisual && "image" in initialSlide) {
    baseVisual.src = initialSlide.image;
  }

  if (copyIcon) {
    copyIcon.src = initialSlide.icon;
  }

  if (copyTitle) {
    renderCopyTitle(copyTitle, initialSlide.titleLines);
  }

  if (copyText) {
    renderPixelatedBrandText(copyText, initialSlide.text);
  }

  if (controls) {
    const showControls = cardCount > 3;

    controls.hidden = !showControls;
    controls.setAttribute("aria-hidden", String(!showControls));
  }

  if (tabs) {
    tabs.dataset.reveal = "group";
    tabs.dataset.revealTrigger = "viewport";
    renderSuccessTabs(tabs);
  }
}

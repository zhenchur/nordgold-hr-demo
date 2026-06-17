import { benefitCards } from "./content";
import { createDeckGalleryTransition, type DeckGalleryDirection } from "./deckGalleryMotion";
import { optional, qsa, type CleanupRegistry } from "./dom";
import { gsap } from "./gsapSetup";

type BenefitsSliderOptions = {
  cleanup: CleanupRegistry;
};

function renderCards(track: HTMLElement) {
  const cards = benefitCards.map((card) => {
    const article = document.createElement("article");
    const title = document.createElement("h3");
    const bottom = document.createElement("div");
    const icon = document.createElement("img");
    const text = document.createElement("p");

    article.className = "benefit-card";
    article.dataset.revealCard = "true";
    title.dataset.reveal = "text";
    title.dataset.revealTrigger = "viewport";
    bottom.className = "benefit-card-bottom";
    title.textContent = card.title;
    icon.src = card.icon;
    icon.alt = "";
    text.textContent = card.text;

    bottom.append(icon, text);
    article.append(title, bottom);
    return article;
  });

  track.replaceChildren(...cards);
}

export function initBenefitsSlider({ cleanup }: BenefitsSliderOptions) {
  const slider = optional<HTMLElement>(".benefits-slider");
  const track = optional<HTMLElement>("[data-benefits-track]");
  const prev = optional<HTMLButtonElement>("[data-benefits-prev]");
  const next = optional<HTMLButtonElement>("[data-benefits-next]");
  const gap = 39;
  let index = 0;
  let cardWidth = 0;
  let slots = [0, 0, 0];
  let activeTimeline: gsap.core.Timeline | undefined;
  const visibleCount = 3;

  if (!slider || !track || !prev || !next) {
    return;
  }

  const sliderEl = slider;
  const trackEl = track;
  const prevButton = prev;
  const nextButton = next;

  renderCards(trackEl);

  const cards = qsa<HTMLElement>(".benefit-card", trackEl);

  if (cards.length < 4) {
    return;
  }

  const maxIndex = cards.length - visibleCount;

  function cardAt(offset: number) {
    return index + offset;
  }

  function measure() {
    cardWidth = (sliderEl.clientWidth - gap * 2) / 3;
    slots = [0, cardWidth + gap, (cardWidth + gap) * 2];
  }

  function setVisible(cardIndex: number, visible: boolean) {
    cards[cardIndex].dataset.sliderVisible = String(visible);
  }

  function setCard(cardIndex: number, slot: number, alpha: number) {
    setVisible(cardIndex, alpha > 0);
    gsap.set(cards[cardIndex], {
      width: cardWidth,
      x: slots[slot],
      autoAlpha: alpha
    });
  }

  function layout() {
    measure();
    cards.forEach((card, cardIndex) => {
      card.dataset.sliderVisible = "false";
      gsap.set(card, { width: cardWidth, autoAlpha: 0 });
      gsap.set(card.querySelectorAll("[data-reveal='text']"), { clearProps: "all" });
      setVisible(cardIndex, false);
    });
    Array.from({ length: visibleCount }, (_, slot) => {
      setCard(cardAt(slot), slot, 1);
    });
    updateControls();
  }

  function updateControls() {
    prevButton.disabled = index <= 0;
    nextButton.disabled = index >= maxIndex;
  }

  function settleActiveTimeline() {
    if (!activeTimeline) {
      return;
    }

    const timeline = activeTimeline;
    activeTimeline = undefined;
    timeline.progress(1);
    timeline.kill();
  }

  function go(direction: DeckGalleryDirection) {
    settleActiveTimeline();

    const targetIndex = Math.max(0, Math.min(maxIndex, index + direction));

    if (targetIndex === index) {
      updateControls();
      return;
    }

    measure();
    const fromIndex = index;
    index = targetIndex;
    updateControls();

    activeTimeline = createDeckGalleryTransition({
      cardWidth,
      cards,
      direction,
      index: fromIndex,
      onComplete: () => {
        layout();
        activeTimeline = undefined;
      },
      setVisible,
      slots
    });
  }

  layout();
  cleanup.on(prevButton, "click", () => go(-1));
  cleanup.on(nextButton, "click", () => go(1));
  cleanup.on(window, "resize", () => {
    settleActiveTimeline();
    layout();
  });
  cleanup.add(() => activeTimeline?.kill());
}

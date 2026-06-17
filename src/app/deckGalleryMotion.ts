import { gsap } from "./gsapSetup";

export type DeckGalleryDirection = 1 | -1;

type DeckGalleryTransitionOptions = {
  cardWidth: number;
  cards: HTMLElement[];
  direction: DeckGalleryDirection;
  index: number;
  onComplete: () => void;
  setVisible?: (cardIndex: number, visible: boolean) => void;
  slots: number[];
  visibleCount?: number;
};

const defaults = {
  edgeScale: 0.9,
  edgeDuration: 0.48,
  moveDuration: 0.62
};

function getVisibleIndices(index: number, count: number) {
  return Array.from({ length: count }, (_, slot) => index + slot);
}

export function createDeckGalleryTransition({
  cardWidth,
  cards,
  direction,
  index,
  onComplete,
  setVisible,
  slots,
  visibleCount = 3
}: DeckGalleryTransitionOptions) {
  const targetIndex = index + direction;
  const currentVisible = getVisibleIndices(index, visibleCount);
  const targetVisible = getVisibleIndices(targetIndex, visibleCount);
  const targetSet = new Set(targetVisible);
  const currentSet = new Set(currentVisible);
  const outgoingIndices = currentVisible.filter((cardIndex) => !targetSet.has(cardIndex));
  const animatedIndexSet = new Set([...targetVisible, ...outgoingIndices]);
  const animatedCards = [...animatedIndexSet].map((cardIndex) => cards[cardIndex]);

  animatedIndexSet.forEach((cardIndex) => setVisible?.(cardIndex, true));

  gsap.set(animatedCards, {
    transformOrigin: "50% 50%",
    willChange: "transform, opacity"
  });

  targetVisible.forEach((cardIndex, slot) => {
    const card = cards[cardIndex];

    gsap.set(card, {
      width: cardWidth,
      zIndex: 3
    });

    if (!currentSet.has(cardIndex)) {
      gsap.set(card, {
        autoAlpha: 0,
        scale: defaults.edgeScale,
        x: slots[slot],
        zIndex: 2
      });
    }
  });

  return gsap.timeline({
    defaults: {
      overwrite: "auto"
    },
    onComplete: () => {
      gsap.set(animatedCards, {
        clearProps: "zIndex,scale,transformOrigin,willChange"
      });
      onComplete();
    }
  })
    .to(targetVisible.map((cardIndex) => cards[cardIndex]), {
      duration: defaults.moveDuration,
      ease: "power3.inOut",
      x: (itemIndex) => slots[itemIndex],
      scale: 1,
      autoAlpha: 1
    }, 0)
    .to(outgoingIndices.map((cardIndex) => cards[cardIndex]), {
      autoAlpha: 0,
      duration: defaults.edgeDuration,
      ease: "power2.out",
      scale: defaults.edgeScale,
      zIndex: 1
    }, 0);
}

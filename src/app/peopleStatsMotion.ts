import type { MinesMotionPhaseSettings, MinesMotionSettings } from "./minesMotion";

export type PeopleStatsMotionSettings = MinesMotionSettings;

export const peopleStatsHoldDuration = 3.6;

const peopleStatsMotionDefaults: PeopleStatsMotionSettings = {
  targetStagger: 0.035,
  phaseOffset: 0.1,
  transformOrigin: "50% 0%",
  enter: {
    duration: 0.3,
    ease: "power4.out",
    opacity: 0,
    perspective: 400,
    rotateX: -90,
    yPercent: 80
  },
  exit: {
    duration: 0.3,
    ease: "power3.out",
    opacity: 0,
    perspective: 3200,
    rotateX: 40,
    yPercent: -20
  }
};

function clonePeopleStatsMotionSettings(settings: PeopleStatsMotionSettings): PeopleStatsMotionSettings {
  return {
    ...settings,
    enter: { ...settings.enter },
    exit: { ...settings.exit }
  };
}

export function readPeopleStatsMotionSettings(): PeopleStatsMotionSettings {
  return clonePeopleStatsMotionSettings(peopleStatsMotionDefaults);
}

export function getPeopleStatsPhaseFromVars(
  phase: MinesMotionPhaseSettings,
  settings: PeopleStatsMotionSettings
) {
  return {
    autoAlpha: phase.opacity,
    rotationX: phase.rotateX,
    transformOrigin: settings.transformOrigin,
    transformPerspective: phase.perspective,
    transformStyle: "preserve-3d",
    yPercent: phase.yPercent,
    willChange: "transform, opacity"
  };
}

export function getPeopleStatsPhaseToVars(settings: PeopleStatsMotionSettings) {
  return {
    autoAlpha: 1,
    rotationX: 0,
    transformOrigin: settings.transformOrigin,
    transformStyle: "preserve-3d",
    yPercent: 0
  };
}

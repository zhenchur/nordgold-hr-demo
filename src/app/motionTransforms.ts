import type { TextMotionSettings } from "./motionSettings";

type MotionTransformVars = Record<string, number | string>;

function getElementOffset(settings: TextMotionSettings) {
  return Math.round(settings.yPercent * 0.25);
}

export function getWordFromVars(settings: TextMotionSettings): MotionTransformVars {
  return {
    rotationX: settings.fromRotateX,
    transformOrigin: settings.transformOrigin,
    yPercent: settings.yPercent
  };
}

export function getWordToVars(settings: TextMotionSettings): MotionTransformVars {
  return {
    rotationX: 0,
    transformOrigin: settings.transformOrigin,
    yPercent: 0
  };
}

export function getElementFromVars(settings: TextMotionSettings): MotionTransformVars {
  return {
    rotationX: settings.fromRotateX,
    transformOrigin: settings.transformOrigin,
    transformPerspective: settings.perspective,
    transformStyle: "preserve-3d",
    y: getElementOffset(settings)
  };
}

export function getElementToVars(settings: TextMotionSettings): MotionTransformVars {
  return {
    rotationX: 0,
    transformOrigin: settings.transformOrigin,
    transformPerspective: settings.perspective,
    transformStyle: "preserve-3d",
    y: 0
  };
}

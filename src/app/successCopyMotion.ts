export type SuccessCopyMotionPhaseSettings = {
  duration: number;
  ease: string;
  opacity: number;
  perspective: number;
  rotateX: number;
  yPercent: number;
};

export type SuccessCopyMotionSettings = {
  enter: SuccessCopyMotionPhaseSettings;
  lineStagger: number;
  transformOrigin: string;
};

const successCopyMotionDefaults: SuccessCopyMotionSettings = {
  lineStagger: 0.035,
  transformOrigin: "50% 0%",
  enter: {
    duration: 0.3,
    ease: "power4.out",
    opacity: 0,
    perspective: 400,
    rotateX: -90,
    yPercent: 80
  }
};

function cloneSuccessCopyMotionSettings(settings: SuccessCopyMotionSettings): SuccessCopyMotionSettings {
  return {
    ...settings,
    enter: { ...settings.enter }
  };
}

export function readSuccessCopyMotionSettings(): SuccessCopyMotionSettings {
  return cloneSuccessCopyMotionSettings(successCopyMotionDefaults);
}

export function getSuccessCopyEnterFromVars(settings: SuccessCopyMotionSettings) {
  return {
    autoAlpha: settings.enter.opacity,
    rotationX: settings.enter.rotateX,
    transformOrigin: settings.transformOrigin,
    transformPerspective: settings.enter.perspective,
    transformStyle: "preserve-3d",
    yPercent: settings.enter.yPercent,
    willChange: "transform, opacity"
  };
}

export function getSuccessCopyEnterToVars(settings: SuccessCopyMotionSettings) {
  return {
    autoAlpha: 1,
    rotationX: 0,
    transformOrigin: settings.transformOrigin,
    yPercent: 0
  };
}

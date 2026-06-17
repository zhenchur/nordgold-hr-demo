export function initPageStartPolicy() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  function resetToTop() {
    window.scrollTo(0, 0);
    return window.scrollY;
  }

  return {
    resetToTop
  };
}

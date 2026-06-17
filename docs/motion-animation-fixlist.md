# Motion animation fixlist

Status legend:
- `[x]` done
- `[~]` in progress
- `[ ]` pending
- `[?]` needs visual/product decision

## First half

1. [x] Rework `SplitText` controllers to use the official `onSplit()` returned timeline lifecycle.
2. [x] Stabilize split text after resize/font re-split so completed titles do not disappear or reset incorrectly.
3. [x] Recalculate hero group timing from the current title split before playback.
4. [?] Decide whether grouped elements need a shared transform axis wrapper instead of per-element origin.
5. [?] Decide whether left/right origin presets should introduce `rotationY`; current effect is `rotationX` based.
6. [x] Filter hidden hero nav variants out of reveal groups so inactive desktop/compact nodes do not affect stagger.
7. [x] Treat section headings as one staged reveal sequence: kicker and title; slider controls stay as a separate stagger group by current product decision.
8. [x] Store the real trigger element separately from the animated target for replay/debug visibility checks.
9. [x] Keep ScrollTriggers alive in debug replay mode instead of killing them immediately through `once`.
10. [x] Move motion settings into a runtime store instead of reading the debug panel DOM on every animation build.
11. [x] Remove the unused motion effect selector while only one effect exists.
12. [x] Expose delay in motion settings or remove it from the public settings type if unused.
13. [x] Wait for fonts before building/refreshing split text and ScrollTrigger positions on startup.
14. [x] Keep first paint protected against raw unstyled HTML while the module/CSS bootstraps.
15. [x] Render the initial hero mask state before revealing the app and starting the opening animation.
16. [x] Reduce per-frame work in the hero mask render loop where it is safe.
17. [x] Avoid writing `will-change` on every hero scroll update.

## Second half

18. [x] Debounce hero debug `ScrollTrigger.refresh()` calls.
19. [x] Simplify inner nav visibility to one source of truth.
20. [x] Replace hero shutter custom window events with direct callbacks.
21. [x] Centralize Lenis and ScrollTrigger integration.
22. [x] Split benefits slider layout state from transition timelines.
23. [x] Prevent hidden absolute slider cards from creating unwanted reveal triggers.
24. [x] Keep number layout scale and motion transforms on separate wrappers in people stats.
25. [x] Batch people stats resize reads/writes or move them to `ResizeObserver`.
26. [x] Replace people stats `setInterval` with GSAP scheduling if we want all timing in GSAP.
27. [x] Decide whether text hover remains CSS micro-interaction or moves into GSAP.
28. [x] If hover moves to GSAP, rebuild hover transitions as timelines.
29. [x] Remove unused hover CSS variables and other stale motion leftovers.
30. [x] Audit smooth corner clipping cost and avoid applying it to unnecessary small elements.
31. [x] Centralize GSAP plugin registration.
32. [x] Avoid clearing layout transforms on elements that rely on CSS transforms.
33. [x] Introduce a stable data-attribute API for future section motion.
34. [x] Gate debug panels/settings for production builds.

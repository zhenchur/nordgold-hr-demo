# Code Review Fixlist

Дата аудита: 2026-06-15

Контекст: проект `nordgold-hr-demo` готовится выйти из режима демки в более production-ready состояние. Сборка проходит, `npm audit --omit=dev` чистый, базовый runtime-pass в браузере без console errors.

Статусы:
- `[ ]` - не взято в работу
- `[>]` - в работе
- `[x]` - исправлено
- `[?]` - требует решения/дизайн-ответа
- `[-]` - не нужно на текущем этапе

## P1. Блокеры перед публикацией

1. `[-]` Поиск сабмитит форму без сценария обработки.
   - Риск: Enter или клик по кнопке может перезагружать страницу/менять URL вместо поиска.
   - Где: `index.html:28`, `index.html:32`
   - Рекомендация: добавить явный submit handler, `preventDefault`, дальше либо переход на страницу вакансий с query, либо фильтрацию/заглушку.

2. `[-]` Оптимизировать тяжелые raster assets.
   - Риск: высокий LCP, долгие загрузки на офисных ноутбуках и слабой сети.
   - Текущие размеры: `success-worker.png` ~5.2 MB, `hero-bg.png` ~2.2 MB, `hero-worker.png` ~1.1 MB.
   - Где: `src/assets/success-worker.png`, `src/assets/hero-bg.png`, `src/assets/hero-worker.png`
   - Рекомендация: экспорт в WebP/AVIF, responsive sizes, возможно отдельные desktop-wide версии.

3. `[-]` Добавить image loading policy.
   - Риск: браузер не получает подсказок для LCP/decoding/layout.
   - Где: `index.html:14`, `index.html:15`, `index.html:226`, `index.html:228`
   - Рекомендация: для hero LCP image использовать `fetchpriority="high"` и `decoding`; для нижних секций `loading="lazy"`/`decoding="async"`; добавить `width`/`height`.

4. `[x]` Подключить шрифты как реальные webfont assets.
   - Риск: на чужой машине без PF BeauSans верстка, line-height и motion split метрики поедут.
   - Где: `src/styles.css:5`
   - Сделано: локальные PF BeauSans подключены как project assets в `src/assets/fonts`.
   - Примечание: сейчас подключены TTF-файлы; WOFF2-оптимизация остается частью будущего asset-pass.

5. `[-]` Спрятать debug UI из production по feature flag.
   - Риск: debug-панели попадают в DOM, имеют высокий z-index и могут быть видны пользователям.
   - Где: `index.html:116`, `index.html:275`, `index.html:282`
   - Рекомендация: рендерить панели только в dev mode или по query/env флагу.

6. `[x]` Удалить или восстановить рабочий смысл `Line bottom`.
   - Риск: контрол есть, но больше не влияет на геометрию маски.
   - Где: `index.html:126`, `src/app/heroShutter.ts:18`, `src/app/heroShutter.ts:123`, `src/app/heroShutter.ts:300`
   - Сделано: контрол удален из shutter debug и типа шторки, чтобы не влиял на маску.
   - Примечание: появление элементов при скролле управляется отдельной Motion panel через `Trigger line`.

7. `[-]` Подключить реальную логику controls/tabs в секции 3.
   - Риск: элементы выглядят интерактивными, но не меняют состояние.
   - Где: `index.html:243`, `index.html:248`
   - Рекомендация: сделать data model и контроллер слайдера/табов секции 3.

8. `[x]` Зафиксировать deploy-base strategy.
   - Риск: `file://` не поддерживается, root-absolute пути требуют корректного hosting root; при деплое в подпапку пути сломаются.
   - Где: `index.html:388`, `dist/index.html`
   - Сделано: добавлен `vite.config.ts` с production base `/nordgold-hr-demo/` для GitHub Pages; README обновлен.

## P2. Поведение, доступность, архитектура

9. `[x]` Убрать дублирование формулы закрытия hero mask между `heroShutter` и `innerNav`.
   - Риск: подменная шапка и маска могут рассинхронизироваться после следующей правки анимации.
   - Где: `src/app/innerNav.ts:45`, `src/app/innerNav.ts:50`, `src/app/heroShutter.ts:147`, `src/app/heroShutter.ts:159`
   - Сделано: hero shutter публикует `hero:mask-state`, inner nav слушает состояние и больше не пересчитывает геометрию маски.

10. `[x]` Разделить чтение motion config и side effects debug panel.
    - Риск: `readMotionSettings()` мутирует DOM/CSS, из-за чего обычное чтение настроек имеет побочный эффект.
    - Где: `src/app/motionSettings.ts:77`, `src/app/motionSettings.ts:118`
    - Сделано: чтение motion settings стало чистым, sync debug readouts/trigger guide вынесен отдельно.

11. `[-]` После `Apply` в motion panel проигрывать visible reveal targets.
    - Риск: видимые элементы после rebuild могут остаться в скрытом состоянии до следующего ScrollTrigger.
    - Где: `src/main.ts:41`
    - Рекомендация: в `onApply` после rebuild вызвать `heroReveal.play()`/`scrollReveal.replayVisible()` по ситуации.

12. `[x]` В `textRevealEffect.dispose()` чистить perspective/transformStyle.
    - Риск: если контроллер уничтожен до complete, на target могут остаться 3D props.
    - Где: `src/app/textRevealEffect.ts:206`
    - Сделано: word reveal dispose теперь чистит inline `perspective/transformStyle` без изменения timeline-логики.

13. `[x]` Вернуть `aria-live` в динамический people stats layer.
    - Риск: исходный `aria-live` теряется после `panelEl.textContent = ""`.
    - Где: `index.html:193`, `src/app/peopleStats.ts:73`, `src/app/peopleStats.ts:281`
    - Сделано: динамический `people-number-slot` получает `aria-live="polite"` и `aria-atomic="true"`.

14. `[x]` Останавливать people stats interval вне viewport и в hidden tab.
    - Риск: лишние таймеры и GSAP timelines в фоне.
    - Где: `src/app/peopleStats.ts:278`
    - Сделано: автоплей управляется через ScrollTrigger viewport state и `visibilitychange`; активная timeline ставится на паузу, когда блок не должен играть.

15. `[-]` Сделать fallback для benefits slider при количестве карточек меньше 4.
    - Риск: при `cards.length < 4` карточки остаются скрытыми из-за CSS.
    - Где: `src/app/benefitsSlider.ts:46`
    - Рекомендация: при 1-3 карточках просто показать их без бесконечного слайдера.

16. `[-]` Защитить расчет ширины карточек benefits slider.
    - Риск: на узких desktop states формула может дать некорректную ширину.
    - Где: `src/app/benefitsSlider.ts:55`
    - Рекомендация: clamp/min width или CSS-grid layout с измерением через actual tracks.

17. `[-]` Throttle resize handlers.
    - Риск: layout/GSAP recalculations могут дергаться на каждом resize event.
    - Где: `src/app/benefitsSlider.ts:122`, `src/app/peopleStats.ts:293`, `src/app/heroShutter.ts:470`, `src/app/vacancyTabs.ts:104`
    - Рекомендация: общий `requestAnimationFrame` resize scheduler.

18. `[x]` Убрать дублирующиеся hover listeners у vacancy tabs.
    - Риск: `mouseenter`, `pointerenter`, `pointerover` могут запускать одну и ту же анимацию несколько раз.
    - Где: `src/app/vacancyTabs.ts:87`
    - Сделано: оставлены `pointerenter`, `focus`, `click`.

19. `[-]` Добавить ARIA state для активных tabs.
    - Риск: screen readers не видят текущее состояние.
    - Где: `src/app/vacancyTabs.ts:77`, `index.html:248`
    - Рекомендация: `aria-pressed` для button-tabs или полноценный tablist/tabpanel, если это вкладки.

20. `[-]` Добавить действие для hero CTA `Все вакансии`.
    - Риск: CTA выглядит кликабельным, но ничего не делает.
    - Где: `src/app/vacancyTabs.ts:31`
    - Рекомендация: link/button action на список вакансий или фильтр.

21. `[-]` Сократить DOM-дубли hero worker images.
    - Риск: пять одинаковых image elements под будущие картинки создают лишнюю нагрузку на layout/compositing.
    - Где: `index.html:15`
    - Рекомендация: пока фото одинаковые - один image; когда появятся разные - lazy/preload policy и controlled swap.

22. `[x]` Уменьшить постоянный `will-change`.
    - Риск: лишние compositor layers и память.
    - Где: `src/styles.css:119`, `src/styles.css:141`, `src/styles.css:171`, `src/styles.css:539`, `src/styles.css:632`, `src/styles.css:1336`
    - Рекомендация: включать `will-change` на время анимации через GSAP или классы.
    - Сделано: постоянные CSS `will-change` сняты; hero mask/depth/vacancy и vacancy bar получают hint только на время GSAP/scroll-анимаций.

23. `[x]` Обновлять smooth corners для динамических элементов.
    - Риск: элементы, добавленные после init, не получают squircle clip.
    - Где: `src/app/smoothCorners.ts:104`
    - Рекомендация: экспортировать `refreshSmoothCorners()` или подключить MutationObserver/явный refresh после render.
    - Сделано: выбран более устойчивый вариант с `MutationObserver` + `ResizeObserver`; новые matching nodes автоматически получают squircle clip.

24. `[x]` Сделать graceful no-JS/fallback state.
    - Риск: без JS hero media clipped в ноль, tabs создаются только скриптом.
    - Где: `src/styles.css:116`, `src/app/vacancyTabs.ts:20`
    - Рекомендация: базовый HTML должен быть читаемым; JS только улучшает.
    - Сделано: clip hero media включается только в `.js` mode; добавлен статический fallback для hero tabs и benefits cards.

25. `[-]` Добавить disabled/interaction state для benefits controls во время анимации.
    - Риск: `isMoving` гасит логику, но UI не сообщает, что действие заблокировано.
    - Где: `src/app/benefitsSlider.ts:75`
    - Рекомендация: `aria-disabled`, `disabled` или визуальный state на время tween.

26. `[-]` Добавить live/label feedback для benefits slider.
    - Риск: пользователь клавиатуры/скринридера не понимает смену карточек.
    - Где: `src/app/benefitsSlider.ts:85`
    - Рекомендация: `aria-live` на текущий набор карточек или announcements.

27. `[-]` Проверить keyboard flow для debug panels и fixed overlays.
    - Риск: fixed debug panels могут перехватывать tab-order в production-like просмотре.
    - Где: `index.html:116`, `index.html:282`
    - Рекомендация: после dev-gate проверить tab order без панелей.

## P3. Поддерживаемость и качество кода

28. `[x]` Заменить `innerHTML` render там, где данные могут стать внешними.
    - Риск: сейчас данные локальные, но при CMS/API это XSS-вектор.
    - Где: `src/app/benefitsSlider.ts:11`, `src/app/vacancyTabs.ts:24`, `src/app/textHoverSystem.ts:63`
    - Рекомендация: создавать DOM nodes через `textContent`; hover wrapper делать DOM-оберткой без HTML string.
    - Сделано: vacancy tabs, benefits cards и hover wrapper собираются через DOM nodes / `textContent` без HTML string render.

29. `[x]` Вынести контент секции 3 в data layer.
    - Риск: часть данных в `content.ts`, часть зашита в HTML.
    - Где: `src/app/content.ts:7`, `index.html:231`
    - Рекомендация: единый источник данных для секций/табов/слайдеров.
    - Сделано: контент секции 3 вынесен в `successSection` data layer; HTML оставлен как fallback и гидратится из данных при запуске JS.

30. `[x]` Добавить lint/format scripts.
    - Риск: TypeScript ловит не все; style drift и dead code будут возвращаться.
    - Где: `package.json:6`
    - Рекомендация: добавить `lint`, `format`, возможно `typecheck` отдельно от `build`.
    - Сделано: добавлены `typecheck`, `lint`, `format`, `format:check`, ESLint flat config и Prettier config.

31. `[x]` Включить строгие TS флаги для unused code.
    - Риск: мертвые параметры вроде `lineFromBottom` проходят сборку.
    - Где: `tsconfig.json`
    - Рекомендация: `noUnusedLocals`, `noUnusedParameters` после чистки текущих хвостов.
    - Сделано: включены `noUnusedLocals` и `noUnusedParameters`; лишние параметры `getWordToVars/getElementToVars` удалены, переключатели words/lines сохранены.

32. `[x]` Исправить несуществующую CSS-переменную `--gold`.
    - Риск: accent-color silently fallback.
    - Где: `src/styles.css:841`
    - Рекомендация: заменить на `var(--yellow)` или добавить токен.
    - Сделано: `accent-color` motion checkbox переведен на существующий `var(--yellow)`.

33. `[-]` Пересмотреть negative letter-spacing в анимируемых текстах.
    - Риск: split-by-lines/words и метрики могут отличаться между браузерами/шрифтами.
    - Где: `src/styles.css:1323`, `src/styles.css:1518`, `src/styles.css:1706`
    - Рекомендация: оставить только там, где это подтверждено макетом и не ломает wrapping.

34. `[-]` Разделить nav controls на реальные links/actions и декоративные buttons.
    - Риск: сейчас много `button type="button"` без сценария.
    - Где: `index.html:60`, `index.html:74`, `index.html:81`, `index.html:91`, `index.html:98`
    - Рекомендация: навигацию делать ссылками, открывающиеся меню - кнопками с состояниями.

35. `[-]` Зафиксировать policy для reload/back/forward.
    - Риск: сейчас `scrollRestoration = manual` и `scrollTo(0, 0)` намеренно всегда возвращают на hero.
    - Где: `src/app/pageStartPolicy.ts:1`
    - Рекомендация: описать ожидаемое поведение для отдельных страниц, anchor links и browser history.
    - Уточнение: тут нужен продуктовый выбор, а не кодовая мелочь: всегда возвращаемся на hero при reload/back/forward или для будущих страниц/anchor links сохраняем/восстанавливаем позицию.

36. `[x]` Переименовать `pageScrollRestoration` под фактическое поведение.
    - Риск: название звучит как восстановление скролла, а код принудительно сбрасывает в начало.
    - Где: `src/app/pageStartPolicy.ts:1`
    - Рекомендация: например `pageStartPolicy` / `initTopOnLoad`.
    - Сделано: модуль переименован в `pageStartPolicy`, API стал `initPageStartPolicy().resetToTop()`.

37. `[x]` Централизовать layout constants/grid ratios.
    - Риск: проценты сетки повторяются в CSS и логике, легко получить расхождение.
    - Где: `src/styles.css:957`, `src/styles.css:1266`, `src/styles.css:1663`, `src/styles.css:1711`
    - Рекомендация: единые CSS custom properties на `:root` или section-level tokens.
    - Сделано: добавлены root-токены `--layout-left-ratio`, `--layout-gap-ratio`, `--layout-left-col`, `--layout-gap-col`, `--site-pad-x`; debug grid, секция 2 и секция 3 используют их.

38. `[-]` Документировать motion systems.
    - Риск: hero reveal, scroll reveal, hover motion и people stats используют похожие параметры, но разные контроллеры.
    - Где: `src/app/heroRevealSystem.ts`, `src/app/scrollRevealSystem.ts`, `src/app/textHoverSystem.ts`, `src/app/peopleStats.ts`
    - Рекомендация: короткий `docs/motion-system.md` с contract/classes/data-attributes.

39. `[-]` Добавить production preview smoke script.
    - Риск: dev server и production build могут отличаться по путям/assets.
    - Где: `package.json:6`
    - Рекомендация: `npm run build && npm run preview`, плюс ручной/browser smoke checklist.

40. `[-]` Проверить bundle budget.
    - Риск: JS сейчас нормальный, но GSAP plugins и будущие секции могут быстро разрастись.
    - Текущий build: JS ~178.68 kB raw / ~64.22 kB gzip, CSS ~30.66 kB raw / ~6.47 kB gzip.
    - Рекомендация: зафиксировать asset/bundle budget в README или CI.

## Проверки, выполненные во время аудита

- `npm run build` - успешно.
- `npm audit --omit=dev` - 0 vulnerabilities.
- Browser runtime-pass:
  - console errors/warnings отсутствуют;
  - reload из середины страницы возвращает `scrollY: 0`;
  - hero ready attributes выставляются;
  - inner nav скрыта на старте после reload.

## Рекомендуемый порядок работы

1. Закрыть пункты 1-8.
2. После этого стабилизировать архитектуру hero mask/nav: пункты 9-12.
3. Затем пройти accessibility/interaction: пункты 13-20, 25-27, 34-35.
4. Отдельным проходом сделать performance: пункты 2-3, 14, 17, 21-22, 40.
5. В конце привести кодовую базу к поддерживаемому виду: пункты 28-33, 36-39.

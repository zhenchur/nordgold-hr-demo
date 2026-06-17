import chevronIcon from "../assets/ico-chevron.svg";
import langIcon from "../assets/ico-lang.svg";
import phoneIcon from "../assets/ico-phone.svg";
import userIcon from "../assets/ico-user.svg";
import colorLogo from "../assets/logo-color.svg";
import logo from "../assets/logo.svg";
import mineHeroImage from "../assets/mine-berezitovy-hero.png";
import statMethodIcon from "../assets/mine-stat-method.svg";
import statReservesIcon from "../assets/mine-stat-reserves.svg";
import statResourcesIcon from "../assets/mine-stat-resources.svg";

function templateToElements(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return Array.from(template.content.children);
}

export function renderPage2Container(container: HTMLElement) {
  const elements = templateToElements(`
    <section class="hero hero-page2 mine-hero" aria-label="Рудник Березитовый">
      <div class="hero-stage" data-hero-stage>
        <div class="scene">
          <div class="media mine-hero-media" id="media">
            <div class="hero-visuals mine-hero-visuals" data-hero-visuals aria-hidden="true">
              <div class="hero-visual mine-hero-visual is-active" data-vacancy-visual="0">
                <img class="hero-visual-image mine-hero-image" src="${mineHeroImage}" alt="" />
              </div>
            </div>
            <div class="veil mine-hero-veil"></div>

            <div class="hero-copy mine-hero-copy" data-hero-copy>
              <div class="mine-hero-content">
                <p
                  class="mine-location"
                  data-reveal="element"
                  data-reveal-trigger="manual"
                  data-reveal-scope="hero"
                  data-reveal-sequence="hero-ui"
                  data-reveal-after="hero-title"
                >
                  <span class="mine-location-pin" aria-hidden="true"></span>
                  <span>Россия, Амурская область</span>
                </p>
                <h1
                  class="mine-title"
                  data-reveal="text"
                  data-reveal-trigger="manual"
                  data-reveal-scope="hero"
                  data-reveal-id="hero-title"
                >
                  Рудник «Березитовый»
                </h1>
                <p
                  class="mine-subtitle"
                  data-reveal="element"
                  data-reveal-trigger="manual"
                  data-reveal-scope="hero"
                  data-reveal-sequence="hero-ui"
                  data-reveal-after="hero-title"
                >
                  100 км от ж/д станции Сковородино
                </p>
                <div
                  class="mine-actions"
                  data-reveal="element"
                  data-reveal-trigger="manual"
                  data-reveal-scope="hero"
                  data-reveal-sequence="hero-ui"
                  data-reveal-after="hero-title"
                >
                  <button class="mine-cta mine-cta-primary" type="button" data-squircle>
                    <span>Отправить отклик</span>
                    <img src="${chevronIcon}" alt="" />
                  </button>
                  <button class="mine-cta mine-cta-secondary" type="button" data-squircle>
                    <span>Вакансии на руднике</span>
                    <img src="${chevronIcon}" alt="" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <svg class="mask-svg" id="maskSvg" aria-hidden="true">
            <polygon id="maskSector"></polygon>
          </svg>
          <svg class="guide-svg" id="guideSvg" aria-hidden="true">
            <line id="upperRay" />
            <line id="lowerRay" />
            <line id="axisLine" />
            <line id="travelLine" />
            <line id="yLine" />
            <circle id="centerDot" r="6" />
            <circle id="travelDot" r="10" />
          </svg>
        </div>
      </div>

      <header class="nav">
        <div
          class="nav-left"
          data-reveal="element"
          data-reveal-trigger="manual"
          data-reveal-scope="hero"
          data-reveal-sequence="hero-nav"
        >
          <button class="job-btn" type="button">
            <span>Все вакансии</span>
            <img src="${userIcon}" alt="" />
          </button>
          <nav class="links" aria-label="Основная навигация">
            <button type="button"><span>Рудники</span></button>
            <button type="button"><span>Условия работы</span></button>
            <button type="button"><span>О нас</span></button>
            <button type="button"><span>Контакты</span></button>
          </nav>
        </div>

        <a
          class="brand"
          href="/"
          aria-label="Компания"
          data-reveal="element"
          data-reveal-trigger="manual"
          data-reveal-scope="hero"
          data-reveal-sequence="hero-nav"
          data-pixelate-image
          data-pixelate-kind="logo"
          data-pixel-size="8"
        >
          <img src="${logo}" alt="" />
        </a>

        <div
          class="nav-right"
          data-reveal="element"
          data-reveal-trigger="manual"
          data-reveal-scope="hero"
          data-reveal-sequence="hero-nav"
        >
          <div class="career">
            <span>Начало карьеры</span>
            <button type="button"><span>Fast track</span></button>
            <button type="button"><span>Sprint</span></button>
          </div>
          <a class="phone" href="tel:88007005555">
            <img src="${phoneIcon}" alt="" />
            <span>8 800 700 55 55</span>
          </a>
          <button class="lang" type="button" aria-label="Сменить язык">
            <img src="${langIcon}" alt="" />
          </button>
        </div>

        <div
          class="nav-compact-left"
          data-reveal="element"
          data-reveal-trigger="manual"
          data-reveal-scope="hero"
          data-reveal-sequence="hero-nav"
        >
          <button class="inner-job-btn" type="button">
            <span>Все вакансии</span>
            <img src="${userIcon}" alt="" />
          </button>
          <button class="inner-menu" type="button">
            <span>Меню</span>
            <span class="dots" aria-hidden="true"></span>
          </button>
        </div>

        <div
          class="nav-compact-right"
          data-reveal="element"
          data-reveal-trigger="manual"
          data-reveal-scope="hero"
          data-reveal-sequence="hero-nav"
        >
          <button class="inner-career" type="button">
            <span>Начало карьеры</span>
            <span class="dots" aria-hidden="true"></span>
          </button>
          <a class="inner-icon-btn" href="tel:88007005555" aria-label="Позвонить">
            <img src="${phoneIcon}" alt="" />
          </a>
          <button class="inner-icon-btn" type="button" aria-label="Сменить язык">
            <img src="${langIcon}" alt="" />
          </button>
        </div>

        <nav
          class="mine-breadcrumbs"
          aria-label="Хлебные крошки"
          data-reveal="element"
          data-reveal-trigger="manual"
          data-reveal-scope="hero"
          data-reveal-sequence="hero-nav"
        >
          <button class="mine-breadcrumb-link" type="button">
            <span>Главная</span>
          </button>
          <span class="mine-breadcrumb-dot" aria-hidden="true"></span>
          <button class="mine-breadcrumb-link" type="button">
            <span>Рудники</span>
          </button>
          <span class="mine-breadcrumb-dot" aria-hidden="true"></span>
          <span class="mine-breadcrumb-current" aria-current="page">Рудник «Березитовый»</span>
        </nav>
      </header>

      <div class="mine-mask-anchor" id="vacancies" aria-hidden="true"></div>
      <div class="lock" aria-hidden="true"></div>
    </section>

    <header class="inner-nav" aria-label="Навигация после первого экрана">
      <div class="inner-nav-left">
        <button class="inner-job-btn" type="button">
          <span>Все вакансии</span>
          <img src="${userIcon}" alt="" />
        </button>
        <button class="inner-menu" type="button">
          <span>Меню</span>
          <span class="dots" aria-hidden="true"></span>
        </button>
      </div>

      <a
        class="inner-brand"
        href="/"
        aria-label="Компания"
        data-pixelate-image
        data-pixelate-kind="logo"
        data-pixel-size="8"
      >
        <img src="${colorLogo}" alt="" />
      </a>

      <div class="inner-nav-right">
        <button class="inner-career" type="button">
          <span>Начало карьеры</span>
          <span class="dots" aria-hidden="true"></span>
        </button>
        <a class="inner-icon-btn" href="tel:88007005555" aria-label="Позвонить">
          <img src="${phoneIcon}" alt="" />
        </a>
        <button class="inner-icon-btn" type="button" aria-label="Сменить язык">
          <img src="${langIcon}" alt="" />
        </button>
      </div>
    </header>

    <section class="mine-stats" aria-labelledby="mine-stats-title">
      <div class="mine-stats-grid">
        <div class="mine-stats-aside">
          <h2
            id="mine-stats-title"
            data-reveal="text"
            data-reveal-trigger="manual"
            data-reveal-scope="hero"
            data-reveal-sequence="hero-stats"
            data-reveal-after="hero-title"
            data-reveal-split="lines"
          >
            <span class="mine-stats-title-line">Основные</span>
            <span class="mine-stats-title-line">показатели</span>
          </h2>
          <div class="mine-year">
            <p>Год запуска рудника</p>
            <strong>2007</strong>
          </div>
        </div>

        <div class="mine-stat-cards" aria-label="Показатели рудника">
          <article class="mine-stat-card">
            <h3
              data-reveal="text"
              data-reveal-trigger="manual"
              data-reveal-scope="hero"
              data-reveal-sequence="hero-stats"
              data-reveal-after="hero-title"
              data-reveal-split="lines"
            >
              <span class="mine-stat-title-nowrap">Способ добычи</span>
            </h3>
            <img src="${statMethodIcon}" alt="" />
            <p>Подземный</p>
          </article>
          <article class="mine-stat-card">
            <h3
              data-reveal="text"
              data-reveal-trigger="manual"
              data-reveal-scope="hero"
              data-reveal-sequence="hero-stats"
              data-reveal-after="hero-title"
              data-reveal-split="lines"
            >
              Запасы
            </h3>
            <img src="${statReservesIcon}" alt="" />
            <p>
              <strong>763 тыс.</strong>
              <span>унций с 5,97 г/т</span>
            </p>
          </article>
          <article class="mine-stat-card">
            <h3
              data-reveal="text"
              data-reveal-trigger="manual"
              data-reveal-scope="hero"
              data-reveal-sequence="hero-stats"
              data-reveal-after="hero-title"
              data-reveal-split="lines"
            >
              Ресурсы
            </h3>
            <img src="${statResourcesIcon}" alt="" />
            <p>
              <strong>1 106 тыс.</strong>
              <span>унций с 5,11 г/т</span>
            </p>
          </article>
        </div>
      </div>
    </section>
  `);

  container.replaceChildren(...elements);
}

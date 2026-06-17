import benefitIconCompany from "../assets/benefit-icon-company.svg";
import benefitIconPay from "../assets/benefit-icon-pay.svg";
import benefitIconStability from "../assets/benefit-icon-stability.svg";
import statIconPeople from "../assets/stat-icon-people.svg";
import statIconReserves from "../assets/stat-icon-reserves.svg";
import successSlideLeaders from "../assets/success-slide-leaders.png";
import successSlideStudents from "../assets/success-slide-students.png";
import successSlideWorkers from "../assets/success-slide-workers.png";
import successStrategyIcon from "../assets/success-strategy-icon.svg";

export const vacancyTabs = [
  { label: "Вахта", count: 12, visualIndex: 0 },
  { label: "Стажировка", count: 4, visualIndex: 1 },
  { label: "Офис", count: 9, visualIndex: 2 },
  { label: "Женщинам", count: 6, visualIndex: 3 },
  { label: "Все вакансии", count: 28, hot: true }
];

export const peopleStats = [
  {
    value: "7800",
    unit: "+",
    caption: "Сотрудников\nв компании",
    icon: statIconPeople
  },
  {
    value: "15.2",
    unit: "млн.",
    caption: "Унций — доказанные\nвероятные запасы",
    icon: statIconReserves
  }
];

const benefitText =
  "Мы обеспечиваем максимально возможную безопасность и высокую эффективность производственных процессов, что обеспечивает финансовую стабильность";

export const benefitCards = [
  {
    title: "Стабильность",
    icon: benefitIconStability,
    text: benefitText
  },
  {
    title: "Платим больше",
    icon: benefitIconPay,
    text: benefitText
  },
  {
    title: "Надежная компания",
    icon: benefitIconCompany,
    text: benefitText
  },
  {
    title: "Стабильность",
    icon: benefitIconStability,
    text: benefitText
  },
  {
    title: "Платим больше",
    icon: benefitIconPay,
    text: benefitText
  },
  {
    title: "Надежная компания",
    icon: benefitIconCompany,
    text: benefitText
  }
];

export const successSection = {
  kicker: "Направления",
  titleLines: ["Достигайте успехов", "вместе с нами"],
  sliderLabel: "Направления карьеры",
  slides: [
    {
      image: successSlideLeaders,
      icon: successStrategyIcon,
      titleLines: ["Ответственность", "достойная стратегов"],
      text: "Станьте частью команды, где решения превращаются в результат. Ведите людей, развивайте процессы и влияйте на стратегию Nordgold."
    },
    {
      image: successSlideWorkers,
      icon: successStrategyIcon,
      titleLines: ["Мастерство", "на вес золота"],
      text: "Работайте на современном производстве, где ценят опыт, точность и ответственность. Получайте стабильные условия и поддержку команды."
    },
    {
      image: successSlideStudents,
      icon: successStrategyIcon,
      titleLines: ["Первый опыт", "с настоящими задачами"],
      text: "Начните карьеру с практики на реальных проектах. Учитесь у наставников, пробуйте разные направления и находите свой путь в Nordgold."
    }
  ],
  copy: {
    icon: successStrategyIcon,
    titleLines: ["Ответственность", "достойная стратегов"],
    text: "Станьте частью команды, где решения превращаются в результат. Ведите людей, развивайте процессы и влияйте на стратегию Nordgold."
  },
  tabs: [
    { label: "Руководителям", count: 6, active: true },
    { label: "Рабочие специальности", count: 4 },
    { label: "Студентам", count: 12 },
    { label: "Все вакансии", count: 28, all: true }
  ]
};

export const mineLocations = [
  {
    region: "Северо-Енисейский район",
    title: "Ирокинда",
    location: "Россия, Бурятия",
    method: "Подземная добыча",
    year: "1985",
    vacancies: 7
  },
  {
    region: "Магаданская область",
    title: "Таборный",
    location: "Россия, Якутия",
    method: "Карьерная добыча",
    year: "2002",
    vacancies: 5
  },
  {
    region: "Чукотский район",
    title: "Нерюнгри",
    location: "Россия, Дальний Восток",
    method: "Подземная добыча",
    year: "2011",
    vacancies: 4
  },
  {
    region: "Олекминский район",
    title: "Кластер Гросс",
    location: "Россия, Якутия",
    method: "Комбинированная добыча",
    year: "2007",
    vacancies: 28
  },
  {
    region: "Амурская область",
    title: "Березитовый",
    location: "Россия, Забайкалье",
    method: "Открытая добыча",
    year: "2010",
    vacancies: 9
  }
];

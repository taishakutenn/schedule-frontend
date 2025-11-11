import InfoBlock from "../components/infoBlock/InfoBlock";
import Button from "../components/Button/Button";

import "./Plan.css";

const plansInfo = [
  {
    title: "Учебные планы",
    text: [
      "На этой странице вы можете осуществлять работу с учебными планами",
      "В том числе: экспорт учебных планов из Excel файлов, назначение и просмотр нагрузки преподавателей факультета.",
    ],
  },
];

export default function Plans() {
  return (
    <main>
      <InfoBlock items={plansInfo} />
      <div class="btn--box">
        <Button>Загрузка плана</Button>
        <Button>Назначение учебной нагрузки</Button>
      </div>
    </main>
  );
}

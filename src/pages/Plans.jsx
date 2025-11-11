import { useState } from "react";
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

const planLoadHeaderInfo = [
  {
    title: "Загрузка учебных планов",
    text: [],
  },
];

export default function Plans() {
  const [activeView, setActiveView] = useState(null);

  const handleLoadPlan = () => setActiveView("loadPlan");
  const handleTeachLoad = () => setActiveView("teachLoad");

  const Content = () => {
    if (activeView === "loadPlan") {
      return (
        <div className="dynamic-content">
          <InfoBlock items={planLoadHeaderInfo} />
          <div className="instruction"></div>
        </div>
      );
    }

    if (activeView === "teachLoad") {
      return <p>TEACH LOAD</p>;
    }

    return null;
  };

  return (
    <main>
      <InfoBlock items={plansInfo} />
      <div className="btn--box">
        <Button onClick={handleLoadPlan}>Загрузка плана</Button>
        <Button onClick={handleTeachLoad}>Назначение учебной нагрузки</Button>
      </div>
      <div>{Content()}</div>
    </main>
  );
}

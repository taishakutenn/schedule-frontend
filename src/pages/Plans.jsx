import { useState } from "react";
import InfoBlock from "../components/InfoBlock/InfoBlock";
import Button from "../components/Button/Button";
import PlanLoader from "../components/Plan/PlanLoader";
import TeachLoad from "../components/Plan/TeachLoad";

import "./Plan.css";

const plansInfo = [
  {
    title: "Учебные планы и нагрузка",
    text: [
      "На этой странице вы можете осуществлять работу с учебными планами и нагрузкой преподавателей.",
      "В том числе: экспорт учебных планов из Excel файлов, назначение и просмотр нагрузки преподавателей факультета.",
    ],
  },
];

export default function Plans() {
  const [activeView, setActiveView] = useState(null);

  const handleLoadPlan = () => setActiveView("loadPlan");
  const handleTeachLoad = () => setActiveView("teachLoad");

  const Content = () => {
    if (activeView === "loadPlan") {
      return <PlanLoader />;
    }

    if (activeView === "teachLoad") {
      return <TeachLoad />;
    }

    return null;
  };

  return (
    <main>
      <InfoBlock items={plansInfo} />
      <div className="btn--box">
        <Button onClick={handleLoadPlan}>Загрузка плана</Button>
        <Button onClick={handleTeachLoad}>Учебная нагрузка</Button>
      </div>
      <div>{Content()}</div>
    </main>
  );
}

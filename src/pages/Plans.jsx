import { useState } from "react";
import InfoBlock from "../components/infoBlock/InfoBlock";
import Button from "../components/Button/Button";
import DynamicList from "../components/DynamicList/DynamicList";

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

const planLoadInstructionHeaderInfo = [
  {
    title: "Инструкция для загрузки учебного плана",
    text: [
      "Для успешной загрузки учебного плана выполните действия, описанные ниже",
    ],
  },
];

export default function Plans() {
  const [activeView, setActiveView] = useState(null);

  const [sections, setSections] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [modules, setModules] = useState([]);

  // Функции для разделов
  const addSection = () => setSections([...sections, { name: "" }]);
  const updateSection = (index, value) => {
    const newSections = [...sections];
    newSections[index].name = value;
    setSections(newSections);
  };
  const removeSection = (index) =>
    setSections(sections.filter((_, i) => i !== index));

  // Функции для циклов
  const addCycle = () => setCycles([...cycles, { name: "" }]);
  const updateCycle = (index, value) => {
    const newCycles = [...cycles];
    newCycles[index].name = value;
    setCycles(newCycles);
  };
  const removeCycle = (index) =>
    setCycles(cycles.filter((_, i) => i !== index));

  // Функции для модулей
  const addModule = () => setModules([...modules, { name: "" }]);
  const updateModule = (index, value) => {
    const newModules = [...modules];
    newModules[index].name = value;
    setModules(newModules);
  };
  const removeModule = (index) =>
    setModules(modules.filter((_, i) => i !== index));

  const handleLoadPlan = () => setActiveView("loadPlan");
  const handleTeachLoad = () => setActiveView("teachLoad");

  const Content = () => {
    if (activeView === "loadPlan") {
      return (
        <div className="dynamic-content">
          <InfoBlock items={planLoadHeaderInfo} />
          <div className="plan-structure-data">
            <DynamicList
              title="Разделы"
              items={sections}
              onAdd={addSection}
              onRemove={removeSection}
              onUpdate={updateSection}
              placeholder="Название раздела"
            />
            <DynamicList
              title="Циклы"
              items={cycles}
              onAdd={addCycle}
              onRemove={removeCycle}
              onUpdate={updateCycle}
              placeholder="Название цикла"
            />
            <DynamicList
              title="Модули"
              items={modules}
              onAdd={addModule}
              onRemove={removeModule}
              onUpdate={updateModule}
              placeholder="Название модуля"
            />
          </div>
          <Button>Список загруженных планов</Button>
          <Button action="load">Загрузить файл плана</Button>
          <div className="instruction">
            <InfoBlock items={planLoadInstructionHeaderInfo} />
            {/* <InfoBlock /> */}
          </div>
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

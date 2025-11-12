import { useState } from "react";
import InfoBlock from "../components/infoBlock/InfoBlock";
import Button from "../components/Button/Button";
import DynamicInputList from "../components/DynamicList/DynamicInputList";
import DynamicSelectList from "../components/DynamicList/DynamicSelectList";

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
    level: 2,
    text: [
      "Для успешной загрузки учебного плана выполните действия, описанные ниже",
    ],
  },
];

const teachLoadHeaderInfo = [
  {
    title: "Учебная нагрузка преподавателей",
    text: [],
  },
];

export default function Plans() {
  const [activeView, setActiveView] = useState(null);

  const [sections, setSections] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [modules, setModules] = useState([]);

  // Chapters function
  const addSection = () => setSections([...sections, { name: "" }]);
  const updateSection = (index, value) => {
    const newSections = [...sections];
    newSections[index].name = value;
    setSections(newSections);
  };
  const removeSection = (index) =>
    setSections(sections.filter((_, i) => i !== index));
  // Cycles function
  const addCycle = () => setCycles([...cycles, { name: "" }]);
  const updateCycle = (index, value) => {
    const newCycles = [...cycles];
    newCycles[index].name = value;
    setCycles(newCycles);
  };
  const removeCycle = (index) =>
    setCycles(cycles.filter((_, i) => i !== index));
  // Modules function
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

  const [teacher, setTeacher] = useState("");
  const [plan, setPlan] = useState("");

  const [subjects, setSubjects] = useState([]);

  const teachers = ["Антонов", "Марков", "Фильков"];
  const plans = ["09.02.07 - 2023", "08.04.03 - 2024"];
  const subjectsList = ["Математика", "Физика", "Химия", "Информатика"];

  const addSubject = () => {
    setSubjects([...subjects, { value: "" }]);
  };

  const updateSubject = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index].value = value;
    setSubjects(newSubjects);
  };
  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const Content = () => {
    if (activeView === "loadPlan") {
      return (
        <div className="dynamic-content">
          <InfoBlock items={planLoadHeaderInfo} />
          <div className="plan-structure-data">
            <DynamicInputList
              title="Разделы"
              items={sections}
              onAdd={addSection}
              onRemove={removeSection}
              onUpdate={updateSection}
              placeholder="Название раздела"
            />
            <DynamicInputList
              title="Циклы"
              items={cycles}
              onAdd={addCycle}
              onRemove={removeCycle}
              onUpdate={updateCycle}
              placeholder="Название цикла"
            />
            <DynamicInputList
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
      return (
        <div className="dynamic-content">
          <InfoBlock items={teachLoadHeaderInfo} />
          <div className="teachLoad-data">
            <div className="select-container">
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
              >
                <option value="">Выберите преподавателя</option>
                {teachers.map((f, i) => (
                  <option key={i} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option value="">Выберите учебный план</option>
                {plans.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <DynamicSelectList
              title="Дисциплины"
              items={subjects}
              onAdd={addSubject}
              onRemove={removeSubject}
              onUpdate={updateSubject}
              options={subjectsList}
              placeholder="Выберите дисциплину"
              label="дисциплину"
            />
          </div>
        </div>
      );
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

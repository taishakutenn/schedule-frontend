import { useState, useEffect } from "react";
import InfoBlock from "../components/infoBlock/InfoBlock";
import Button from "../components/Button/Button";
import DynamicInputList from "../components/DynamicList/DynamicInputList";
import DynamicSelectList from "../components/DynamicList/DynamicSelectList";
import { getTeachers } from "../api/teachersAPI";

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

const loadTeach = {
  general: 2,
  current: 1.3,
};

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

  // Teach load state
  const [teacher, setTeacher] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getTeachers();
        setTeachers(data);
      } catch (err) {
        setError(err.message);
        console.error("Ошибка загрузки преподавателей:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const [plan, setPlan] = useState("");
  const [subjects, setSubjects] = useState([]);

  // const teachers = ["Антонов", "Марков", "Фильков"];
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
          </div>
        </div>
      );
    }

    if (activeView === "teachLoad") {
      return (
        <div className="dynamic-content">
          <InfoBlock items={teachLoadHeaderInfo} />

          {loading && <p>Загрузка преподавателей...</p>}
          {error && <p className="error">Ошибка: {error}</p>}

          <div className="teachLoad-data">
            <div className="select-container">
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                disabled={loading}
              >
                <option value="">Выберите преподавателя</option>
                {teachers.map((t, i) => (
                  <option key={t.id} value={t.id}>
                    {t.surname} {t.name} {t.fathername}
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
            <div className="right-column">
              <div className="teach-load-stats">
                <div className="stat-item">
                  <span className="stat-label">
                    Количество ставок преподавателя:
                  </span>
                  <span className="stat-value">{loadTeach.general}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Текущее количество ставок:</span>
                  <span className="stat-value">{loadTeach.current}</span>
                </div>
              </div>
              <Button>Синхронизировать</Button>
            </div>
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

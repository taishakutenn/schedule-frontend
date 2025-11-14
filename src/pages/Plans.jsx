import { useState, useEffect } from "react";
import InfoBlock from "../components/InfoBlock/InfoBlock";
import Button from "../components/Button/Button";
import DynamicInputList from "../components/DynamicList/DynamicInputList";
import DynamicSelectList from "../components/DynamicList/DynamicSelectList";
import { getTeachers } from "../api/teachersAPI";
import { getPlans } from "../api/plansAPI";
import { getAllSubjectsInPlan } from "../api/subjectAPI";
import Modal from "../components/Modal/Modal";
import { useApiData } from "../hooks/useApiData";

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [plan, setPlan] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [allSubjectsInPlan, setAllSubjectsInPlan] = useState([]);
  const [teacher, setTeacher] = useState("");

  const {
    data: teachers,
    loading: teachersLoading,
    error: teachersError,
  } = useApiData(getTeachers, [], isModalOpen);

  const {
    data: plans,
    loading: plansLoading,
    error: plansError,
  } = useApiData(getPlans, [], isModalOpen);

  // get all subjects in selected plan
  useEffect(() => {
    if (plan) {
      const fetchSubjects = async () => {
        try {
          const subjects = await getAllSubjectsInPlan(plan);
          setAllSubjectsInPlan(subjects);
        } catch (err) {
          console.error("Ошибка загрузки предметов:", err);
          setAllSubjectsInPlan([]);
        }
      };

      fetchSubjects();
    } else {
      setAllSubjectsInPlan([]);
    }
  }, [plan]);

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
          <Button onClick={() => setIsModalOpen(true)}>
            Назначить нагрузку
          </Button>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Назначение нагрузки"
            size="md"
          >
            {(teachersLoading || plansLoading) && (
              <p className="loading">Загрузка...</p>
            )}
            {teachersError && <p className="error">{teachersError}</p>}
            {plansError && <p className="error">{plansError}</p>}
            <div className="teachLoad-data-modal">
              <div className="select-container">
                <select
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  disabled={teachersLoading}
                >
                  <option value="">Выберите преподавателя</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.surname} {t.name} {t.fathername}
                    </option>
                  ))}
                </select>

                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  disabled={plansLoading}
                >
                  <option value="">Выберите учебный план</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.year} - {p.speciality_code}
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
                options={allSubjectsInPlan.map(
                  (s) => s.name || s.title || s.subject_name
                )}
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
                    <span className="stat-label">
                      Текущее количество ставок:
                    </span>
                    <span className="stat-value">{loadTeach.current}</span>
                  </div>
                </div>
                <Button>Синхронизировать</Button>
              </div>
            </div>
          </Modal>
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

import { useState, useEffect } from "react";
import InfoBlock from "../components/InfoBlock/InfoBlock";
import Button from "../components/Button/Button";
import DynamicInputList from "../components/DynamicList/DynamicInputList";
import DynamicTripleSelectList from "../components/DynamicList/DynamicTripleSelectList";
import { getTeachers } from "../api/teachersAPI";
import { getPlans } from "../api/plansAPI";
import { getAllSubjectsInPlan } from "../api/subjectAPI";
import { getGroupsBySpeciality } from "../api/groupAPI";
import { getSubjectHoursBySubject } from "../api/subjectHoursAPI";
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

  const [plan, setPlan] = useState(""); // ID плана
  const [group, setGroup] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [allSubjectsInPlan, setAllSubjectsInPlan] = useState([]);
  const [allGroupsInSpeciality, setAllGroupsInSpeciality] = useState([]);
  const [teacher, setTeacher] = useState("");

  // Новое состояние для хранения данных о часах по предметам
  const [subjectHoursData, setSubjectHoursData] = useState({});

  // Используем useApiData с enabled = isModalOpen
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

  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState(null);

  // Функция получения семестров по предмету
  const getSemestersBySubject = (subjectId) => {
    if (!subjectId) return [];

    const subject = allSubjectsInPlan.find((s) => s.id === subjectId);
    if (!subject) return [];

    const hours = subjectHoursData[subject.id] || [];
    const semesters = hours.map((h) => h.semester);
    // Уникальные и отсортированные по возрастанию номера семестров
    return [...new Set(semesters)].sort((a, b) => a - b);
  };

  // Функция получения типов пар по предмету и семестру
  const getClassTypesBySemester = (subjectId, semester) => {
    if (!subjectId || !semester) return [];

    const subject = allSubjectsInPlan.find((s) => s.id === subjectId);
    if (!subject) return [];

    const hours = subjectHoursData[subject.id] || [];
    const semesterData = hours.find((h) => h.semester === parseInt(semester));
    if (!semesterData) return [];

    const types = [];
    if (semesterData.lectures_hours > 0) types.push("Лекция");
    if (semesterData.laboratory_hours > 0) types.push("Лабораторная");
    if (semesterData.practical_hours > 0) types.push("Практика");
    if (semesterData.course_project_hours > 0) types.push("Курсовой проект");

    return types;
  };

  // Загрузка предметов
  useEffect(() => {
    if (plan) {
      const fetchSubjects = async () => {
        try {
          const subjects = await getAllSubjectsInPlan(plan);
          setAllSubjectsInPlan(subjects);

          // После загрузки предметов, загружаем часы для каждого из них
          const data = {};
          for (const subject of subjects) {
            try {
              const hours = await getSubjectHoursBySubject(subject.id);
              data[subject.id] = hours;
            } catch (err) {
              console.error(
                `Ошибка загрузки часов для предмета ${subject.id}:`,
                err
              );
              data[subject.id] = []; // Если ошибка, присваиваем пустой массив
            }
          }
          setSubjectHoursData(data);
        } catch (err) {
          console.error("Ошибка загрузки предметов:", err);
          setAllSubjectsInPlan([]);
          setSubjectHoursData({}); // Сбросить, если ошибка
        }
      };

      fetchSubjects();
    } else {
      setAllSubjectsInPlan([]);
      setSubjectHoursData({});
    }
  }, [plan]); // Зависимость: при смене плана - перезагружаем предметы и часы

  // Загрузка групп
  useEffect(() => {
    if (plan) {
      const selectedPlan = plans.find((p) => p.id === parseInt(plan));
      if (selectedPlan) {
        const fetchGroups = async () => {
          setGroupsLoading(true);
          setGroupsError(null);

          try {
            const groups = await getGroupsBySpeciality(
              selectedPlan.speciality_code
            );

            const filteredGroups = groups.filter((group) => {
              const groupPrefix = group.group_name.slice(0, 2);
              const yearSuffix = selectedPlan.year.toString().slice(-2);
              return groupPrefix === yearSuffix;
            });

            setAllGroupsInSpeciality(filteredGroups);
          } catch (err) {
            console.error("Ошибка загрузки групп:", err);
            setGroupsError(err.message);
            setAllGroupsInSpeciality([]);
          } finally {
            setGroupsLoading(false);
          }
        };

        fetchGroups();
      }
    } else {
      setAllGroupsInSpeciality([]);
    }
  }, [plan, plans]);

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
    // Обновленная структура элемента subjects
    setSubjects([...subjects, { value1: "", value2: "", value3: "" }]);
  };

  // Обновленная функция updateSubject для работы с тремя полями
  const updateSubject = (index, value1, value2, value3) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { value1, value2, value3 };
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
          <Button size="small">Список загруженных планов</Button>
          <Button size="small" action="load">
            Загрузить файл плана
          </Button>
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
          <Button size="small" onClick={() => setIsModalOpen(true)}>
            Назначить нагрузку
          </Button>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Назначение нагрузки"
            size="xxl"
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
                  {/* ✅ Правильная проверка и отображение данных */}
                  {teachersLoading ? (
                    <option disabled>Загрузка преподавателей...</option>
                  ) : teachersError ? (
                    <option disabled>Ошибка: {teachersError}</option>
                  ) : teachers?.length > 0 ? (
                    teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.surname} {t.name} {t.fathername}
                      </option>
                    ))
                  ) : (
                    <option disabled>Нет данных</option>
                  )}
                </select>

                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  disabled={plansLoading}
                >
                  <option value="">Выберите учебный план</option>
                  {/* ✅ Правильная проверка и отображение данных */}
                  {plansLoading ? (
                    <option disabled>Загрузка планов...</option>
                  ) : plansError ? (
                    <option disabled>Ошибка: {plansError}</option>
                  ) : plans?.length > 0 ? (
                    plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.year} - {p.speciality_code}
                      </option>
                    ))
                  ) : (
                    <option disabled>Нет данных</option>
                  )}
                </select>

                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  disabled={groupsLoading}
                >
                  <option value="">Выберите группу</option>
                  {allGroupsInSpeciality.map((g) => (
                    <option key={g.group_name} value={g.group_name}>
                      {g.group_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Обновлённый компонент с динамическими опциями для семестров и типов пар */}
              <DynamicTripleSelectList
                title="Дисциплины"
                items={subjects}
                onAdd={addSubject}
                onRemove={removeSubject}
                onUpdate={updateSubject}
                options1={allSubjectsInPlan.map((s) => ({
                  label: s.name || s.title || s.subject_name,
                  value: s.id,
                }))}
                // Передаём функции для получения опций
                getOptions2={getSemestersBySubject}
                getOptions3={getClassTypesBySemester}
                placeholder1="Выберите дисциплину"
                placeholder2="Выберите семестр"
                placeholder3="Выберите тип пары"
                label="дисциплину"
                showSecondSelect={true}
                showThirdSelect={true}
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
                <Button>Сохранить</Button>
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

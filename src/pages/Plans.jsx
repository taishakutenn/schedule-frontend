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

  const [plan, setPlan] = useState("");
  const [group, setGroup] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [allSubjectsInPlan, setAllSubjectsInPlan] = useState([]);
  const [allGroupsInSpeciality, setAllGroupsInSpeciality] = useState([]);
  const [teacher, setTeacher] = useState("");

  const [subjectHoursData, setSubjectHoursData] = useState({}); // { subjectId: [hours] }
  const [loadingHours, setLoadingHours] = useState({}); // { subjectId: true/false }

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

  const loadSubjectHours = async (subjectId) => {
    if (loadingHours[subjectId]) return;

    setLoadingHours((prev) => ({ ...prev, [subjectId]: true }));

    try {
      const hours = await getSubjectHoursBySubject(subjectId);
      setSubjectHoursData((prev) => ({
        ...prev,
        [subjectId]: hours,
      }));
    } catch (err) {
      console.error(`Ошибка загрузки часов для предмета ${subjectId}:`, err);

      setSubjectHoursData((prev) => ({
        ...prev,
        [subjectId]: [],
      }));
    } finally {
      setLoadingHours((prev) => {
        const newState = { ...prev };
        delete newState[subjectId];
        return newState;
      });
    }
  };

  const getSemestersBySubject = (subjectId) => {
    if (!subjectId) return [];
    const hours = subjectHoursData[subjectId];
    if (hours) {
      const semesters = hours.map((h) => h.semester);
      return [...new Set(semesters)].sort((a, b) => a - b);
    }

    loadSubjectHours(subjectId);
    return [];
  };

  const getClassTypesBySemester = (subjectId, semester) => {
    if (!subjectId || !semester) return [];
    const hours = subjectHoursData[subjectId];
    if (!hours) {
      loadSubjectHours(subjectId);
      return [];
    }
    const semesterData = hours.find((h) => h.semester === parseInt(semester));
    if (!semesterData) return [];

    const types = [];
    if (semesterData.lectures_hours > 0) types.push("Лекция");
    if (semesterData.laboratory_hours > 0) types.push("Лабораторная");
    if (semesterData.practical_hours > 0) types.push("Практика");
    if (semesterData.course_project_hours > 0) types.push("Курсовой проект");

    return types;
  };

  // load subjects
  useEffect(() => {
    if (plan) {
      const fetchSubjects = async () => {
        try {
          const subjects = await getAllSubjectsInPlan(plan);
          setAllSubjectsInPlan(subjects);

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
              data[subject.id] = [];
            }
          }
          setSubjectHoursData(data);
        } catch (err) {
          console.error("Ошибка загрузки предметов:", err);
          setAllSubjectsInPlan([]);
          setSubjectHoursData({});
        }
      };

      fetchSubjects();
    } else {
      setAllSubjectsInPlan([]);
      setSubjectHoursData({});
    }
  }, [plan]);

  // load groups
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

  // Function that filtered data
  const getFilteredData = useCallback((data, search) => {
    if (!search) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter((item) => {
      return Object.values(item).some((value) => {
        return String(value).toLowerCase().includes(lowerSearch);
      });
    });
  }, []);

  // List of loaded plans

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
    setSubjects([...subjects, { value1: "", value2: "", value3: "" }]);
  };

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
            size="xl"
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

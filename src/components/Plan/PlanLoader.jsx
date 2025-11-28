// components/Plan/PlanLoader.jsx
import { useState, useEffect } from "react";
import InfoBlock from "../InfoBlock/InfoBlock";
import Button from "../Button/Button";
import DynamicInputList from "../DynamicList/DynamicInputList";
import { getTeachers } from "../../api/teachersAPI";
import { getPlans } from "../../api/plansAPI";
import { getAllSubjectsInPlan } from "../../api/subjectAPI";
import { getGroupsBySpeciality } from "../../api/groupAPI";
import { getSubjectHoursBySubject } from "../../api/subjectHoursAPI";
import { useApiData } from "../../hooks/useApiData";

// Информационные блоки
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

export default function PlanLoader() {
  // --- Состояния для вводимых пользователем кодов ---
  const [sections, setSections] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [modules, setModules] = useState([]);
  // ---

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
  } = useApiData(getTeachers, [], true);

  const {
    data: plans,
    loading: plansLoading,
    error: plansError,
  } = useApiData(getPlans, [], true);

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
      const selectedPlan = plans?.find((p) => p.id === parseInt(plan));
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

  // --- Функции для управления вводимыми списками (как раньше) ---
  const addSection = () => setSections([...sections, { name: "" }]);
  const updateSection = (index, value) => {
    const newSections = [...sections];
    newSections[index].name = value;
    setSections(newSections);
  };
  const removeSection = (index) =>
    setSections(sections.filter((_, i) => i !== index));

  const addCycle = () => setCycles([...cycles, { name: "" }]);
  const updateCycle = (index, value) => {
    const newCycles = [...cycles];
    newCycles[index].name = value;
    setCycles(newCycles);
  };
  const removeCycle = (index) =>
    setCycles(cycles.filter((_, i) => i !== index));

  const addModule = () => setModules([...modules, { name: "" }]);
  const updateModule = (index, value) => {
    const newModules = [...modules];
    newModules[index].name = value;
    setModules(newModules);
  };
  const removeModule = (index) =>
    setModules(modules.filter((_, i) => i !== index));
  // ---

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

  // --- Функция загрузки Excel файла ---
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Проверим, что парсер может получить коды из состояния
      const sectionCodes = sections
        .map((s) => s.name)
        .filter((n) => n.trim() !== "");
      const cycleCodes = cycles
        .map((c) => c.name)
        .filter((n) => n.trim() !== "");
      const moduleCodes = modules
        .map((m) => m.name)
        .filter((n) => n.trim() !== "");

      console.log("Коды разделов (ОП, ПП, ...):", sectionCodes);
      console.log("Коды циклов (НО, ОО, ...):", cycleCodes);
      console.log("Коды модулей (ОУД, ПОО, ...):", moduleCodes);

      // Загрузка файла и вызов парсера
      // Здесь нужно интегрировать логику парсера
      // 1. Прочитать файл (используя XLSX или другой пакет в браузере)
      // 2. Вызвать processStructureData(jsonData, sectionCodes, cycleCodes, moduleCodes)
      // и другие функции парсера с этими кодами
      // 3. Отправить результат на бэкенд

      // ПОКА: Заглушка для демонстрации
      alert(
        `Файл ${file.name} загружен. Коды: ОП=${sectionCodes.join(
          ", "
        )}, ОО=${cycleCodes.join(", ")}, ОУД=${moduleCodes.join(", ")}`
      );
    } catch (err) {
      console.error("Ошибка обработки файла:", err);
      // Отобразить ошибку пользователю
    }
  };
  // ---

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
      <input
        type="file"
        accept=".xls, .xlsx"
        onChange={handleFileUpload}
        style={{ marginBottom: "10px" }} // Простой стиль для отступа
      />
      <Button size="small">Список загруженных планов</Button>
      {/* Кнопка "Загрузить файл плана" теперь триггерит выбор файла через input */}
      <Button
        size="small"
        action="load"
        onClick={() => document.querySelector('input[type="file"]').click()}
      >
        Загрузить файл плана
      </Button>
      <div className="instruction">
        <InfoBlock items={planLoadInstructionHeaderInfo} />
      </div>
    </div>
  );
}

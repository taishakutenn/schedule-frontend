import "./PlanLoader.css";

import { useState, useEffect, useRef } from "react";
import InfoBlock from "../InfoBlock/InfoBlock";
import Button from "../Button/Button";
import DynamicInputList from "../DynamicList/DynamicInputList";
import { getTeachers } from "../../api/teachersAPI";
import { getPlans } from "../../api/plansAPI";
import { getAllSubjectsInPlan } from "../../api/subjectAPI";
import { getGroupsBySpeciality } from "../../api/groupAPI";
import { getSubjectHoursBySubject } from "../../api/subjectHoursAPI";
import { useApiData } from "../../hooks/useApiData";
import { uploadAndParsePlan } from "../../api/parserLoad";
import HandbookTable from "../HandbookTable/HandbookTable";

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
  const [sections, setSections] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [modules, setModules] = useState([]);

  const [plan, setPlan] = useState("");
  const [group, setGroup] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [allSubjectsInPlan, setAllSubjectsInPlan] = useState([]);
  const [allGroupsInSpeciality, setAllGroupsInSpeciality] = useState([]);
  const [teacher, setTeacher] = useState("");

  const [subjectHoursData, setSubjectHoursData] = useState({}); // { subjectId: [hours] }
  const [loadingHours, setLoadingHours] = useState({}); // { subjectId: true/false }

  const [uploadStatus, setUploadStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showPlansTable, setShowPlansTable] = useState(false);
  const [plansTableData, setPlansTableData] = useState([]);
  const [plansTableLoading, setPlansTableLoading] = useState(false);
  const [plansTableError, setPlansTableError] = useState(null);

  const fileInputRef = useRef(null);

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

  const togglePlansTable = async () => {
    if (showPlansTable) {
      setShowPlansTable(false);
    } else {
      setPlansTableLoading(true);
      setPlansTableError(null);
      try {
        const data = await getPlans();
        setPlansTableData(data);
        setShowPlansTable(true);
      } catch (err) {
        console.error("Ошибка загрузки планов для таблицы:", err);
        setPlansTableError(err.message);
        setShowPlansTable(true);
      } finally {
        setPlansTableLoading(false);
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xls|xlsx)$/i)) {
      setUploadStatus("error");
      setUploadMessage("Файл должен быть в формате .xls или .xlsx");
      return;
    }

    setUploadStatus("loading");
    setUploadMessage("Загрузка и обработка файла...");
    setUploadProgress(0);

    try {
      const sectionCodes = sections
        .map((s) => s.name)
        .filter((n) => n.trim() !== "");
      const cycleCodes = cycles
        .map((c) => c.name)
        .filter((n) => n.trim() !== "");
      const moduleCodes = modules
        .map((m) => m.name)
        .filter((n) => n.trim() !== "");

      console.log("Коды разделов:", sectionCodes);
      console.log("Коды циклов:", cycleCodes);
      console.log("Коды модулей:", moduleCodes);

      const result = await uploadAndParsePlan(
        file,
        sectionCodes,
        cycleCodes,
        moduleCodes
      );

      console.log("Результат загрузки:", result);

      setUploadStatus("success");
      setUploadMessage(
        `Файл ${result.filename} успешно загружен и данные сохранены в БД. Номер плана: ${result.saved_plan_id}`
      );
    } catch (err) {
      console.error("Ошибка загрузки файла:", err);
      setUploadStatus("error");
      setUploadMessage(`Ошибка загрузки: ${err.message}`);
    } finally {
      setUploadProgress(100);
      setTimeout(() => {
        if (uploadStatus !== "success") {
          setUploadStatus(null);
          setUploadMessage("");
        }
      }, 5000);
    }
  };

  return (
    <div className="dynamic-content">
      <InfoBlock items={planLoadHeaderInfo} />
      <div className="plan-structure-data-wrapper">
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
      </div>
      <Button size="small" onClick={togglePlansTable}>
        {showPlansTable ? "Скрыть список планов" : "Список загруженных планов"}
      </Button>
      <Button
        size="small"
        action="load"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        Загрузить файл плана
      </Button>
      <input
        type="file"
        accept=".xls, .xlsx"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      {uploadStatus && (
        <div className={`upload-status upload-status--${uploadStatus}`}>
          <p>{uploadMessage}</p>
          {uploadStatus === "loading" && (
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {showPlansTable && (
        <div className="plans-table-container">
          {plansTableLoading && <p>Загрузка списка планов...</p>}
          {plansTableError && (
            <p className="error-message">Ошибка: {plansTableError}</p>
          )}
          {!plansTableLoading && !plansTableError && (
            <HandbookTable apiResponse={plansTableData} tableName="plans" />
          )}
        </div>
      )}

      {/* <div className="instruction">
        <InfoBlock items={planLoadInstructionHeaderInfo} />
      </div> */}
    </div>
  );
}

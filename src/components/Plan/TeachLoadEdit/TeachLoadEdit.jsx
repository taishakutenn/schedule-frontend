import { useState, useMemo, useCallback } from "react"; // <--- Добавлен useCallback
import { useApiData } from "../../../hooks/useApiData";
import { getPlans } from "../../../api/plansAPI";
import { getAllSubjectsInPlan } from "../../../api/subjectAPI"; // Используем оптимизированный API
import { getTeachers } from "../../../api/teachersAPI";
import { getGroupsBySpeciality } from "../../../api/groupAPI";
import Button from "../../../components/Button/Button";

export default function TeachLoadEdit({ onClose }) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Получаем список всех планов
  const {
    plans,
    loading: plansLoading,
    error: plansError,
  } = useApiData(getPlans, [], true);

  // Создаем стабильную функцию для загрузки предметов
  const apiFunctionForSubjects = useCallback(() => {
    if (selectedPlanId) {
      return getAllSubjectsInPlan(selectedPlanId);
    }
    return getAllSubjectsInPlan(selectedPlanId);
  }, [selectedPlanId]); // <--- Зависимость: selectedPlanId

  const {
    subjectsInPlan,
    loading: subjectsLoading,
    error: subjectsError,
  } = useApiData(
    apiFunctionForSubjects, // <--- Передаем стабильную функцию
    [], // Зависимости для apiFunction уже учтены в useCallback
    !!selectedPlanId // enabled: true, если selectedPlanId выбран
  );

  // Получаем список преподавателей
  const {
    teachers,
    loading: teachersLoading,
    error: teachersError,
  } = useApiData(getTeachers, [], true);

  // Используем useMemo для стабилизации специальности
  const planSpecialityCode = useMemo(() => {
    if (selectedPlanId && plans) {
      const foundPlan = plans.find((plan) => plan.id === selectedPlanId);
      return foundPlan ? foundPlan.speciality_code : null;
    }
    return null;
  }, [selectedPlanId, plans]);

  // Создаем стабильную функцию для загрузки групп
  const apiFunctionForGroups = useCallback(() => {
    if (planSpecialityCode) {
      return getGroupsBySpeciality(planSpecialityCode);
    }
    // Опять же, возвращаем функцию, которая возвращает промис, или полагаемся на enabled
    // В текущем useApiData, apiFunction должна быть функцией, если enabled=true
    return getGroupsBySpeciality(planSpecialityCode);
  }, [planSpecialityCode]); // <--- Зависимость: planSpecialityCode

  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
  } = useApiData(
    apiFunctionForGroups, // <--- Передаем стабильную функцию
    [], // Зависимости для apiFunction уже учтены в useCallback
    !!planSpecialityCode // enabled: true, если planSpecialityCode вычислен
  );

  // Функция для получения предметов по семестрам
  const getSubjectsBySemester = (subjects) => {
    if (!subjects || !Array.isArray(subjects))
      return { semester1: [], semester2: [] };

    const semester1 = [];
    const semester2 = [];

    subjects.forEach((subject) => {
      // В реальной логике нужно получить данные о часах и определить, в каком семестре предмет
      // Пока просто распределим по порядку
      if (semester1.length < 3) {
        semester1.push(subject);
      } else {
        semester2.push(subject);
      }
    });

    return { semester1, semester2 };
  };

  const { semester1, semester2 } = getSubjectsBySemester(subjectsInPlan);

  // Обработчик изменения плана
  const handlePlanChange = (e) => {
    const planId = parseInt(e.target.value);
    setSelectedPlanId(planId);
    setSelectedGroupId(null); // Сбрасываем выбранную группу
  };

  // Обработчик изменения группы
  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
  };

  // Обработчик выбора преподавателя (заглушка)
  const handleTeacherSelect = (subjectId, teacherId) => {
    console.log(
      `Назначено: Предмет ${subjectId} -> Преподаватель ${teacherId}`
    );
    // Здесь можно отправить запрос на сохранение назначения
  };

  if (plansLoading || subjectsLoading || teachersLoading || groupsLoading) {
    return <div>Загрузка данных...</div>;
  }

  if (plansError || subjectsError || teachersError || groupsError) {
    return (
      <div>
        Ошибка загрузки данных:{" "}
        {plansError || subjectsError || teachersError || groupsError}
      </div>
    );
  }

  if (plansLoading || subjectsLoading || teachersLoading || groupsLoading) {
    return <div>Загрузка данных...</div>;
  }

  if (plansError || subjectsError || teachersError || groupsError) {
    return (
      <div>
        Ошибка загрузки данных:{" "}
        {plansError || subjectsError || teachersError || groupsError}
      </div>
    );
  }

  // ✅ Проверяем, что plans - массив и не пустой
  if (!plans || !Array.isArray(plans)) {
    return <div>Данные о планах отсутствуют или не были загружены.</div>;
  }

  // Проверяем остальные данные
  if (!teachers) {
    return (
      <div>Данные о преподавателях отсутствуют или не были загружены.</div>
    );
  }

  if (selectedPlanId && !subjectsInPlan) {
    return <div>Данные о предметах для выбранного плана отсутствуют.</div>;
  }

  if (planSpecialityCode && !groups) {
    return <div>Данные о группах для выбранного плана отсутствуют.</div>;
  }

  return (
    <div>
      <h2>Назначение учебной нагрузки</h2>

      <div style={{ marginBottom: "10px" }}>
        <Button size="small" onClick={onClose}>
          Назад к таблице
        </Button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Выберите учебный план: </label>
        <select
          value={selectedPlanId || ""}
          onChange={(e) => {
            const planId = parseInt(e.target.value);
            setSelectedPlanId(planId);
            setSelectedGroupId(null);
          }}
        >
          <option value="">-- Выберите план --</option>
          {plans && Array.isArray(plans) && plans.length > 0 ? (
            plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.speciality_code} - {plan.year}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {plansLoading ? "Загрузка планов..." : "Нет доступных планов"}
            </option>
          )}
        </select>
      </div>

      {selectedPlanId && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <label>Выберите группу: </label>
            <select
              value={selectedGroupId || ""}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">-- Выберите группу --</option>
              {groups && Array.isArray(groups) && groups.length > 0 ? (
                groups.map((group) => (
                  <option key={group.group_name} value={group.group_name}>
                    {group.group_name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {groupsLoading ? "Загрузка групп..." : "Нет доступных групп"}
                </option>
              )}
            </select>
          </div>

          {/* Таблица назначения нагрузки */}
          <table className="teach-load-edit-table">
            <thead>
              <tr>
                <th rowSpan={2}>Группа</th>
                <th colSpan={3} style={{ textAlign: "center" }}>
                  Семестр 1
                </th>
                <th colSpan={4} style={{ textAlign: "center" }}>
                  Семестр 2
                </th>
              </tr>
              <tr>
                <th>GROUP SELECT</th>
                <th>subject 1</th>
                <th>subject 2</th>
                <th>subject 3</th>
                <th>subject 1</th>
                <th>subject 2</th>
                <th>subject 3</th>
                <th>subject 4</th>
              </tr>
            </thead>
            <tbody>
              {/* Здесь должна быть логика для отображения предметов и выбора преподавателей */}
              {/* Пока оставим пустым или добавим заглушку */}
              <tr>
                <td>{selectedGroupId || "Не выбрана"}</td>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  {/* Пример: выбор преподавателя для первого предмета семестра 1 */}
                  <select value="" onChange={() => {}}>
                    <option value="">-- Выберите преподавателя --</option>
                    {teachers &&
                      Array.isArray(teachers) &&
                      teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
              {/* Добавьте остальные строки по аналогии */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

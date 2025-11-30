import { useContext, useState, useEffect } from "react";

import TeacherContext from "../../../../../contexts/TeacherContext";
import { createNewSession } from "../../../../../api/scheduleAPI";

export default function ScheduleTeachersTableCell({ classCell, date, sessionNumber }) {
  const [currentGroup, setCurrentGroup] = useState([]);

  // Get teacher info for context
  const teacher = useContext(TeacherContext);

  // Get groups and subjects from context
  const teacherGroups = teacher.teacherGroups;
  const teacherSubjects = teacher.teacherSubjects;

  // State for one session
  const [sessionData, setSessionData] = useState({
    sessionNumber: sessionNumber,
    sessionDate: date,
    sessionGroup: "",
    sessionSubject: "",
    sessionType: "",
  });

  // Function for check what we have
  function checkSession() {
    if (sessionData.sessionGroup == "" || sessionData.sessionSubject == "" || sessionData.sessionType == "") {
      return false;
    }

    return true;
  }

  // Universal function for updating any field
  function updateSession(e) {
    const field = e.target.name;
    const value = e.target.value;

    setSessionData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Get actual data for session when sessionData change
useEffect(() => {
  // Сначала проверяем, все ли поля заполнены
  if (!checkSession()) return;

  // Если все поля заполнены - получаем id часов для выбранного предмета
  const fetchSubjectHours = async () => {
    try {
      // Получаем id часов предмета по id предмета из контекста
      const subjectHoursData = teacher.subjectHoursData;
      const currentSubjectHours = subjectHoursData.find(item => 
        item.subject_in_cycle_id == sessionData.sessionSubject
      )
      const subjectHoursId = currentSubjectHours.id;

      // Ищем в контексте запись teacher in plan с текущей группой и id часов предмета
      const foundTeacherPlan = teacher.teachersInPlanData.find(item =>
        item.group_name === sessionData.sessionGroup &&
        item.subject_in_cycle_hours_id === subjectHoursId
      );
      const teacherPlanId = foundTeacherPlan.id;

      // Создаём пару
      await createNewSession(
          sessionData.sessionNumber,
          sessionData.sessionDate,
          teacherPlanId,
          sessionData.sessionType
        );

    } catch (e) {
      console.error(e);
    }
  }

  fetchSubjectHours();
}, [sessionData]);

  // When prop date change - update state
  useEffect(() => {
    setSessionData(prev => ({
      ...prev,
      sessionDate: date
    }));
  }, [date]);

  return (
    <td className={classCell}>
      <div className="teachers-table__select-container">
        <div className="teachers-table__group-subject-container">

          {/* === SELECT: GROUP === */}
          <select
            className={
              "teachers-table__select " +
              (sessionData.sessionGroup === "" ? "select--placeholder" : "")
            }
            name="sessionGroup"
            onChange={updateSession}
            value={sessionData.sessionGroup}
          >
            <option value="" disabled className="option--placeholder">
              Группа
            </option>

            {teacherGroups.map((group) => (
              <option value={group} key={group} className="select__option">
                {group}
              </option>
            ))}
          </select>

          {/* === SELECT: SUBJECT === */}
          <select
            className={
              "teachers-table__select " +
              (sessionData.sessionSubject === "" ? "select--placeholder" : "")
            }
            name="sessionSubject"
            onChange={updateSession}
            value={sessionData.sessionSubject}
          >
            <option value="" disabled className="option--placeholder">
              Предмет
            </option>

            {teacherSubjects?.map((subject) => (
              <option
                value={subject.id}
                key={subject.id}
                className="select__option"
              >
                {subject.title}
              </option>
            ))}
          </select>
        </div>

        {/* === SELECT: SESSION TYPE === */}
        <div className="teachers-table__session-type-container">
          <select
            className={
              "type-select " +
              (sessionData.sessionType === "" ? "select--placeholder" : "")
            }
            name="sessionType"
            onChange={updateSession}
            value={sessionData.sessionType}
          >
            <option value="" disabled className="option--placeholder">
              Пара
            </option>
            <option className="select__option" value="Лк">Лк</option>
            <option className="select__option" value="Лб">Лб</option>
            <option className="select__option" value="Пз">Пз</option>
          </select>
        </div>
      </div>
    </td>
  );
}

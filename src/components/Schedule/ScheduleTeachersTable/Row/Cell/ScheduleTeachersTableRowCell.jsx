import { useContext, useState, useEffect } from "react";
import TeacherContext from "../../../../../contexts/TeacherContext";
import ScheduleTeachersTableContext from "../../../../../contexts/ScheduleTeachersTableContext";
import { createNewSession } from "../../../../../api/scheduleAPI";
import Modal from "../../../../Modal/Modal";

export default function ScheduleTeachersTableCell({
  classCell,
  date,
  sessionNumber,
}) {
  const [currentGroup, setCurrentGroup] = useState([]);
  const teacher = useContext(TeacherContext);
  const teacherGroups = teacher.teacherGroups;
  const teacherSubjects = teacher.teacherSubjects;

  const scheduleTeachersTableContext = useContext(ScheduleTeachersTableContext);

  const [sessionData, setSessionData] = useState({
    sessionNumber: sessionNumber,
    sessionDate: date,
    sessionGroup: "",
    sessionSubject: "",
    sessionType: "",
  });

  // Состояние для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  function checkSession() {
    return (
      sessionData.sessionGroup !== "" &&
      sessionData.sessionSubject !== "" &&
      sessionData.sessionType !== ""
    );
  }

  function updateSession(e) {
    const { name, value } = e.target;
    setSessionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  useEffect(() => {
    if (!checkSession()) return;

    const fetchSubjectHours = async () => {
      try {
        const subjectHoursData = teacher.subjectHoursData;
        const currentSubjectHours = subjectHoursData.find(
          (item) => item.subject_in_cycle_id == sessionData.sessionSubject
        );

        if (!currentSubjectHours) {
          setModalMessage("Не найдены часы для выбранного предмета.");
          setIsModalOpen(true);
          return;
        }

        const subjectHoursId = currentSubjectHours.id;

        const foundTeacherPlan = teacher.teachersInPlanData.find(
          (item) =>
            item.group_name === sessionData.sessionGroup &&
            item.subject_in_cycle_hours_id === subjectHoursId
        );

        if (!foundTeacherPlan) {
          setModalMessage(
            "Не найдена запись преподавателя в учебном плане для этой группы и предмета."
          );
          setIsModalOpen(true);
          return;
        }

        const teacherPlanId = foundTeacherPlan.id;

        const session = await createNewSession(
          sessionData.sessionNumber,
          sessionData.sessionDate,
          teacherPlanId,
          sessionData.sessionType
        );

        if (session?.session) {
          setModalMessage("Пара успешно создана!");
          setIsModalOpen(true);
        } else {
          setModalMessage("Не удалось создать пару. Проверьте данные.");
          setIsModalOpen(true);
        }
      } catch (e) {
        console.error(e);
        setModalMessage("Произошла ошибка при создании пары.");
        setIsModalOpen(true);
      }
    };

    fetchSubjectHours();
  }, [sessionData, teacher]);

  useEffect(() => {
    setSessionData((prev) => ({
      ...prev,
      sessionDate: date,
    }));
  }, [date]);

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <td className={classCell}>
        <div className="teachers-table__select-container">
          <div className="teachers-table__group-subject-container">
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

              {scheduleTeachersTableContext.sessionsTypes.map((type) => {
                <option
                  value={type.name}
                  key={type.name}
                  className="select__option"
                >
                  {type.name}
                </option>;
              })}
            </select>
          </div>
        </div>
      </td>

      {/* Модальное окно с уведомлением */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Результат операции"
        size="sm"
      >
        <p>{modalMessage}</p>
      </Modal>
    </>
  );
}

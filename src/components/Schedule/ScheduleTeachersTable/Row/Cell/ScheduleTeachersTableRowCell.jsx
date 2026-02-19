import "./scheduleTeachersTableRowCell.css";

import { useContext, useState, useEffect } from "react";
import ScheduleTeachersTableContext from "../../../../../contexts/ScheduleTeachersTableContext";
import { createNewSession } from "../../../../../api/scheduleAPI";
import Modal from "../../../../Modal/Modal";

import SyncSelect from "../../../../CustomSelect/syncSelect";

export default function ScheduleTeachersTableCell({
  classCell,
  date,
  sessionNumber,
}) {
  // Get data from context
  const scheduleTeachersTableContext = useContext(ScheduleTeachersTableContext);
  const {
    cabinets,
    sessionsTypes,
    teacherInfo,
    teacherInPlanData,
    subjectInCycleHoursData,
    subjectInCycleData,
    groups,
    teacherSessions,
  } = scheduleTeachersTableContext;

  // // Logging context data
  // console.log("scheduleTeachersTableContext:", scheduleTeachersTableContext);
  // console.log("cabinets:", cabinets);
  // console.log("sessionsTypes:", sessionsTypes);
  // console.log("teacherInfo:", teacherInfo);
  // console.log("teacherInPlanData:", teacherInPlanData);
  // console.log("subjectInCycleHoursData:", subjectInCycleHoursData);
  // console.log("subjectInCycleData:", subjectInCycleData);
  // console.log("groups:", groups);
  // console.log("teacherSessions:", teacherSessions);

  // Preparing data for selects
  const groupsOptions = groups.map((group) => ({
    value: group,
    label: group,
  }));

  const subjectsOptions =
    subjectInCycleData.map((subject) => ({
      value: `${subject.id}`,
      label: `${subject.title}`,
    })) || [];

  const sessionTypesOptions = sessionsTypes.map((type) => ({
    value: `${type.name}`,
    label: `${type.name}`,
  }));

  const cabinetsOptions = cabinets.map((cabinet) => ({
    value: `${cabinet.building_number}-${cabinet.cabinet_number}`,
    label: `${cabinet.building_number}-${cabinet.cabinet_number}`,
  }));

  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [currentBorder, setCurrentBorder] = useState(
    "--shedule-table-cell-border-nothing",
  );

  const handleSelectChange = (type) => {
    setIsAnimating(false);

    requestAnimationFrame(() => {
      setIsAnimating(true);
    });

    setIsModalAnimating(true);

    if (type === "create") {
      setCurrentBorder("--shedule-table-cell-border-success-create");
    } else if (type === "update") {
      setCurrentBorder("--shedule-table-cell-border-success-update");
    } else if (type === "error") {
      setCurrentBorder("--shedule-table-cell-border-error");
    } else {
      setCurrentBorder("--shedule-table-cell-border-nothing");
    }

    setTimeout(() => {
      setIsModalAnimating(false);
    }, 2600);
  };

  // Получаем занятие на текущую пару
  const formattedDate = date.toISOString().split("T")[0];
  const currentSession = (teacherSessions?.sessions || []).find((item) => {
    return (
      item.session.session_date === formattedDate &&
      item.session.session_number === sessionNumber
    );
  });

  // Форма для создания или редактирования занятия
  const [form, setForm] = useState({
    group: null,
    subject: null,
    sessionType: null,
    cabinet: null,
    isNew: false,
  });

  // Функция для изменения полей формы
  const changeField = (field) => (value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Функция для полчения объекта по значению из массива опций
  const findOption = (options, value) =>
    options.find((o) => o.value === String(value)) || null;

  // Отслеживаем изменения с сервера
  useEffect(() => {
    if (!currentSession) {
      // пары нет - форма пустая
      setForm({
        group: null,
        subject: null,
        type: null,
        cabinet: null,
        isNew: true,
      });
      return;
    }

    // Пара есть - заполняем форму
    const s = currentSession.session;

    // Группу берём из teacher in plan data по id teacher in plan из сессии
    const teacherInPlan = (teacherInPlanData || []).find(
      (tip) => tip.id === s.teacher_in_plan,
    );
    const group = teacherInPlan?.group_name || null;

    // Предмет берём по такой цепочке:
    // 1) в teacher in plan id часов предмета (subject_in_cycle_hours_id)
    // 2) в часах предмета айди предмета (subject_in_cycle_id)
    // 3) по айди предмета в subjectInCycleData находим данные
    const subjectInCycleHours = (subjectInCycleHoursData || []).find(
      (sch) => sch.id === teacherInPlan?.subject_in_cycle_hours_id,
    );
    const subjectInCycle = (subjectInCycleData || []).find(
      (sic) => sic.id === subjectInCycleHours?.subject_in_cycle_id,
    );

    setForm({
      group: findOption(groupsOptions, group),
      subject: findOption(subjectsOptions, subjectInCycle?.id),
      sessionType: findOption(sessionTypesOptions, s.session_type),
      cabinet: findOption(
        cabinetsOptions,
        `${s.building_number}-${s.cabinet_number}`,
      ),
      isNew: false,
    });

    // Включаем анимацию и задаём ей цвет
    handleSelectChange("error");
    setIsAnimating(true);
  }, [
    currentSession,
    teacherInPlanData,
    subjectInCycleHoursData,
    subjectInCycleData,
  ]);

  return (
    <td className={classCell}>
      <div
        className={`cell-container ${
          isAnimating ? "cell-container--animated" : ""
        }`}
        style={{
          "--animation-border-color": `var(${currentBorder})`,
        }}
      >
        <div className="cell-for-animation-container">
          {isModalAnimating ? (
            <div className="modal-in-container">Обновлённая запись</div>
          ) : null}

          <div className="cell-container__column left-column">
            <div className="select-wrapper">
              <SyncSelect
                options={groupsOptions}
                placeholder="Группа"
                value={form.group}
                onChange={changeField("group")}
              />
            </div>
            <div className="select-wrapper">
              <SyncSelect
                options={subjectsOptions}
                placeholder="Предмет"
                value={form.subject}
                onChange={changeField("subject")}
              />
            </div>
          </div>

          <div className="cell-container__column right-column">
            <div className="select-wrapper">
              <SyncSelect
                options={sessionTypesOptions}
                placeholder="Тип пары"
                value={form.sessionType}
                onChange={changeField("sessionType")}
              />
            </div>
            <div className="select-wrapper">
              <SyncSelect
                options={cabinetsOptions}
                placeholder="Кабинет"
                value={form.cabinet}
                onChange={changeField("cabinet")}
              />
            </div>
          </div>
        </div>
      </div>
    </td>
  );
}

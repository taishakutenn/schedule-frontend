import "./scheduleTeachersTableRowCell.css";

import { useContext, useState } from "react";
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

  // Функция для проверки, заполнино ли уже расписание на сегодня
  const isScheduleForToday = () => {
    console.log("Сессия: ", teacherSessions.sessions);
  };

  return (
    <td className={classCell}>
      {isScheduleForToday()}
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
            <div className="modal-in-container">Запись успешно добавлена</div>
          ) : null}

          <div className="cell-container__column left-column">
            <div className="select-wrapper">
              <SyncSelect options={groupsOptions} placeholder="Группа" />
            </div>
            <div className="select-wrapper">
              <SyncSelect options={subjectsOptions} placeholder="Предмет" />
            </div>
          </div>

          <div className="cell-container__column right-column">
            <div className="select-wrapper">
              <SyncSelect
                options={sessionTypesOptions}
                placeholder="Тип пары"
              />
            </div>
            <div className="select-wrapper">
              <SyncSelect options={cabinetsOptions} placeholder="Кабинет" />
            </div>
          </div>
        </div>
      </div>
    </td>
  );
}

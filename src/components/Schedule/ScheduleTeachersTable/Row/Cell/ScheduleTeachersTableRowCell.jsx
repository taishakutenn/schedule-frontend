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

  console.log(groups);
  // Preparing data for selects
  // const groupsOptions = groups.map((group) => ({
  //   value: group.id,
  //   label: group.name,
  // }));

  // const sessionTypesOptions = sessionsTypes.map((type) => ({
  //   value: type.id,
  //   label: type.name,
  // }));

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
            <div className="modal-in-container">Запись успешно добавлена</div>
          ) : null}

          {/* Содержимое ячейки */}
          <div className="cell-container__column left-column">
            <select className="cell-container__left-select">
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            {/* Groups */}
            {/* <SyncSelect options={groupsOptions} /> */}

            <select
              className="cell-container__left-select"
              // onChange={() => handleSelectChange("update")}
            >
              <option>Предмет</option>
              <option>Предмет2</option>
            </select>
          </div>

          <div className="cell-container__column right-column">
            <select className="cell-container__right-select">
              {sessionsTypes.map((type) => (
                <option key={type.id}>{type.name}</option>
              ))}
            </select>
            {/* <SyncSelect options={sessionTypesOptions} /> */}

            <select className="cell-container__right-select">
              {cabinets.map((cabinet) => (
                <option
                  key={`${cabinet.building_number}-${cabinet.cabinet_number}`}
                >
                  {`${cabinet.building_number}-${cabinet.cabinet_number}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </td>
  );
}

import "./scheduleTeachersTableRowCell.css";

import Select from "react-select";

import { useContext, useState } from "react";
import ScheduleTeachersTableContext from "../../../../../contexts/ScheduleTeachersTableContext";
import { createNewSession } from "../../../../../api/scheduleAPI";
import Modal from "../../../../Modal/Modal";

export default function ScheduleTeachersTableCell({
  classCell,
  date,
  sessionNumber,
}) {
  const scheduleTeachersTableContext = useContext(ScheduleTeachersTableContext);

  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [currentBorder, setCurrentBorder] = useState(
    "--shedule-table-cell-border-nothing"
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
            <div className="modal-in-container">
              Запись успешно добавлена
            </div>
          ) : null}

          {/* Содержимое ячейки */}
          <div className="cell-container__column left-column">
            <select
              className="cell-container__left-select"
              onChange={() => handleSelectChange("create")}
            >
              <option>Группа</option>
              <option>Группа2</option>
            </select>

            <select
              className="cell-container__left-select"
              onChange={() => handleSelectChange("update")}
            >
              <option>Предмет</option>
              <option>Предмет2</option>
            </select>
          </div>

          <div className="cell-container__column right-column">
            <select
              className="cell-container__right-select"
              onChange={() => handleSelectChange("error")}
            >
              <option>Тип пары</option>
              <option>Тип пары2</option>
            </select>

            <select
              className="cell-container__right-select"
              onChange={() => handleSelectChange("nothing")}
            >
              <option>Кабинет</option>
              <option>Кабинет2</option>
            </select>
          </div>
        </div>
      </div>
    </td>
  );
}

import "./scheduleTeachersTableRowCell.css";

import { useContext, useState, useEffect } from "react";
import ScheduleTeachersTableContext from "../../../../../contexts/ScheduleTeachersTableContext";
import { createNewSession } from "../../../../../api/scheduleAPI";
import Modal from "../../../../Modal/Modal";

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

  const [isAnimating, setIsAnimating] = useState(false);
  const [currentBorder, setCurrentBorder] = useState(
    "--shedule-table-cell-border-nothing"
  );

  const handleSelectChange = (type) => {
    setIsAnimating(true);
    if (type === "create") {
      setCurrentBorder("--shedule-table-cell-border-success-create");
    } else if (type === "update") {
      setCurrentBorder("--shedule-table-cell-border-success-update");
    } else if (type === "error") {
      setCurrentBorder("--shedule-table-cell-border-error");
    }

    setTimeout(() => setIsAnimating(false), 3000);
  };

  return (
    <td className={classCell}>
      <div className="cell-container">
        {/* SVG для анимации бордера */}
        {isAnimating && (
          <svg
            className="border-animation-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <defs>
              <mask id="border-mask">
                <rect width="100%" height="100%" fill="white" />
                {/* Прямоугольник с вырезанным внутренним контуром */}
                <rect
                  x="5"
                  y="5"
                  width="90"
                  height="90"
                  rx="3"
                  ry="3"
                  fill="black"
                />
              </mask>
            </defs>

            {/* Путь для бордера (прямоугольник с закруглёнными углами) */}
            <path
              d="M5,5 H95 A2,2 0 0 1 97,7 V93 A2,2 0 0 1 95,95 H5 A2,2 0 0 1 3,93 V7 A2,2 0 0 1 5,5 Z"
              fill="none"
              stroke="var(--shedule-table-cell-border-error)"
              strokeWidth="2"
              strokeDasharray="200"
              strokeDashoffset="200"
              mask="url(#border-mask)"
              style={{
                "--current-border-color": `var(${currentBorder})`,
              }}
            >
              <animate
                attributeName="strokeDashoffset"
                values="200;0"
                dur="3s"
                fill="freeze"
              />
            </path>
          </svg>
        )}

        {/* Содержимое ячейки */}
        <div className="cell-container__column left-column">
          <select
            className="cell-container__left-select"
            onChange={() => handleSelectChange("create")}
          >
            <option>Пара</option>
            <option>Пара2</option>
          </select>

          <select
            className="cell-container__left-select"
            onChange={() => handleSelectChange("update")}
          >
            <option disabled>Предмет</option>
          </select>
        </div>

        <div className="cell-container__column right-column">
          <select
            className="cell-container__right-select"
            onChange={() => handleSelectChange("error")}
          >
            <option disabled>Тип пары</option>
          </select>

          <select
            className="cell-container__right-select"
            onChange={() => handleSelectChange("nothing")}
          >
            <option disabled>Кабинет</option>
          </select>
        </div>
      </div>
    </td>
  );
}

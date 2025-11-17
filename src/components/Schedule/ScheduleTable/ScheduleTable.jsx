import "./scheduleTable.css";

export default function ScheduleTable() {
  return (
    <div className="schedule-table-container">
      <div className="schedule-table__headers">
        <h1 className="table-title">Расписание</h1>
        <div className="schedule-table__grid">
          {/* Заголовки */}
          <div className="schedule-table__cell header-cell">Номер пары</div>
          <div className="schedule-table__cell header-cell">Группа</div>
          <div className="schedule-table__cell header-cell">Пн</div>
          <div className="schedule-table__cell header-cell">Вт</div>
          <div className="schedule-table__cell header-cell">Ср</div>
          <div className="schedule-table__cell header-cell">Чт</div>
          <div className="schedule-table__cell header-cell">Пт</div>
          <div className="schedule-table__cell header-cell">Сб</div>

          {/* Строка 1 */}
          <div className="schedule-table__cell">1</div>
          {/* Ячейка с группой — объединяем по 6 строк */}
          <div className="schedule-table__cell group-cell" style={{ gridRow: "span 6" }}>
            23 ИСП-1
          </div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>

          {/* Строка 2 */}
          <div className="schedule-table__cell">2</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell"></div>

          {/* Строка 3 */}
          <div className="schedule-table__cell">3</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell"></div>

          {/* Строка 4 */}
          <div className="schedule-table__cell">4</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell"></div>

          {/* Строка 5 */}
          <div className="schedule-table__cell">5</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell"></div>

          {/* Строка 6 */}
          <div className="schedule-table__cell">6</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">ИСРПО</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell">БД</div>
          <div className="schedule-table__cell"></div>
        </div>
      </div>
    </div>
  );
}
import MondayDatePicker from "../../../DatePicker/MondayDatePicker";

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const SESSION_NUMBERS = [1, 2, 3, 4, 5];

function addDays(baseDate, n) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + n);
}

export default function ScheduleTeachersTableHeader({ selectedDate, onDateChange }) {
  return (
    <>
      <tr>
        {/* Ячейка с выбором даты */}
        <th rowSpan="2" className="far-right">
          <MondayDatePicker
            selectedDate={selectedDate}
            onDateChange={onDateChange}
          />
        </th>

        {/* Дни недели */}
        {DAYS.map((day, index) => (
          <th
            key={day}
            colSpan="5"
            className={`far-left ${index < DAYS.length - 1 ? "far-right" : ""}`}
          >
            {day}{" "}
            {selectedDate &&
              addDays(selectedDate, index).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
              })}
          </th>
        ))}
      </tr>

      {/* Номера пар */}
      <tr>
        {DAYS.map((_, dayIndex) =>
          SESSION_NUMBERS.map((num) => (
            <th
              key={`${dayIndex}-${num}`}
              className={
                num === 1
                  ? "far-left"
                  : num === 5 && dayIndex < DAYS.length - 1
                  ? "far-right"
                  : ""
              }
            >
              {num}
            </th>
          ))
        )}
      </tr>
    </>
  );
}
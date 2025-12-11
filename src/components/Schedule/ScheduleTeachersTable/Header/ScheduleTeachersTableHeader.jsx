import MondayDatePicker from "../../../DatePicker/MondayDatePicker";

export default function ScheduleTeachersTableHeader({ selectedDate, onDateChange }) {

  function addDays(baseDate, n) {
    return new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate() + n
    );
  }

  return (
    <>
      <tr>
        {/* LEFT CELL WITH DATE PICKER */}
        <td rowSpan="2" className="far-right">
          <MondayDatePicker
            selectedDate={selectedDate}
            onDateChange={onDateChange}
          />
        </td>

        {/* DAYS OF WEEK */}
        <td colSpan="5" className="far-left far-right">
          Понедельник{" "}
          {selectedDate &&
            addDays(selectedDate, 0).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
            })}
        </td>

        <td colSpan="5" className="far-left far-right">
          Вторник{" "}
          {selectedDate &&
            addDays(selectedDate, 1).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
            })}
        </td>

        <td colSpan="5" className="far-left far-right">
          Среда{" "}
          {selectedDate &&
            addDays(selectedDate, 2).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
            })}
        </td>

        <td colSpan="5" className="far-left far-right">
          Четверг{" "}
          {selectedDate &&
            addDays(selectedDate, 3).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
            })}
        </td>

        <td colSpan="5" className="far-left far-right">
          Пятница{" "}
          {selectedDate &&
            addDays(selectedDate, 4).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
            })}
        </td>

        <td colSpan="5" className="far-left">
          Суббота{" "}
          {selectedDate &&
            addDays(selectedDate, 5).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
            })}
        </td>
      </tr>

      {/* SESSION NUMBERS */}
      <tr>
        <td className="far-left">1</td><td>2</td><td>3</td><td>4</td><td className="far-right">5</td>
        <td className="far-left">1</td><td>2</td><td>3</td><td>4</td><td className="far-right">5</td>
        <td className="far-left">1</td><td>2</td><td>3</td><td>4</td><td className="far-right">5</td>
        <td className="far-left">1</td><td>2</td><td>3</td><td>4</td><td className="far-right">5</td>
        <td className="far-left">1</td><td>2</td><td>3</td><td>4</td><td className="far-right">5</td>
        <td className="far-left">1</td><td>2</td><td>3</td><td>4</td><td>5</td>
      </tr>
    </>
  );
}

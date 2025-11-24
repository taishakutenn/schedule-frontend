import { useState } from "react";
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Locale for datepicker component
import { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
registerLocale("ru", ru);

import "./scheduleTeachersTable.css";

export default function SchedulteTeachersTable() {
  const [date, setDate] = useState(new Date());
  
  // Filter - only for mondays
  function isMonday(dateToCheck) {
    if (!dateToCheck) { return false; }
    return dateToCheck.getDay() === 1;
  }

  function changeDate(newDate) {
    setDate(newDate);
  }

  return (
    <div className="schedule-teacher-table__container">
      <table className="schedule-teacher-table">
        <thead>
          <tr>
            <td rowSpan="2" className="far-right">
              <DatePicker
                selected={date}
                onChange={changeDate}
                filterDate={isMonday}
                dateFormat="dd-MM-yyyy"
                locale="ru"
              />
            </td>
            <td colSpan="5" className="far-left far-right">
              Понедельник
              {date ? date.toLocaleDateString('ru-RU') : ""}
            </td>
            <td colSpan="5" className="far-left far-right">
              Вторник
              {date ? date.toLocaleDateString('ru-RU') : ""}
              </td>
            <td colSpan="5" className="far-left far-right">
              Среда
              {date ? date.toLocaleDateString('ru-RU') : ""}
              </td>
            <td colSpan="5" className="far-left far-right">
              Четверг
              {date ? date.toLocaleDateString('ru-RU') : ""}
              </td>
            <td colSpan="5" className="far-left far-right">
              Пятница
              {date ? date.toLocaleDateString('ru-RU') : ""}
              </td>
            <td colSpan="5" className="far-left">
              Суббота
              {date ? date.toLocaleDateString('ru-RU') : ""}
              </td>
          </tr>
          <tr>
            <td className="far-left">1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td className="far-right">5</td>
            <td className="far-left">1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td className="far-right">5</td>
            <td className="far-left">1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td className="far-right">5</td>
            <td className="far-left">1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td className="far-right">5</td>
            <td className="far-left">1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td className="far-right">5</td>
            <td className="far-left">1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td>5</td>
          </tr>
      </thead>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
    </table>
  </div>
  );
}
// DatePicker
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Locale datePicker
import { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
registerLocale("ru", ru);

// Css datePicker
import "./mondayDatePicker.css";

// Help functions
import { isMonday } from "../../utils/scheduleTeachersTableHepl";

export default function MondayDatePicker({selectedDate, onDateChange}) {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onDateChange}
      filterDate={isMonday}
      dateFormat="dd-MM-yyyy"
      locale="ru"
    />
  )
}
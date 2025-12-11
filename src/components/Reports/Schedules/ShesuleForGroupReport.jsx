import { useState, useEffect } from "react";
import { DatePicker } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../../Button/Button"; // Путь к компоненту Button

// Locale
import { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
registerLocale("ru", ru);

// Импортируем функцию получения групп и получения отчёта
import { getGroups } from "../../../api/groupAPI";
import { getReportForGroup } from "../../../api/scheduleAPI"; // Предполагаемый путь к новой функции

export default function ScheduleForGroupReport() {
  const [date, setDate] = useState(new Date("01.12.2025"));
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Загружаем группы при монтировании компонента
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const groupsData = await getGroups();
        setGroups(groupsData);
        if (groupsData.length > 0) {
          setSelectedGroup(groupsData[0].group_name); // Используем group_name
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Filter - only monday
  function isMonday(dateToCheck) {
    if (!dateToCheck) return false;
    return dateToCheck.getDay() === 1;
  }

  function addDays(baseDate, n) {
    return new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate() + n
    );
  }

  const handleGetReport = async () => {
    if (!selectedGroup) {
      setError("Пожалуйста, выберите группу");
      return;
    }

    try {
      setReportLoading(true);
      setError(null);
      
      // Форматируем дату в нужный формат (например, YYYY-MM-DD)
      // Используем метод toISOString и корректируем временную зону
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в JS с 0
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Получаем отчет
      const reportBlob = await getReportForGroup(selectedGroup, formattedDate);
      
      // Создаем URL для скачивания файла
      const downloadUrl = window.URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `schedule_${selectedGroup}_${formattedDate}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(`Ошибка при получении отчета: ${err.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка групп...</div>;
  }

  if (error && !selectedGroup) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div className="data-for-report-container">
      <div className="date-container">
        <p>Выберите понедельник, с которого хотите получить расписание</p> 
        <DatePicker
          selected={date}
          onChange={setDate}
          filterDate={isMonday}
          dateFormat="dd-MM-yyyy"
          locale="ru"
        />
      </div>
      <div className="group-container">
        <p>Выберите группу</p>
        <select 
          value={selectedGroup} 
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="group-select"
        >
          {groups.map((group, index) => (
            <option key={index} value={group.group_name}>
              {group.group_name}
            </option>
          ))}
        </select>
      </div>
      <div className="button-container">
        <Button 
          onClick={handleGetReport}
          variant="primary"
          size="medium"
          action="click"
          disabled={reportLoading}
        >
          {reportLoading ? "Загрузка..." : "Получить отчёт"}
        </Button>
      </div>
      {error && <div className="error-message">Ошибка: {error}</div>}
    </div>
  );
}
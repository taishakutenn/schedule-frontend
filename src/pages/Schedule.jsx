import ScheduleTable from "../components/Schedule/ScheduleTable/ScheduleTable";
import ScheduleTeachersTable from "../components/Schedule/ScheduleTeachersTable/ScheduleTeachersTable";
import Button from "../components/Button/Button";
import Sidebar from "../components/Sidebar/Sidebar";
import DatePicker from "react-datepicker";
import { useState } from "react";
import { useApiData } from "../hooks/useApiData";
import { copyScheduleInRange } from "../api/scheduleAPI";

import "./schedule.css";

export default function Schedule() {
  // UseState выбора дат для копирования на неделю
  const [copyScheduleAllForm, setCopyScheduleAllForm] = useState({
    startCopyPeriodDate: new Date(), // Дата, начиная с которой копируем
    endPeriodCopyDate: new Date(), // Дата, до которой копируем
    startPeriodDate: new Date(), // Дата, начиная с которой вставляем скопированное
  });

  // Триггер для отправки данных на сервер
  const [copyTrigger, setCopyTrigger] = useState(0);

  // Общий обработчик изменений для дат формы копирования
  const handleFormChange = (field, value, formName, formSetFunc) => {
    formSetFunc({
      ...formName,
      [field]: value,
    });
  };

  // Функция для отправки данных на сервер
  const handleCopySchedule = () => {
    setCopyTrigger((prev) => prev + 1);
  };

  // Функция для копирования расписания через
  const copySchedule = async () => {
    if (copyTrigger === 0) return null;

    try {
      // Рассчитываем разницу в днях между началом и концом копирования
      const countDays = Math.round(
        (copyScheduleAllForm.endPeriodCopyDate -
          copyScheduleAllForm.startCopyPeriodDate) /
          (1000 * 3600 * 24),
      );

      console.log("Дней для копирования:", countDays);

      // Отправляем данные на сервер
      return await copyScheduleInRange(
        copyScheduleAllForm.startCopyPeriodDate,
        copyScheduleAllForm.startPeriodDate,
        countDays,
      );
    } finally {
      setCopyTrigger(0);
    }
  };

  // Хук для отправки данных на сервер через useApiData
  const { data, loading, error } = useApiData(
    copySchedule,
    [copyTrigger],
    copyTrigger > 0,
  );

  // Вкладки сайдбара
  const tabs = [
    {
      label: "Копирование расписания",
      content: (
        <div className="copy-schedule-container">
          <div className="copy-schedule-option copy-schedule--all">
            <h3 className="copy-schedule--title">Полное копирование</h3>
            <p className="copy-schedule--label">
              Выберите диапазон дат, которые хотите скопировать
            </p>
            <DatePicker
              selected={copyScheduleAllForm.startCopyPeriodDate}
              onChange={(date) =>
                handleFormChange(
                  "startCopyPeriodDate",
                  date,
                  copyScheduleAllForm,
                  setCopyScheduleAllForm,
                )
              }
              dateFormat="dd-MM-yyyy"
              locale="ru"
            />
            <p className="copy-schedule--label">-</p>
            <DatePicker
              selected={copyScheduleAllForm.endPeriodCopyDate}
              onChange={(date) =>
                handleFormChange(
                  "endPeriodCopyDate",
                  date,
                  copyScheduleAllForm,
                  setCopyScheduleAllForm,
                )
              }
              dateFormat="dd-MM-yyyy"
              locale="ru"
            />
            <p className="copy-schedule--label">
              Выберите дату, с которой начнётся вставка расписания
            </p>
            <DatePicker
              selected={copyScheduleAllForm.startPeriodDate}
              onChange={(date) =>
                handleFormChange(
                  "startPeriodDate",
                  date,
                  copyScheduleAllForm,
                  setCopyScheduleAllForm,
                )
              }
              dateFormat="dd-MM-yyyy"
              locale="ru"
            />
            <Button onClick={handleCopySchedule} disabled={loading}>
              {loading ? "Копирование..." : "Скопировать расписание"}
            </Button>
            {error && <p className="error-message">Ошибка: {error}</p>}
          </div>
        </div>
      ),
    },
  ];

  return (
    <main>
      <Sidebar title="Вспомогательная панель" tabs={tabs}></Sidebar>
      <ScheduleTeachersTable />
    </main>
  );
}

import ScheduleTeachersTable from "../components/Schedule/ScheduleTeachersTable/ScheduleTeachersTable";
import Button from "../components/Button/Button";
import Sidebar from "../components/Sidebar/Sidebar";

import DatePicker from "react-datepicker";
import { useState } from "react";
import OvalLoader from "../components/CustomLoader/CustomLoader";

import { copyScheduleInRange } from "../api/scheduleAPI";

import "./schedule.css";

export default function Schedule() {
  // UseState выбора дат для копирования на неделю
  const [copyScheduleAllForm, setCopyScheduleAllForm] = useState({
    startCopyPeriodDate: new Date(), // Дата, начиная с которой копируем
    endPeriodCopyDate: new Date(), // Дата, до которой копируем
    startPeriodDate: new Date(), // Дата, начиная с которой вставляем скопированное
  });

  // Состояние загрузки и ошибки для полного копирования
  const [isFullCopying, setIsFullCopying] = useState(false);
  const [error, setError] = useState(null);

  // Общий обработчик изменений для дат формы копирования
  const handleFormChange = (field, value, formName, formSetFunc) => {
    formSetFunc({
      ...formName,
      [field]: value,
    });
  };

  // Функция для копирования расписания
  const handleCopySchedule = async () => {
    setIsFullCopying(true);
    setError(null);

    try {
      // Рассчитываем разницу в днях между началом и концом копирования
      const countDays = Math.round(
        (copyScheduleAllForm.endPeriodCopyDate -
          copyScheduleAllForm.startCopyPeriodDate) /
          (1000 * 3600 * 24),
      );

      // Отправляем данные на сервер
      await copyScheduleInRange(
        copyScheduleAllForm.startCopyPeriodDate,
        copyScheduleAllForm.startPeriodDate,
        countDays,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFullCopying(false);
    }
  };

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
            <Button onClick={handleCopySchedule} disabled={isFullCopying}>
              {isFullCopying ? <OvalLoader /> : "Скопировать расписание"}
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

import ScheduleTable from "../components/Schedule/ScheduleTable/ScheduleTable";
import ScheduleTeachersTable from "../components/Schedule/ScheduleTeachersTable/ScheduleTeachersTable";
import Button from "../components/Button/Button";
import Sidebar from "../components/Sidebar/Sidebar";
import DatePicker from "react-datepicker";
import { useState } from "react";
import { getInfoForCreateSchedule } from "../api/scheduleAPI";

import "./schedule.css";

export default function Schedule() {
  // UseState выбора дат для копирования на неделю
  const [copyScheduleAllForm, setCopyScheduleAllForm] = useState({
    startCopyPeriodDate: new Date(), // Дата, начиная с которой копируем
    endPeriodCopyDate: new Date(), // Дата, до которой копируем
    startPeriodDate: new Date(), // Дата, начиная с которой вставляем скопированное
  });

  // Общий обработчик изменений для дат формы копирования
  const handleFormChange = (field, value, formName, formSetFunc) => {
    formSetFunc({
      ...formName,
      [field]: value,
    });
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
              Выберите дату, с которой начнётся копирование расписания
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
            <Button>Скопировать расписание</Button>
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

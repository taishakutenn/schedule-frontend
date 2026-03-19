import "./scheduleTeachersTable.css";
import "react-contexify/ReactContexify.css";

import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
import { Menu, Item } from "react-contexify";

import ScheduleTeachersTableRow from "./Row/ScheduleTeachersTableRow";
import ScheduleTeachersTableHeader from "./Header/ScheduleTeachersTableHeader";
import ScheduleTeachersTableContext from "../../../contexts/ScheduleTeachersTableContext";

import { useApiData } from "../../../hooks/useApiData";
import { getTeachers } from "../../../api/teachersAPI";
import { getCabinets } from "../../../api/cabinetAPI";
import { getSessionTypes } from "../../../api/sessionTypeAPI";

export default function SchedulteTeachersTable() {
  // Функция для получения понедельника текущей недели (в прошлом или сегодня)
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = воскресенье, 1 = понедельник, ...
    const daysToSubtract = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - daysToSubtract);
    return d;
  }

  // Расчитываем дату так, чтобы таблица грузилась с ближайшего понедельника из прошлого
  const today = new Date();
  const initialMonday = getMonday(today);

  const [selectedDate, setSelectedDate] = useState(initialMonday);
  // Синхронизация даты из заголовка с текущим компонент
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Получаем преподавателей
  const {
    data: teachersData,
    loading: teachersLoading,
    error: teachersError,
  } = useApiData(getTeachers, [selectedDate]); // Компонент будет перерисовываться при каждом изменении даты

  // Получаем кабинеты
  const {
    data: cabinetsData,
    loading: cabinetsLoading,
    error: cabinetsError,
  } = useApiData(getCabinets);

  // Получаем типы занятий
  const {
    data: sessionsTypesData,
    loading: sessionsTypesLoading,
    error: sessionsTypesError,
  } = useApiData(getSessionTypes);

  // Проверка загрузки данных
  if (teachersLoading || cabinetsLoading || sessionsTypesLoading) {
    return (
      <Oval
        visible={true}
        height="50"
        width="50"
        color="var(--main-accent-color)"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    );
  }

  // Ошибки
  if (teachersError) {
    return <div>Произошла ошибка: {teachersError}</div>;
  } else if (cabinetsError) {
    return <div>Произошла ошибка: {cabinetsError}</div>;
  } else if (sessionsTypesError) {
    return <div>Произошла ошибка: {sessionsTypesError}</div>;
  }

  // Сортируем преподавателей
  const sortedTeachersData = [...teachersData].sort((a, b) => {
    if (a.surname < b.surname) return -1;
    if (a.surname > b.surname) return 1;
    return 0;
  });

  // Добавляем кабинеты и типы занятий в контекст
  const scheduleTeachersTableContext = {
    cabinets: cabinetsData,
    sessionsTypes: sessionsTypesData,
  };

  // Обработчик нажатия на Item в контекстном меню
  const handleUpdateSession = ({ props }) => {
    // Обработчик открытия меню находится в компоненте TableCell
    // При нажатии - этот обработчик передаёт в props callback функции из Cell компонента
    // так мы обновляем/удаляем данные внутри cell, имея возможность вызвать анимации
    // И при этом компонент menu у нас всего один
    props.handleFunctionCallback("update");
  };

  const handleDeleteSession = ({ props }) => {
    props.handleFunctionCallback("delete");
  };

  return (
    <div className="schedule-teacher-table__container">
      <table className="schedule-teacher-table">
        <thead>
          <ScheduleTeachersTableHeader
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </thead>
        <tbody>
          {/* Добавляем контекст с кабинетами для всех строк в таблице */}
          <ScheduleTeachersTableContext.Provider
            value={scheduleTeachersTableContext}
          >
            {sortedTeachersData.map((item) => {
              return (
                <ScheduleTeachersTableRow
                  selectedDate={selectedDate}
                  teacherInfo={item}
                  key={item.id}
                />
              );
            })}
          </ScheduleTeachersTableContext.Provider>
        </tbody>
      </table>
      <Menu id="teacher-menu" theme="scheduleTable">
        <Item onClick={handleUpdateSession}>Обновить</Item>
        <Item onClick={handleDeleteSession}>Удалить</Item>
      </Menu>
    </div>
  );
}

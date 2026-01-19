import "./scheduleTeachersTable.css";

import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";

import ScheduleTeachersTableRow from "./Row/ScheduleTeachersTableRow";
import ScheduleTeachersTableHeader from "./Header/ScheduleTeachersTableHeader";
import ScheduleTeachersTableContext from "../../../contexts/ScheduleTeachersTableContext";

import { useApiData } from "../../../hooks/useApiData";
import { getTeachers } from "../../../api/teachersAPI";
import { getCabinets } from "../../../api/cabinetAPI";
import { getSessionTypes } from "../../../api/sessionTypeAPI";

import Modal from "../../Modal/Modal";

export default function SchedulteTeachersTable() {
  // Syncrhonize date from header to current component
  const [selectedDate, setSelectedDate] = useState(new Date());
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Get teahcers
  const {
    data: teachersData,
    loading: teachersLoading,
    error: teachersError,
  } = useApiData(getTeachers, [selectedDate]); // Сomponent will re-render every time the date changes

  // Get cabinets
  const {
    data: cabinetsData,
    loading: cabinetsLoading,
    error: cabinetsError,
  } = useApiData(getCabinets);

  // Get sessions types
  const {
    data: sessionsTypesData,
    loading: sessionsTypesLoading,
    error: sessionsTypesError,
  } = useApiData(getSessionTypes);

  // Checking if the data loads
  if (teachersLoading || cabinetsLoading || sessionsTypesLoading) {
    return (
      <Oval
        visible={true}
        height="50"
        width="50"
        color="#4caf50"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    );
  }

  // Errors
  if (teachersError) {
    return <div>Произошла ошибка: {teachersError}</div>;
  } else if (cabinetsError) {
    return <div>Произошла ошибка: {cabinetsError}</div>;
  } else if (sessionsTypesError) {
    return <div>Произошла ошибка: {sessionsTypesError}</div>;
  }

  // Sort teachers
  const sortedTeachersData = [...teachersData].sort((a, b) => {
    if (a.surname < b.surname) return -1;
    if (a.surname > b.surname) return 1;
    return 0;
  });

  // Add cabinets and sessionTypes in context
  const scheduleTeachersTableContext = {
    cabinets: cabinetsData,
    sessionsTypes: sessionsTypesData,
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
          {/* Add context with cabinets for all rows in table */}
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
    </div>
  );
}

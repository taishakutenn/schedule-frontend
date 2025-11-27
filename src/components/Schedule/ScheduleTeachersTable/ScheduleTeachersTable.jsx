import "./scheduleTeachersTable.css";

import { useState } from "react";

import ScheduleTeachersTableHeader from "./Header/ScheduleTeachersTableHeader";
import ScheduleTeachersTableRow from "./Row/ScheduleTeachersTableRow";

import { useApiData } from "../../../hooks/useApiData";
import { getTeachers } from "../../../api/teachersAPI";

export default function SchedulteTeachersTable() {
  // Syncrhonize date from header to current component
  const [selectedDate, setSelectedDate] = useState(null);
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Get teahcers
  const {
    data: teachersData,
    loading: teachersLoading,
    error: teachersError,
  } = useApiData(getTeachers, [selectedDate]);

  // Sort teachers
  const sortedTeachersData = [...teachersData].sort((a, b) => {
    if (a.surname < b.surname) return -1;
    if (a.surname > b.surname) return 1;
    return 0;
  });

  return (
    <div className="schedule-teacher-table__container">
      <table className="schedule-teacher-table">
        <thead>
          <ScheduleTeachersTableHeader onDateChange={handleDateChange} />
        </thead>
        <tbody>
          {sortedTeachersData.map((item) => {
            return (
              <ScheduleTeachersTableRow
                selectedDate={selectedDate}
                teacherInfo={item}
                key={item.id}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import { useState } from "react";

import ScheduleTeachersTableHeader from "./Header/ScheduleTeachersTableHeader";
import ScheduleTeachersTableRow from "./Row/ScheduleTeachersTableRow";

import { useApiData } from "../../../hooks/useApiData";
import { getTeachers } from "../../../api/teachersAPI";

import "./scheduleTeachersTable.css";

export default function SchedulteTeachersTable() {
  // Syncrhonize date from header to current component
  const [selectedDate, setSelectedDate] = useState(null);
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  }

  // Get teahcers
  const {data: teachersData, loading: teachersLoading, error: teachersError} = useApiData(getTeachers, [selectedDate]);

  return (
    <div className="schedule-teacher-table__container">
      <table className="schedule-teacher-table">
        <thead>
          <ScheduleTeachersTableHeader onDateChange={handleDateChange} />
        </thead>
        <tbody>
          {teachersData.map((item) => {
            return <ScheduleTeachersTableRow
            selectedDate={selectedDate}
            teacherInfo={item} 
            key={item.id}
            />
          })}
        </tbody>
      </table>
    </div>
  );
}
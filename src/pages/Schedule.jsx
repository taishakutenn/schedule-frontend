import ScheduleTable from "../components/Schedule/ScheduleTable/ScheduleTable";
import ScheduleTeachersTable from "../components/Schedule/ScheduleTeachersTable/ScheduleTeachersTable";
import Button from "../components/Button/Button";
import { useState } from "react";
import { getInfoForCreateSchedule } from "../api/scheduleAPI";

export default function Schedule() {
  return (
    <main>
      <ScheduleTeachersTable />
    </main>
  );
}

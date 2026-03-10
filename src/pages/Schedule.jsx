import ScheduleTable from "../components/Schedule/ScheduleTable/ScheduleTable";
import ScheduleTeachersTable from "../components/Schedule/ScheduleTeachersTable/ScheduleTeachersTable";
import Button from "../components/Button/Button";
import Sidebar from "../components/Sidebar/Sidebar";
import { useState } from "react";
import { getInfoForCreateSchedule } from "../api/scheduleAPI";

export default function Schedule() {
  return (
    <main>
      <Sidebar title="Вспомогательная панель" tabs={["Таб 1", "Таб 2"]}>
        <div>
          <p>Пока что-то тут</p>
        </div>
      </Sidebar>
      <ScheduleTeachersTable />
    </main>
  );
}

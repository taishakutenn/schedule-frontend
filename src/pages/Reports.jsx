import "./Reports.css";

import Button from "../components/Button/Button";
import GroupPlate from "../components/GroupPlate/GroupPlate";

import TeachLoad from "../components/Reports/TeachLoad/TeachLoad";
import { useState } from "react";

export default function Reports() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  // set reports states
  const handleStaffingSchedule = () => {
    setSelectedReport("StaffingSchedule");
    setSelectedGroup("TeachLoad");
  };
  const handleLoad = () => {
    setSelectedReport("Load");
    setSelectedGroup("TeachLoad");
  };

  // render content
  const RenderContent = () => {
    if (selectedReport == null) return null;
    if (selectedGroup == "TeachLoad") {
      return <TeachLoad selectedReport={selectedReport}></TeachLoad>;
    }
  };

  // control groups
  const teachLoadButtons = [
    <Button key={"btn-staffing"} onClick={handleStaffingSchedule} size="small">
      Штатное расписание
    </Button>,
    <Button key={"btn-load"} onClick={handleLoad} size="small">
      Нагрузка преподавателей
    </Button>,
    // <Button key={"btn-hours"} size="small">
    //   Количество часов в учебном плане
    // </Button>,
  ];

  return (
    <main>
      <div className="reports__navigation">
        <GroupPlate groupElements={teachLoadButtons}></GroupPlate>
      </div>
      <div className="reports__display">
        <RenderContent />
      </div>
    </main>
  );
}

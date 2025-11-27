import StaffingSchedule from "./StaffingSchedule";
import TeachLoadReport from "./TeachLoadReport";

export default function TeachLoad({ selectedReport }) {
  const RenderContent = () => {
    if (selectedReport == null) return null;

    if (selectedReport === "StaffingSchedule") {
      return <StaffingSchedule selectedReport={selectedReport} />;
    } else if (selectedReport === "Load") {
      return <TeachLoadReport />;
    }
  };

  return <RenderContent />;
}

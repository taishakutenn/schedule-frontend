import StaffingSchedule from "./StaffingSchedule";

export default function TeachLoad({ selectedReport }) {
  const RenderContent = () => {
    if (selectedReport == null) return null;

    if (selectedReport === "StaffingSchedule") {
      return <StaffingSchedule selectedReport={selectedReport} />;
    } else if (selectedReport === "Load") {
      return <div>Load</div>;
    }
  };

  return <RenderContent />;
}

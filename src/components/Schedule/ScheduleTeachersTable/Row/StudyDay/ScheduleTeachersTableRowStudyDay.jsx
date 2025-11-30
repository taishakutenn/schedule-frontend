import ScheduleTeachersTableCell from "../Cell/ScheduleTeachersTableRowCell";

export default function ScheduleTeachersTableRowStudyDay({date, shift}) {
  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + shift);

  return (
    <>
      <ScheduleTeachersTableCell classCell="session-cell far-left" date={shiftedDate} sessionNumber={1} />
      <ScheduleTeachersTableCell classCell="session-cell" date={shiftedDate} sessionNumber={2} />
      <ScheduleTeachersTableCell classCell="session-cell" date={shiftedDate} sessionNumber={3} />
      <ScheduleTeachersTableCell classCell="session-cell" date={shiftedDate} sessionNumber={4} />
      <ScheduleTeachersTableCell classCell="session-cell far-right" date={shiftedDate} sessionNumber={5} />
    </>
  );
}

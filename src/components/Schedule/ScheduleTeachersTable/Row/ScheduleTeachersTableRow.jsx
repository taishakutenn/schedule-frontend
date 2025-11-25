import ScheduleTeachersTableRowStudyDay from "./StudyDay/ScheduleTeachersTableRowStudyDay";

export default function ScheduleTeachersTableRow({
  selectedDate,
  teacherInfo,
}) {
  return (
    <tr>
      <td className="session-cell">
        {teacherInfo.fathername
          ? `${teacherInfo.surname} ${teacherInfo.name.charAt(0)}. ${teacherInfo.fathername.charAt(0)}.`
          : `${teacherInfo.surname} ${teacherInfo.name.charAt(0)}.`}
      </td>
      <ScheduleTeachersTableRowStudyDay />
      <ScheduleTeachersTableRowStudyDay />
      <ScheduleTeachersTableRowStudyDay />
      <ScheduleTeachersTableRowStudyDay />
      <ScheduleTeachersTableRowStudyDay />
      <ScheduleTeachersTableRowStudyDay />
    </tr>
  );
}

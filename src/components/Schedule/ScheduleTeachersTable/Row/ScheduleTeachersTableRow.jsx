import ScheduleTeachersTableRowStudyDay from "./StudyDay/ScheduleTeachersTableRowStudyDay";
import TeacherContext from "../../../../contexts/TeacherContext";
import { useApiData } from "../../../../hooks/useApiData";
import { getTeacherInPlanByTeacher } from "../../../../api/teachersInPlansAPI";

export default function ScheduleTeachersTableRow({
  selectedDate,
  teacherInfo,
}) {
  // Get groups for this teacher
    const {
      data: teacherInPlanData,
      loading: teachersLoading,
      error: teachersError,
    } = useApiData(
      () => getTeacherInPlanByTeacher(teacherInfo?.id),
      [selectedDate]);
  
    console.log(teacherInPlanData);

  return (
    <tr>
      <td className="session-cell">
        {teacherInfo.fathername
          ? `${teacherInfo.surname} ${teacherInfo.name.charAt(0)}. ${teacherInfo.fathername.charAt(0)}.`
          : `${teacherInfo.surname} ${teacherInfo.name.charAt(0)}.`}
      </td>
      <TeacherContext.Provider value={teacherInfo}>
        <ScheduleTeachersTableRowStudyDay />
        <ScheduleTeachersTableRowStudyDay />
        <ScheduleTeachersTableRowStudyDay />
        <ScheduleTeachersTableRowStudyDay />
        <ScheduleTeachersTableRowStudyDay />
        <ScheduleTeachersTableRowStudyDay />
      </TeacherContext.Provider>
    </tr>
  );
}

import ScheduleTeachersTableRowStudyDay from "./StudyDay/ScheduleTeachersTableRowStudyDay";
import TeacherContext from "../../../../contexts/TeacherContext";
import { useApiData } from "../../../../hooks/useApiData";
import { getTeacherInPlanByTeacher } from "../../../../api/teachersInPlansAPI";
import { getSubjectHoursByIds } from "../../../../api/subjectHoursAPI";
import { getSubjectsByIds } from "../../../../api/subjectAPI";
import { useState, useEffect } from "react";

export default function ScheduleTeachersTableRow({
  selectedDate,
  teacherInfo,
}) {
  // FIXED USE_API_DATA AND REWRITE THIS CODE
  // =================================================================== 
  // Get teacher in plan datas for current teacher
  const [teachersInPlanData, setTeacherInPlanData] = useState([]);
  const [teacherSubjects, setSubjects] = useState([]);
  const [subjectHoursData, setSubjectHours] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First request
        const result = await getTeacherInPlanByTeacher(teacherInfo?.id);
        setTeacherInPlanData(result);
        
        // Second request

        // Get subject_in_cycle_hours_ids
        const subjectHoursIds = result.map(plan => plan.subject_in_cycle_hours_id);
        // If we have subjectsHoursIds get subjectHours data
        if (subjectHoursIds.length > 0) {
          const subjectsHoursData = await getSubjectHoursByIds(subjectHoursIds);
          setSubjectHours(subjectsHoursData);

          // Get subject ids
          const subjectIds = subjectsHoursData.map((subjectHour) => subjectHour.subject_in_cycle_id)
          // If we have subjectIds get subjects data
          if (subjectIds.length > 0) {
            const subjects = await getSubjectsByIds(subjectIds);
            setSubjects(subjects);
          }
        }
        
      } catch (err) {
        setTeacherInPlanData([]);
        console.error("Ошибка загрузки:", err);
      } 
    };

    fetchData();
  }, [selectedDate]);
  // ===================================================================

  // Get groups for current teacher
  const teacherGroups = teachersInPlanData.map((plan) => plan.group_name);
  // Get subjects in cycle hours id for current teacher
  const teacherSubjectsInCycleHours = teachersInPlanData.map((plan) => plan.subject_in_cycle_hours_id);

  // Create context
  const teacherContext = {
    "teacherInfo": teacherInfo,
    "teacherGroups": teacherGroups,
    "teacherSubjectsInCycleHours": teacherSubjectsInCycleHours,
    "teacherSubjects": teacherSubjects,
    "teachersInPlanData": teachersInPlanData,
    "subjectHoursData": subjectHoursData,
  };

  // console.log(`Инфо препод:`, teacherInfo);
  // console.log(`Группы препод:`, teacherGroups);
  // console.log(`Препод в цикле:`, teacherSubjectsInCycleHours);
  // console.log(`Учителя предметы:`, teacherSubjects);
  
  return (
    <tr>
      <td className="session-cell">
        {teacherInfo.fathername
          ? `${teacherInfo.surname} ${teacherInfo.name.charAt(0)}. ${teacherInfo.fathername.charAt(0)}.`
          : `${teacherInfo.surname} ${teacherInfo.name.charAt(0)}.`}
      </td>
      <TeacherContext.Provider value={teacherContext}>
        <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={0} />
        <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={1} />
        <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={2} />
        <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={3} />
        <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={4} />
        <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={5} />
      </TeacherContext.Provider>
    </tr>
  );
}

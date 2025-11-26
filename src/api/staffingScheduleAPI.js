import { getTeachers } from "./teachersAPI";
import { getTeacherInPlanByTeacher } from "./teachersInPlansAPI";
import { getSubjectHoursByIds } from "./subjectHoursAPI";
import { getPlans, getPlanBySubjectHoursId } from "./plansAPI";
import { getGroupByName } from "./groupAPI";

export const fetchStaffingScheduleData = async (year) => {
  try {
    const plans = await getPlans();
    console.log("Загруженные планы:", plans);

    const teachers = await getTeachers();
    console.log("Загруженные преподаватели:", teachers);

    const staffingData = [];

    for (const teacher of teachers) {
      console.log(
        `Обработка преподавателя: ${teacher.surname} ${teacher.name} ${teacher.fathername}`
      );

      const assignments = await getTeacherInPlanByTeacher(teacher.id);
      console.log(`Назначения для преподавателя ${teacher.id}:`, assignments);

      let totalHoursForYear = 0;
      const relevantAssignments = [];

      for (const assignment of assignments) {
        const hourId = assignment.subject_in_cycle_hours_id;
        const groupName = assignment.group_name;

        const group = await getGroupByName(groupName);

        if (!group) {
          console.warn(
            `Информация о группе "${groupName}" не найдена для назначения ${assignment.id}. Пропускаем.`
          );
          continue;
        }

        const paymentForm = group.payment_form;
        console.log(`Группа ${groupName}, форма оплаты: ${paymentForm}`);

        const hourDetailsArray = await getSubjectHoursByIds([hourId]);
        const hourDetails = hourDetailsArray[0];

        if (!hourDetails) {
          console.warn(`Данные о часах для ID ${hourId} не найдены.`);
          continue;
        }

        const plan = await getPlanBySubjectHoursId(hourId);

        if (!plan) {
          console.warn(`План для часа ID ${hourId} не найден.`);
          continue;
        }

        const semester = hourDetails.semester;
        const planYear = plan.year;

        const calculatedYear = planYear + Math.floor((semester - 1) / 2);

        if (calculatedYear === year) {
          let hoursForSemester = 0;

          if (paymentForm === "Бюджет") {
            hoursForSemester =
              hourDetails.lectures_hours +
              hourDetails.laboratory_hours +
              hourDetails.practical_hours +
              hourDetails.course_project_hours +
              hourDetails.consultation_hours +
              hourDetails.intermediate_assessment_hours;
          } else if (paymentForm === "Внебюджет") {
            hoursForSemester =
              hourDetails.laboratory_hours +
              hourDetails.practical_hours +
              hourDetails.course_project_hours +
              hourDetails.consultation_hours +
              hourDetails.intermediate_assessment_hours;
          } else {
            console.warn(
              `Неизвестная форма оплаты "${paymentForm}" для группы ${groupName}. Назначение ${assignment.id} обработано как бюджетное.`
            );
            hoursForSemester =
              hourDetails.lectures_hours +
              hourDetails.laboratory_hours +
              hourDetails.practical_hours +
              hourDetails.course_project_hours +
              hourDetails.consultation_hours +
              hourDetails.intermediate_assessment_hours;
          }

          totalHoursForYear += hoursForSemester;
          relevantAssignments.push({
            subjectId: hourDetails.subject_in_cycle_id,
            semester: semester,
            hours: hoursForSemester,
            paymentForm: paymentForm,
          });
        } else {
          console.log(
            `Назначение для семестра ${semester} (год ${calculatedYear}) не подходит для отчета за ${year}.`
          );
        }
      }

      const fte = totalHoursForYear / 720;

      staffingData.push({
        teacherId: teacher.id,
        teacherName: `${teacher.surname} ${teacher.name.charAt(0)}. ${
          teacher.fathername ? teacher.fathername.charAt(0) + "." : ""
        }`,
        totalHours: totalHoursForYear,
        fte: parseFloat(fte.toFixed(2)),
        assignments: relevantAssignments,
      });
    }

    return staffingData;
  } catch (error) {
    console.error("Ошибка при загрузке данных для штатного расписания:", error);
    throw error;
  }
};

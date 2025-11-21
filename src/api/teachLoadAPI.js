import { getGroupsByNames } from "./groupAPI";
import { getTeachersInPlans } from "./teachersInPlansAPI";
import { getSubjectHoursByIds } from "./subjectHoursAPI";
import { getPlans } from "./plansAPI";
import { getSubjectsByIds } from "./subjectAPI";
import { getTeachersByIds } from "./teachersAPI";

const determineSemesterType = (groupName, semesterNumber) => {
  const groupYearSuffix = groupName.substring(0, 2);
  const studentStartYear = parseInt(groupYearSuffix, 10) + 2000;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let currentAcademicYearStart;
  if (currentMonth >= 8) {
    currentAcademicYearStart = currentYear;
  } else {
    currentAcademicYearStart = currentYear - 1;
  }

  const yearsSinceStart = currentAcademicYearStart - studentStartYear;
  if (yearsSinceStart < 0) {
    return { isFirstHalf: false, isSecondHalf: false };
  }
  const expectedSemesterForCurrentYear = yearsSinceStart * 2 + 1;
  const expectedSemesterForCurrentYearSecond = yearsSinceStart * 2 + 2;

  if (semesterNumber === expectedSemesterForCurrentYear) {
    return { isFirstHalf: true, isSecondHalf: false };
  } else if (semesterNumber === expectedSemesterForCurrentYearSecond) {
    return { isFirstHalf: false, isSecondHalf: true };
  } else {
    console.warn(
      `Семестр ${semesterNumber} не соответствует ожидаемому для группы ${groupName} в текущем учебном году ${currentAcademicYearStart}-${
        currentAcademicYearStart + 1
      }`
    );
    return { isFirstHalf: false, isSecondHalf: false };
  }
};

const formatTeacherName = (teacherObj) => {
  if (!teacherObj) return "Преподаватель";

  const surname = teacherObj.surname || "";
  const nameInitial = teacherObj.name ? teacherObj.name.charAt(0) + "." : "";
  const patronymicInitial = teacherObj.fathername
    ? teacherObj.fathername.charAt(0) + "."
    : "";
  return `${surname} ${nameInitial}${patronymicInitial}`.trim();
};

export const fetchTeachLoadData = async () => {
  try {
    console.log("Загрузка записей о нагрузке...");
    const planItems = await getTeachersInPlans();

    console.log("Загрузка всех планов...");
    const allPlans = await getPlans();
    const plansMap = new Map();
    allPlans.forEach((plan) => {
      plansMap.set(`${plan.speciality_code}-${plan.year}`, plan);
    });

    console.log("Сбор уникальных имён групп...");
    const uniqueGroupNamesSet = new Set();
    planItems.forEach((item) => {
      uniqueGroupNamesSet.add(item.group_name);
    });
    const uniqueGroupNames = Array.from(uniqueGroupNamesSet);

    console.log("Загрузка информации о группах по именам...");
    if (uniqueGroupNames.length === 0) {
      console.warn("Не найдено уникальных имён групп в данных о нагрузке.");
      return [];
    }
    const allGroups = await getGroupsByNames(uniqueGroupNames);

    const groupPaymentMap = new Map();
    allGroups.forEach((group) => {
      groupPaymentMap.set(group.group_name, group.payment_form);
    });

    const uniqueHoursIdsSet = new Set();
    const uniqueTeacherIdsSet = new Set();
    const uniqueSubjectIdsSet = new Set();

    planItems.forEach((item) => {
      uniqueHoursIdsSet.add(item.subject_in_cycle_hours_id);
      uniqueTeacherIdsSet.add(item.teacher_id);
    });

    const uniqueHoursIds = Array.from(uniqueHoursIdsSet);
    const uniqueTeacherIds = Array.from(uniqueTeacherIdsSet);

    console.log("Загрузка данных о часах...");
    const hoursDataArray = await getSubjectHoursByIds(uniqueHoursIds);

    hoursDataArray.forEach((hoursItem) => {
      uniqueSubjectIdsSet.add(hoursItem.subject_in_cycle_id);
    });
    const uniqueSubjectIds = Array.from(uniqueSubjectIdsSet);

    console.log("Загрузка данных о предметах...");
    const subjectDataArray = await getSubjectsByIds(uniqueSubjectIds);

    const subjectDataMap = new Map(
      subjectDataArray.map((item) => [item.id, item])
    );

    console.log("Загрузка данных о преподавателях...");
    const teacherDataArray = await getTeachersByIds(uniqueTeacherIds);

    const hoursDataMap = new Map(hoursDataArray.map((item) => [item.id, item]));
    const teacherDataMap = new Map(
      teacherDataArray.map((item) => [item.id, item])
    );

    const groupedLoadDataMap = new Map();

    console.log("Сбор итоговых данных...");
    for (const planItem of planItems) {
      const hoursData = hoursDataMap.get(planItem.subject_in_cycle_hours_id);
      const subjectData = subjectDataMap.get(hoursData?.subject_in_cycle_id);
      const teacherData = teacherDataMap.get(planItem.teacher_id);

      if (!hoursData || !subjectData) {
        console.warn("Не найдены данные для одной из записей:", planItem);
        continue;
      }

      const groupPaymentType = groupPaymentMap.get(planItem.group_name);

      if (groupPaymentType === undefined) {
        console.warn(
          `Тип оплаты (payment_form) для группы ${planItem.group_name} не найден в ответе API.`,
          planItem
        );
        continue;
      }

      const { isFirstHalf, isSecondHalf } = determineSemesterType(
        planItem.group_name,
        hoursData.semester
      );

      const groupKey = `${planItem.teacher_id}-${subjectData.id}-${planItem.group_name}`;

      let loadEntry = groupedLoadDataMap.get(groupKey);

      if (!loadEntry) {
        loadEntry = {
          id: planItem.id,
          teacher_id: planItem.teacher_id,
          teacher_name: teacherData
            ? formatTeacherName(teacherData)
            : `Преподаватель ${planItem.teacher_id}`,
          subject_id: subjectData.id,
          subject_id: subjectData.id,
          subject: subjectData.title,
          group: planItem.group_name,
          semester: hoursData.semester,
          lecture_1: 0,
          lecture_2: 0,
          practical_1: 0,
          practical_2: 0,
          course_project: 0,
          consultation: 0,
          diff_exam: 0,
          exam: 0,
          budget_hours: 0,
          budget_rate: 0,
          extrabudget_hours: 0,
          extrabudget_rate: 0,
          hourly_budget: 0,
          hourly_extrabudget: 0,
        };
      }

      const totalPracticalHours =
        (hoursData.laboratory_hours || 0) + (hoursData.practical_hours || 0);

      if (isFirstHalf) {
        loadEntry.lecture_1 = hoursData.lectures_hours;
        loadEntry.practical_1 = totalPracticalHours;
        loadEntry.course_project = hoursData.course_project_hours;
        loadEntry.consultation = hoursData.consultation_hours;
        loadEntry.diff_exam = hoursData.intermediate_assessment_hours;
      } else if (isSecondHalf) {
        loadEntry.lecture_2 = hoursData.lectures_hours;
        loadEntry.practical_2 = totalPracticalHours;
        loadEntry.course_project = hoursData.course_project_hours;
        loadEntry.consultation = hoursData.consultation_hours;
        loadEntry.diff_exam = hoursData.intermediate_assessment_hours;
      }

      groupedLoadDataMap.set(groupKey, loadEntry);
    }

    // calculate
    groupedLoadDataMap.forEach((loadEntry) => {
      const groupPaymentType = groupPaymentMap.get(loadEntry.group);

      loadEntry.budget_hours = 0;
      loadEntry.extrabudget_hours = 0;

      if (groupPaymentType === "Бюджет") {
        loadEntry.budget_hours =
          loadEntry.lecture_1 +
          loadEntry.lecture_2 +
          loadEntry.practical_1 +
          loadEntry.practical_2 +
          loadEntry.course_project +
          loadEntry.consultation +
          loadEntry.diff_exam +
          loadEntry.exam;
        loadEntry.extrabudget_hours = 0;
      } else if (groupPaymentType === "Внебюджет") {
        loadEntry.budget_hours = 0;
        loadEntry.extrabudget_hours =
          loadEntry.practical_1 +
          loadEntry.practical_2 +
          loadEntry.course_project +
          loadEntry.consultation +
          loadEntry.diff_exam +
          loadEntry.exam;
      } else {
        console.warn(
          `Неизвестный тип оплаты (payment_form) для группы ${loadEntry.group}: ${groupPaymentType}. Установлены 0.`
        );
        loadEntry.budget_hours = 0;
        loadEntry.extrabudget_hours = 0;
      }
    });

    const finalLoadData = Array.from(groupedLoadDataMap.values());

    console.log("Данные нагрузки собраны:", finalLoadData);
    return finalLoadData;
  } catch (error) {
    console.error("Ошибка при загрузке данных о нагрузке:", error);
    throw error;
  }
};

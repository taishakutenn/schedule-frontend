export const processPlanItems = (
  planItems,
  groupPaymentMap,
  hoursDataMap,
  subjectDataMap,
  teacherDataMap,
  certificationsMap,
  determineSemesterType,
  formatTeacherName,
  additionalFilter = null
) => {
  const groupedLoadDataMap = new Map();

  console.log("Сбор итоговых данных...");
  for (const planItem of planItems) {
    const hoursData = hoursDataMap.get(planItem.subject_in_cycle_hours_id);
    const subjectData = subjectDataMap.get(hoursData?.subject_in_cycle_id);
    const teacherData = teacherDataMap.get(planItem.teacher_id);
    const certificationData = certificationsMap.get(
      planItem.subject_in_cycle_hours_id
    );

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

    if (additionalFilter) {
      const groupName = planItem.group_name;
      const yearMatch = groupName.match(/^(\d{2})/);
      let groupStartYear = null;
      if (yearMatch) {
        const twoDigitYear = parseInt(yearMatch[1], 10);
        groupStartYear = 2000 + twoDigitYear;
      } else {
        console.warn(
          `Не удалось извлечь год из названия группы ${groupName} для фильтрации. Пропускаем.`
        );
        continue;
      }

      if (!additionalFilter(planItem, hoursData, groupStartYear)) {
        continue;
      }
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
        subject: subjectData.title,
        group: planItem.group_name,
        semester: hoursData.semester,

        lecture_1: undefined,
        lecture_2: undefined,
        practical_1: undefined,
        practical_2: undefined,
        course_project: undefined,
        consultation: undefined,
        diff_exam: undefined,
        exam: undefined,
        budget_hours: 0,
        budget_rate: 0,
        extrabudget_hours: 0,
        extrabudget_rate: 0,
      };
    }

    const totalPracticalHours =
      (hoursData.laboratory_hours || 0) + (hoursData.practical_hours || 0);

    if (isFirstHalf) {
      loadEntry.lecture_1 = hoursData.lectures_hours;
      loadEntry.practical_1 = totalPracticalHours;
      loadEntry.course_project = hoursData.course_project_hours;
      loadEntry.consultation = hoursData.consultation_hours;

      if (certificationData) {
        if (certificationData.differentiated_credit) {
          loadEntry.diff_exam = hoursData.intermediate_assessment_hours;
        } else if (certificationData.credit) {
          loadEntry.exam = hoursData.intermediate_assessment_hours;
        }
      }
    } else if (isSecondHalf) {
      loadEntry.lecture_2 = hoursData.lectures_hours;
      loadEntry.practical_2 = totalPracticalHours;
      loadEntry.course_project = hoursData.course_project_hours;
      loadEntry.consultation = hoursData.consultation_hours;

      if (certificationData) {
        if (certificationData.differentiated_credit) {
          loadEntry.diff_exam = hoursData.intermediate_assessment_hours;
        } else if (certificationData.credit) {
          loadEntry.exam = hoursData.intermediate_assessment_hours;
        }
      }
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
        (loadEntry.lecture_1 || 0) +
        (loadEntry.lecture_2 || 0) +
        (loadEntry.practical_1 || 0) +
        (loadEntry.practical_2 || 0) +
        (loadEntry.course_project || 0) +
        (loadEntry.consultation || 0) +
        (loadEntry.diff_exam || 0) +
        (loadEntry.exam || 0);
      loadEntry.extrabudget_hours = 0;

      loadEntry.budget_rate =
        Math.round((loadEntry.budget_hours / 720) * 100) / 100;
      loadEntry.extrabudget_rate = 0;
    } else if (groupPaymentType === "Внебюджет") {
      loadEntry.budget_hours = 0;
      loadEntry.extrabudget_hours =
        (loadEntry.practical_1 || 0) +
        (loadEntry.practical_2 || 0) +
        (loadEntry.course_project || 0) +
        (loadEntry.consultation || 0) +
        (loadEntry.diff_exam || 0) +
        (loadEntry.exam || 0);

      loadEntry.extrabudget_rate =
        Math.round((loadEntry.extrabudget_hours / 720) * 100) / 100;
      loadEntry.budget_rate = 0;
    } else {
      console.warn(
        `Неизвестный тип оплаты (payment_form) для группы ${loadEntry.group}: ${groupPaymentType}. Установлены 0.`
      );
      loadEntry.budget_hours = 0;
      loadEntry.extrabudget_hours = 0;
      loadEntry.budget_rate = 0;
      loadEntry.extrabudget_rate = 0;
    }
  });

  return Array.from(groupedLoadDataMap.values());
};

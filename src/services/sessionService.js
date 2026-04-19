/**
 * Сервис для работы с данными сессий
 * Все функции — pure, не вызывают побочных эффектов
 */

export const parseCabinetValue = (cabinetValue) => {
  if (!cabinetValue) return { building: "", cabinet: "" };
  const parts = cabinetValue.split("-");
  return {
    building: parts[0] || "",
    cabinet: parts[1] || "",
  };
};

export const buildSessionPayload = ({
  form,
  teacherInPlanData,
  subjectInCycleHoursData,
}) => {
  if (!form?.group?.value || !form?.subject?.value) {
    return null;
  }

  // Находим teacher_in_plan по группе и предмету
  const teacherInPlan = teacherInPlanData?.find((tip) => {
    const hasGroup = tip.group_name === form.group.value;
    const hasSubject = subjectInCycleHoursData?.some(
      (sch) =>
        sch.id === tip.subject_in_cycle_hours_id &&
        sch.subject_in_cycle_id === parseInt(form.subject.value, 10),
    );
    return hasGroup && hasSubject;
  });

  if (!teacherInPlan) {
    return null;
  }

  // Парсим кабинет
  const { building, cabinet } = parseCabinetValue(form.cabinet?.value);

  return {
    teacherInPlanId: teacherInPlan.id,
    sessionType: form.sessionType?.value,
    cabinet,
    building,
  };
};

export const buildStreamPayload = ({
  form,
  teacherInPlanData,
  subjectInCycleHoursData,
  subjectInCycleData,
}) => {
  if (!form.streams?.length) {
    return [];
  }

  return form.streams
    .map((stream) => {
      // Находим subject_in_cycle_hours по subject_id из стрима
      const subjectInCycleHours = subjectInCycleHoursData?.find(
        (sch) => sch.subject_in_cycle_id === stream.subject_id,
      );

      if (!subjectInCycleHours) {
        return null;
      }

      // Находим teacher_in_plan для этого стрима
      const teacherInPlan = teacherInPlanData?.find(
        (tip) =>
          tip.subject_in_cycle_hours_id === subjectInCycleHours.id &&
          tip.group_name === stream.group_name,
      );

      if (!teacherInPlan) {
        return null;
      }

      // Парсим кабинет
      const { building, cabinet } = parseCabinetValue(form.cabinet?.value);

      return {
        teacherInPlanId: teacherInPlan.id,
        sessionType: form.sessionType?.value,
        cabinet,
        building,
      };
    })
    .filter((item) => item !== null);
};

export const validateSessionForm = (form) => {
  const errors = [];

  if (!form?.group?.value) {
    errors.push("Не выбрана группа");
  }
  if (!form?.subject?.value) {
    errors.push("Не выбран предмет");
  }
  if (!form?.sessionType?.value) {
    errors.push("Не выбран тип пары");
  }
  if (!form?.cabinet?.value) {
    errors.push("Не выбран кабинет");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const filterCurrentGroupFromStreams = (streams, currentGroup) => {
  if (!streams?.length || !currentGroup) {
    return [];
  }
  return streams.filter((streamItem) => streamItem.group_name !== currentGroup);
};

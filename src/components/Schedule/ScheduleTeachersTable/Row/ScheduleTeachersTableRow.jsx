import ScheduleTeachersTableRowStudyDay from "./StudyDay/ScheduleTeachersTableRowStudyDay";
import ScheduleTeachersTableContext from "../../../../contexts/ScheduleTeachersTableContext";

import { useApiData } from "../../../../hooks/useApiData";

import { getTeacherInPlanByTeacher } from "../../../../api/teachersInPlansAPI";
import { getSubjectHoursByIds } from "../../../../api/subjectHoursAPI";
import { getSubjectsByIds } from "../../../../api/subjectAPI";
import { getSessionsForTeacherAndDate } from "../../../../api/scheduleAPI";

import { isMonday } from "../../../../utils/scheduleTeachersTableHepl";

import { useState, useEffect, useMemo, useContext, useCallback } from "react";

import "./scheduleTeachersTableRow.css";

export default function ScheduleTeachersTableRow({
  selectedDate,
  teacherInfo,
}) {
  // Перед чтением этого кода настоятельно рекомендуется изучить таблицы базы данных:
  // teacher_in_plan, subject_in_cycle, subject_in_cycle_hours

  // 1.
  // По ID преподавателя получаем все записи teacher_in_plan
  const teachersInPlanCall = useCallback(
    // Используем callback, чтобы избежать бесконечного количества API-запросов
    () => getTeacherInPlanByTeacher(teacherInfo.id),
    [teacherInfo.id],
  );
  const {
    data: teacherInPlanData,
    loading: teacherInPlanLoading,
    error: teacherInPlanError,
  } = useApiData(teachersInPlanCall, [selectedDate]);

  // 2.
  // Получаем ID subject_in_cycle_hours из данных teacher_in_plan
  const teacherSubjectsInCyclesHoursIds = useMemo(() => {
    // Используем memo, потому что без него массив создавался бы заново при каждом рендере,
    // что привело бы к бесконечным API-запросам
    return (
      teacherInPlanData?.map((item) => item.subject_in_cycle_hours_id) || []
    );
  }, [teacherInPlanData]);

  // По полученным ID subject_in_cycle_hours получаем записи subject_in_cycle_hours
  const subjectsInCycleHoursCall = useCallback(() => {
    if (teacherSubjectsInCyclesHoursIds.length == 0) {
      return Promise.resolve([]); // Избегаем отправки пустого массива в API
    }
    return getSubjectHoursByIds(teacherSubjectsInCyclesHoursIds);
  }, [teacherSubjectsInCyclesHoursIds]);

  const {
    data: subjectInCycleHoursData,
    loading: subjectInCycleHoursLoading,
    error: subjectInCycleHoursError,
  } = useApiData(subjectsInCycleHoursCall, [teacherSubjectsInCyclesHoursIds]);

  // 3.
  // В полученных данных subject_in_cycle_hours
  // получаем ID всех subject_in_cycle
  const subjectsInCycleIds = useMemo(() => {
    return (
      subjectInCycleHoursData?.map((item) => item.subject_in_cycle_id) || []
    );
  }, [subjectInCycleHoursData]);

  // По полученным ID subject_in_cycle получаем записи subject_in_cycle
  const subjectsInCycleCall = useCallback(() => {
    if (subjectsInCycleIds.length == 0) {
      return Promise.resolve([]);
    }
    return getSubjectsByIds(subjectsInCycleIds);
  }, [subjectsInCycleIds]);

  const {
    data: subjectInCycleData,
    loading: subjectInCycleLoading,
    error: subjectInCycleError,
  } = useApiData(subjectsInCycleCall, [subjectsInCycleIds]);

  // 4.
  // Отдельно для удобства формируем данные для контекста
  const groups = [...new Set(teacherInPlanData.map((item) => item.group_name))];

  // Функция для форматирования даты (без конвертации в UTC)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 5.
  // Получаем сессии для этого преподавателя и для текущей недели
  const startPeriodDateStr = useMemo(
    () => formatDate(selectedDate),
    [selectedDate],
  );
  const endPeriodDateStr = useMemo(() => {
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 5);
    return formatDate(endDate);
  }, [selectedDate]);

  const teacherSessionsCall = useCallback(() => {
    return getSessionsForTeacherAndDate(
      teacherInfo?.id,
      startPeriodDateStr,
      endPeriodDateStr,
    );
  }, [teacherInfo?.id, startPeriodDateStr, endPeriodDateStr]);

  const {
    data: teacherSessions,
    loading: teacherSessionsLoading,
    error: teacherSessionsError,
  } = useApiData(teacherSessionsCall, [
    teacherInfo?.id,
    startPeriodDateStr,
    endPeriodDateStr,
  ]);

  // Получаем контекст и добавляем в него данные
  const scheduleTeachersTableContext = useContext(ScheduleTeachersTableContext);
  const updatedScheduleTeachersTableContext = useMemo(() => {
    return {
      ...scheduleTeachersTableContext,
      teacherInfo: teacherInfo,
      teacherInPlanData: teacherInPlanData || [],
      subjectInCycleHoursData: subjectInCycleHoursData || [],
      subjectInCycleData: subjectInCycleData || [],
      groups: groups || [],
      teacherSessions: teacherSessions || [],
    };
  }, [
    scheduleTeachersTableContext,
    teacherInfo,
    teacherInPlanData,
    subjectInCycleHoursData,
    subjectInCycleData,
    groups,
    teacherSessions,
  ]);

  return (
  <ScheduleTeachersTableContext.Provider value={updatedScheduleTeachersTableContext}>
    <tr>
      <th className="session-cell-header teacher-name-cell">
        {teacherInfo.fathername
          ? `${teacherInfo.surname} ${teacherInfo.name.charAt(0)}. ${teacherInfo.fathername.charAt(0)}.`
          : `${teacherInfo.surname} ${teacherInfo.name.charAt(0)}.`}
      </th>
      <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={0} />
      <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={1} />
      <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={2} />
      <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={3} />
      <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={4} />
      <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={5} />
    </tr>
  </ScheduleTeachersTableContext.Provider>
);
}

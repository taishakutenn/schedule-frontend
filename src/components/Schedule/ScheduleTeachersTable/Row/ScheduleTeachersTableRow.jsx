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
  // Before reading this code blog, it is highly recommended to study the database tables:
  // teacher_in_plan, subject_in_cycle, subject_in_cycle_hours

  // 1.
  // By teacher ID we get all teacher records in the plan
  const teachersInPlanCall = useCallback(
    // We use callback to avoid an infinite number of API requests
    () => getTeacherInPlanByTeacher(teacherInfo.id),
    [teacherInfo.id],
  );
  const {
    data: teacherInPlanData,
    loading: teacherInPlanLoading,
    error: teacherInPlanError,
  } = useApiData(teachersInPlanCall, [selectedDate]);

  // 2.
  // Get subject in cycle hours IDs from teacher in plan data
  const teacherSubjectsInCyclesHoursIds = useMemo(() => {
    // We use memo, because Map create recreate this array and so that there is no endless API call
    return (
      teacherInPlanData?.map((item) => item.subject_in_cycle_hours_id) || []
    );
  }, [teacherInPlanData]);

  // Using the received subject in cycle hours IDs, we obtain the item records subject in cycle hours
  const subjectsInCycleHoursCall = useCallback(() => {
    if (teacherSubjectsInCyclesHoursIds.length == 0) {
      return Promise.resolve([]); // <--To avoid sending an empty array to the API
    }
    return getSubjectHoursByIds(teacherSubjectsInCyclesHoursIds);
  }, [teacherSubjectsInCyclesHoursIds]);

  const {
    data: subjectInCycleHoursData,
    loading: subjectInCycleHoursLoading,
    error: subjectInCycleHoursError,
  } = useApiData(subjectsInCycleHoursCall, []);

  // 3.
  // In the received data of the clock of objects in the cycle,
  // we obtain the ID of all objects in the cycle
  const subjectsInCycleIds = useMemo(() => {
    return (
      subjectInCycleHoursData?.map((item) => item.subject_in_cycle_id) || []
    );
  }, [subjectInCycleHoursData]);

  // Using the received subject in cycle IDs, we obtain the item records subject in cycle
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
  } = useApiData(subjectsInCycleCall, []);

  // 4.
  // Separately, for convenience, we generate data for context
  const groups = [...new Set(teacherInPlanData.map((item) => item.group_name))];

  // 5.
  // Get sessions for this teacher and for current week
  const startPeriodDate = selectedDate;
  const endPeriodDate = new Date(selectedDate);
  endPeriodDate.setDate(endPeriodDate.getDate() + 5);

  // Function for formating date
  const formatDate = (date) => date.toISOString().split("T")[0];

  const startPeriodDateStr = formatDate(startPeriodDate);
  const endPeriodDateStr = formatDate(endPeriodDate);

  const teacherSessionsCall = useCallback(() => {
    return getSessionsForTeacherAndDate(
      teacherInfo?.id,
      startPeriodDateStr,
      endPeriodDateStr,
    );
  }, [teacherInfo]);

  const {
    data: teacherSessions,
    loading: teacherSessionsLoading,
    error: teacherSessionsError,
  } = useApiData(teacherSessionsCall, [selectedDate]);

  // Get context with cabinets and add data in this context
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
    <tr>
      <th className="session-cell-header">
        {teacherInfo.fathername
          ? `${teacherInfo.surname} ${teacherInfo.name.charAt(
              0,
            )}. ${teacherInfo.fathername.charAt(0)}.`
          : `${teacherInfo.surname} ${teacherInfo.name.charAt(0)}.`}
      </th>
      <ScheduleTeachersTableContext.Provider
        value={updatedScheduleTeachersTableContext}
      >
        <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={0} />
        {/* <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={1} />
          <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={2} />
          <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={3} />
          <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={4} />
          <ScheduleTeachersTableRowStudyDay date={selectedDate} shift={5} /> */}
      </ScheduleTeachersTableContext.Provider>
    </tr>
  );
}

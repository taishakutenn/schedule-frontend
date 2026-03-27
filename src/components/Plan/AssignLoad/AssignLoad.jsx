import "./AssignLoad.css";
import { useState, useEffect, useMemo, useRef } from "react";
import { getPlans } from "../../../api/plansAPI";
import { getGroupsBySpeciality, getGroupByName } from "../../../api/groupAPI";
import { getAllSubjectsInPlan } from "../../../api/subjectAPI";
import { getSubjectHoursBySubject } from "../../../api/subjectHoursAPI";
import { getTeachers } from "../../../api/teachersAPI";
import { getTeacherInPlanByGroup } from "../../../api/teachersInPlansAPI";
import { calculateCurrentSemestersForGroup } from "../../../utils/calculateCurrentSemestersForGroup";
import { usePost } from "../../../hooks/usePost";
import { useUpdate } from "../../../hooks/useUpdate";
import { useDelete } from "../../../hooks/useDelete";
import Button from "../../Button/Button";
import AssignLoadTable from "./AssignLoadTable";

export default function AssignLoad({ onClose }) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allSubjectHours, setAllSubjectHours] = useState({});
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [relevantSemesters, setRelevantSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState(null);

  const [assignedTeachers, setAssignedTeachers] = useState({});
  const [duplicating, setDuplicationg] = useState(false);
  const [duplicateSuccess, setDuplicateSuccess] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState(new Set());

  // Ref для хранения актуального значения assignedTeachers без ре-рендера
  const assignedTeachersRef = useRef({});

  // Ref для сохранения позиции скролла таблицы
  const tableContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const needRestoreScrollRef = useRef(false);

  // Синхронизируем ref с состоянием
  useEffect(() => {
    assignedTeachersRef.current = assignedTeachers;
  }, [assignedTeachers]);

  // Восстанавливаем скролл после ре-рендера
  useEffect(() => {
    if (needRestoreScrollRef.current && tableContainerRef.current) {
      // Используем setTimeout для восстановления после отрисовки
      const timerId = setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = scrollPositionRef.current;
        }
        needRestoreScrollRef.current = false;
      }, 0);

      return () => clearTimeout(timerId);
    }
  });

  const { post: createAssignment, loading: loadingCreate } = usePost();
  const { update: updateAssignment, loading: loadingUpdate } = useUpdate();
  const { del: deleteAssignment, loading: loadingDelete } = useDelete();

  const findSpecialityCodeByPlanId = (planId) => {
    if (!planId || !plans) return null;
    const plan = plans.find((p) => p.id === parseInt(planId));
    return plan ? plan.speciality_code : null;
  };

  // load plans
  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPlans();
        setPlans(data);
      } catch (err) {
        setError(`Ошибка загрузки планов: ${err.message}`);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // load teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      setError(null);
      try {
        const data = await getTeachers();
        setTeachers(data);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError(`Ошибка загрузки преподавателей: ${err.message}`);
        setTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  // Load subjects and it hours
  useEffect(() => {
    const fetchPlanData = async (planId) => {
      if (!planId) {
        setSubjects([]);
        setAllSubjectHours({});
        setGroups([]);
        setAssignedTeachers({});
        setRelevantSemesters([]);
        return;
      }

      setLoadingSubjects(true);
      setError(null);
      try {
        // console.log("Fetching subjects for plan ID:", planId);
        const subjectsInPlan = await getAllSubjectsInPlan(planId);
        const subjectsArray = Array.isArray(subjectsInPlan)
          ? subjectsInPlan
          : [];
        // console.log("Fetched subjects:", subjectsArray);

        const hoursMap = {};
        const hoursPromises = subjectsArray.map(async (subject) => {
          try {
            const hours = await getSubjectHoursBySubject(subject.id);
            // console.log("Fetched hours for subject ID:", subject.id, hours);
            hoursMap[subject.id] = hours;
          } catch (err) {
            console.error(
              `Error fetching hours for subject ID ${subject.id}:`,
              err,
            );
            hoursMap[subject.id] = [];
          }
        });

        await Promise.all(hoursPromises);

        setSubjects(subjectsArray);
        setAllSubjectHours(hoursMap);

        const specialityCode = findSpecialityCodeByPlanId(planId);
        if (specialityCode) {
          const groupsForSpeciality =
            await getGroupsBySpeciality(specialityCode);
          setGroups(
            Array.isArray(groupsForSpeciality) ? groupsForSpeciality : [],
          );
        } else {
          setGroups([]);
        }
      } catch (err) {
        console.error("Error in fetchPlanData:", err);
        setError(`Ошибка загрузки данных по плану: ${err.message}`);
        setSubjects([]);
        setAllSubjectHours({});
        setGroups([]);
        setAssignedTeachers({});
        setRelevantSemesters([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchPlanData(selectedPlanId);
    setSelectedGroup(null);
  }, [selectedPlanId]);

  useEffect(() => {
    if (!selectedGroup || !Object.keys(allSubjectHours).length) {
      setRelevantSemesters([]);
      return;
    }

    const { relevantSemesters: calculatedRelevantSemesters, error: calcError } =
      calculateCurrentSemestersForGroup(selectedGroup);

    if (calcError) {
      console.warn(
        `Ошибка вычисления семестров для группы ${selectedGroup}:`,
        calcError,
      );
      setRelevantSemesters([]);
      return;
    }

    const uniqueSemestersSet = new Set();
    Object.values(allSubjectHours).forEach((hoursArray) => {
      if (Array.isArray(hoursArray)) {
        hoursArray.forEach((hour) => {
          if (calculatedRelevantSemesters.includes(hour.semester)) {
            uniqueSemestersSet.add(hour.semester);
          }
        });
      }
    });

    const sortedSemesters = Array.from(uniqueSemestersSet).sort(
      (a, b) => a - b,
    );
    setRelevantSemesters(sortedSemesters);
  }, [selectedGroup, allSubjectHours]);

  useEffect(() => {
    if (
      !selectedGroup ||
      !selectedPlanId ||
      !subjects.length ||
      !Object.keys(allSubjectHours).length
    ) {
      setAssignedTeachers({});
      return;
    }

    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      setError(null);

      try {
        const assignments = await getTeacherInPlanByGroup(selectedGroup);

        const hoursToSubjectMap = new Map();
        Object.entries(allSubjectHours).forEach(([subjectId, hoursArray]) => {
          if (Array.isArray(hoursArray)) {
            hoursArray.forEach((hour) => {
              hoursToSubjectMap.set(hour.id, parseInt(subjectId));
            });
          }
        });

        const initialAssignedTeachers = {};

        assignments.forEach((assignment) => {
          const subjectId = hoursToSubjectMap.get(
            assignment.subject_in_cycle_hours_id,
          );

          const subjectInPlan = subjects.find((s) => s.id === subjectId);

          if (subjectInPlan) {
            let semester = null;
            const subjectHours = allSubjectHours[subjectId];
            if (Array.isArray(subjectHours)) {
              const hourDetails = subjectHours.find(
                (h) => h.id === assignment.subject_in_cycle_hours_id,
              );
              if (hourDetails) {
                semester = hourDetails.semester;
              }
            }

            const { relevantSemesters: currentRelevantSemesters } =
              calculateCurrentSemestersForGroup(selectedGroup);
            if (currentRelevantSemesters.includes(semester)) {
              const assignmentKey = `${selectedGroup}-${semester}-${subjectId}`;

              initialAssignedTeachers[assignmentKey] = {
                id: assignment.id,
                teacher_id: assignment.teacher_id.toString(),
              };
              console.log(
                `Pre-filled assignment: Key=${assignmentKey}, DB ID=${assignment.id}, TeacherID=${assignment.teacher_id}`,
              );
            } else {
              console.log(
                `Assignment found for non-current semester: Group=${selectedGroup}, Semester=${semester}, SubjectID=${subjectId}, TeacherID=${assignment.teacher_id}`,
              );
            }
          } else {
            console.log(
              `Assignment found for subject not in current plan: subject_in_cycle_hours_id=${assignment.subject_in_cycle_hours_id}, teacher_id=${assignment.teacher_id}`,
            );
          }
        });

        setAssignedTeachers(initialAssignedTeachers);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError(`Ошибка загрузки назначенной нагрузки: ${err.message}`);
        setAssignedTeachers({});
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, [selectedGroup, selectedPlanId, subjects, allSubjectHours]);

  const tableRows = useMemo(() => {
    if (
      !selectedGroup ||
      !Object.keys(allSubjectHours).length ||
      !subjects.length
    ) {
      return [];
    }

    const { relevantSemesters: calculatedRelevantSemesters, error: calcError } =
      calculateCurrentSemestersForGroup(selectedGroup);

    if (calcError) {
      console.warn(
        `useMemo: Ошибка вычисления семестров для группы ${selectedGroup}:`,
        calcError,
      );
      return [];
    }

    const rows = [];

    Object.entries(allSubjectHours).forEach(([subjectId, hoursArray]) => {
      if (Array.isArray(hoursArray)) {
        hoursArray.forEach((hour) => {
          if (calculatedRelevantSemesters.includes(hour.semester)) {
            const subject = subjects.find((s) => s.id === parseInt(subjectId));
            if (subject) {
              rows.push({
                semester: hour.semester,
                subjectId: subject.id,
                subjectTitle: subject.title,
              });
            }
          }
        });
      }
    });

    rows.sort((a, b) => {
      if (a.semester !== b.semester) {
        return a.semester - b.semester;
      }
      return a.subjectTitle.localeCompare(b.subjectTitle);
    });

    console.log("useMemo: Calculated tableRows for vertical table:", rows);
    return rows;
  }, [selectedGroup, allSubjectHours, subjects]);

  const handleTeacherChange = async (
    semester,
    subjectId,
    subjectTitle,
    group,
    e,
  ) => {
    const selectedTeacherId = e.target.value;
    const assignmentKey = `${group}-${semester}-${subjectId}`;

    // Блокируем повторные вызовы для того же ключа
    if (pendingUpdates.has(assignmentKey)) {
      return;
    }

    // Сохраняем позицию скролла перед обновлением
    if (tableContainerRef.current) {
      scrollPositionRef.current = tableContainerRef.current.scrollTop;
      needRestoreScrollRef.current = true;
    }

    // Помечаем ключ как обрабатываемый
    setPendingUpdates((prev) => new Set(prev).add(assignmentKey));

    const subjectHoursForSubject = allSubjectHours[subjectId];
    if (!Array.isArray(subjectHoursForSubject)) {
      setPendingUpdates((prev) => {
        const next = new Set(prev);
        next.delete(assignmentKey);
        return next;
      });
      return;
    }

    const hourForSemester = subjectHoursForSubject.find(
      (hour) => hour.semester === semester,
    );
    if (!hourForSemester) {
      setPendingUpdates((prev) => {
        const next = new Set(prev);
        next.delete(assignmentKey);
        return next;
      });
      return;
    }

    const subjectInCycleHoursId = hourForSemester.id;
    const sessionType = null;

    // Используем ref для получения актуального значения
    const currentAssignment = assignedTeachersRef.current[assignmentKey];
    const existingAssignmentId = currentAssignment?.id;

    const assignmentData = {
      subject_in_cycle_hours_id: subjectInCycleHoursId,
      teacher_id: parseInt(selectedTeacherId),
      group_name: group,
      session_type: sessionType,
    };

    // Обновляем UI сразу (один раз)
    setAssignedTeachers((prevAssigned) => ({
      ...prevAssigned,
      [assignmentKey]: {
        id: existingAssignmentId || null,
        teacher_id: selectedTeacherId,
      },
    }));

    if (!selectedTeacherId) {
      setPendingUpdates((prev) => {
        const next = new Set(prev);
        next.delete(assignmentKey);
        return next;
      });
      return;
    }

    try {
      if (existingAssignmentId) {
        await updateAssignment(
          "teachers_in_plans",
          { teacher_in_plan_id: existingAssignmentId },
          assignmentData,
        );
      } else {
        const createResult = await createAssignment(
          "/teachers_in_plans",
          assignmentData,
        );

        const newId = createResult?.teacher_in_plan?.id || createResult?.id;

        if (newId !== undefined && newId !== null) {
          // Сохраняем ID в ref для будущих вызовов
          // Не вызываем setState повторно, чтобы избежать лишнего ре-рендера
          // ID будет использован из ref при следующем вызове
          assignedTeachersRef.current[assignmentKey] = {
            id: newId,
            teacher_id: selectedTeacherId,
          };
        }
      }
    } catch (err) {
      // Откатываем состояние при ошибке
      setAssignedTeachers((prevAssigned) => ({
        ...prevAssigned,
        [assignmentKey]: currentAssignment,
      }));
    } finally {
      // Снимаем блокировку
      setPendingUpdates((prev) => {
        const next = new Set(prev);
        next.delete(assignmentKey);
        return next;
      });
    }
  };

  const handlePlanChange = (e) => {
    const newPlanId = e.target.value;
    setSelectedPlanId(newPlanId);
    if (newPlanId !== selectedPlanId) {
      setSelectedGroup(null);
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleDuplicateToAllGroups = async () => {
    if (!selectedPlanId || !selectedGroup) {
      setError("Выберите план и группу для дублирования");
      return;
    }

    if (Object.keys(assignedTeachers).length === 0) {
      setError("Нет назначений для дублирования");
      return;
    }

    setDuplicationg(true);
    setError(null);
    setDuplicateSuccess(false);

    try {
      const plan = plans.find((p) => p.id === Number(selectedPlanId));
      if (!plan) {
        throw new Error("План не найден. Проверьте выбранный план.");
      }

      const specialityCode = plan.speciality_code;

      const allGroups = await getGroupsBySpeciality(specialityCode);

      const targetGroups = allGroups.filter(
        (g) => g?.group_name !== selectedGroup,
      );

      if (targetGroups.length === 0) {
        setError("Нет других групп для дублирования");
        setDuplicationg(false);
        return;
      }

      for (const targetGroup of targetGroups) {
        const targetGroupName = targetGroup.group_name;

        const existingAssignments =
          await getTeacherInPlanByGroup(targetGroupName);

        const existingAssignmentsMap = new Map();
        const hoursToSubjectMap = new Map();

        Object.entries(allSubjectHours).forEach(([subjectId, hoursArray]) => {
          if (Array.isArray(hoursArray)) {
            hoursArray.forEach((hour) => {
              hoursToSubjectMap.set(hour.id, parseInt(subjectId));
            });
          }
        });

        existingAssignments.forEach((assignment) => {
          const subjectId = hoursToSubjectMap.get(
            assignment.subject_in_cycle_hours_id,
          );
          const subjectInPlan = subjects.find((s) => s.id === subjectId);

          if (subjectInPlan) {
            let semester = null;
            const subjectHours = allSubjectHours[subjectId];
            if (Array.isArray(subjectHours)) {
              const hourDetails = subjectHours.find(
                (h) => h.id === assignment.subject_in_cycle_hours_id,
              );
              if (hourDetails) {
                semester = hourDetails.semester;
              }
            }

            const { relevantSemesters: currentRelevantSemesters } =
              calculateCurrentSemestersForGroup(targetGroupName);

            if (currentRelevantSemesters.includes(semester)) {
              const key = `${targetGroupName}-${semester}-${subjectId}`;
              existingAssignmentsMap.set(key, assignment);
            }
          }
        });

        for (const [key, assignmentInfo] of Object.entries(assignedTeachers)) {
          if (!assignmentInfo.teacher_id) continue;

          const parts = key.split("-");
          if (parts.length < 3) continue;

          const semester = parts[parts.length - 2];
          const subjectId = parts[parts.length - 1];

          const subjectHoursForSubject = allSubjectHours[subjectId];
          if (!Array.isArray(subjectHoursForSubject)) continue;

          const hourForSemester = subjectHoursForSubject.find(
            (hour) => hour.semester === parseInt(semester),
          );
          if (!hourForSemester) continue;

          const subjectInCycleHoursId = hourForSemester.id;
          const targetKey = `${targetGroupName}-${semester}-${subjectId}`;
          const existingAssignment = existingAssignmentsMap.get(targetKey);

          const assignmentData = {
            subject_in_cycle_hours_id: subjectInCycleHoursId,
            teacher_id: parseInt(assignmentInfo.teacher_id),
            group_name: targetGroupName,
            session_type: null,
          };

          try {
            if (existingAssignment && existingAssignment.id) {
              await updateAssignment(
                "teachers_in_plans",
                { teacher_in_plan_id: existingAssignment.id },
                assignmentData,
              );
            } else {
              await createAssignment("/teachers_in_plans", assignmentData);
            }
          } catch (err) {
            console.error(
              `Ошибка при дублировании для ${targetGroupName}:`,
              err,
            );
          }
        }
      }

      setDuplicateSuccess(true);
      setTimeout(() => {
        setDuplicateSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Ошибка при дублировании нагрузки:", err);
      setError(`Ошибка дублирования: ${err.message}`);
    } finally {
      setDuplicationg(false);
    }
  };

  const overallLoading =
    loading ||
    loadingTeachers ||
    loadingSubjects ||
    loadingAssignments ||
    loadingCreate ||
    loadingUpdate ||
    duplicating;

  if (overallLoading) {
    return <div>Загрузка данных...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div>
      <div className="assign-load-controls">
        <label>Учебный план:</label>
        <select value={selectedPlanId || ""} onChange={handlePlanChange}>
          <option value="">-- Выберите план --</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.year} год, {plan.speciality_code}
            </option>
          ))}
        </select>

        {selectedPlanId && (
          <>
            <label>Группа:</label>
            <select value={selectedGroup || ""} onChange={handleGroupChange}>
              <option value="">-- Выберите группу --</option>
              {groups.map((group) => (
                <option key={group.group_name} value={group.group_name}>
                  {group.group_name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {selectedPlanId && selectedGroup && (
        <AssignLoadTable
          tableRows={tableRows}
          selectedGroup={selectedGroup}
          assignedTeachers={assignedTeachers}
          teachers={teachers}
          onTeacherChange={handleTeacherChange}
          tableContainerRef={tableContainerRef}
        />
      )}
      <div className="assign-load-footer">
        {selectedPlanId && selectedGroup && (
          <Button
            onClick={handleDuplicateToAllGroups}
            size="small"
            disabled={
              overallLoading || Object.keys(assignedTeachers).length === 0
            }
          >
            {duplicating ? "Дублирование..." : "Дублировать на все группы"}
          </Button>
        )}
        {duplicateSuccess && (
          <span className="duplicate-success-message">
            Нагрузка успешно дублирована!
          </span>
        )}
        <Button onClick={onClose} size="small" disabled={overallLoading}>
          Закрыть
        </Button>
      </div>
    </div>
  );
}

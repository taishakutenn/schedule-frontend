import "./AssignLoad.css";
import { useState, useEffect, useMemo } from "react";
import { getPlans } from "../../../api/plansAPI";
import { getGroupsBySpeciality } from "../../../api/groupAPI";
import { getAllSubjectsInPlan } from "../../../api/subjectAPI";
import { getSubjectHoursBySubject } from "../../../api/subjectHoursAPI";
import { getTeachers } from "../../../api/teachersAPI";
import { getTeacherInPlanByGroup } from "../../../api/teachersInPlansAPI";
import { calculateCurrentSemestersForGroup } from "../../../utils/calculateCurrentSemestersForGroup";
import { usePost } from "../../../hooks/usePost";
import { useUpdate } from "../../../hooks/useUpdate";
import Button from "../../Button/Button";

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

  const { post: createAssignment, loading: loadingCreate } = usePost();
  const { update: updateAssignment, loading: loadingUpdate } = useUpdate();

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
        console.log("Fetched teachers:", data);
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
        return;
      }

      setLoadingSubjects(true);
      setError(null);
      try {
        console.log("Fetching subjects for plan ID:", planId);
        const subjectsInPlan = await getAllSubjectsInPlan(planId);
        const subjectsArray = Array.isArray(subjectsInPlan)
          ? subjectsInPlan
          : [];
        console.log("Fetched subjects:", subjectsArray);

        const hoursMap = {};
        const hoursPromises = subjectsArray.map(async (subject) => {
          try {
            console.log("Fetching hours for subject ID:", subject.id);
            const hours = await getSubjectHoursBySubject(subject.id);
            console.log("Fetched hours for subject ID:", subject.id, hours);
            hoursMap[subject.id] = hours;
          } catch (err) {
            console.error(
              `Error fetching hours for subject ID ${subject.id}:`,
              err
            );
            hoursMap[subject.id] = [];
          }
        });

        await Promise.all(hoursPromises);

        console.log("All hours fetched, map:", hoursMap);

        setSubjects(subjectsArray);
        setAllSubjectHours(hoursMap);

        const specialityCode = findSpecialityCodeByPlanId(planId);
        if (specialityCode) {
          const groupsForSpeciality = await getGroupsBySpeciality(
            specialityCode
          );
          setGroups(
            Array.isArray(groupsForSpeciality) ? groupsForSpeciality : []
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
        calcError
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
      (a, b) => a - b
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
        console.log(`Fetching assignments for group: ${selectedGroup}`);
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
            assignment.subject_in_cycle_hours_id
          );

          const subjectInPlan = subjects.find((s) => s.id === subjectId);

          if (subjectInPlan) {
            let semester = null;
            const subjectHours = allSubjectHours[subjectId];
            if (Array.isArray(subjectHours)) {
              const hourDetails = subjectHours.find(
                (h) => h.id === assignment.subject_in_cycle_hours_id
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
                `Pre-filled assignment: Key=${assignmentKey}, DB ID=${assignment.id}, TeacherID=${assignment.teacher_id}`
              );
            } else {
              console.log(
                `Assignment found for non-current semester: Group=${selectedGroup}, Semester=${semester}, SubjectID=${subjectId}, TeacherID=${assignment.teacher_id}`
              );
            }
          } else {
            console.log(
              `Assignment found for subject not in current plan: subject_in_cycle_hours_id=${assignment.subject_in_cycle_hours_id}, teacher_id=${assignment.teacher_id}`
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

  const { subjectsBySemester, semesterColSpans } = useMemo(() => {
    if (!selectedGroup || !Object.keys(allSubjectHours).length) {
      return { subjectsBySemester: {}, semesterColSpans: {} };
    }

    const { relevantSemesters: calculatedRelevantSemesters, error: calcError } =
      calculateCurrentSemestersForGroup(selectedGroup);

    if (calcError) {
      console.warn(
        `useMemo: Ошибка вычисления семестров для группы ${selectedGroup}:`,
        calcError
      );
      return { subjectsBySemester: {}, semesterColSpans: {} };
    }

    const subjectsBySemesterMap = {};
    const semesterColSpansMap = {};

    Object.entries(allSubjectHours).forEach(([subjectId, hoursArray]) => {
      if (Array.isArray(hoursArray)) {
        hoursArray.forEach((hour) => {
          if (calculatedRelevantSemesters.includes(hour.semester)) {
            if (!subjectsBySemesterMap[hour.semester]) {
              subjectsBySemesterMap[hour.semester] = [];
            }
            const subject = subjects.find((s) => s.id === parseInt(subjectId));
            if (
              subject &&
              !subjectsBySemesterMap[hour.semester].some(
                (s) => s.id === subject.id
              )
            ) {
              subjectsBySemesterMap[hour.semester].push(subject);
            }
          }
        });
      }
    });

    Object.keys(subjectsBySemesterMap).forEach((sem) => {
      semesterColSpansMap[sem] = subjectsBySemesterMap[sem].length;
    });

    console.log(
      "useMemo: Calculated subjectsBySemester and semesterColSpans:",
      { subjectsBySemesterMap, semesterColSpansMap }
    );
    return {
      subjectsBySemester: subjectsBySemesterMap,
      semesterColSpans: semesterColSpansMap,
    };
  }, [selectedGroup, allSubjectHours, subjects]);

  const handleTeacherChange = async (semester, subject, group, e) => {
    const selectedTeacherId = e.target.value;
    console.log(
      `Преподаватель для группы ${group}, семестр ${semester}, предмет ${subject.title} изменён на ID: ${selectedTeacherId}`
    );

    const assignmentKey = `${group}-${semester}-${subject.id}`;

    const subjectHoursForSubject = allSubjectHours[subject.id];
    if (!Array.isArray(subjectHoursForSubject)) {
      console.error(
        `Hours for subject ${subject.id} not found or not an array.`
      );
      return;
    }

    const hourForSemester = subjectHoursForSubject.find(
      (hour) => hour.semester === semester
    );
    if (!hourForSemester) {
      console.error(
        `Hours for subject ${subject.id} in semester ${semester} not found.`
      );
      return;
    }

    const subjectInCycleHoursId = hourForSemester.id;
    const sessionType = null;

    const currentAssignment = assignedTeachers[assignmentKey];

    let assignmentData = {
      subject_in_cycle_hours_id: subjectInCycleHoursId,
      teacher_id: parseInt(selectedTeacherId),
      group_name: group,
      session_type: sessionType,
    };

    if (currentAssignment && currentAssignment.id) {
      assignmentData.teacher_in_plan_id = currentAssignment.id;
    }

    const updatedAssignmentInfo = {
      id: currentAssignment?.id || null,
      teacher_id: selectedTeacherId,
    };
    setAssignedTeachers((prevAssigned) => ({
      ...prevAssigned,
      [assignmentKey]: updatedAssignmentInfo,
    }));

    if (!selectedTeacherId) {
      console.log("No teacher selected, skipping API call.");
      return;
    }

    try {
      if (currentAssignment && currentAssignment.id) {
        console.log(
          "Attempting to update assignment with ID in body:",
          assignmentData
        );
        const updateResult = await updateAssignment(
          "teachers_in_plans",
          {},
          assignmentData
        );
        console.log("Assignment updated:", updateResult);
      } else {
        console.log("Creating new assignment:", assignmentData);
        const createResult = await createAssignment(
          "/teachers_in_plans",
          assignmentData
        );
        console.log("Assignment created:", createResult);

        if (createResult && createResult.id !== undefined) {
          setAssignedTeachers((prevAssigned) => ({
            ...prevAssigned,
            [assignmentKey]: {
              id: createResult.id,
              teacher_id: selectedTeacherId,
            },
          }));
        }
      }
    } catch (err) {
      console.error("Failed to update or create assignment:", err);
      setAssignedTeachers((prevAssigned) => ({
        ...prevAssigned,
        [assignmentKey]: currentAssignment,
      }));
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

  const overallLoading =
    loading ||
    loadingTeachers ||
    loadingSubjects ||
    loadingAssignments ||
    loadingCreate ||
    loadingUpdate;

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
        <div className="assign-load-table-container">
          <table className="assign-load-table">
            <thead>
              <tr>
                {relevantSemesters.map((semester) => (
                  <th
                    key={`semester-${semester}`}
                    colSpan={semesterColSpans[semester] || 0}
                  >
                    {`Семестр ${semester}`}
                  </th>
                ))}
              </tr>
              <tr>
                {relevantSemesters.map((semester) => {
                  const subjectsInSemester = subjectsBySemester[semester] || [];
                  return subjectsInSemester.map((subject) => (
                    <th key={`subject-${subject.id}`}>{subject.title}</th>
                  ));
                })}
              </tr>
            </thead>
            <tbody>
              <tr key={`group-${selectedGroup}`}>
                {relevantSemesters.map((semester) => {
                  const subjectsInSemester = subjectsBySemester[semester] || [];
                  return subjectsInSemester.map((subject) => {
                    const assignmentKey = `${selectedGroup}-${semester}-${subject.id}`;
                    const assignmentInfo = assignedTeachers[assignmentKey] || {
                      id: null,
                      teacher_id: "",
                    };
                    const assignedTeacherId = assignmentInfo.teacher_id;

                    return (
                      <td key={`teacher-${selectedGroup}-${subject.id}`}>
                        <select
                          value={assignedTeacherId}
                          onChange={(e) =>
                            handleTeacherChange(
                              semester,
                              subject,
                              selectedGroup,
                              e
                            )
                          }
                        >
                          <option value="">-- Выберите преподавателя --</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  });
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="assign-load-footer">
        <Button onClick={onClose} size="small" disabled={overallLoading}>
          Закрыть
        </Button>
      </div>
    </div>
  );
}

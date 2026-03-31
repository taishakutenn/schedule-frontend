import { memo } from "react";

const AssignLoadTable = memo(
  function AssignLoadTable({
    tableRows,
    selectedGroup,
    assignedTeachers,
    teachers,
    onTeacherChange,
    tableContainerRef,
  }) {
    return (
      <div className="assign-load-table-container" ref={tableContainerRef}>
        <table className="assign-load-table">
          <thead>
            <tr>
              <th>Семестр</th>
              <th>Предмет</th>
              <th>Преподаватель</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length > 0 ? (
              tableRows.map((row, index) => {
                const assignmentKey = `${selectedGroup}-${row.semester}-${row.subjectId}`;
                const assignmentInfo = assignedTeachers[assignmentKey] || {
                  id: null,
                  teacher_id: "",
                };
                const assignedTeacherId = assignmentInfo.teacher_id;

                return (
                  <tr
                    key={`row-${selectedGroup}-${row.semester}-${row.subjectId}-${index}`}
                  >
                    <td>{`${row.semester}`}</td>
                    <td>{row.subjectTitle}</td>
                    <td>
                      <select
                        value={assignedTeacherId}
                        onChange={(e) =>
                          onTeacherChange(
                            row.semester,
                            row.subjectId,
                            row.subjectTitle,
                            selectedGroup,
                            e,
                          )
                        }
                        className={`teach-select-${assignedTeacherId !== "" ? "active" : "passive"}`}
                      >
                        <option value="">-- Выберите преподавателя --</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.fathername
                              ? `${teacher.surname} ${teacher.name.charAt(0)}. ${teacher.fathername.charAt(0)}.`
                              : `${teacher.surname} ${teacher.name.charAt(0)}.`}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3">Нет данных для отображения</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Кастомное сравнение: перерисовываем только если изменились важные props
    // assignedTeachers не включаем в сравнение, чтобы избежать лишних ре-рендеров
    return (
      prevProps.tableRows === nextProps.tableRows &&
      prevProps.selectedGroup === nextProps.selectedGroup &&
      prevProps.teachers === nextProps.teachers &&
      prevProps.onTeacherChange === nextProps.onTeacherChange
    );
  },
);

export default AssignLoadTable;

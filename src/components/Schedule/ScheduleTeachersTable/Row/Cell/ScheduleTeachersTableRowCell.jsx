import { useContext, useState } from "react";

import TeacherContext from "../../../../../contexts/TeacherContext";
import { useApiData } from "../../../../../hooks/useApiData";

export default function ScheduleTeachersTableCell({classCell}) {
  const [currentGroup, setCurrentGroup] = useState([]);
  // Get teacher info for context
  const teacher = useContext(TeacherContext);
  // Get groups and subjects from context
  const teacherGroups = teacher.teacherGroups;
  const teacherSubjects = teacher.teacherSubjects;

  return (
      <td className={classCell}>
        <div className="teachers-table__select-container">
          <div className="teachers-table__group-subject-container">
            <select className="teachers-table__select">
              <option selected disabled className="select__option--disabled">Группа</option>
              {teacherGroups.map((group) => {
                return <option
                        value={group}
                        key={group}
                        className="select__option"
                        >
                        {group}
                        </option>
              })}
            </select>

            <select className="teachers-table__select">
              <option selected disabled className="select__option--disabled">Предмет</option>
              {teacherSubjects?.map((subject) => (
                <option
                  value={subject.id}
                  key={subject.id}
                  className="select__option"
                >
                  {subject.title}
                </option>
              ))}
            </select>
          </div>
          <div className="teachers-table__session-type-container">
            <select teachers-table__select>
              <option selected disabled className="select__option--disabled">Пара</option>
              <option className="select__option">Лк</option>
              <option className="select__option">Лб</option>
              <option className="select__option">Пз</option>
            </select>
          </div>
        </div>
      </td>
  );
}
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

        <select className="teachers-table__select">
          <option selected disabled>Выберите группу</option>
          {teacherGroups.map((group) => {
            return <option
                    value={group}
                    key={group}>
                    {group}
                    </option>
          })}
        </select>

        <select>
          <option selected disabled>Выберите предмет</option>
          {teacherSubjects?.map((subject) => (
            <option
              value={subject.id}
              key={subject.id}
            >
              {subject.title}
            </option>
          ))}
        </select>
      </td>
  );
}
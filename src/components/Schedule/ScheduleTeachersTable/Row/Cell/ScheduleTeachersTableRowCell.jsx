import { useContext } from "react";

import TeacherContext from "../../../../../contexts/TeacherContext";
import { useApiData } from "../../../../../hooks/useApiData";
import { getTeacherInPlanByTeacher } from "../../../../../api/teachersInPlansAPI"; 

export default function ScheduleTeachersTableCell({classCell}) {
  // Get teacher info for context
  const teacher = useContext(TeacherContext);

  return (
      <td className={classCell}>
        <select className="teachers-table__select">
          <option selected disabled></option>
          <option value="23ИСП1">23ИСП1</option>
        </select>
        <select>
          <option selected disabled></option>
          <option value="Математика">Математика</option>
        </select>
      </td>
  );
}
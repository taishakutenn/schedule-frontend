export default function ScheduleTeachersTableCell({classCell}) {
  return (
      <td className={classCell}>
        <select>
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
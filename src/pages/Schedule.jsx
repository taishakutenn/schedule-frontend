import { useApiData } from "../hooks/useApiData";
import ScheduleTable from "../components/Schedule/ScheduleTable/ScheduleTable";
import { getSubjectsByGroupAndSemesters } from "../api/groupAPI";

export default function Schedule() {
  const { data, loading, error } = useApiData(() => getSubjectsByGroupAndSemesters("23ИСП1"), []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  console.log(data);

  return (
    <main>
      <ScheduleTable data={data} />
    </main>
  );
}
import ScheduleTable from "../components/Schedule/ScheduleTable/ScheduleTable";
import Button from "../components/Button/Button";
import { useState } from "react";
import { getSubjectsByGroupAndSemesters } from "../api/groupAPI";

export default function Schedule() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getSubjectsByGroupAndSemesters("24МАШ1");
      setData(result);
      console.log(result);
    } catch(error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <ScheduleTable />
      <Button onClick={handleLoadData} disabled={loading}>
        Получить данные
      </Button>
      {error && <div>Ошибка: {error.message}</div>}
    </main>
  );
}
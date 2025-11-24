import ScheduleTable from "../components/Schedule/ScheduleTable/ScheduleTable";
import ScheduleTeachersTable from "../components/Schedule/ScheduleTeachersTable/ScheduleTeachersTable";
import Button from "../components/Button/Button";
import { useState } from "react";
import { getInfoForCreateSchedule } from "../api/scheduleAPI";

export default function Schedule() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getInfoForCreateSchedule("23ПКС1", 5);
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
      <ScheduleTeachersTable />
      <Button onClick={handleLoadData} disabled={loading}>
        Получить данные
      </Button>
      {error && <div>Ошибка: {error.message}</div>}
    </main>
  );
}
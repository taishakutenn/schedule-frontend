// pages/Plan/TeachLoad.jsx

import InfoBlock from "../InfoBlock/InfoBlock";
import LoadTable from "./LoadTable";
import { useApiData } from "../../hooks/useApiData";
import { fetchTeachLoadData } from "../../api/teachLoadAPI";
import { useState, useCallback, useMemo } from "react";
import ControlLine from "./ControlLine/ControlLine";

const teachLoadHeaderInfo = [
  {
    title: "Учебная нагрузка преподавателей",
    text: [],
  },
];

export default function TeachLoad() {
  const {
    data: loadData,
    loading,
    error,
  } = useApiData(fetchTeachLoadData, [], true);

  // Filters states
  const [filters, setFilters] = useState({
    teacher: { enabled: false, value: "" },
    group: { enabled: false, value: "" },
    subject: { enabled: false, value: "" },
  });

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    if (!loadData || !Array.isArray(loadData)) {
      return [];
    }

    return loadData.filter((item) => {
      if (filters.teacher.enabled && filters.teacher.value) {
        if (
          !item.teacher_name
            .toLowerCase()
            .includes(filters.teacher.value.toLowerCase())
        ) {
          return false;
        }
      }

      if (filters.group.enabled && filters.group.value) {
        if (
          !item.group.toLowerCase().includes(filters.group.value.toLowerCase())
        ) {
          return false;
        }
      }

      if (filters.subject.enabled && filters.subject.value) {
        if (
          !item.subject
            .toLowerCase()
            .includes(filters.subject.value.toLowerCase())
        ) {
          return false;
        }
      }
      return true;
    });
  }, [loadData, filters]);

  if (loading) {
    return <div>Загрузка данных о нагрузке...</div>;
  }
  if (error) {
    return <div>Ошибка загрузки данных: {error}</div>;
  }
  if (!loadData) {
    return <div>Данные отсутствуют.</div>;
  }

  return (
    <div>
      <InfoBlock items={teachLoadHeaderInfo} />
      <ControlLine onFilterChange={handleFilterChange} />
      <LoadTable loadData={filteredData} />
    </div>
  );
}

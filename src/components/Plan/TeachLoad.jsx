import InfoBlock from "../InfoBlock/InfoBlock";
import LoadTable from "./LoadTable";
import { fetchTeachLoadData } from "../../api/teachLoadAPI";
import { useState, useCallback, useMemo, useEffect } from "react";
import ControlLine from "./ControlLine/ControlLine";
import Modal from "../../components/Modal/Modal";
import AssignLoad from "./AssignLoad/AssignLoad";
import Sidebar from "../Sidebar/Sidebar";

const teachLoadHeaderInfo = [
  {
    title: "Учебная нагрузка преподавателей",
    text: [],
  },
];

export default function TeachLoad() {
  const [loadData, setLoadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTeachLoadData();
      setLoadData(data);
      console.log("TeachLoad: Data loaded successfully:", data);
    } catch (err) {
      console.error("TeachLoad: Error loading data:", err);
      setError(err.message);
      setLoadData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters states
  const [filters, setFilters] = useState({
    teacher: { enabled: false, value: "" },
    group: { enabled: false, value: "" },
    subject: { enabled: false, value: "" },
  });

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleEditClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(async () => {
    await fetchData();
    setIsModalOpen(false);
  }, [fetchData]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!loadData || !Array.isArray(loadData)) {
      // console.log("TeachLoad: loadData is not an array, returning [].");
      return [];
    }

    // console.log("TeachLoad: Filtering data with filters:", filters);

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

  const aggregatedTeacherHours = useMemo(() => {
    if (!filteredData || !Array.isArray(filteredData)) {
      return [];
    }

    const hoursMap = new Map();

    filteredData.forEach((item) => {
      const teacherId = item.teacher_id;
      const teacherName = item.teacher_name;
      const budgetHours = parseFloat(item.budget_hours) || 0;
      const extraBudgetHours = parseFloat(item.extrabudget_hours) || 0;
      const totalHoursForItem = budgetHours + extraBudgetHours;

      if (hoursMap.has(teacherId)) {
        const existing = hoursMap.get(teacherId);
        hoursMap.set(teacherId, {
          ...existing,
          totalHours: existing.totalHours + totalHoursForItem,
        });
      } else {
        hoursMap.set(teacherId, {
          teacher_id: teacherId,
          teacher_name: teacherName,
          totalHours: totalHoursForItem,
        });
      }
    });

    return Array.from(hoursMap.values()).sort((a, b) =>
      a.teacher_name.localeCompare(b.teacher_name, "ru-RU", {
        sensitivity: "base",
      }),
    );
  }, [filteredData]);

  if (loading) {
    return <div>Загрузка данных о нагрузке...</div>;
  }
  if (error) {
    return <div>Ошибка загрузки данных: {error}</div>;
  }

  return (
    <div>
      <InfoBlock items={teachLoadHeaderInfo} />
      <ControlLine
        onFilterChange={handleFilterChange}
        onEditClick={handleEditClick}
      />
      <p>Количество записей: {filteredData.length}</p>
      <LoadTable loadData={filteredData} />

      <Sidebar title="Нагрузка по преподавателям">
        {aggregatedTeacherHours.length === 0 ? (
          <p>Нет данных о нагрузке преподавателей.</p>
        ) : (
          <ul>
            {aggregatedTeacherHours.map((entry) => (
              <li key={entry.teacher_id} style={{ marginBottom: "4px" }}>
                <span style={{ fontWeight: "bold" }}>{entry.teacher_name}</span>
                : <span>{entry.totalHours}</span>
              </li>
            ))}
          </ul>
        )}
      </Sidebar>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Назначение учебной нагрузки"
        size="lg"
      >
        <AssignLoad onClose={handleCloseModal} />
      </Modal>
      {/* {console.log("Загруженные данные", loadData)} */}
    </div>
  );
}

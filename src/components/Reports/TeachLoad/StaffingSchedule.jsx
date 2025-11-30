import "./StaffingSchedule.css";

import { useState, useEffect } from "react";
import { fetchStaffingScheduleData } from "../../../api/staffingScheduleAPI";
import { getPlans } from "../../../api/plansAPI";

export default function StaffingSchedule({ selectedReport }) {
  const [staffingData, setStaffingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const plans = await getPlans();
        console.log("Загруженные планы:", plans);

        if (plans.length === 0) {
          setAvailableYears([]);
          setSelectedYear(null);
          console.warn("Нет доступных учебных планов.");
          return;
        }

        const validPlans = plans.filter(
          (plan) => typeof plan.year === "number" && plan.year > 0
        );
        if (validPlans.length === 0) {
          setAvailableYears([]);
          setSelectedYear(null);
          console.warn("Нет учебных планов с корректным годом (year > 0).");
          return;
        }

        const currentYear = new Date().getFullYear();
        console.log("Текущий год:", currentYear);

        const minPlanYear = Math.min(...plans.map((plan) => plan.year));
        console.log("Минимальный год плана:", minPlanYear);

        const maxEndYear = Math.max(...plans.map((plan) => plan.year + 4));
        console.log("Максимальный возможный год (год начала + 4):", maxEndYear);

        const effectiveMaxYear = Math.min(maxEndYear, currentYear);
        console.log(
          "Максимальный эффективный год (ограничен текущим):",
          effectiveMaxYear
        );

        const yearsSet = new Set();
        for (let year = minPlanYear; year <= effectiveMaxYear; year++) {
          yearsSet.add(year);
        }

        const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);
        console.log("Рассчитанные доступные годы:", sortedYears);
        setAvailableYears(sortedYears);

        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[sortedYears.length - 1]);
        }
      } catch (err) {
        console.error("Ошибка загрузки планов для получения лет:", err);
        setError(`Ошибка загрузки доступных лет: ${err.message}`);
        setAvailableYears([]);
        setSelectedYear(null);
      }
    };

    loadYears();
  }, []);

  useEffect(() => {
    if (!selectedYear) {
      setStaffingData([]);
      return;
    }

    const loadReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStaffingScheduleData(selectedYear);
        console.log("Рассчитанные данные штатного расписания:", data);
        setStaffingData(data);
      } catch (err) {
        setError(err.message);
        setStaffingData([]);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [selectedYear]);

  if (selectedReport !== "StaffingSchedule") return null;

  if (loading)
    return (
      <div>Загрузка данных штатного расписания на {selectedYear} год...</div>
    );
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="staffing-schedule-report">
      <h2>Штатное расписание на {selectedYear || null} год</h2>
      <div className="report-controls">
        <label htmlFor="year-select">Выберите год: </label>
        <select
          id="year-select"
          value={selectedYear || ""}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          <option value="">-- Выберите год --</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {" "}
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>Преподаватель</th>
              <th>Общее количество часов</th>
              <th>Количество ставок</th>
            </tr>
          </thead>
          <tbody>
            {staffingData.map((entry) => (
              <tr key={entry.teacherId}>
                <td>{entry.teacherName}</td>
                <td>{entry.totalHours}</td>
                <td>{entry.fte}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {staffingData.length === 0 && (
          <p>Нет данных для отображения на {selectedYear} год.</p>
        )}
      </div>
    </div>
  );
}

import InfoBlock from "../../InfoBlock/InfoBlock";
import LoadTable from "../../Plan/LoadTable";
import { fetchTeachLoadDataByYear } from "../../../api/teachLoadAPI";
import { getPlans } from "../../../api/plansAPI";
import { useState, useEffect } from "react";
import { exportToExcel } from "../../../utils/exportToExcel";
import Button from "../../Button/Button";

const teachLoadReportHeaderInfo = [
  {
    title: "Отчёт по учебной нагрузке преподавателей",
    text: [],
  },
];

export default function TeachLoadReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const plans = await getPlans();
        console.log("Загруженные планы для отчёта:", plans);

        if (plans.length === 0) {
          setAvailableYears([]);
          setSelectedYear(null);
          console.warn("Нет доступных учебных планов для отчёта.");
          setReportData([]);
          return;
        }

        const validPlans = plans.filter(
          (plan) => typeof plan.year === "number" && plan.year > 0,
        );
        if (validPlans.length === 0) {
          setAvailableYears([]);
          setSelectedYear(null);
          console.warn(
            "Нет учебных планов с корректным годом (year > 0) для отчёта.",
          );
          setReportData([]);
          return;
        }

        const currentYear = new Date().getFullYear();
        console.log("Текущий год:", currentYear);

        const minPlanYear = Math.min(...validPlans.map((plan) => plan.year));
        console.log("Минимальный год плана:", minPlanYear);

        const maxEndYear = Math.max(...validPlans.map((plan) => plan.year + 4));
        console.log("Максимальный возможный год (год начала + 4):", maxEndYear);

        const effectiveMaxYear = Math.min(maxEndYear, currentYear);
        console.log(
          "Максимальный эффективный год (ограничен текущим):",
          effectiveMaxYear,
        );

        const yearsSet = new Set();
        for (let year = minPlanYear; year <= effectiveMaxYear; year++) {
          yearsSet.add(year);
        }

        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
        console.log("Рассчитанные доступные годы для отчёта:", sortedYears);
        setAvailableYears(sortedYears);

        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]);
        } else {
          setReportData([]);
        }
      } catch (err) {
        console.error(
          "Ошибка загрузки планов для получения лет в отчёте:",
          err,
        );
        setError(`Ошибка загрузки доступных лет: ${err.message}`);
        setAvailableYears([]);
        setSelectedYear(null);
        setReportData([]);
      }
    };

    loadYears();
  }, []);

  useEffect(() => {
    if (!selectedYear) {
      setReportData([]);
      return;
    }

    const loadReportData = async () => {
      setLoading(true);
      setError(null);

      try {
        let data = await fetchTeachLoadDataByYear(selectedYear);

        // Сортировка данных по полю teacher_name в алфавитном порядке
        data = data.sort((a, b) => {
          const nameA = a.teacher_name || "";
          const nameB = b.teacher_name || "";
          return nameA.localeCompare(nameB, "ru-RU", { sensitivity: "base" });
        });

        setReportData(data);
        console.log(
          `Данные для отчёта за ${selectedYear} год загружены и отсортированы.`,
          data,
        );
      } catch (err) {
        console.error("Ошибка загрузки данных отчёта:", err);
        setError(err.message);
        setReportData([]);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [selectedYear]);

  const handleYearChange = (e) => {
    const year = e.target.value ? Number(e.target.value) : null;
    setSelectedYear(year);
  };

  const handleExport = () => {
    if (!reportData || reportData.length === 0) {
      alert("Нет данных для экспорта");
      return;
    }

    const exportData = reportData.map((item) => ({
      Преподаватель: item.teacher_name || "",
      Дисциплина: item.subject || "",
      "Лекции 1": item.lecture_1 || "",
      "Лекции 2": item.lecture_2 || "",
      "Практика 1": item.practical_1 || "",
      "Практика 2": item.practical_2 || "",
      "Курс. проектирование": item.course_project || "",
      Консультации: item.consultation || "",
      "Диф. зачёт": item.diff_exam || "",
      Экзамен: item.exam || "",
      "Бюджет (часы)": item.budget_hours || "",
      "Бюджет (ставка)": item.budget_rate || "",
      "Внебюджет (часы)": item.extrabudget_hours || "",
      "Внебюджет (ставка)": item.extrabudget_rate || "",
      Группа: item.group || "",
    }));

    exportToExcel(
      exportData,
      `Нагрузка_преподавателей_${selectedYear || "без_года"}`,
      "Нагрузка",
    );
  };

  if (loading) {
    return (
      <div>
        Загрузка данных отчёта за {selectedYear || "неизвестный"} год...
      </div>
    );
  }
  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div>
      <InfoBlock items={teachLoadReportHeaderInfo} />
      <div className="report-controls">
        <label style={{ marginLeft: "5px" }} htmlFor="year-select">
          Выберите год:{" "}
        </label>
        <select
          id="year-select"
          value={selectedYear || ""}
          onChange={handleYearChange}
        >
          <option value="">-- Выберите год --</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <Button onClick={handleExport} style={{ marginLeft: "auto" }}>
          Экспорт в Excel
        </Button>
      </div>
      <p style={{ marginLeft: "10px" }}>
        Год отчёта: {selectedYear || "Не выбран"}
      </p>
      <p style={{ marginLeft: "10px" }}>
        Количество записей: {reportData?.length || 0}
      </p>
      <LoadTable loadData={reportData} />
    </div>
  );
}

import InfoBlock from "../components/infoBlock/InfoBlock";
import { getTeachers } from "../api/teachersAPI";
import Button from "../components/Button/Button";
import { useState, useEffect } from "react";
import HandbookTable from "../components/HandbookTable/HandbookTable";

const headerInfo = [
  {
    title: "Справочная информация",
    text: [],
  },
];

export default function Handbooks() {
  const [handbook, setHandbook] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ useEffect на верхнем уровне
  useEffect(() => {
    if (handbook === "teachers") {
      const fetchTeachers = async () => {
        setLoading(true);
        setError(null);

        try {
          const data = await getTeachers();
          setTeachers(data);
        } catch (err) {
          setError(err.message);
          console.error("Ошибка загрузки преподавателей:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchTeachers();
    }
  }, [handbook]); // ✅ Зависит от handbook

  const handleTeacher = () => setHandbook("teachers");

  // ✅ Возвращаем разный контент в зависимости от состояния
  const renderContent = () => {
    if (handbook === "teachers") {
      if (loading) return <div>Загрузка преподавателей...</div>;
      if (error) return <div>Ошибка: {error}</div>;
      return <HandbookTable apiResponse={teachers} />;
    }
    return null; // если handbook !== "teachers", ничего не показываем
  };

  return (
    <main>
      <InfoBlock items={headerInfo} /> {/* Убедитесь, что InfoBlock корректно обрабатывает items */}
      <div className="handbooks__navigation">
        <Button onClick={handleTeacher}>Преподаватели</Button>
        <Button>Категории преподавателей</Button>
        <Button>Специальности</Button>
        <Button>Кабинеты</Button>
        <Button>Типы занятий</Button>
      </div>
      <div>
        {renderContent()}
      </div>
    </main>
  );
}
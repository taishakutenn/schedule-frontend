import InfoBlock from "../components/InfoBlock/InfoBlock";
import Button from "../components/Button/Button";
import { useCallback, useState } from "react";
import HandbookTable from "../components/HandbookTable/HandbookTable";
import { useApiData } from "../hooks/useApiData";
import { tableConfig } from "../utils/tableConfig";
import Modal from "../components/Modal/Modal";
import { getTeachersCategory } from "../api/teacherCategoryAPI";

import "./Handbook.css";

const headerInfo = [
  {
    title: "Справочная информация",
    text: [],
  },
];

// Вынесенный компонент
const ControlContainer = ({ handbook, onAdd, search, onSearchChange }) => {
  if (!handbook) return null;

  return (
    <div className="control-container">
      <Button onClick={onAdd} size="small">
        Добавить запись
      </Button>
      <Button variant="secondary" size="small">
        Редактировать запись
      </Button>
      <Button variant="danger" size="small">
        Удалить запись
      </Button>
      <input
        type="text"
        placeholder="Поиск"
        value={search}
        onChange={onSearchChange}
      />
    </div>
  );
};

const ModalAdd = ({
  isOpen,
  onClose,
  handbook,
  teachersCategoryData,
  teachersCategoryLoading,
  teachersCategoryError,
}) => {
  if (!isOpen || handbook !== "teachers") return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавить преподавателя"
      size="sm"
    >
      <div className="teacher-add-container">
        <input type="text" placeholder="Имя" />
        <input type="text" placeholder="Фамилия" />
        <input type="text" placeholder="Отчество" />
        <input type="tel" placeholder="Номер телефона" />
        <input type="email" placeholder="Почта" />
        <input type="text" placeholder="Ставка" />

        {teachersCategoryLoading && <div>Загрузка категорий...</div>}
        {teachersCategoryError && <div>Ошибка загрузки категорий</div>}

        {!teachersCategoryLoading && !teachersCategoryError && (
          <select>
            <option value="" disabled>
              Категория
            </option>
            {teachersCategoryData?.map((t) => (
              <option key={t.teacher_category} value={t.teacher_category}>
                {t.teacher_category}
              </option>
            ))}
          </select>
        )}

        <Button size="small">Добавить</Button>
      </div>
    </Modal>
  );
};

export default function Handbooks() {
  const [handbook, setHandbook] = useState(null);
  const [search, setSearch] = useState("");

  // get data from API with custom hook
  const currentTableConfig = tableConfig[handbook];
  const { data, loading, error } = useApiData(
    currentTableConfig?.apiFunction || (() => []),
    [handbook],
    !!currentTableConfig
  );

  // state for display Modal window
  const [isModalOpen, setIsModalOpen] = useState(false);

  // load teacher category
  const {
    data: teachersCategoryData,
    loading: teachersCategoryLoading,
    error: teachersCategoryError,
  } = useApiData(getTeachersCategory, [], isModalOpen);

  // set handbook states
  const handleTeacher = () => setHandbook("teachers");
  const handleTeacherCategory = () => setHandbook("teachers_category");
  const handleCabinet = () => setHandbook("cabinets");
  const handleBuilding = () => setHandbook("buildings");
  const handleSpeciality = () => setHandbook("specialities");
  const handleSessionType = () => setHandbook("sessionTypes");

  // Function that filtered data
  const getFilteredData = useCallback((data, search) => {
    if (!search) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter((item) => {
      return Object.values(item).some((value) => {
        return String(value).toLowerCase().includes(lowerSearch);
      });
    });
  }, []);

  // return content depending on the state handbook
  const renderContent = useCallback(() => {
    if (!currentTableConfig) return null;

    if (loading)
      return (
        <div className="request-loading">
          {currentTableConfig.loadingMessage}
        </div>
      );
    if (error)
      return (
        <div className="request-error">
          {currentTableConfig.errorMessage}: {error}
        </div>
      );

    const filteredData = getFilteredData(data, search);
    return <HandbookTable apiResponse={filteredData} tableName={handbook} />;
  }, [
    currentTableConfig,
    loading,
    error,
    data,
    search,
    getFilteredData,
    handbook,
  ]);

  return (
    <main>
      <InfoBlock items={headerInfo} />
      <div className="handbooks__navigation">
        <Button onClick={handleTeacher} size="small">
          Преподаватели
        </Button>
        <Button onClick={handleTeacherCategory} size="small">
          Категории преподавателей
        </Button>
        <Button onClick={handleSpeciality} size="small">
          Специальности
        </Button>
        <Button onClick={handleBuilding} size="small">
          Здания
        </Button>
        <Button onClick={handleCabinet} size="small">
          Кабинеты
        </Button>
        <Button onClick={handleSessionType} size="small">
          Типы занятий
        </Button>
      </div>
      <ControlContainer
        handbook={handbook}
        onAdd={() => setIsModalOpen(true)}
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
      />
      <div className="rendered-table">{renderContent()}</div>
      <ModalAdd
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handbook={handbook}
        teachersCategoryData={teachersCategoryData}
        teachersCategoryLoading={teachersCategoryLoading}
        teachersCategoryError={teachersCategoryError}
      />
    </main>
  );
}

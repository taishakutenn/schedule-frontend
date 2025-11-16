import InfoBlock from "../components/InfoBlock/InfoBlock";
import Button from "../components/Button/Button";
import { useCallback, useState } from "react";
import HandbookTable from "../components/HandbookTable/HandbookTable";
import { useApiData } from "../hooks/useApiData";
import { tableConfig } from "../utils/tableConfig";
import Modal from "../components/Modal/Modal";
import { getTeachersCategory } from "../api/teacherCategoryAPI";
import { usePost } from "../hooks/usePost";

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
  onAdd,
  loading,
  error,
}) => {
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  // configs for some post forms
  const formConfig = {
    teachers: {
      fields: [
        { name: "name", placeholder: "Имя", type: "text" },
        { name: "surname", placeholder: "Фамилия", type: "text" },
        { name: "fathername", placeholder: "Отчество", type: "text" },
        { name: "phone_number", placeholder: "Номер телефона", type: "tel" },
        { name: "email", placeholder: "Почта", type: "email" },
        { name: "salary_rate", placeholder: "Ставка", type: "text" },
      ],
      selectField: {
        name: "teacher_category",
        options: teachersCategoryData?.map((t) => ({
          value: t.teacher_category,
          label: t.teacher_category,
        })),
        placeholder: "Категория",
      },
    },
    // another handbooks add here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //
    //
    //
    //
    //
    //
  };

  const config = formConfig[handbook];
  if (!config) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData, () => {
      setFormData({});
      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Добавить ${handbook === "teachers" ? "преподавателя" : handbook}`}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <div className="teacher-add-container">
          {config.fields.map((field) => (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ""}
              onChange={handleChange}
            />
          ))}

          {config.selectField && (
            <>
              {teachersCategoryLoading && <div>Загрузка категорий...</div>}
              {teachersCategoryError && <div>Ошибка загрузки категорий</div>}

              {!teachersCategoryLoading &&
                !teachersCategoryError &&
                config.selectField.options && (
                  <select
                    name={config.selectField.name}
                    value={formData[config.selectField.name] || ""}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      {config.selectField.placeholder}
                    </option>
                    {config.selectField.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
            </>
          )}

          <Button type="submit" size="small" disabled={loading}>
            {loading ? "Отправка..." : "Добавить"}
          </Button>
          {error && <div className="error-message">{error}</div>}
        </div>
      </form>
    </Modal>
  );
};

export default function Handbooks() {
  const [handbook, setHandbook] = useState(null);
  const [search, setSearch] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0); // trigger for update

  // get data from API with custom hook
  const currentTableConfig = tableConfig[handbook];
  const { data, loading, error } = useApiData(
    currentTableConfig?.apiFunction || (() => []),
    [handbook, refreshTrigger],
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

  // consts for post requests
  const { post, loading: postLoading, error: postError } = usePost();

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

  // Universal add function
  const handleAdd = async (formData, onReset) => {
    try {
      const result = await post(`/${handbook}`, formData);
      console.log("Успешно добавлено:", result);
      setRefreshTrigger((prev) => prev + 1);
      onReset();
    } catch (err) {
      console.error("Ошибка добавления:", err);
    }
  };

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
        onAdd={handleAdd}
        loading={postLoading}
        error={postError}
      />
    </main>
  );
}

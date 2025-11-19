import InfoBlock from "../components/InfoBlock/InfoBlock";
import Button from "../components/Button/Button";
import { useCallback, useState } from "react";
import HandbookTable from "../components/HandbookTable/HandbookTable";
import { useApiData } from "../hooks/useApiData";
import { tableConfig } from "../utils/tableConfig";
import { getTeachersCategory } from "../api/teacherCategoryAPI";
import { getTeachers } from "../api/teachersAPI";
import { usePost } from "../hooks/usePost";
import { useUpdate } from "../hooks/useUpdate";
import ModalForm from "../components/Modal/ModalForm";
import { useDelete } from "../hooks/useDelete";
import ConfirmModal from "../components/Modal/ConfirmModal";
import { tableIds } from "../utils/idTableConfig";

import "./Handbook.css";

const headerInfo = [
  {
    title: "Справочная информация",
    text: [],
  },
];

const ControlContainer = ({
  handbook,
  onAdd,
  onEdit,
  onDelete,
  search,
  onSearchChange,
}) => {
  if (!handbook) return null;

  return (
    <div className="control-container">
      <Button onClick={onAdd} size="small">
        Добавить запись
      </Button>
      <Button
        variant="secondary"
        size="small"
        onClick={onEdit}
        disabled={!onEdit}
      >
        Редактировать запись
      </Button>
      <Button
        onClick={onDelete}
        variant="danger"
        size="small"
        disabled={!onEdit}
      >
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

export default function Handbooks() {
  const [handbook, setHandbook] = useState(null);
  const [search, setSearch] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0); // trigger for update

  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // get data from API with custom hook
  const currentTableConfig = tableConfig[handbook];
  const { data, loading, error } = useApiData(
    currentTableConfig?.apiFunction || (() => []),
    [handbook, refreshTrigger],
    !!currentTableConfig
  );

  // load teachers for group table
  const {
    data: teachersData,
    loading: teachersLoading,
    error: teachersError,
  } = useApiData(getTeachers, [], handbook === "groups");

  // consts for post requests
  const { post, loading: postLoading, error: postError } = usePost();
  // consts for update requests
  const {
    update: updateRecord,
    loading: updateLoading,
    error: updateError,
  } = useUpdate();
  // const for delete requests
  const { del, loading: deleteLoading, error: deleteError } = useDelete();

  // set handbook states
  const handleTeacher = () => setHandbook("teachers");
  const handleTeacherCategory = () => setHandbook("teacher_category");
  const handleCabinet = () => setHandbook("cabinets");
  const handleBuilding = () => setHandbook("buildings");
  const handleSpeciality = () => setHandbook("specialities");
  const handleSessionType = () => setHandbook("session_type");
  const handleGroup = () => setHandbook("groups");
  const handleStream = () => setHandbook("streams");

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

  // Component for count filtererd data
  const CountHandbookRows = ({ handbook, data, search }) => {
    if (!handbook) return null;

    return (
      <div className="count-filtered-data">
        Количество записей: {getFilteredData(data, search).length}
      </div>
    );
  };

  // Universal save edit function
  const handleSaveEdit = async (updatedData, idValues, onReset) => {
    try {
      const result = await updateRecord(handbook, idValues, updatedData);

      console.log("Успешно обновлено:", result);
      setRefreshTrigger((prev) => prev + 1);
      onReset();
    } catch (err) {
      console.error("Ошибка обновления:", err);
    }
  };

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

  // Function for open delete modal
  const handleOpenConfirmDelete = () => {
    if (selectedRowData) {
      setIsConfirmModalOpen(true);
    }
  };
  // Function confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedRowData || !handbook) {
      setIsConfirmModalOpen(false);
      return;
    }

    const idFields = tableIds[handbook];

    if (!idFields || !Array.isArray(idFields) || idFields.length === 0) {
      console.error(
        `Неизвестная или некорректная конфигурация ID для таблицы: ${handbook}`
      );
      setIsConfirmModalOpen(false);
      return;
    }

    const idValue = idFields.map((field) => selectedRowData[field]);

    try {
      await del(`/${handbook}`, idValue);

      console.log("Успешно удалено");
      console.log("ID для удаления:", idValue);
      setRefreshTrigger((prev) => prev + 1);
      setIsConfirmModalOpen(false);
      setSelectedRowData(null);
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  // return content depending on the state handbook
  const renderContent = () => {
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

    let processedData = data;

    if (
      handbook === "groups" &&
      !teachersLoading &&
      !teachersError &&
      teachersData
    ) {
      const teacherMap = {};
      teachersData.forEach((teacher) => {
        teacherMap[teacher.id] =
          `${teacher.surname} ${teacher.name} ${teacher.fathername}`.trim();
      });

      processedData = data.map((group) => ({
        ...group,
        group_advisor_id:
          teacherMap[group.group_advisor_id] || "Неизвестный преподаватель",
      }));
    }

    const filteredData = getFilteredData(processedData, search);
    return (
      <HandbookTable
        apiResponse={filteredData}
        tableName={handbook}
        onRowClick={setSelectedRowData}
        selectedRow={selectedRowData}
      />
    );
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
        <Button onClick={handleGroup} size="small">
          Группы
        </Button>
        <Button onClick={handleStream} size="small">
          Потоки занятий
        </Button>
      </div>
      <ControlContainer
        handbook={handbook}
        onAdd={() => {
          setIsModalOpen(true);
          setSelectedRowData(null);
        }}
        onEdit={selectedRowData ? () => setIsModalOpen(true) : null}
        onDelete={selectedRowData ? handleOpenConfirmDelete : null}
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
      />
      <div className="rendered-table">
        {renderContent()}
        {/* Count data rows */}
        <CountHandbookRows handbook={handbook} data={data} search={search} />
      </div>

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRowData(null);
        }}
        handbook={handbook}
        rowData={selectedRowData}
        onSubmit={selectedRowData ? handleSaveEdit : handleAdd}
        loading={postLoading || updateLoading}
        error={postError || updateError}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Подтвердите удаление"
        message={
          tableIds[handbook] && Array.isArray(tableIds[handbook])
            ? `Вы уверены, что хотите удалить запись с ${tableIds[handbook]
                .map(
                  (field) => `${field}: "${selectedRowData?.[field] ?? "N/A"}"`
                )
                .join(", ")}?`
            : `Вы уверены, что хотите удалить запись?`
        }
        confirmText="Удалить"
        cancelText="Отмена"
        loading={deleteLoading}
      />
    </main>
  );
}

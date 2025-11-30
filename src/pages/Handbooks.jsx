import InfoBlock from "../components/InfoBlock/InfoBlock";
import Button from "../components/Button/Button";
import { useEffect, useState, useRef } from "react";
import HandbookTable from "../components/HandbookTable/HandbookTable";
import { useApiData } from "../hooks/useApiData";
import { tableConfig } from "../utils/tableConfig";
import { getFilteredData } from "../utils/getFilteredData";
import { getTeachers } from "../api/teachersAPI";
import { usePost } from "../hooks/usePost";
import { useUpdate } from "../hooks/useUpdate";
import ModalForm from "../components/Modal/ModalForm";
import { useDelete } from "../hooks/useDelete";
import ConfirmModal from "../components/Modal/ConfirmModal";
import { tableIds } from "../utils/idTableConfig";
import { API_BASE_URL } from "../api/apiURL";
import GroupPlate from "../components/GroupPlate/GroupPlate";
import { displayFieldConfig } from "../utils/tableConfig";

import "./Handbook.css";

const headerInfo = [
  {
    title: "Справочная информация",
    text: [],
  },
];

const ControlContainer = (
  { handbook, onAdd, onEdit, onDelete, search, onSearchChange },
  ref
) => {
  if (!handbook) return null;

  return (
    <div ref={ref} className="control-container">
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

  // Ref for table
  const tableRef = useRef(null);
  const controlContainerRef = useRef(null);

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

  // clear selected row
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target) &&
        controlContainerRef.current &&
        !controlContainerRef.current.contains(event.target)
      ) {
        setSelectedRowData(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  // set handbook states
  const handleTeacher = () => {
    setHandbook("teachers");
    setSelectedRowData(null);
  };
  const handleTeacherCategory = () => {
    setHandbook("teacher_category");
    setSelectedRowData(null);
  };
  const handleCabinet = () => {
    setHandbook("cabinets");
    setSelectedRowData(null);
  };
  const handleBuilding = () => {
    setHandbook("buildings");
    setSelectedRowData(null);
  };
  const handleSpeciality = () => {
    setHandbook("specialities");
    setSelectedRowData(null);
  };
  const handleSessionType = () => {
    setHandbook("session_type");
    setSelectedRowData(null);
  };
  const handleGroup = () => {
    setHandbook("groups");
    setSelectedRowData(null);
  };
  const handleStream = () => {
    setHandbook("streams");
    setSelectedRowData(null);
  };
  const handlePaymentForm = () => {
    setHandbook("payment_forms");
    setSelectedRowData(null);
  };

  // Component for count filtered data
  const CountHandbookRows = ({ handbook, data, search }) => {
    if (!handbook) return null;

    return (
      <div className="count-filtered-data">
        Количество записей:{" "}
        {Array.isArray(data) ? getFilteredData(data, search).length : []}
      </div>
    );
  };

  // Universal save edit function
  const handleSaveEdit = async (
    updateDataOrFormData,
    idDataOrIdValues,
    onReset
  ) => {
    if (
      typeof idDataOrIdValues === "object" &&
      idDataOrIdValues !== null &&
      !Array.isArray(idDataOrIdValues)
    ) {
      const updateData = updateDataOrFormData;
      const idData = idDataOrIdValues;

      try {
        const requestBody = { ...idData, ...updateData };
        console.log("Отправка обновления с изменяемым ключом:", requestBody);

        const response = await fetch(`${API_BASE_URL}/${handbook}/update`, {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          let errorText = `HTTP error! status: ${response.status}`;
          try {
            errorText = await response.text();
          } catch (e) {}
          throw new Error(errorText);
        }

        const result = await response.json();
        console.log("Успешно обновлено (ключевой метод):", result);
        setRefreshTrigger((prev) => prev + 1);
        onReset();
      } catch (err) {
        console.error("Ошибка обновления (ключевой метод):", err);
      }
    } else {
      const updatedData = updateDataOrFormData;
      const idValues = idDataOrIdValues;

      try {
        const result = await updateRecord(handbook, idValues, updatedData);
        console.log("Успешно обновлено (старый метод):", result);
        setRefreshTrigger((prev) => prev + 1);
        onReset();
      } catch (err) {
        console.error("Ошибка обновления (старый метод):", err);
      }
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

    const filteredData = Array.isArray(data)
      ? getFilteredData(processedData, search)
      : [];
    return (
      <div ref={tableRef}>
        <HandbookTable
          apiResponse={filteredData}
          tableName={handbook}
          onRowClick={setSelectedRowData}
          selectedRow={selectedRowData}
        />
      </div>
    );
  };

  // array of tab buttons
  const tabButtonsTeacher = [
    <Button onClick={handleTeacher} size="small">
      Преподаватели
    </Button>,
    <Button onClick={handleTeacherCategory} size="small">
      Категории преподавателей
    </Button>,
  ];
  const tabButtonsGroup = [
    <Button onClick={handleSpeciality} size="small">
      Специальности
    </Button>,
    <Button onClick={handleGroup} size="small">
      Группы
    </Button>,
    <Button onClick={handlePaymentForm} size="small">
      Формы оплаты
    </Button>,
  ];
  const tabButtonsCabinet = [
    <Button onClick={handleBuilding} size="small">
      Здания
    </Button>,
    <Button onClick={handleCabinet} size="small">
      Кабинеты
    </Button>,
  ];
  const tabButtonsSession = [
    <Button onClick={handleSessionType} size="small">
      Типы занятий
    </Button>,
    <Button onClick={handleStream} size="small">
      Потоки занятий
    </Button>,
  ];

  return (
    <main>
      <InfoBlock items={headerInfo} />
      <div className="handbooks__navigation">
        <GroupPlate groupElements={tabButtonsTeacher} />
        <GroupPlate groupElements={tabButtonsGroup} />
        <GroupPlate groupElements={tabButtonsCabinet} />
        <GroupPlate groupElements={tabButtonsSession} />
      </div>
      <ControlContainer
        ref={controlContainerRef}
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
        rowData={selectedRowData}
        displayFields={displayFieldConfig[handbook] || []}
        confirmText="Удалить"
        cancelText="Отмена"
        loading={deleteLoading}
      />
    </main>
  );
}

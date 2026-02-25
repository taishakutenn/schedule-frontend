import "./PlanLoader.css";

import { useState, useRef, useCallback } from "react";
import InfoBlock from "../InfoBlock/InfoBlock";
import Button from "../Button/Button";
import DynamicInputList from "../DynamicList/DynamicInputList";
import { getPlans } from "../../api/plansAPI";
import { uploadAndParsePlan, getAvailableReferences, createReference } from "../../api/parserLoad";
import HandbookTable from "../HandbookTable/HandbookTable";
import ConfirmationModal from "../Modal/ConfirmModal";

const planLoadHeaderInfo = [
  {
    title: "Загрузка учебных планов",
    text: [],
  },
];

// Хук для управления списками (разделы, циклы, модули)
function useItemList(initialState = []) {
  const [items, setItems] = useState(initialState);

  const add = useCallback(() => {
    setItems((prev) => [...prev, { name: "" }]);
  }, []);

  const update = useCallback((index, value) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index].name = value;
      return newItems;
    });
  }, []);

  const remove = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const set = useCallback((newItems) => {
    setItems(newItems);
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  return { items, add, update, remove, set, clear };
}

export default function PlanLoader() {
  // Списки разделов, циклов, модулей
  const sections = useItemList();
  const cycles = useItemList();
  const modules = useItemList();

  // Статус загрузки файла
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Таблицы (планы и шаблоны)
  const [activeTable, setActiveTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState(null);

  // Модальное окно сохранения шаблона
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Обработчик клика по строке шаблона
  const handleReferenceRowClick = useCallback((rowData) => {
    if (!rowData || typeof rowData !== "object") return;

    const parseList = (str = "") =>
      str
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

    sections.set(parseList(rowData.chapters).map((name) => ({ name })));
    cycles.set(parseList(rowData.cycles).map((name) => ({ name })));
    modules.set(parseList(rowData.modules).map((name) => ({ name })));
  }, [sections, cycles, modules]);

  // Переключение таблиц
  const toggleTable = async (tableName) => {
    if (activeTable === tableName) {
      setActiveTable(null);
      setTableData([]);
      setTableLoading(false);
      setTableError(null);
      return;
    }

    setActiveTable(tableName);
    setTableLoading(true);
    setTableError(null);

    try {
      let data;
      if (tableName === "plans") {
        data = await getPlans();
      } else if (tableName === "references") {
        const response = await getAvailableReferences();
        data = response.references || [];
      }

      setTableData(data);
    } catch (err) {
      console.error(`Ошибка загрузки ${tableName} для таблицы:`, err);
      setTableError(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  // Загрузка файла плана
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xls|xlsx)$/i)) {
      setUploadStatus("error");
      setUploadMessage("Файл должен быть в формате .xls или .xlsx");
      return;
    }

    setUploadStatus("loading");
    setUploadMessage("Загрузка и обработка файла...");
    setUploadProgress(0);

    try {
      const sectionCodes = sections.items
        .map((s) => s.name)
        .filter((n) => n.trim() !== "");
      const cycleCodes = cycles.items
        .map((c) => c.name)
        .filter((n) => n.trim() !== "");
      const moduleCodes = modules.items
        .map((m) => m.name)
        .filter((n) => n.trim() !== "");

      const result = await uploadAndParsePlan(
        file,
        sectionCodes,
        cycleCodes,
        moduleCodes,
      );

      setUploadStatus("success");
      setUploadMessage(
        `Файл ${result.filename} успешно загружен и данные сохранены в БД. Номер плана: ${result.saved_plan_id}`,
      );
    } catch (err) {
      console.error("Ошибка загрузки файла:", err);
      setUploadStatus("error");
      setUploadMessage(`Ошибка загрузки: ${err.message}`);
    } finally {
      setUploadProgress(100);
      setTimeout(() => {
        if (uploadStatus !== "success") {
          setUploadStatus(null);
          setUploadMessage("");
        }
      }, 5000);
    }
  };

  // Сохранение шаблона
  const handleSaveTemplate = async (name) => {
    if (!name || !name.trim()) {
      alert("Пожалуйста, введите имя шаблона");
      return;
    }

    setSaveLoading(true);

    try {
      const sectionNames = sections.items
        .map((s) => s.name)
        .filter((n) => n.trim() !== "");
      const cycleNames = cycles.items
        .map((c) => c.name)
        .filter((n) => n.trim() !== "");
      const moduleNames = modules.items
        .map((m) => m.name)
        .filter((n) => n.trim() !== "");

      await createReference(name, sectionNames, cycleNames, moduleNames);

      alert(`Шаблон "${name}" успешно сохранен!`);
      setTemplateName("");
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении шаблона:", error);
      alert(`Ошибка при сохранении шаблона: ${error.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenSaveModal = () => {
    setTemplateName("");
    setIsSaveModalOpen(true);
  };

  const handleCloseSaveModal = () => {
    setIsSaveModalOpen(false);
    setTemplateName("");
  };

  return (
    <div className="dynamic-content">
      <InfoBlock items={planLoadHeaderInfo} />
      <div className="plan-structure-data-wrapper">
        <div className="plan-structure-data">
          <DynamicInputList
            title="Разделы"
            items={sections.items}
            onAdd={sections.add}
            onRemove={sections.remove}
            onUpdate={sections.update}
            placeholder="Название раздела"
          />
          <DynamicInputList
            title="Циклы"
            items={cycles.items}
            onAdd={cycles.add}
            onRemove={cycles.remove}
            onUpdate={cycles.update}
            placeholder="Название цикла"
          />
          <DynamicInputList
            title="Модули"
            items={modules.items}
            onAdd={modules.add}
            onRemove={modules.remove}
            onUpdate={modules.update}
            placeholder="Название модуля"
          />
        </div>
        <Button size="small" onClick={handleOpenSaveModal}>
          Save
        </Button>
      </div>
      <div className="buttons">
        <Button size="small" onClick={() => toggleTable("plans")}>
          {activeTable === "plans"
            ? "Скрыть список планов"
            : "Список загруженных планов"}
        </Button>
        <Button size="small" onClick={() => toggleTable("references")}>
          {activeTable === "references"
            ? "Скрыть список шаблонов"
            : "Список шаблонов"}
        </Button>
        <Button
          size="small"
          action="load"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          Загрузить файл плана
        </Button>
        <input
          type="file"
          accept=".xls, .xlsx"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </div>

      {uploadStatus && (
        <div className={`upload-status upload-status--${uploadStatus}`}>
          <p>{uploadMessage}</p>
          {uploadStatus === "loading" && (
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {activeTable && (
        <div className="table-container">
          {tableLoading && <p>Загрузка списка {activeTable}...</p>}
          {tableError && <p className="error-message">Ошибка: {tableError}</p>}
          {!tableLoading && !tableError && (
            <HandbookTable
              apiResponse={tableData}
              tableName={activeTable}
              onRowClick={
                activeTable === "references"
                  ? handleReferenceRowClick
                  : undefined
              }
            />
          )}
        </div>
      )}

      {/* Модальное окно для ввода имени шаблона */}
      <ConfirmationModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseSaveModal}
        onConfirm={() => handleSaveTemplate(templateName)}
        title="Сохранить шаблон"
        confirmText="Сохранить"
        cancelText="Отменить"
        loading={saveLoading}
        confirmDisabled={!templateName.trim()}
        message="Вы уверены, что хотите сохранить этот шаблон?" // Кастомное сообщение
      >
        <div className="template-name-input">
          <label htmlFor="templateName">Имя шаблона:</label>
          <input
            id="templateName"
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Введите имя шаблона"
            autoFocus
            disabled={saveLoading}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid var(--main-border-color)",
              borderRadius: "4px",
              fontSize: "14px",
              marginTop: "4px",
              backgroundColor: "var(--main-background-color)",
              color: "var(--main-font-color)",
            }}
          />
        </div>
      </ConfirmationModal>
    </div>
  );
}

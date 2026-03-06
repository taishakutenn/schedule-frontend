import "./PlanLoader.css";

import { useState, useRef } from "react";
import InfoBlock from "../InfoBlock/InfoBlock";
import Button from "../Button/Button";
import DynamicInputList from "../DynamicList/DynamicInputList";
import { getPlans } from "../../api/plansAPI";
import {
  getAvailableReferences,
  createReference,
  uploadAndParsePlan,
} from "../../api/parserLoad";
import HandbookTable from "../HandbookTable/HandbookTable";
import ConfirmationModal from "../Modal/ConfirmModal";

const planLoadHeaderInfo = [
  {
    title: "Загрузка учебных планов",
    text: [],
  },
];

export default function PlanLoader() {
  const [sections, setSections] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [modules, setModules] = useState([]);

  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [activeTable, setActiveTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const fileInputRef = useRef(null);

  const addSection = () => setSections([...sections, { name: "" }]);
  const updateSection = (index, value) => {
    const newSections = [...sections];
    newSections[index].name = value;
    setSections(newSections);
  };
  const removeSection = (index) =>
    setSections(sections.filter((_, i) => i !== index));

  const addCycle = () => setCycles([...cycles, { name: "" }]);
  const updateCycle = (index, value) => {
    const newCycles = [...cycles];
    newCycles[index].name = value;
    setCycles(newCycles);
  };
  const removeCycle = (index) =>
    setCycles(cycles.filter((_, i) => i !== index));

  const addModule = () => setModules([...modules, { name: "" }]);
  const updateModule = (index, value) => {
    const newModules = [...modules];
    newModules[index].name = value;
    setModules(newModules);
  };
  const removeModule = (index) =>
    setModules(modules.filter((_, i) => i !== index));

  const handleReferenceRowClick = (rowData) => {
    if (!rowData || typeof rowData !== "object") return;

    // Разбиваем по запятой И убираем пробелы
    const parseList = (str = "") =>
      str
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

    const chapters = parseList(rowData.chapters);
    const cycles = parseList(rowData.cycles);
    const modules = parseList(rowData.modules);

    setSections(chapters.map((name) => ({ name })));
    setCycles(cycles.map((name) => ({ name })));
    setModules(modules.map((name) => ({ name })));
  };

  const toggleTable = async (tableName) => {
    if (activeTable === tableName) {
      setActiveTable(null);
      setTableData([]);
      setTableLoading(false);
      return;
    }

    setActiveTable(tableName);
    setTableLoading(true);

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
      // Обработка ошибки
    } finally {
      setTableLoading(false);
    }
  };

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
      const sectionCodes = sections
        .map((s) => s.name)
        .filter((n) => n.trim() !== "");
      const cycleCodes = cycles
        .map((c) => c.name)
        .filter((n) => n.trim() !== "");
      const moduleCodes = modules
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

  const handleSaveTemplate = async (name) => {
    if (!name || !name.trim()) {
      alert("Пожалуйста, введите имя шаблона");
      return;
    }

    setSaveLoading(true);

    try {
      const sectionNames = sections
        .map((s) => s.name)
        .filter((n) => n.trim() !== "");
      const cycleNames = cycles
        .map((c) => c.name)
        .filter((n) => n.trim() !== "");
      const moduleNames = modules
        .map((m) => m.name)
        .filter((n) => n.trim() !== "");

      const result = await createReference(
        name,
        sectionNames,
        cycleNames,
        moduleNames,
      );

      alert(`Шаблон "${name}" успешно сохранен!`);

      setTemplateName("");
      setIsSaveModalOpen(false);
    } catch (error) {
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
            items={sections}
            onAdd={addSection}
            onRemove={removeSection}
            onUpdate={updateSection}
            placeholder="Название раздела"
          />
          <DynamicInputList
            title="Циклы"
            items={cycles}
            onAdd={addCycle}
            onRemove={removeCycle}
            onUpdate={updateCycle}
            placeholder="Название цикла"
          />
          <DynamicInputList
            title="Модули"
            items={modules}
            onAdd={addModule}
            onRemove={removeModule}
            onUpdate={updateModule}
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
          {!tableLoading && (
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
        message="Вы уверены, что хотите сохранить этот шаблон?" // ← Кастомное сообщение
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

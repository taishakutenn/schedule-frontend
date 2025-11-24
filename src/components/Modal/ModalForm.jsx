import { useState, useEffect } from "react";
import Modal from "./Modal";
import { formConfig } from "../../utils/formConfig";
import Button from "../Button/Button";
import { tableIds } from "../../utils/idTableConfig";
import { useApiData } from "../../hooks/useApiData";

export default function ModalForm({
  isOpen,
  onClose,
  handbook,
  rowData = null,
  onSubmit,
  loading = false,
  error = null,
}) {
  const [formData, setFormData] = useState({});

  const config = formConfig[handbook];

  useEffect(() => {
    if (isOpen && rowData) {
      setFormData({ ...rowData });
    } else if (isOpen && !rowData) {
      setFormData({});
    }
  }, [isOpen, rowData]);

  if (!isOpen || !config) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const filteredFormData = {};
    const updateData = {};
    const idData = {};

    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        if (value !== "") {
          const fieldConfig = config.fields.find((f) => f.name === key);
          if (fieldConfig && fieldConfig.isPrimaryKey) {
            if (rowData) {
              const oldValue = rowData[key];
              // --- МОДИФИКАЦИЯ: Проверка на равенство ---
              if (oldValue !== value) {
                // Значение изменилось, добавляем в updateData
                if (fieldConfig.newNameForUpdate) {
                  updateData[fieldConfig.newNameForUpdate] = value;
                } else {
                  console.warn(
                    `Поле ${key} отмечено как ключ, но newNameForUpdate не указано.`
                  );
                  updateData[key] = value; // Или игнорировать, если newNameForUpdate обязателен
                }
              } else {
                // Значение НЕ изменилось, не добавляем в updateData
                console.log(
                  `Ключевое поле ${key} не изменилось, пропускаем: ${value}`
                );
              }
              // idData всегда содержит старое значение для идентификации
              idData[key] = oldValue;
            } else {
              // Режим создания: просто добавляем
              filteredFormData[key] = value;
            }
          } else {
            // Обычные поля (не ключевые)
            if (rowData) {
              updateData[key] = value;
            } else {
              filteredFormData[key] = value;
            }
          }
        }
      }
    }

    // --- МОДИФИКАЦИЯ: Проверка, есть ли что отправлять при обновлении ---
    if (rowData) {
      // Если updateData пуст после обработки, возможно, нечего обновлять
      if (Object.keys(updateData).length === 0) {
        console.log("Нет изменений для отправки в updateData.");
        // Можно закрыть модальное окно без отправки запроса
        setFormData({});
        onClose();
        return; // Прерываем выполнение handleSubmit
      }
      onSubmit(updateData, idData, () => {
        setFormData({});
        onClose();
      });
    } else {
      onSubmit(filteredFormData, () => {
        setFormData({});
        onClose();
      });
    }
  };

  const DynamicSelect = ({ fieldConfig, value, onChange, disabled }) => {
    const { apiFunction, labelField, valueField } = fieldConfig;

    const { data, loading, error } = useApiData(apiFunction, [], isOpen);

    if (error) {
      return <div className="error-message">Ошибка загрузки: {error}</div>;
    }

    const getDisplayLabel = (item, labelField) => {
      if (Array.isArray(labelField)) {
        return labelField
          .map((field) => item[field] || "")
          .join(" ")
          .trim();
      }
      return item[labelField] || "";
    };

    return (
      <select
        name={fieldConfig.name}
        value={value}
        onChange={onChange}
        required={fieldConfig.required}
        disabled={disabled || loading}
      >
        <option value="" disabled>
          {loading ? "Загрузка..." : fieldConfig.placeholder || "Выберите..."}
        </option>
        {data?.map((item) => (
          <option key={item[valueField]} value={item[valueField]}>
            {getDisplayLabel(item, labelField)}
          </option>
        ))}
      </select>
    );
  };

  const renderField = (fieldConfig) => {
    const { name, type, placeholder, required, options } = fieldConfig;
    const value = formData[name] || "";
    if (fieldConfig.type === "select") {
      if (fieldConfig.dynamicOptions) {
        return (
          <DynamicSelect
            key={fieldConfig.name}
            fieldConfig={fieldConfig}
            value={value}
            onChange={handleChange}
            disabled={loading}
          />
        );
      }

      if (fieldConfig.options && Array.isArray(fieldConfig.options)) {
        return (
          <select
            key={fieldConfig.name}
            name={fieldConfig.name}
            value={value}
            onChange={handleChange}
            required={fieldConfig.required}
          >
            <option value="" disabled>
              {fieldConfig.placeholder || "Выберите..."}
            </option>
            {fieldConfig.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      console.warn(`Поле ${fieldConfig.name} типа select не имеет опций.`);
      return (
        <input
          key={fieldConfig.name}
          type="text"
          name={fieldConfig.name}
          placeholder={fieldConfig.placeholder}
          value={value}
          onChange={handleChange}
          required={fieldConfig.required}
        />
      );
    }

    return (
      <input
        key={fieldConfig.name}
        type={fieldConfig.type}
        name={fieldConfig.name}
        placeholder={fieldConfig.placeholder}
        value={value}
        onChange={handleChange}
        required={fieldConfig.required}
      />
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={rowData ? `Редактировать запись` : `Добавить запись`}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <div className="teacher-add-container">
          {config.fields.map(renderField)}
        </div>

        <Button type="submit" size="small" disabled={loading}>
          {loading
            ? "Отправка..."
            : rowData
            ? "Сохранить изменения"
            : "Добавить"}
        </Button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </Modal>
  );
}

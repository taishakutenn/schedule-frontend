import { useState, useEffect } from "react";
import Modal from "./Modal";
import { formConfig } from "../../utils/formConfig";
import Button from "../Button/Button";
import DynamicSelect from "./DynamicSelect";

/**
 * Универсальная модальная форма для добавления и редактирования записей справочников.
 * Режим работы (создание/редактирование) определяется наличием rowData.
 */
export default function ModalForm({
  isOpen,
  onClose,
  handbook,
  rowData = null,
  onSubmit,
  loading = false,
  error = null,
}) {
  // Данные формы
  const [formData, setFormData] = useState({});
  // Конфигурация полей для выбранного справочника
  const config = formConfig[handbook];

  // Заполняем форму данными строки при редактировании или очищаем при создании
  useEffect(() => {
    if (isOpen && rowData) {
      setFormData({ ...rowData });
    } else if (isOpen && !rowData) {
      setFormData({});
    }
  }, [isOpen, rowData]);

  if (!isOpen || !config) return null;

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчик отправки формы: разделяет логику создания и редактирования
  const handleSubmit = (e) => {
    e.preventDefault();
    // Данные для создания новой записи (без пустых значений)
    const filteredFormData = {};
    // Данные для обновления (только изменённые поля)
    const updateData = {};
    // ID записи для редактирования
    const idData = {};

    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        if (value !== "") {
          const fieldConfig = config.fields.find((f) => f.name === key);

          // Обработка первичных ключей: обновляем только если значение изменилось
          if (fieldConfig && fieldConfig.isPrimaryKey) {
            if (rowData) {
              const oldValue = rowData[key];
              if (oldValue !== value) {
                if (fieldConfig.newNameForUpdate) {
                  updateData[fieldConfig.newNameForUpdate] = value;
                } else {
                  console.warn(
                    `Поле ${key} отмечено как ключ, но newNameForUpdate не указано.`
                  );
                  updateData[key] = value;
                }
              } else {
                console.log(
                  `Ключевое поле ${key} не изменилось, пропускаем: ${value}`
                );
              }
              // Сохраняем старое значение для идентификации записи
              idData[key] = oldValue;
            } else {
              filteredFormData[key] = value;
            }
          } else {
            // Обычные поля
            if (rowData) {
              updateData[key] = value;
            } else {
              filteredFormData[key] = value;
            }
          }
        }
      }
    }

    // Отправка данных в зависимости от режима
    if (rowData) {
      // Редактирование: проверяем, есть ли изменения
      if (Object.keys(updateData).length === 0) {
        console.log("Нет изменений для отправки в updateData.");
        setFormData({});
        onClose();
        return;
      }
      onSubmit(updateData, idData, () => {
        setFormData({});
        onClose();
      });
    } else {
      // Создание новой записи
      onSubmit(filteredFormData, () => {
        setFormData({});
        onClose();
      });
    }
  };

  /**
   * Отрисовка поля формы в зависимости от типа.
   * Для select с dynamicOptions использует компонент DynamicSelect.
   */
  const renderField = (fieldConfig) => {
    const { name, type, placeholder, required, options } = fieldConfig;
    const value = formData[name] || "";

    if (fieldConfig.type === "select") {
      // Динамический select с загрузкой данных из API
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

      // Обычный select с фиксированными опциями
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
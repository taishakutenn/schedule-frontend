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
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState({});
  // Конфигурация формы для выбранного справочника
  const config = formConfig[handbook];

  // Обновление состояния формы при открытии модального окна
  useEffect(() => {
    if (isOpen && rowData) {
      // Заполнение формы данными строки при редактировании
      setFormData({ ...rowData });
    } else if (isOpen && !rowData) {
      // Очистка формы при создании новой записи
      setFormData({});
    }
  }, [isOpen, rowData]);

  // Не отображать форму, если модальное окно закрыто или конфигурация отсутствует
  if (!isOpen || !config) return null;

  // Обработчик изменения значения в полях формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();

    // Объект для хранения данных формы при создании
    const filteredFormData = {};
    // Объект для хранения данных обновления при редактировании
    const updateData = {};
    // Объект для хранения идентификаторов записи при редактировании
    const idData = {};

    // Обработка каждого поля формы
    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        if (value !== "") {
          // Поиск конфигурации поля
          const fieldConfig = config.fields.find((f) => f.name === key);

          // Обработка первичных ключей
          if (fieldConfig && fieldConfig.isPrimaryKey) {
            if (rowData) {
              // Режим редактирования
              const oldValue = rowData[key];

              // Проверка, изменилось ли значение ключа
              if (oldValue !== value) {
                // Значение изменилось, добавляем в updateData
                if (fieldConfig.newNameForUpdate) {
                  updateData[fieldConfig.newNameForUpdate] = value;
                } else {
                  console.warn(
                    `Поле ${key} отмечено как ключ, но newNameForUpdate не указано.`,
                  );
                  updateData[key] = value; // Или игнорировать, если newNameForUpdate обязателен
                }
              } else {
                // Значение НЕ изменилось, не добавляем в updateData
                console.log(
                  `Ключевое поле ${key} не изменилось, пропускаем: ${value}`,
                );
              }
              // idData всегда содержит старое значение для идентификации записи
              idData[key] = oldValue;
            } else {
              // Режим создания: просто добавляем в filteredFormData
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

    // Отправка данных в зависимости от режима работы
    if (rowData) {
      // Режим редактирования
      if (Object.keys(updateData).length === 0) {
        console.log("Нет изменений для отправки в updateData.");
        setFormData({});
        onClose();
        return;
      }
      // Вызов внешней функции onSubmit с данными обновления
      onSubmit(updateData, idData, () => {
        setFormData({});
        onClose();
      });
    } else {
      // Режим создания
      // Вызов внешней функции onSubmit с данными создания
      onSubmit(filteredFormData, () => {
        setFormData({});
        onClose();
      });
    }
  };

  // Компонент для отображения динамического выпадающего списка
  const DynamicSelect = ({ fieldConfig, value, onChange, disabled }) => {
    const { apiFunction, labelField, valueField } = fieldConfig;

    // Загрузка данных из API для выпадающего списка
    const { data, loading, error } = useApiData(apiFunction, [], isOpen);

    if (error) {
      return <div className="error-message">Ошибка загрузки: {error}</div>;
    }

    // Формирование отображаемой метки из нескольких полей
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

  // Функция для отрисовки поля формы в зависимости от его конфигурации
  const renderField = (fieldConfig) => {
    const { name, type, placeholder, required, options } = fieldConfig;
    const value = formData[name] || "";

    if (fieldConfig.type === "select") {
      // Обработка выпадающего списка
      if (fieldConfig.dynamicOptions) {
        // Динамический список с загрузкой из API
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

      // Обычный список с фиксированными опциями
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

      // Предупреждение при отсутствии опций для select
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

    // Обычное поле ввода
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
          {/* Отображение всех полей формы */}
          {config.fields.map(renderField)}
        </div>

        <Button type="submit" size="small" disabled={loading}>
          {loading
            ? "Отправка..."
            : rowData
              ? "Сохранить изменения"
              : "Добавить"}
        </Button>
        {/* Отображение сообщения об ошибке */}
        {error && <div className="error-message">{error}</div>}
      </form>
    </Modal>
  );
}

import { useApiData } from "../../hooks/useApiData";
import { useEffect, useState, useCallback } from "react";

/**
 * Выпадающий список с динамической загрузкой опций из API.
 * Используется в ModalForm для полей, данные которых получаются из внешних источников.
 * Поддерживает зависимость от другого поля формы через параметр dependsOnField.
 */
export default function DynamicSelect({
  fieldConfig,
  value,
  onChange,
  disabled,
  formData,
}) {
  // Извлекаем настройки из конфигурации поля
  const { apiFunction, labelField, valueField, dependsOnField } = fieldConfig;

  // Состояние для хранения зависимого значения
  const [dependentValue, setDependentValue] = useState(null);

  // Обновляем зависимое значение при изменении formData
  useEffect(() => {
    if (dependsOnField && formData) {
      setDependentValue(formData[dependsOnField]);
    }
  }, [dependsOnField, formData]);

  // Функция для вызова API с параметром - мемоизируем
  const fetchWithParam = useCallback(async () => {
    if (!dependentValue) return [];
    if (apiFunction) {
      return await apiFunction(dependentValue);
    }
    return [];
  }, [dependentValue, apiFunction]);

  // Загружаем данные из API через кастомный хук
  const { data, loading, error } = useApiData(
    dependsOnField ? fetchWithParam : apiFunction,
    dependsOnField ? [dependentValue] : [],
    true,
  );

  // Показываем ошибку, если загрузка не удалась
  if (error) {
    return <div className="error-message">Ошибка загрузки: {error}</div>;
  }

  /**
   * Формирует отображаемую метку из одного или нескольких полей объекта.
   * @param {Object} item - Объект данных из API
   * @param {string|string[]} labelField - Поле или массив полей для отображения
   * @returns {string} Объединённая строка для отображения
   */
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
      disabled={disabled || loading || (dependsOnField && !dependentValue)}
    >
      <option value="" disabled>
        {loading
          ? "Загрузка..."
          : dependsOnField && !dependentValue
            ? "Сначала выберите группу"
            : fieldConfig.placeholder || "Выберите..."}
      </option>
      {data?.map((item) => (
        <option key={item[valueField]} value={item[valueField]}>
          {getDisplayLabel(item, labelField)}
        </option>
      ))}
    </select>
  );
}

import { useApiData } from "../../hooks/useApiData";

/**
 * Выпадающий список с динамической загрузкой опций из API.
 * Используется в ModalForm для полей, данные которых получаются из внешних источников.
 */
export default function DynamicSelect({
  fieldConfig,
  value,
  onChange,
  disabled,
}) {
  // Извлекаем настройки из конфигурации поля
  const { apiFunction, labelField, valueField } = fieldConfig;

  // Загружаем данные из API через кастомный хук
  const { data, loading, error } = useApiData(apiFunction, [], true);

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
}
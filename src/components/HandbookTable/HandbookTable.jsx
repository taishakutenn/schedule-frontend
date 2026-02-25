import "./HandbookTable.css";
import { useMemo } from "react";
import { fieldLabels } from "../../utils/fieldsLabel";

export default function HandbookTable({
  apiResponse,
  tableName,
  onRowClick,
  selectedRow = null,
}) {
  // Получаем перевод заголовков для таблицы
  const labels = fieldLabels[tableName] || {};

  // Мемоизируем заголовки для оптимизации
  const headers = useMemo(() => {
    if (!apiResponse || !Array.isArray(apiResponse) || apiResponse.length === 0) {
      return [];
    }

    const headersSet = new Set();
    apiResponse.forEach((item) => {
      Object.keys(item).forEach((key) => headersSet.add(key));
    });
    return Array.from(headersSet);
  }, [apiResponse]);

  // Определяем поле идентификатора (первое поле, обычно id)
  const idField = useMemo(() => {
    if (!apiResponse || !Array.isArray(apiResponse) || apiResponse.length === 0) {
      return null;
    }
    // Приоритет: id, затем первое поле
    const firstItem = apiResponse[0];
    if ("id" in firstItem) return "id";
    return Object.keys(firstItem)[0];
  }, [apiResponse]);

  // Показываем сообщение, если нет данных
  if (!apiResponse || !Array.isArray(apiResponse) || apiResponse.length === 0) {
    return (
      <div className="data-table-empty">
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  const hasRowClick = typeof onRowClick === "function";

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{labels[header] || header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {apiResponse.map((item) => {
            const itemId = idField ? item[idField] : undefined;
            const isSelected = selectedRow && itemId !== undefined && 
              selectedRow[idField] === itemId;

            return (
              <tr
                key={itemId !== undefined ? itemId : JSON.stringify(item)}
                onClick={() => hasRowClick && onRowClick(item)}
                className={`${hasRowClick ? "clickable" : ""} ${isSelected ? "selected" : ""}`}
              >
                {headers.map((header) => (
                  <td key={header}>{item[header]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

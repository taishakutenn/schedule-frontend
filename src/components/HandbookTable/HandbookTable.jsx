import "./HandbookTable.css";
import { fieldLabels } from "../../utils/fieldsLabel";

export default function HandbookTable({
  apiResponse, // Может быть null, undefined или массивом
  tableName,
  onRowClick,
  selectedRow = null,
}) {
  // Select fieldsLabel
  const labels = fieldLabels[tableName] || {};

  // Function to determine table headers from an API response
  function findHeaders(data) {
    // Принимаем data как аргумент
    const headers = new Set();
    // ✅ Проверяем, что data существует и является массивом
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        Object.keys(item).forEach((key) => {
          headers.add(key);
        });
      });
    }
    return Array.from(headers);
  }

  // Function to find id in data
  function findIdInData(data) {
    // Принимаем data как аргумент
    // ✅ Проверяем, что data существует и является массивом и не пустой
    if (data && Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      let firstKey = Object.keys(firstItem)[0];
      return firstKey;
    }
    return null; // Возвращаем null, если данные отсутствуют или пусты
  }

  // Get handlers
  const headers = findHeaders(apiResponse); // Передаём apiResponse
  const dataId = findIdInData(apiResponse); // Передаём apiResponse

  // ✅ Проверяем, что apiResponse существует и является массивом перед рендерингом
  if (!apiResponse || !Array.isArray(apiResponse)) {
    return <div>Нет данных для отображения.</div>; // Или другой элемент заглушка
  }

  return (
    <table className="data-table">
      {/* Fill table headers */}
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{labels[header] || header}</th>
          ))}
        </tr>
      </thead>
      {/* Fill table cells */}
      <tbody>
        {apiResponse.map((item) => (
          <tr
            key={item[dataId]} // dataId может быть null, если apiResponse пустой
            onClick={() => onRowClick && onRowClick(item)}
            className={selectedRow?.[dataId] === item[dataId] ? "selected" : ""}
          >
            {headers.map((header) => (
              <td key={header}>{item[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

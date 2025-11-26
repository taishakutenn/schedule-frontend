import "./HandbookTable.css";
import { fieldLabels } from "../../utils/fieldsLabel";

export default function HandbookTable({
  apiResponse,
  tableName,
  onRowClick,
  selectedRow = null,
}) {
  // Select fieldsLabel
  const labels = fieldLabels[tableName] || {};

  // Function to determine table headers from an API response
  function findHeaders(data) {
    const headers = new Set();
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
    if (data && Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      let firstKey = Object.keys(firstItem)[0];
      return firstKey;
    }
    return null;
  }

  // Get handlers
  const headers = findHeaders(apiResponse);
  const dataId = findIdInData(apiResponse);

  if (!apiResponse || !Array.isArray(apiResponse)) {
    return <div>Нет данных для отображения.</div>;
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
            key={item[dataId]}
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

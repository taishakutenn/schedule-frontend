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
  function findHeaders() {
    const headers = new Set();
    apiResponse.forEach((item) => {
      Object.keys(item).forEach((key) => {
        headers.add(key);
      });
    });
    return Array.from(headers);
  }

  // Function to find id in data
  function findIdInData() {
    if (apiResponse && apiResponse.length > 0) {
      const firstItem = apiResponse[0];
      let firstKey = Object.keys(firstItem)[0];
      return firstKey;
    }
  }

  // Get handlers
  const headers = findHeaders();
  const dataId = findIdInData();

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

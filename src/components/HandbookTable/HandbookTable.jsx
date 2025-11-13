export default function HandbookTable({apiResponse}) {
  // Функция для определения заголовков таблицы из ответа api
  function findHeaders() {
    const headers = new Set();
    apiResponse.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== "id") { headers.add(key); }
      });
    });
    return Array.from(headers);
  }

  // Получаем заголовки
  const headers = findHeaders();

  return (
    <table className="teachers-table">
      {/* Заполняем заголовки таблицы */}
      <thead>
        <tr>
          {headers.map(header => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      {/* Заполняем таблицу данными */}
      <tbody>
        {apiResponse.map(item => (
          <tr key={item.id}>
            {headers.map(header => (
              <td key={header}>{item[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
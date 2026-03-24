import * as XLSX from "xlsx";

export function exportToExcel(data, filename = "export", sheetName = "Sheet1") {
  if (!data || data.length === 0) {
    console.warn("Нет данных для экспорта");
    return;
  }

  // Создаем рабочую книгу
  const wb = XLSX.utils.book_new();

  // Преобразуем данные в worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Добавляем лист в книгу
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Генерируем буфер и инициируем скачивание
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToExcelWithHeaders(
  data,
  headers,
  filename = "export",
  sheetName = "Sheet1",
) {
  if (!data || data.length === 0) {
    console.warn("Нет данных для экспорта");
    return;
  }

  const wb = XLSX.utils.book_new();

  // Создаем worksheet с заголовками
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });

  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

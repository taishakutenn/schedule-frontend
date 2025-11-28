const XLSX = require("xlsx");
const fs = require("fs");

const filePath = "__Учебный план 09.02.07_2023 год .osf-1 (2).xls";

if (!fs.existsSync(filePath)) {
  console.error(`Файл ${filePath} не найден.`);
  process.exit(1);
}

function findWord(data, searchWord) {
  const results = [];

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cell = row[colIndex];

      if (cell && typeof cell === "string" && cell.includes(searchWord)) {
        results.push({
          rowIndex: rowIndex,
          colIndex: colIndex,
          value: cell,
          coordinates: [rowIndex, colIndex],
        });
      }
    }
  }
  return results;
}

function parseWeeksString(input) {
  if (!input || typeof input !== "string") return null;

  const result = {
    weeks: 0,
    practice_weeks: 0,
  };

  const fractionMatch = input.match(/(\d+)\/(\d+)/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1]);
    const denominator = parseInt(fractionMatch[2]);
    const fractionValue = numerator / denominator;
    result.weeks = fractionValue;
  }

  const bracketMatch = input.match(/\(([^)]+)\)/);
  if (bracketMatch) {
    const bracketValue = bracketMatch[1].trim();
    const practiceWeeks = parseFloat(bracketValue.replace(/[^\d.]/g, ""));
    if (!isNaN(practiceWeeks)) {
      result.practice_weeks = practiceWeeks;
    }
  }

  const mainNumberMatch = input.match(/^(\d+)/);
  if (mainNumberMatch) {
    result.weeks += parseInt(mainNumberMatch[1]);
  }

  return result;
}

function getNextRowData(jsonData, indexes) {
  const results = [];

  indexes.forEach((item) => {
    const semesterNumber = extractSemesterNumber(item.value);

    if (item.rowIndex + 1 < jsonData.length) {
      const nextRow = jsonData[item.rowIndex + 1];
      const nextCellValue = nextRow[item.colIndex];

      if (nextCellValue !== null && nextCellValue !== undefined) {
        const parsedWeeks = parseWeeksString(nextCellValue.toString());

        results.push({
          semester: semesterNumber,
          weeks: parsedWeeks.weeks,
          practice_weeks: parsedWeeks.practice_weeks || 0,
        });
      } else {
        results.push({
          semester: semesterNumber,
          weeks: 0,
          practice_weeks: 0,
        });
      }
    }
  });

  return results;
}

function extractSemesterNumber(semesterString) {
  const match = semesterString.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function processSemesterData(jsonData) {
  const indexes = findWord(jsonData, "Семестр");

  if (indexes.length === 0) {
    console.log('Слово "Семестр" не найдено');
    return [];
  }

  const semesterData = getNextRowData(jsonData, indexes);

  return semesterData;
}

function processStructureData(
  jsonData,
  chapters = [],
  cycles = [],
  modules = []
) {
  // Принимаем коды
  // const chapters = ["ОП", "ПП"]; // УБРАТЬ ЭТИ СТРОКИ
  // const cycles = ["НО", "ОО", "СО", "ОГСЭ", "ЕН", "ОПЦ", "ПЦ"];
  // const modules = ["ОУД", "ПОО", "ПМ.02", "ПМ.03", "ПМ.05", "ПМ.06", "ПМ.07"];

  console.log("processStructureData использует коды:", {
    chapters,
    cycles,
    modules,
  }); // Для отладки

  const structure = {
    chapters: [],
  };

  const allRows = [];
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row && row.length >= 2) {
      const secondColumnValue = row[1];
      if (secondColumnValue) {
        allRows.push({
          rowIndex: i,
          col1: row[0] !== undefined ? row[0] : null,
          col2: row[1] !== undefined ? row[1] : null,
          col3: row[2] !== undefined ? row[2] : null,
          col4: row[3] !== undefined ? row[3] : null,
        });
      }
    }
  }

  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    const category = row.col2;

    // Используем переданные массивы
    if (chapters.includes(category)) {
      structure.chapters.push({
        code: category,
        name: row.col3,
        cycles: [],
      });
    } else if (cycles.includes(category)) {
      const parentChapter = structure.chapters[structure.chapters.length - 1];
      if (parentChapter) {
        parentChapter.cycles.push({
          code: category,
          name: row.col3,
          modules: [],
          subjects: [],
        });
      }
    } else if (modules.includes(category)) {
      const parentChapter = structure.chapters[structure.chapters.length - 1];
      if (parentChapter && parentChapter.cycles.length > 0) {
        const parentCycle =
          parentChapter.cycles[parentChapter.cycles.length - 1];
        parentCycle.modules.push({
          code: category,
          name: row.col3,
          subjects: [],
        });
      }
    } else {
      if (row.col2 && row.col2 !== "*") {
        const parentChapter = structure.chapters[structure.chapters.length - 1];
        if (parentChapter && parentChapter.cycles.length > 0) {
          const parentCycle =
            parentChapter.cycles[parentChapter.cycles.length - 1];

          if (parentCycle.modules.length > 0) {
            const parentModule =
              parentCycle.modules[parentCycle.modules.length - 1];
            parentModule.subjects.push({
              code: row.col2,
              name: row.col3,
            });
          } else {
            parentCycle.subjects.push({
              code: row.col2,
              name: row.col3,
            });
          }
        }
      }
    }
  }

  return structure;
}

function extractAllSubjects(structure) {
  const subjects = [];

  function traverse(obj, path = []) {
    if (obj.subjects && Array.isArray(obj.subjects)) {
      obj.subjects.forEach((subject) => {
        subjects.push({
          ...subject,
          path: [...path],
        });
      });
    }

    if (obj.modules && Array.isArray(obj.modules)) {
      obj.modules.forEach((module, index) => {
        traverse(module, [...path, `module_${index}`]);
      });
    }

    if (obj.cycles && Array.isArray(obj.cycles)) {
      obj.cycles.forEach((cycle, index) => {
        traverse(cycle, [...path, `cycle_${index}`]);
      });
    }

    if (obj.chapters && Array.isArray(obj.chapters)) {
      obj.chapters.forEach((chapter, index) => {
        traverse(chapter, [...path, `chapter_${index}`]);
      });
    }
  }

  traverse(structure);
  return subjects;
}

function findSemesterColumns(jsonData) {
  const semesterColumns = [];

  for (let rowIndex = 0; rowIndex < jsonData.length; rowIndex++) {
    const row = jsonData[rowIndex];

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cell = row[colIndex];

      if (cell && typeof cell === "string") {
        const match = cell.match(/Семестр\s+(\d+)/i);
        if (match) {
          const semesterNumber = parseInt(match[1]);
          semesterColumns.push({
            semester: semesterNumber,
            colIndex: colIndex,
            rowIndex: rowIndex,
          });
        }
      }
    }
  }

  return semesterColumns;
}

function findSecondOpVolume(jsonData, startRowIndex) {
  let foundCount = 0;

  for (let rowIndex = startRowIndex; rowIndex < jsonData.length; rowIndex++) {
    const row = jsonData[rowIndex];

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cell = row[colIndex];

      if (cell && typeof cell === "string" && cell.includes("Объём ОП")) {
        foundCount++;
        if (foundCount === 2) {
          return {
            rowIndex: rowIndex,
            colIndex: colIndex,
          };
        }
      }
    }
  }

  return null;
}

function extractSemesterData(subjectRow, semesterColIndex) {
  const data = {
    value: 0,
    col1: 0,
    col2: 0,
    col3: 0,
    col4: 0,
    col5: 0,
    col6: 0,
    col7: 0,
    col8: 0,
    col9: 0,
    col10: 0,
  };

  if (
    subjectRow.length > semesterColIndex &&
    subjectRow[semesterColIndex] !== null &&
    subjectRow[semesterColIndex] !== undefined &&
    subjectRow[semesterColIndex] !== ""
  ) {
    data.value = subjectRow[semesterColIndex];
  }

  const colNames = [
    "col1",
    "col2",
    "col3",
    "col4",
    "col5",
    "col6",
    "col7",
    "col8",
    "col9",
    "col10",
  ];
  for (let i = 0; i < colNames.length; i++) {
    const colIndex = semesterColIndex + 1 + i;
    if (
      subjectRow.length > colIndex &&
      subjectRow[colIndex] !== null &&
      subjectRow[colIndex] !== undefined &&
      subjectRow[colIndex] !== ""
    ) {
      data[colNames[i]] = subjectRow[colIndex];
    } else {
      data[colNames[i]] = 0;
    }
  }

  return data;
}

function findSubjectInData(jsonData, subjectCode, subjectName) {
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];

    if (row && row.length >= 3) {
      const code = row[1];
      const name = row[2];

      if (code === subjectCode && name === subjectName) {
        return {
          found: true,
          rowIndex: i,
          row: row,
        };
      }
    }
  }
  return {
    found: false,
    rowIndex: -1,
    row: null,
  };
}

function isPracticeSubject(subjectName) {
  return (
    subjectName.toLowerCase().includes("производственная практика") ||
    subjectName.toLowerCase().includes("учебная практика")
  );
}

function findSemestersAndInfoForSubject(
  jsonData,
  subjectRow,
  subjectRowIndex,
  semesterColumns,
  opVolumeRow,
  subjectName
) {
  const semestersInfo = [];

  if (!subjectRow || !opVolumeRow) return semestersInfo;

  for (const semCol of semesterColumns) {
    const semesterColIndex = semCol.colIndex;

    if (
      subjectRow.length > semesterColIndex &&
      opVolumeRow.rowIndex < jsonData.length
    ) {
      const opVolumeRowData = jsonData[opVolumeRow.rowIndex];
      if (opVolumeRowData && opVolumeRowData.length > semesterColIndex) {
        const semesterData = extractSemesterData(subjectRow, semesterColIndex);

        if (
          semesterData.value !== 0 &&
          semesterData.value !== null &&
          semesterData.value !== undefined &&
          semesterData.value !== ""
        ) {
          if (isPracticeSubject(subjectName)) {
            // Для практик: умножаем 36 на значение в practical_hours (col4) и записываем в lectures_hours
            const practicalHours = semesterData.col4;
            if (
              practicalHours !== 0 &&
              practicalHours !== null &&
              practicalHours !== undefined &&
              practicalHours !== ""
            ) {
              const lecturesHours = 36 * practicalHours;
              semestersInfo.push({
                semester: semCol.semester,
                self_study_hours: semesterData.col1,
                lectures_hours: lecturesHours, // 36 * practical_hours
                practical_hours: practicalHours,
                laboratory_hours: semesterData.col5,
                intermediate_assessment_hours: semesterData.col6,
                course_project_hours: semesterData.col7,
                consultation_hours: semesterData.col8, // через 8 колонки после value
                certification_hours: semesterData.col9, // через 9 колонки после value
              });
            }
            // Если практические часы отсутствуют, запись не создаем
          } else {
            // Для обычных предметов: стандартная обработка
            semestersInfo.push({
              semester: semCol.semester,
              self_study_hours: semesterData.col1, // через 1 колонку после value
              lectures_hours: semesterData.col3, // через 3 колонки после value
              practical_hours: semesterData.col4, // через 4 колонки после value
              laboratory_hours: semesterData.col5, // через 5 колонки после value
              intermediate_assessment_hours: semesterData.col6, // через 6 колонки после value
              course_project_hours: semesterData.col7, // через 7 колонки после value
              consultation_hours: semesterData.col8, // через 8 колонки после value
              certification_hours: semesterData.col9, // через 9 колонки после value
            });
          }
        }
      }
    }
  }

  return semestersInfo;
}

function processSubjectHours(jsonData, structure) {
  // Извлекаем все дисциплины из структурированных данных
  const allSubjects = extractAllSubjects(structure);

  // Находим колонки с семестрами
  const semesterColumns = findSemesterColumns(jsonData);
  // Находим вторую строку с "Объём ОП"
  const secondOpVolume = findSecondOpVolume(jsonData, 0);

  // Для каждой дисциплины ищем информацию в Excel-данных
  const subjectsWithInfo = [];

  for (const subject of allSubjects) {
    const searchResult = findSubjectInData(
      jsonData,
      subject.code,
      subject.name
    );

    let semestersInfo = [];

    if (searchResult.found && secondOpVolume) {
      semestersInfo = findSemestersAndInfoForSubject(
        jsonData,
        searchResult.row,
        searchResult.rowIndex,
        semesterColumns,
        secondOpVolume,
        subject.name
      );
    }

    subjectsWithInfo.push({
      ...subject,
      found: searchResult.found,
      hours: semestersInfo,
      excelPosition: searchResult.found
        ? {
            rowIndex: searchResult.rowIndex,
          }
        : null,
    });
  }

  return subjectsWithInfo;
}

// === ПАРСЕР 4: Оценки по семестрам ===

// Функция разбора значения - может быть числом или диапазоном (например, "1-6")
function parseValue(value) {
  if (typeof value === "string" && value.includes("-")) {
    const [start, end] = value.split("-").map(Number);
    if (!isNaN(start) && !isNaN(end)) {
      const range = [];
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      return range;
    }
  }

  // Если это просто число
  const numValue = Number(value);
  if (!isNaN(numValue)) {
    return [numValue];
  }

  return [];
}

// Функция извлечения значений оценок для предмета
// Берём 7 колонок после названия предмета (предполагаем, что название в колонке 2)
// В этих колонках содержится номер семестра или диапазон (например, "1-6")
function extractAssessmentValues(subjectRow, semesterNumber) {
  const assessmentFields = [
    "ex",
    "zach",
    "dif",
    "proj",
    "work",
    "cntrl",
    "other",
  ];
  const values = {};

  for (const field of assessmentFields) {
    values[field] = false; // по умолчанию false
  }

  if (!subjectRow) return values;

  const nameColIndex = 2; // колонка с названием предмета (индекс 2)
  const assessmentStartIndex = nameColIndex + 1; // начинаем с колонки после названия

  // Проверяем, есть ли в этих колонках указанный номер семестра
  for (let i = 0; i < assessmentFields.length; i++) {
    const colIndex = assessmentStartIndex + i;
    if (
      subjectRow.length > colIndex &&
      subjectRow[colIndex] !== null &&
      subjectRow[colIndex] !== undefined &&
      subjectRow[colIndex] !== ""
    ) {
      const cellValue = subjectRow[colIndex];
      // Разбираем значение (может быть числом или диапазоном)
      const valuesInCell = parseValue(cellValue);
      // Если номер семестра присутствует в значениях ячейки, устанавливаем true
      if (valuesInCell.includes(semesterNumber)) {
        values[assessmentFields[i]] = true;
      }
    }
  }

  return values;
}

// Функция поиска всех уникальных номеров семестров в строке предмета
function findSemestersInRow(subjectRow) {
  const semesters = new Set();

  if (!subjectRow) return Array.from(semesters);

  const nameColIndex = 2; // колонка с названием предмета (индекс 2)
  const assessmentStartIndex = nameColIndex + 1; // начинаем с колонки после названия
  const assessmentFields = [
    "ex",
    "zach",
    "dif",
    "proj",
    "work",
    "cntrl",
    "other",
  ];

  for (let i = 0; i < assessmentFields.length; i++) {
    const colIndex = assessmentStartIndex + i;
    if (
      subjectRow.length > colIndex &&
      subjectRow[colIndex] !== null &&
      subjectRow[colIndex] !== undefined &&
      subjectRow[colIndex] !== ""
    ) {
      const cellValue = subjectRow[colIndex];
      // Разбираем значение и добавляем все семестры из него
      const valuesInCell = parseValue(cellValue);
      valuesInCell.forEach((semester) => semesters.add(semester));
    }
  }

  return Array.from(semesters).filter((sem) => sem !== 0 && sem !== ""); // исключаем 0 и пустые значения
}

function processSubjectAssessments(jsonData, structure) {
  // Извлекаем все дисциплины из структурированных данных
  const allSubjects = extractAllSubjects(structure);

  // Для каждой дисциплины ищем информацию в Excel-данных
  const subjectsWithAssessments = [];

  for (const subject of allSubjects) {
    const searchResult = findSubjectInData(
      jsonData,
      subject.code,
      subject.name
    );

    let semesterAssessments = [];

    if (searchResult.found) {
      // Находим все уникальные номера семестров в строке предмета
      const semesters = findSemestersInRow(searchResult.row);

      // Для каждого найденного номера семестра создаем запись
      for (const semester of semesters) {
        const assessmentValues = extractAssessmentValues(
          searchResult.row,
          semester
        );

        // Проверяем, есть ли хотя бы одно true значение
        const hasAssessments = Object.values(assessmentValues).some(
          (val) => val === true
        );

        if (hasAssessments) {
          semesterAssessments.push({
            semester: semester,
            credit: assessmentValues.ex, // ex -> credit (exam)
            differentiated_credit: assessmentValues.dif, // dif -> differentiated_credit
            course_project: assessmentValues.proj, // proj -> course_project
            course_work: assessmentValues.work, // work -> course_work
            control_work: assessmentValues.cntrl, // cntrl -> control_work
            other_form: assessmentValues.other, // other -> other_form
          });
        }
      }
    }

    subjectsWithAssessments.push({
      ...subject,
      found: searchResult.found,
      certifications: semesterAssessments,
      excelPosition: searchResult.found
        ? {
            rowIndex: searchResult.rowIndex,
          }
        : null,
    });
  }

  return subjectsWithAssessments;
}

// === ФУНКЦИЯ СБОРКИ ВСЕЙ ИНФОРМАЦИИ В ОДИН JSON ===

function buildCompleteStructure(
  semesterData,
  structuredCurriculum,
  subjectsWithHours,
  subjectsWithAssessments
) {
  // Создаём объект для хранения оценок по предметам
  const assessmentsMap = {};
  subjectsWithAssessments.forEach((subject) => {
    const key = `${subject.code}-${subject.name}`;
    assessmentsMap[key] = subject.certifications;
  });

  // Создаём структурированный JSON
  const completeStructure = {
    id: 1, // условный ID плана
    year: 2023, // условный год
    speciality_code: "09.02.07", // условный код специальности
    semesters: semesterData.map((semester) => ({
      semester: semester.semester,
      weeks: semester.weeks,
      practice_weeks: semester.practice_weeks,
      plan_id: 1, // внешний ключ на план
    })),
    chapters: structuredCurriculum.chapters.map((chapter, chapterIndex) => ({
      id: chapterIndex + 1,
      code: chapter.code,
      name: chapter.name,
      plan_id: 1, // внешний ключ на план
      cycles: chapter.cycles.map((cycle, cycleIndex) => ({
        id: cycleIndex + 1,
        contains_modules: cycle.modules.length > 0,
        code: cycle.code,
        name: cycle.name,
        chapter_in_plan_id: chapterIndex + 1, // внешний ключ на раздел
        modules: cycle.modules.map((module, moduleIndex) => ({
          id: moduleIndex + 1,
          name: module.name,
          code: module.code,
          cycle_in_chapter_id: cycleIndex + 1, // внешний ключ на цикл
          subjects: module.subjects.map((subject, subjectIndex) => {
            const subjectKey = `${subject.code}-${subject.name}`;
            const hoursInfo = subjectsWithHours.find(
              (s) => s.code === subject.code && s.name === subject.name
            );
            const certifications = assessmentsMap[subjectKey] || [];

            return {
              id: subjectIndex + 1, // числовое ID для предмета
              code: subject.code,
              title: subject.name,
              module_in_cycle_id: moduleIndex + 1,
              cycle_in_chapter_id: cycleIndex + 1,
              hours: hoursInfo ? hoursInfo.hours : [],
              certifications: certifications,
            };
          }),
        })),
        subjects: cycle.subjects.map((subject, subjectIndex) => {
          const subjectKey = `${subject.code}-${subject.name}`;
          const hoursInfo = subjectsWithHours.find(
            (s) => s.code === subject.code && s.name === subject.name
          );
          const certifications = assessmentsMap[subjectKey] || [];

          return {
            id: subjectIndex + 1, // числовое ID для предмета
            code: subject.code,
            title: subject.name,
            module_in_cycle_id: null,
            cycle_in_chapter_id: cycleIndex + 1,
            hours: hoursInfo ? hoursInfo.hours : [],
            certifications: certifications,
          };
        }),
      })),
    })),
  };

  return completeStructure;
}

try {
  const curriculumBook = XLSX.readFile(filePath);
  const thirdSheetName = curriculumBook.SheetNames[2];
  const curriculumSheet = curriculumBook.Sheets[thirdSheetName];
  const jsonData = XLSX.utils.sheet_to_json(curriculumSheet, {
    header: 1,
    defval: null,
    raw: false,
  });

  // Запускаем все парсеры
  console.log("Запуск парсера недель по семестрам...");
  const semesterWeeks = processSemesterData(jsonData);
  console.log(`Получено ${semesterWeeks.length} записей о неделях`);

  console.log("Запуск парсера структуры учебного плана...");
  const structuredCurriculum = processStructureData(jsonData);
  console.log(
    `Получена структура с ${structuredCurriculum.chapters.length} разделами`
  );

  console.log("Запуск парсера информации по семестрам для предметов...");
  const subjectsWithHours = processSubjectHours(jsonData, structuredCurriculum);
  console.log(
    `Получено ${subjectsWithHours.length} предметов с информацией о часах`
  );

  console.log("Запуск парсера оценок по семестрам...");
  const subjectsWithAssessments = processSubjectAssessments(
    jsonData,
    structuredCurriculum
  );
  console.log(
    `Получено ${subjectsWithAssessments.length} предметов с информацией об оценках`
  );

  // Собираем всё в один структурированный JSON
  console.log("Сборка полной структуры...");
  const completeStructure = buildCompleteStructure(
    semesterWeeks,
    structuredCurriculum,
    subjectsWithHours,
    subjectsWithAssessments
  );

  fs.writeFileSync(
    "complete_curriculum_structure.json",
    JSON.stringify(completeStructure, null, 2)
  );
  console.log(
    "Полная структура сохранена в complete_curriculum_structure.json"
  );
} catch (error) {
  console.error("Ошибка при чтении Excel-файла:", error);
  process.exit(1);
}

function parseExcelFile(jsonData, sectionCodes, cycleCodes, moduleCodes) {
  // Новая функция
  console.log("Запуск парсера недель по семестрам...");
  const semesterWeeks = processSemesterData(jsonData);
  console.log(`Получено ${semesterWeeks.length} записей о неделях`);

  console.log(
    "Запуск парсера структуры учебного плана с пользовательскими кодами..."
  );
  const structuredCurriculum = processStructureData(
    jsonData,
    sectionCodes,
    cycleCodes,
    moduleCodes
  ); // Передаём коды
  console.log(
    `Получена структура с ${structuredCurriculum.chapters.length} разделами`
  );

  console.log("Запуск парсера информации по семестрам для предметов...");
  const subjectsWithHours = processSubjectHours(jsonData, structuredCurriculum);
  console.log(
    `Получено ${subjectsWithHours.length} предметов с информацией о часах`
  );

  console.log("Запуск парсера оценок по семестрам...");
  const subjectsWithAssessments = processSubjectAssessments(
    jsonData,
    structuredCurriculum
  );
  console.log(
    `Получено ${subjectsWithAssessments.length} предметов с информацией об оценках`
  );

  // Собираем всё в один структурированный JSON
  console.log("Сборка полной структуры...");
  const completeStructure = buildCompleteStructure(
    semesterWeeks,
    structuredCurriculum,
    subjectsWithHours,
    subjectsWithAssessments
  );

  return completeStructure;
}

module.exports = {
  parseExcelFile,
};

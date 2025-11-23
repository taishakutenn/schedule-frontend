export const calculateCurrentSemestersForGroup = (groupName) => {
  if (!groupName || typeof groupName !== "string" || groupName.length < 2) {
    return {
      relevantSemesters: [],
      error: "Некорректное название группы: слишком короткое или не строка.",
      expectedSemesterForCurrentYear: null,
      expectedSemesterForCurrentYearSecond: null,
      currentAcademicYearStart: null,
    };
  }

  const groupYearSuffix = groupName.substring(0, 2);
  const studentStartYear = parseInt(groupYearSuffix, 10) + 2000;

  if (isNaN(studentStartYear) || studentStartYear < 2000) {
    return {
      relevantSemesters: [],
      error: `Некорректный год начала обучения, извлечённый из группы "${groupName}": ${studentStartYear}`,
      expectedSemesterForCurrentYear: null,
      expectedSemesterForCurrentYearSecond: null,
      currentAcademicYearStart: null,
    };
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let currentAcademicYearStart;
  if (currentMonth >= 8) {
    currentAcademicYearStart = currentYear;
  } else {
    currentAcademicYearStart = currentYear - 1;
  }

  const yearsSinceStart = currentAcademicYearStart - studentStartYear;
  if (yearsSinceStart < 0) {
    return {
      relevantSemesters: [],
      error: `Группа "${groupName}" начинает обучение в ${studentStartYear}, что позже текущего учебного года ${currentAcademicYearStart}-${
        currentAcademicYearStart + 1
      }.`,
      expectedSemesterForCurrentYear: null,
      expectedSemesterForCurrentYearSecond: null,
      currentAcademicYearStart: currentAcademicYearStart,
    };
  }

  const expectedSemesterForCurrentYear = yearsSinceStart * 2 + 1;
  const expectedSemesterForCurrentYearSecond = yearsSinceStart * 2 + 2;

  const relevantSemesters = [
    expectedSemesterForCurrentYear,
    expectedSemesterForCurrentYearSecond,
  ].sort((a, b) => a - b);

  return {
    relevantSemesters: relevantSemesters,
    error: undefined,
    expectedSemesterForCurrentYear: expectedSemesterForCurrentYear,
    expectedSemesterForCurrentYearSecond: expectedSemesterForCurrentYearSecond,
    currentAcademicYearStart: currentAcademicYearStart,
  };
};

import { getGroupsByNames } from "./groupAPI";
import { getTeachersInPlans } from "./teachersInPlansAPI";
import { getSubjectHoursByIds } from "./subjectHoursAPI";
import { getPlans } from "./plansAPI";
import { getSubjectsByIds } from "./subjectAPI";
import { getTeachersByIds } from "./teachersAPI";
import { getCertificationsByIds } from "./certificationAPI";
import { processPlanItems } from "../utils/processTEachLoadData";

const determineSemesterType = (groupName, semesterNumber) => {
  const groupYearSuffix = groupName.substring(0, 2);
  const studentStartYear = parseInt(groupYearSuffix, 10) + 2000;

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
    return { isFirstHalf: false, isSecondHalf: false };
  }
  const expectedSemesterForCurrentYear = yearsSinceStart * 2 + 1;
  const expectedSemesterForCurrentYearSecond = yearsSinceStart * 2 + 2;

  if (semesterNumber === expectedSemesterForCurrentYear) {
    return { isFirstHalf: true, isSecondHalf: false };
  } else if (semesterNumber === expectedSemesterForCurrentYearSecond) {
    return { isFirstHalf: false, isSecondHalf: true };
  } else {
    console.warn(
      `Семестр ${semesterNumber} не соответствует ожидаемому для группы ${groupName} в текущем учебном году ${currentAcademicYearStart}-${
        currentAcademicYearStart + 1
      }`
    );
    return { isFirstHalf: false, isSecondHalf: false };
  }
};

const formatTeacherName = (teacherObj) => {
  if (!teacherObj) return "Преподаватель";

  const surname = teacherObj.surname || "";
  const nameInitial = teacherObj.name ? teacherObj.name.charAt(0) + "." : "";
  const patronymicInitial = teacherObj.fathername
    ? teacherObj.fathername.charAt(0) + "."
    : "";
  return `${surname} ${nameInitial}${patronymicInitial}`.trim();
};

export const fetchTeachLoadData = async () => {
  try {
    console.log("Загрузка записей о нагрузке...");
    const planItems = await getTeachersInPlans();

    console.log("Загрузка всех планов...");
    const allPlans = await getPlans();

    console.log("Сбор уникальных имён групп...");
    const uniqueGroupNamesSet = new Set();
    planItems.forEach((item) => {
      uniqueGroupNamesSet.add(item.group_name);
    });
    const uniqueGroupNames = Array.from(uniqueGroupNamesSet);

    console.log("Загрузка информации о группах по именам...");
    if (uniqueGroupNames.length === 0) {
      console.warn("Не найдено уникальных имён групп в данных о нагрузке.");
      return [];
    }
    const allGroups = await getGroupsByNames(uniqueGroupNames);

    const groupPaymentMap = new Map();
    allGroups.forEach((group) => {
      groupPaymentMap.set(group.group_name, group.payment_form);
    });

    const uniqueHoursIdsSet = new Set();
    const uniqueTeacherIdsSet = new Set();
    const uniqueSubjectIdsSet = new Set();

    planItems.forEach((item) => {
      uniqueHoursIdsSet.add(item.subject_in_cycle_hours_id);
      uniqueTeacherIdsSet.add(item.teacher_id);
    });

    const uniqueHoursIds = Array.from(uniqueHoursIdsSet);
    const uniqueTeacherIds = Array.from(uniqueTeacherIdsSet);

    console.log("Загрузка данных о часах...");
    const hoursDataArray = await getSubjectHoursByIds(uniqueHoursIds);

    hoursDataArray.forEach((hoursItem) => {
      uniqueSubjectIdsSet.add(hoursItem.subject_in_cycle_id);
    });
    const uniqueSubjectIds = Array.from(uniqueSubjectIdsSet);

    console.log("Загрузка данных о предметах...");
    const subjectDataArray = await getSubjectsByIds(uniqueSubjectIds);

    const subjectDataMap = new Map(
      subjectDataArray.map((item) => [item.id, item])
    );

    console.log("Загрузка данных о преподавателях...");
    const teacherDataArray = await getTeachersByIds(uniqueTeacherIds);

    console.log("Загрузка данных о сертификациях...");
    const certificationsDataArray = await getCertificationsByIds(
      uniqueHoursIds
    );
    const certificationsMap = new Map(
      certificationsDataArray.map((cert) => [cert.id, cert])
    );

    const hoursDataMap = new Map(hoursDataArray.map((item) => [item.id, item]));
    const teacherDataMap = new Map(
      teacherDataArray.map((item) => [item.id, item])
    );

    const finalLoadData = processPlanItems(
      planItems,
      groupPaymentMap,
      hoursDataMap,
      subjectDataMap,
      teacherDataMap,
      certificationsMap,
      determineSemesterType,
      formatTeacherName,
      null
    );

    console.log("Данные нагрузки собраны:", finalLoadData);
    return finalLoadData;
  } catch (error) {
    console.error("Ошибка при загрузке данных о нагрузке:", error);
    throw error;
  }
};

export const fetchTeachLoadDataByYear = async (targetYear) => {
  try {
    console.log(`Загрузка записей о нагрузке за ${targetYear} год...`);
    const planItems = await getTeachersInPlans();

    console.log("Загрузка всех планов...");
    const allPlans = await getPlans();

    console.log("Сбор уникальных имён групп...");
    const uniqueGroupNamesSet = new Set();
    planItems.forEach((item) => {
      uniqueGroupNamesSet.add(item.group_name);
    });
    const uniqueGroupNames = Array.from(uniqueGroupNamesSet);

    console.log("Загрузка информации о группах по именам...");
    if (uniqueGroupNames.length === 0) {
      console.warn("Не найдено уникальных имён групп в данных о нагрузке.");
      return [];
    }
    const allGroups = await getGroupsByNames(uniqueGroupNames);

    const groupPaymentMap = new Map();
    allGroups.forEach((group) => {
      groupPaymentMap.set(group.group_name, group.payment_form);
    });

    const uniqueHoursIdsSet = new Set();
    const uniqueTeacherIdsSet = new Set();
    const uniqueSubjectIdsSet = new Set();

    planItems.forEach((item) => {
      uniqueHoursIdsSet.add(item.subject_in_cycle_hours_id);
      uniqueTeacherIdsSet.add(item.teacher_id);
    });

    const uniqueHoursIds = Array.from(uniqueHoursIdsSet);
    const uniqueTeacherIds = Array.from(uniqueTeacherIdsSet);

    console.log("Загрузка данных о часах...");
    const hoursDataArray = await getSubjectHoursByIds(uniqueHoursIds);

    hoursDataArray.forEach((hoursItem) => {
      uniqueSubjectIdsSet.add(hoursItem.subject_in_cycle_id);
    });
    const uniqueSubjectIds = Array.from(uniqueSubjectIdsSet);

    console.log("Загрузка данных о предметах...");
    const subjectDataArray = await getSubjectsByIds(uniqueSubjectIds);

    const subjectDataMap = new Map(
      subjectDataArray.map((item) => [item.id, item])
    );

    console.log("Загрузка данных о преподавателях...");
    const teacherDataArray = await getTeachersByIds(uniqueTeacherIds);

    console.log("Загрузка данных о сертификациях...");
    const certificationsDataArray = await getCertificationsByIds(
      uniqueHoursIds
    );
    const certificationsMap = new Map(
      certificationsDataArray.map((cert) => [cert.id, cert])
    );

    const hoursDataMap = new Map(hoursDataArray.map((item) => [item.id, item]));
    const teacherDataMap = new Map(
      teacherDataArray.map((item) => [item.id, item])
    );

    const finalLoadData = processPlanItems(
      planItems,
      groupPaymentMap,
      hoursDataMap,
      subjectDataMap,
      teacherDataMap,
      certificationsMap,
      determineSemesterType,
      formatTeacherName,
      (planItem, hoursData, groupStartYear) => {
        const semester = hoursData.semester;
        const academicYearStart =
          groupStartYear + Math.floor((semester - 1) / 2);
        return academicYearStart === targetYear;
      }
    );

    console.log(`Данные нагрузки за ${targetYear} год собраны:`, finalLoadData);
    return finalLoadData;
  } catch (error) {
    console.error("Ошибка при загрузке данных о нагрузке по году:", error);
    throw error;
  }
};

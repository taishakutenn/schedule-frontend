import { getTeachers } from "../api/teachersAPI";
import { getTeachersCategory } from "../api/teacherCategoryAPI";
import { getSpecialities } from "../api/specialityAPI";
import { getGroups } from "../api/groupAPI";
import { getBuildings } from "../api/buildingAPI";
import { getSubjects } from "../api/subjectAPI";

const createField = (
  name,
  type = "text",
  placeholder = "",
  required = false,
  options = null,
  dynamicOptions = false,
  apiFunction = null,
  labelField = null,
  valueField = null
) => ({
  name,
  type,
  placeholder,
  required,
  options,
  dynamicOptions,
  apiFunction,
  labelField,
  valueField,
});

export const formConfig = {
  teachers: {
    fields: [
      createField("name", "text", "Имя", true),
      createField("surname", "text", "Фамилия", true),
      createField("fathername", "text", "Отчество", true),
      createField("phone_number", "tel", "Номер телефона", true),
      createField("email", "email", "Почта", true),
      createField("salary_rate", "text", "Ставка", true),
      createField(
        "teacher_category",
        "select",
        "Категория",
        true,
        null,
        true,
        getTeachersCategory,
        "teacher_category",
        "teacher_category"
      ),
    ],
  },
  buildings: {
    fields: [
      createField("building_number", "text", "Номер корпуса", true),
      createField("city", "text", "Город", true),
      createField("building_address", "text", "Адрес корпуса", true),
    ],
  },
  teacher_category: {
    fields: [
      createField("teacher_category", "text", "Название категории", true),
    ],
  },
  specialities: {
    fields: [createField("speciality_code", "text", "Код специальности", true)],
  },
  cabinets: {
    fields: [
      createField("cabinet_number", "text", "Номер кабинета", true),
      createField(
        "building_number",
        "select",
        "Номер здания",
        true,
        null,
        true,
        getBuildings,
        ["building_number", "building_address"],
        "building_number"
      ),
      createField("capacity", "text", "Вместимость", true),
      createField("cabinet_state", "text", "Тип кабинета", true),
    ],
  },
  session_type: {
    fields: [createField("name", "text", "Тип занятия", true)],
  },
  groups: {
    fields: [
      createField("group_name", "text", "Название группы", true),
      createField(
        "speciality_code",
        "select",
        "Код специальности",
        true,
        null,
        true,
        getSpecialities,
        "speciality_code",
        "speciality_code"
      ),
      createField("quantity_students", "text", "Количество студентов", true),
      createField(
        "group_advisor_id",
        "select",
        "Класс-рук группы",
        true,
        null,
        true,
        getTeachers,
        ["fathername", "name", "surname"],
        "id"
      ),
    ],
  },
  streams: {
    fields: [
      createField("stream_id", "text", "Номер потока", true),
      createField(
        "group_name",
        "select",
        "Название группы",
        true,
        null,
        true,
        getGroups,
        "group_name",
        "group_name"
      ),
      createField(
        "subject_id",
        "select",
        "Предмет",
        true,
        null,
        true,
        getSubjects,
        "title",
        "id"
      ),
    ],
  },
};

import { getTeachers } from "../api/teachersAPI";
import { getTeachersCategory } from "../api/teacherCategoryAPI";
import { getSpecialities } from "../api/specialityAPI";
import { getGroups } from "../api/groupAPI";
import { getBuildings } from "../api/buildingAPI";
import { getSubjects } from "../api/subjectAPI";
import { getPaymentForms } from "../api/paymentAPI";

const createField = (
  name,
  type = "text",
  placeholder = "",
  required = false,
  isPrimaryKey = false,
  newNameForUpdate = null,
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
  isPrimaryKey,
  newNameForUpdate,
  options,
  dynamicOptions,
  apiFunction,
  labelField,
  valueField,
});

export const formConfig = {
  teachers: {
    fields: [
      createField("surname", "text", "Фамилия", true, false),
      createField("name", "text", "Имя", true, false),
      createField("fathername", "text", "Отчество", true, false),
      createField("phone_number", "tel", "Номер телефона", true, false),
      createField("email", "email", "Почта", true, false),
      createField(
        "teacher_category",
        "select",
        "Категория",
        true,
        false,
        null,
        null,
        true,
        getTeachersCategory,
        "teacher_category",
        "teacher_category",
        false
      ),
    ],
  },
  buildings: {
    fields: [
      createField(
        "building_number",
        "text",
        "Номер корпуса",
        true,
        true,
        "new_building_number"
      ),
      createField("city", "text", "Город", true, false),
      createField("building_address", "text", "Адрес корпуса", true, false),
    ],
  },
  teacher_category: {
    fields: [
      createField(
        "teacher_category",
        "text",
        "Название категории",
        true,
        true,
        "new_teacher_category"
      ),
    ],
  },
  specialities: {
    fields: [
      createField(
        "speciality_code",
        "text",
        "Код специальности",
        true,
        true,
        "new_speciality_code"
      ),
    ],
  },
  cabinets: {
    fields: [
      createField(
        "cabinet_number",
        "text",
        "Номер кабинета",
        false,
        true,
        "new_cabinet_number"
      ),
      createField(
        "building_number",
        "select",
        "Номер здания",
        true,
        true,
        "new_building_number",
        null,
        true,
        getBuildings,
        "building_number",
        "building_number"
      ),
      createField("capacity", "text", "Вместимость", false, false),
      createField("cabinet_state", "text", "Тип кабинета", true, false),
    ],
  },
  session_type: {
    fields: [
      createField("name", "text", "Тип занятия", true, true, "new_name"),
    ],
  },
  groups: {
    fields: [
      createField(
        "group_name",
        "text",
        "Название группы",
        true,
        true,
        "new_group_name"
      ),
      createField(
        "speciality_code",
        "select",
        "Код специальности",
        true,
        false,
        null,
        null,
        true,
        getSpecialities,
        "speciality_code",
        "speciality_code"
      ),
      createField(
        "payment_form",
        "select",
        "Форма оплаты",
        true,
        false,
        null,
        null,
        true,
        getPaymentForms,
        "payment_name",
        "payment_name"
      ),
      createField(
        "quantity_students",
        "text",
        "Количество студентов",
        true,
        false
      ),
      createField(
        "group_advisor_id",
        "select",
        "Класс-рук группы",
        true,
        false,
        null,
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
      createField("stream_id", "text", "Номер потока", true, true),
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
  payment_forms: {
    fields: [
      createField(
        "payment_name",
        "text",
        "Название",
        true,
        true,
        "new_payment_name"
      ),
    ],
  },
};

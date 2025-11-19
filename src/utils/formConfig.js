const createField = (
  name,
  type = "text",
  placeholder = "",
  required = false,
  options = null
) => ({
  name,
  type,
  placeholder,
  required,
  options,
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
      createField("teacher_category", "select", "Категория", true, null),
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
    fields: [
      createField("speciality_code", "text", "Код специальности", true),
    ],
  },
  cabinets: {
    fields: [
      createField("cabinet_number", "text", "Номер кабинета", true),
      createField("building_number", "text", "Номер здания", true),
      createField("capacity", "text", "Вместимость", true),
      createField("cabinet_state", "text", "Тип кабинета", true),
    ],
  },
  session_type: {
    fields: [
      createField("name", "text", "Тип занятия", true),
    ],
  },
  groups: {
    fields: [
      createField("group_name", "text", "Название группы", true),
      createField("speciality_code", "select", "Код специальности", true, null),
      createField("quantity_students", "text", "Количество студентов", true),
      createField("group_advisor_id", "select", "Номер класс-рука группы", true, null),
    ],
  },
  streams: {
    fields: [
      createField("stream_id", "text", "Номер потока", true),
      createField("group_name", "select", "Название группы", true, null),
      createField("subject_id", "select", "Предмет", true, null),
    ],
  },
};

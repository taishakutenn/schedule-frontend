// file for defining the translation if field names from database

// Teacher
export const teacherFieldLabels = {
  id: "Номер",
  name: "Имя",
  surname: "Фамилия",
  fathername: "Отчество",
  phone_number: "Телефон",
  email: "Email",
  salary_rate: "Ставка",
  teacher_category: "Категория преподавателя",
};

// Teacher-category
export const teacherCategoryFieldLabel = {
  teacher_category: "Категория преподавателя",
};

// Building
export const buildingFieldLabels = {
  building_number: "Номер корпуса",
  city: "Город",
  building_address: "Адрес корпуса",
};

// Cabinet
export const cabinetFieldLabels = {
  cabinet_number: "Номер кабинета",
  building_number: "Номер здания",
  capacity: "Вместимость (кол-во)",
  cabinet_state: "Тип кабинета",
};

// Specialities
export const specialityFieldLabels = {
  "speciality_code": "Код специальности",
};

// Session types
export const sessionTypeFieldLabels = {
  "name": "Название типа занятия",
};

// Groups
export const groupFieldLabels = {
  "group_name": "Название группы",
  "speciality_code": "Код специальности",
  "quantity_students": "Кол-во студентов",
  "group_advisor_id": "Номер класс-рука. группы",
}

// Streams
export const streamFieldLabels = {
  "stream_id": "Номер потока",
  "group_name": "Название группы",
  "subject_id": "Номер предмета",
}

// list for export, add the table here if you added it above
export const fieldLabels = {
  teachers: teacherFieldLabels,
  teachers_category: teacherCategoryFieldLabel,
  cabinets: cabinetFieldLabels,
  buildings: buildingFieldLabels,
  specialities: specialityFieldLabels,
  sessionTypes: sessionTypeFieldLabels,
  groups: groupFieldLabels,
  streams: streamFieldLabels,
};

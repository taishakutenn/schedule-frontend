// file for defining the translation if field names from database

// Teacher
export const teacherFieldLabels = {
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

// list for export, add the table here if you added it above
export const fieldLabels = {
  teachers: teacherFieldLabels,
  teachers_category: teacherCategoryFieldLabel,
};

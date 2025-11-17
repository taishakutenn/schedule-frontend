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
      createField("surname", "text", "Фамилия", false),
      createField("fathername", "text", "Отчество", false),
      createField("phone_number", "tel", "Номер телефона", false),
      createField("email", "email", "Почта", false),
      createField("salary_rate", "number", "Ставка", false),
      createField("teacher_category", "select", "Категория", false, null),
    ],
  },
  // ... another tables
};

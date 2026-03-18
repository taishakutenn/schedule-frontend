# Конфигурация форм

Файл: `src/utils/formConfig.js`

Объект `formConfig` определяет структуру полей формы для добавления и редактирования записей справочников. Используется в компоненте [[ModalForm]].

## Описание
Конфигурация позволяет универсально рендерить формы для всех справочников, поддерживая различные типы полей, валидацию и динамические данные из API.

## Структура

### createField
Вспомогательная функция для создания конфигурации поля:

```javascript
createField(
  name,              // string — имя поля
  type = "text",     // string — тип поля
  placeholder = "",  // string — текст подсказки
  required = false,  // boolean — обязательность
  isPrimaryKey = false,  // boolean — является ли первичным ключом
  newNameForUpdate = null, // string — новое имя для обновления
  options = null,    // array — опции для select
  dynamicOptions = false, // boolean — динамическая загрузка опций
  apiFunction = null, // Function — API функция для динамических опций
  labelField = null,  // string | string[] — поле отображения
  valueField = null,  // string — поле значения
  dependsOnField = null // string — зависимое поле
)
```

### Возвращаемый объект
```javascript
{
  name, type, placeholder, required,
  isPrimaryKey, newNameForUpdate, options,
  dynamicOptions, apiFunction, labelField,
  valueField, dependsOnField
}
```

## Типы полей

### text
Обычное текстовое поле:
```javascript
createField("surname", "text", "Фамилия", true, false)
```

### tel
Поле для номера телефона:
```javascript
createField("phone_number", "tel", "Номер телефона", true, false)
```

### email
Поле для email:
```javascript
createField("email", "email", "Почта", true, false)
```

### select (статический)
Выпадающий список с фиксированными опциями:
```javascript
createField(
  "payment_form",
  "select",
  "Форма оплаты",
  true,
  false,
  null,
  [
    { value: "budget", label: "Бюджет" },
    { value: "contract", label: "Контракт" }
  ]
)
```

### select (динамический)
Выпадающий список с загрузкой из API:
```javascript
createField(
  "group_advisor_id",
  "select",
  "Класс-рук группы",
  true,
  false,
  null,
  null,
  true,              // dynamicOptions = true
  getTeachers,       // API функция
  ["fathername", "name", "surname"],  // labelField (массив полей)
  "id"               // valueField
)
```

### select (зависимый)
Выпадающий список, зависящий от другого поля:
```javascript
createField(
  "subject_id",
  "select",
  "Предмет",
  true,
  false,
  null,
  null,
  true,
  getSubjectsByGroupName,  // API функция с параметром
  ["code", "title"],       // labelField
  "id",                    // valueField
  "group_name"             // dependsOnField
)
```

## Конфигурация справочников

### teachers
| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| surname | text | Да | Фамилия |
| name | text | Да | Имя |
| fathername | text | Да | Отчество |
| phone_number | tel | Да | Телефон |
| email | email | Да | Email |
| teacher_category | select (dynamic) | Да | Категория |

### buildings
| Поле | Тип | Обязательное | Первичный ключ |
|------|-----|--------------|----------------|
| building_number | text | Да | Да |
| city | text | Да | Нет |
| building_address | text | Да | Нет |

### cabinets
| Поле | Тип | Обязательное | Первичный ключ | Динамический |
|------|-----|--------------|----------------|--------------|
| cabinet_number | text | Нет | Да | Нет |
| building_number | select | Да | Да | Да (getBuildings) |
| capacity | text | Нет | Нет | Нет |
| cabinet_state | text | Да | Нет | Нет |

### groups
| Поле | Тип | Обязательное | Динамический |
|------|-----|--------------|--------------|
| group_name | text | Да | Нет |
| speciality_code | select | Да | Да (getSpecialities) |
| payment_form | select | Да | Да (getPaymentForms) |
| quantity_students | text | Да | Нет |
| group_advisor_id | select | Да | Да (getTeachers) |

### streams
| Поле | Тип | Обязательное | Первичный ключ | Зависимый |
|------|-----|--------------|----------------|-----------|
| stream_id | text | Да | Да | Нет |
| group_name | select | Да | Нет | Нет |
| subject_id | select | Да | Нет | Да (group_name) |

## Особенности

### Первичные ключи
Поля с `isPrimaryKey: true` используются для идентификации записи при обновлении:
```javascript
createField(
  "group_name",
  "text",
  "Название группы",
  true,
  true,              // isPrimaryKey
  "new_group_name"   // newNameForUpdate
)
```

### newNameForUpdate
Если первичный ключ может изменяться, указывается новое имя:
```javascript
// При обновлении:
{
  "group_name": "старое_значение",  // для поиска
  "new_group_name": "новое_значение" // для обновления
}
```

### Динамические опции
Для полей с `dynamicOptions: true`:
- `apiFunction` — функция для загрузки данных
- `labelField` — поле (или массив полей) для отображения
- `valueField` — поле для значения опции

### Зависимые поля
Для полей с `dependsOnField`:
- Загружаются только после выбора зависимого поля
- API функция вызывается с параметром из зависимого поля

## Пример использования в ModalForm

```jsx
import { formConfig } from './formConfig';

const config = formConfig[handbook];

{config.fields.map((fieldConfig) => (
  <DynamicSelect
    key={fieldConfig.name}
    fieldConfig={fieldConfig}
    value={formData[fieldConfig.name]}
    onChange={handleChange}
    formData={formData}
  />
))}
```

## См. также
- [[ModalForm]] — компонент формы
- [[DynamicSelect]] — компонент динамического select
- [[Справочники]] — страница использования форм

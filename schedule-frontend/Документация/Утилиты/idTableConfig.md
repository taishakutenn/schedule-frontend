# Конфигурация первичных ключей

Файл: `src/utils/idTableConfig.js`

Объект `tableIds` определяет первичные ключи для каждого справочника системы. Используется при удалении записей для формирования URL и идентификации записи.

## Описание
Для некоторых справочников требуется составной первичный ключ (несколько полей). Конфигурация позволяет универсально обрабатывать удаление для всех типов справочников.

## Структура
```javascript
export const tableIds = {
  [handbookKey]: string[]
};
```

## Конфигурация справочников

| Справочник | Ключ | Описание |
|------------|------|----------|
| `teachers` | `["id"]` | Числовой идентификатор преподавателя |
| `teacher_category` | `["teacher_category"]` | Название категории (строка) |
| `teachers_in_plans` | `["id"]` | Числовой идентификатор записи |
| `buildings` | `["building_number"]` | Номер корпуса |
| `cabinets` | `["building_number", "cabinet_number"]` | Составной ключ: корпус + кабинет |
| `specialities` | `["speciality_code"]` | Код специальности |
| `session_type` | `["name"]` | Название типа занятия |
| `groups` | `["group_name"]` | Название группы |
| `streams` | `["stream_id", "group_name", "subject_id"]` | Составной ключ: поток + группа + предмет |
| `payment_forms` | `["payment_name"]` | Название формы оплаты |

## Примеры использования

### Получение ключей для удаления
```javascript
import { tableIds } from './idTableConfig';

const handbook = 'streams';
const idFields = tableIds[handbook];
// idFields = ["stream_id", "group_name", "subject_id"]
```

### Извлечение значений из данных
```javascript
const selectedRowData = {
  stream_id: "12",
  group_name: "23bgc1",
  subject_id: 65
};

const idValue = idFields.map(field => selectedRowData[field]);
// idValue = ["12", "23bgc1", 65]
```

### Формирование URL для удаления
```javascript
// В useDelete.js
const idPath = idElem.join("/");
// "12/23bgc1/65"

const url = `${API_BASE_URL}${endpoint}/delete/${idPath}`;
// http://localhost:8000/streams/delete/12/23bgc1/65
```

### Обработка в useUpdate
```javascript
import { tableIds } from '../utils/idTableConfig';

const update = async (tableName, itemId, updatedData) => {
  let id = {};
  
  if (Array.isArray(itemId)) {
    const tableFields = tableIds[tableName];
    tableFields.forEach((field, index) => {
      id[field] = itemId[index];
    });
  }
  
  // id = { stream_id: "12", group_name: "23bgc1", subject_id: 65 }
  // ...
};
```

## Особенности

### Простой ключ
Для справочников с одним первичным ключом:
```javascript
teachers: ["id"]
// URL: /teachers/delete/1
```

### Составной ключ
Для справочников с несколькими полями:
```javascript
cabinets: ["building_number", "cabinet_number"]
// URL: /cabinets/delete/3/101
```

### streams — особый случай
Потоки занятий идентифицируются тройкой полей:
- `stream_id` — номер потока
- `group_name` — название группы
- `subject_id` — идентификатор предмета

Это связано с тем, что один и тот же поток может существовать для разных групп и предметов.

## Обновление конфигурации
При добавлении нового справочника необходимо:
1. Добавить запись в `tableIds`
2. Указать все поля, необходимые для уникальной идентификации записи

```javascript
export const tableIds = {
  // ...
  new_handbook: ["id"], // или ["field1", "field2"] для составного ключа
};
```

## См. также
- [[useDelete]] — хук удаления, использующий конфигурацию
- [[useUpdate]] — хук обновления, использующий конфигурацию
- [[Конфигурация справочников]] — общая конфигурация tableConfig и displayFieldConfig
- [[Справочники]] — страница удаления записей

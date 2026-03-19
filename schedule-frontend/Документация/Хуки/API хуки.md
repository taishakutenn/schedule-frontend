# Хуки для работы с API

Набор кастомных хуков для выполнения CRUD-операций с данными справочников.

---

## useApiData

Файл: `src/hooks/useApiData.js`

Хук для загрузки данных из API с состояниями загрузки и обработки ошибок.

### Сигнатура
```javascript
useApiData(apiFunction, dependencies = [], enabled = true)
```

### Параметры
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `apiFunction` | `Function` | Обязательный | Функция API для вызова |
| `dependencies` | `Array` | `[]` | Массив зависимостей для повторного вызова |
| `enabled` | `boolean` | `true` | Флаг включения загрузки |

### Возвращает
```javascript
{
  data: any,      // Загруженные данные
  loading: boolean,  // Состояние загрузки
  error: string | null  // Сообщение об ошибке
}
```

### Пример использования
```javascript
import { useApiData } from './useApiData';
import { getTeachers } from '../api/teachersAPI';

const TeachersList = () => {
  const { data, loading, error } = useApiData(getTeachers, [], true);
  
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  
  return (
    <ul>
      {data.map(teacher => (
        <li key={teacher.id}>{teacher.surname}</li>
      ))}
    </ul>
  );
};
```

### С зависимостями
```javascript
// Повторная загрузка при изменении handbook и refreshTrigger
const { data } = useApiData(
  tableConfig[handbook]?.apiFunction,
  [handbook, refreshTrigger],
  !!tableConfig[handbook]
);
```

### Особенности
- **Мемоизация** — `fetchData` обёрнута в `useCallback` для предотвращения лишних вызовов
- **Автоматическая очистка ошибки** — при повторном вызове `error` сбрасывается
- **Безопасный вызов** — проверяется тип `apiFunction`

---

## usePost

Файл: `src/hooks/usePost.js`

Хук для выполнения POST-запросов (создание записей).

### Сигнатура
```javascript
usePost()
```

### Возвращает
```javascript
{
  post: Function,    // Функция для отправки запроса
  loading: boolean,  // Состояние загрузки
  error: string | null  // Сообщение об ошибке
}
```

### Метод post
```javascript
post(endpoint, data)
```

**Параметры:**
- `endpoint` (string) — конечная точка API (например, `"/teachers"`)
- `data` (object) — данные для отправки

**Возвращает:** `Promise<object>` — результат операции

### Пример использования
```javascript
import { usePost } from './usePost';

const AddTeacher = () => {
  const { post, loading, error } = usePost();
  
  const handleSubmit = async (formData) => {
    try {
      const result = await post('/teachers', formData);
      console.log('Успешно добавлено:', result);
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* поля формы */}
      <button type="submit" disabled={loading}>
        {loading ? 'Отправка...' : 'Добавить'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### Особенности
- **URL формируется автоматически**: `${API_BASE_URL}${endpoint}/create`
- **Content-Type**: `application/json`
- **Автоматическая обработка ошибок** — выбрасывает исключение при `!response.ok`

---

## useUpdate

Файл: `src/hooks/useUpdate.js`

Хук для выполнения PUT-запросов (обновление записей).

### Сигнатура
```javascript
useUpdate()
```

### Возвращает
```javascript
{
  update: Function,  // Функция для отправки запроса
  loading: boolean,  // Состояние загрузки
  error: string | null  // Сообщение об ошибке
}
```

### Метод update
```javascript
update(tableName, itemId, updatedData)
```

**Параметры:**
- `tableName` (string) — имя таблицы/справочника
- `itemId` (string | number | Array) — идентификатор записи
- `updatedData` (object) — данные для обновления

**Возвращает:** `Promise<object>` — результат операции

### Пример использования
```javascript
import { useUpdate } from './useUpdate';

const EditTeacher = ({ teacherId }) => {
  const { update, loading, error } = useUpdate();
  
  const handleSave = async (formData) => {
    try {
      const result = await update('teachers', teacherId, formData);
      console.log('Успешно обновлено:', result);
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };
  
  return (
    <form onSubmit={handleSave}>
      {/* поля формы */}
      <button type="submit" disabled={loading}>
        {loading ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
};
```

### Обработка составных ключей
```javascript
// Для кабинетов (составной ключ)
const idValue = ["3", "101"]; // building_number, cabinet_number
await update('cabinets', idValue, { capacity: 30 });

// URL: PUT /cabinets/update
// Body: { building_number: "3", cabinet_number: "101", capacity: 30 }
```

### Особенности
- **Автоматическое определение типа ID** — массив или одиночное значение
- **Использует tableIds** — для маппинга полей составного ключа
- **Обработка 204 No Content** — возвращает success при пустом ответе
- **Content-Type detection** — автоматически определяет формат ответа

---

## useDelete

Файл: `src/hooks/useDelete.js`

Хук для выполнения DELETE-запросов (удаление записей).

### Сигнатура
```javascript
useDelete()
```

### Возвращает
```javascript
{
  del: Function,   // Функция для отправки запроса
  loading: boolean,  // Состояние загрузки
  error: string | null  // Сообщение об ошибке
}
```

### Метод del
```javascript
del(endpoint, idElem)
```

**Параметры:**
- `endpoint` (string) — конечная точка API (например, `"/teachers"`)
- `idElem` (string | number | Array) — идентификатор записи

**Возвращает:** `Promise<object>` — результат операции

### Пример использования
```javascript
import { useDelete } from './useDelete';

const DeleteButton = ({ id, onSuccess }) => {
  const { del, loading, error } = useDelete();
  
  const handleDelete = async () => {
    try {
      await del('/teachers', id);
      console.log('Успешно удалено');
      onSuccess();
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };
  
  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Удаление...' : 'Удалить'}
    </button>
  );
};
```

### Удаление с составным ключом
```javascript
import { tableIds } from '../utils/idTableConfig';

const idFields = tableIds['streams']; // ["stream_id", "group_name", "subject_id"]
const idValue = idFields.map(field => selectedRowData[field]);
// ["12", "23bgc1", 65]

await del('/streams', idValue);
// URL: DELETE /streams/delete/12/23bgc1/65
```

### Особенности
- **Массив преобразуется в путь**: `["12", "23bgc1"]` → `"12/23bgc1"`
- **URL формируется**: `${API_BASE_URL}${endpoint}/delete/${idPath}`
- **Content-Type detection** — обрабатывает JSON и текст

---

## Общие принципы

### Обработка ошибок
Все хуки выбрасывают исключения при ошибках, которые можно обработать в try/catch:

```javascript
try {
  await post('/teachers', data);
} catch (err) {
  console.error('Ошибка:', err.message);
}
```

### Состояния загрузки
Каждый хук предоставляет `loading` для блокировки UI во время операции:

```javascript
<button disabled={loading}>
  {loading ? 'Обработка...' : 'Отправить'}
</button>
```

### API_BASE_URL
Все хуки используют базовый URL из `src/api/apiURL.js`:
```javascript
export const API_BASE_URL = 'http://localhost:8000';
```

## См. также
- [[Справочники]] — страница использования хуков
- [[ModalForm]] — компонент, использующий usePost и useUpdate
- [[Конфигурация справочников]] — tableConfig для useApiData

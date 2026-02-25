# Описание
Файл: `src\components\HandbookTable\HandbookTable.jsx`

Компонент `HandbookTable` представляет собой универсальную таблицу для отображения данных справочников. Автоматически определяет структуру таблицы на основе данных API, поддерживает перевод заголовков колонок, выделение строк и обработку кликов.

# Используемые компоненты
- Нет внешних компонентов (базовый компонент)

# Пропсы
## Обязательные
### apiResponse
`array` — Массив объектов данных для отображения в таблице. Каждый объект представляет строку таблицы.

### tableName
`string` — Имя таблицы/справочника. Используется для получения перевода заголовков из `fieldLabels`.

## Опциональные
### onRowClick
`function` — Обработчик клика по строке таблицы. Принимает объект данных строки как параметр.

### selectedRow
`object | null` — Объект данных выбранной строки. Используется для подсветки активной строки. По умолчанию `null`.

# Переменные
## Вычисляемые значения
### labels
Объект переводов заголовков для текущей таблицы. Получается из `fieldLabels[tableName]`. Если перевод не найден — пустой объект.

### headers
Массив имён полей (заголовков таблицы). Извлекается из ключей первого объекта в `apiResponse`. Мемоизируется через `useMemo`.

### idField
Имя поля идентификатора. Приоритет:
1. Поле `"id"` (если существует)
2. Первое поле в объекте данных

Мемоизируется через `useMemo`.

### hasRowClick
Булево значение, указывающее, является ли `onRowClick` функцией. Используется для условного рендеринга и стилизации.

# Функции
## Вспомогательные функции (внутри компонента)
### useMemo для headers
```jsx
const headers = useMemo(() => {
  if (!apiResponse || !Array.isArray(apiResponse) || apiResponse.length === 0) {
    return [];
  }
  const headersSet = new Set();
  apiResponse.forEach((item) => {
    Object.keys(item).forEach((key) => headersSet.add(key));
  });
  return Array.from(headersSet);
}, [apiResponse]);
```
**Назначение**: Извлечение всех уникальных ключей из объектов данных.
**Зависимости**: `apiResponse`

### useMemo для idField
```jsx
const idField = useMemo(() => {
  if (!apiResponse || !Array.isArray(apiResponse) || apiResponse.length === 0) {
    return null;
  }
  const firstItem = apiResponse[0];
  if ("id" in firstItem) return "id";
  return Object.keys(firstItem)[0];
}, [apiResponse]);
```
**Назначение**: Определение поля идентификатора с приоритетом `id`.
**Зависимости**: `apiResponse`

# Хуки
## useMemo
### headers
Мемоизирует массив заголовков для предотвращения лишних вычислений при каждом рендере.

### idField
Мемоизирует поле идентификатора для стабильного определения ключа строки.

# Базовая структура
## 1. Сообщение об отсутствии данных
```jsx
<div className="data-table-empty">
  <p>Нет данных для отображения</p>
</div>
```
Отображается, если `apiResponse` пустой или не является массивом.

## 2. Таблица с данными
```jsx
<table className="data-table">
  <thead>
    <tr>
      {headers.map((header) => (
        <th key={header}>{labels[header] || header}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {apiResponse.map((item) => (
      <tr
        key={itemId !== undefined ? itemId : JSON.stringify(item)}
        onClick={() => hasRowClick && onRowClick(item)}
        className={`${hasRowClick ? "clickable" : ""} ${isSelected ? "selected" : ""}`}
      >
        {headers.map((header) => (
          <td key={header}>{item[header]}</td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

### Структура таблицы:
- **`<thead>`**: Заголовки таблицы с переведёнными названиями
- **`<tbody>`**: Строки данных
  - Каждая строка имеет:
    - Уникальный `key` (id или JSON строка)
    - Обработчик клика (если передан)
    - Классы `clickable` и `selected` для стилизации

# Логика работы
## 1. Определение заголовков
Компонент автоматически извлекает все уникальные ключи из объектов `apiResponse` используя `Set` для исключения дубликатов.

## 2. Перевод заголовков
Для каждого заголовка ищется перевод в `fieldLabels[tableName]`. Если перевод не найден — используется оригинальное имя поля.

## 3. Определение идентификатора
- Проверяется наличие поля `"id"` в первом объекте
- Если `"id"` нет — используется первое доступное поле
- Это обеспечивает стабильный `key` для React

## 4. Выделение строки
- Сравнивается `selectedRow[idField]` с `item[idField]` текущей строки
- При совпадении добавляется класс `selected`

## 5. Интерактивность
- Если `onRowClick` — функция, строка получает класс `clickable` и курсор-указатель
- Клик по строке вызывает `onRowClick(item)`

# Примеры использования
## Базовое использование
```jsx
import HandbookTable from './HandbookTable';

const TeachersTable = ({ teachersData }) => {
  return (
    <HandbookTable
      apiResponse={teachersData}
      tableName="teachers"
    />
  );
};
```

## С обработчиком клика
```jsx
import HandbookTable from './HandbookTable';

const HandbooksPage = () => {
  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <div>
      <HandbookTable
        apiResponse={data}
        tableName="groups"
        onRowClick={setSelectedRow}
        selectedRow={selectedRow}
      />
      {selectedRow && (
        <div>Выбрана: {selectedRow.group_name}</div>
      )}
    </div>
  );
};
```

## Динамическая таблица
```jsx
import HandbookTable from './HandbookTable';

const DynamicTable = () => {
  const [handbook, setHandbook] = useState('teachers');
  const { data } = useApiData(getDataForHandbook(handbook));

  return (
    <HandbookTable
      apiResponse={data}
      tableName={handbook}
      onRowClick={handleRowClick}
    />
  );
};
```

# Конфигурация переводов
Файл: `src/utils/fieldsLabel.js`

Пример конфигурации:
```javascript
export const teacherFieldLabels = {
  id: "Номер",
  name: "Имя",
  surname: "Фамилия",
  fathername: "Отчество",
  phone_number: "Телефон",
  email: "Email",
};

export const fieldLabels = {
  teachers: teacherFieldLabels,
  groups: groupFieldLabels,
  // ... другие таблицы
};
```

# Стили
Файл: `src/components/HandbookTable/HandbookTable.css`

## Основные классы:
### `.data-table`
Основная таблица с данными:
- Ширина: `max-content`, `max-width: 95%`
- Фон: `var(--main-background-panel)`
- Граница: `1px solid var(--main-border-color)`
- Скругление: `8px`

### `.data-table th`
Заголовки таблицы:
- Фон: `var(--main-header-footer-background-color)`
- Выравнивание текста: по центру
- Шрифт: жирный (800)

### `.data-table tbody tr.clickable`
Интерактивная строка:
- Курсор: `pointer`
- Hover-эффект: изменение фона

### `.data-table tbody tr.selected`
Выделенная строка:
- Фон: `var(--main-header-footer-background-color)`

### `.data-table-empty`
Сообщение об отсутствии данных:
- Центрирование: flex
- Отступы: `40px 20px`
- Стиль: аналогичен таблице

# Предложения по улучшению
## 1. Сортировка колонок
- **Проблема**: Заголовки отображаются в произвольном порядке
- **Решение**: Добавить проп `columnOrder` для явного указания порядка колонок

## 2. Форматирование значений
- **Проблема**: Все значения отображаются как есть
- **Решение**: Добавить проп `formatters` для кастомного форматирования ячеек

## 3. Виртуализация больших списков
- **Проблема**: При большом количестве данных таблица тормозит
- **Решение**: Использовать `react-window` или `react-virtualized`

## 4. Экспорт данных
- **Проблема**: Нет возможности экспортировать данные
- **Решение**: Добавить кнопки экспорта в CSV/Excel

## 5. Пагинация
- **Проблема**: Все данные загружаются сразу
- **Решение**: Добавить серверную или клиентскую пагинацию

## 6. Типизация
- **Проблема**: Нет PropTypes или TypeScript
- **Решение**: Добавить типизацию пропсов

## 7. Доступность (A11y)
- **Проблема**: Нет ARIA-атрибутов
- **Решение**: Добавить `role="table"`, `aria-rowindex`, `aria-colindex`

## 8. Кастомные ячейки
- **Проблема**: Нельзя рендерить сложные компоненты в ячейках
- **Решение**: Добавить проп `cellRenderer` для кастомного рендеринга

## 9. Фильтрация
- **Проблема**: Нет встроенной фильтрации
- **Решение**: Добавить проп `filterValue` и `onFilterChange`

## 10. Группировка заголовков
- **Проблема**: Нельзя группировать колонки
- **Решение**: Добавить поддержку `<thead>` с несколькими уровнями

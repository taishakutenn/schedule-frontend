# Описание
Файл: `src\components\Plan\PlanLoader.jsx`

Компонент `PlanLoader` представляет собой интерфейс для загрузки и парсинга учебных планов из Excel-файлов. Позволяет настраивать структуру плана (разделы, циклы, модули), загружать файлы планов, просматривать существующие планы и шаблоны, а также сохранять конфигурации структуры как шаблоны для повторного использования.

# Используемые компоненты
- [[InfoBlock]] — отображение заголовка и описания страницы
- [[Button]] — кнопки для действий (сохранение, загрузка, переключение таблиц)
- [[DynamicInputList]] — динамические списки ввода для разделов, циклов и модулей
- [[HandbookTable]] — таблица для отображения планов и шаблонов
- [[ConfirmationModal]] — модальное окно подтверждения сохранения шаблона

# Пропсы
Компонент не принимает пропсы (самодостаточный).

# Переменные
## Состояния списков (через useItemList)
### sections
Объект управления списком разделов. Содержит:
- `items`: Массив объектов `{ name: string }`
- `add`, `update`, `remove`, `set`, `clear`: Функции управления

### cycles
Объект управления списком циклов. Аналогичная структура.

### modules
Объект управления списком модулей. Аналогичная структура.

## Состояния загрузки файла
### uploadStatus
`string | null` — текущий статус загрузки: `null`, `"loading"`, `"success"`, `"error"`.

### uploadMessage
`string` — сообщение пользователю о результате загрузки.

### uploadProgress
`number` — прогресс загрузки в процентах (0-100).

## Состояния таблиц
### activeTable
`string | null` — имя активной таблицы: `"plans"`, `"references"`, или `null`.

### tableData
`array` — данные для отображения в таблице.

### tableLoading
`boolean` — индикатор загрузки данных таблицы.

### tableError
`string | null` — сообщение об ошибке загрузки таблицы.

## Состояния модального окна
### isSaveModalOpen
`boolean` — открыто ли модальное окно сохранения шаблона.

### templateName
`string` — имя сохраняемого шаблона.

### saveLoading
`boolean` — индикатор загрузки при сохранении шаблона.

## Рефы
### fileInputRef
`ref` — ссылка на скрытый input для загрузки файлов.

# Функции
## handleReferenceRowClick(rowData)
- **Назначение**: Обработчик клика по строке шаблона в таблице.
- **Параметры**: 
  - `rowData`: Объект данных строки шаблона с полями `chapters`, `cycles`, `modules`.
- **Логика**: Парсит строковые значения через запятую, устанавливает соответствующие списки через `sections.set()`, `cycles.set()`, `modules.set()`.
- **Вызов**: При клике на строку таблицы шаблонов.

## toggleTable(tableName)
- **Назначение**: Переключение между таблицами планов и шаблонов.
- **Параметры**: 
  - `tableName`: `"plans"` или `"references"`.
- **Логика**: 
  - Если таблица уже активна — закрывает её.
  - Иначе загружает данные через API (`getPlans()` или `getAvailableReferences()`).
- **Вызов**: При клике на кнопки "Список загруженных планов" / "Список шаблонов".

## handleFileUpload(event)
- **Назначение**: Обработчик загрузки Excel-файла с учебным планом.
- **Параметры**: 
  - `event`: Событие изменения input file.
- **Логика**:
  - Проверяет расширение файла (.xls или .xlsx).
  - Собирает коды разделов, циклов, модулей из текущих списков.
  - Вызывает `uploadAndParsePlan()` для отправки файла на сервер.
  - Отображает статус и результат загрузки.
- **Вызов**: При выборе файла через скрытый input.

## handleSaveTemplate(name)
- **Назначение**: Сохранение текущей конфигурации структуры как шаблона.
- **Параметры**: 
  - `name`: Имя шаблона.
- **Логика**:
  - Проверяет, что имя не пустое.
  - Собирает названия разделов, циклов, модулей.
  - Вызывает `createReference()` для сохранения на сервере.
  - Закрывает модальное окно после успешного сохранения.
- **Вызов**: При подтверждении в модальном окне сохранения.

## handleOpenSaveModal()
- **Назначение**: Открытие модального окна сохранения шаблона.
- **Логика**: Сбрасывает `templateName` и открывает модальное окно.
- **Вызов**: При клике на кнопку "Save".

## handleCloseSaveModal()
- **Назначение**: Закрытие модального окна сохранения.
- **Логика**: Закрывает модальное окно и сбрасывает `templateName`.
- **Вызов**: При отмене в модальном окне.

## parseList(str)
- **Назначение**: Вспомогательная функция для парсинга строки с разделителями.
- **Параметры**: 
  - `str`: Строка для парсинга.
- **Возвращает**: Массивtrimmed значений.
- **Логика**: Разбивает по запятой, trim'ит, фильтрует пустые значения.

# Хуки
## useItemList(initialState = [])
Кастомный хук для управления списками (разделы, циклы, модули).

### Возвращаемые значения:
- `items`: Текущий список элементов.
- `add()`: Добавить пустой элемент.
- `update(index, value)`: Обновить элемент по индексу.
- `remove(index)`: Удалить элемент по индексу.
- `set(newItems)`: Установить новый список.
- `clear()`: Очистить список.

### Использование:
```jsx
const sections = useItemList();
// sections.items, sections.add(), sections.update(), sections.remove()
```

## useState
### Управление статусом загрузки
```jsx
const [uploadStatus, setUploadStatus] = useState(null);
const [uploadMessage, setUploadMessage] = useState("");
const [uploadProgress, setUploadProgress] = useState(0);
```

### Управление таблицами
```jsx
const [activeTable, setActiveTable] = useState(null);
const [tableData, setTableData] = useState([]);
const [tableLoading, setTableLoading] = useState(false);
const [tableError, setTableError] = useState(null);
```

### Управление модальным окном
```jsx
const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
const [templateName, setTemplateName] = useState("");
const [saveLoading, setSaveLoading] = useState(false);
```

## useRef
```jsx
const fileInputRef = useRef(null);
```
Ссылка на скрытый input для программного клика.

## useCallback
### handleReferenceRowClick
Мемоизирован для предотвращения лишних ререндеров при передаче в `HandbookTable`.

### handleSaveTemplate
Мемоизирован для стабильности ссылки на функцию.

# Базовая структура
## Общая компоновка
Компонент состоит из следующих основных блоков:

### 1. Заголовок страницы
```jsx
<InfoBlock items={planLoadHeaderInfo} />
```
Отображает заголовок "Загрузка учебных планов".

### 2. Конфигурация структуры плана
```jsx
<div className="plan-structure-data-wrapper">
  <div className="plan-structure-data">
    <DynamicInputList title="Разделы" {...sections} />
    <DynamicInputList title="Циклы" {...cycles} />
    <DynamicInputList title="Модули" {...modules} />
  </div>
  <Button onClick={handleOpenSaveModal}>Save</Button>
</div>
```
Три динамических списка для настройки структуры + кнопка сохранения шаблона.

### 3. Кнопки управления
```jsx
<div className="buttons">
  <Button onClick={() => toggleTable("plans")}>Список загруженных планов</Button>
  <Button onClick={() => toggleTable("references")}>Список шаблонов</Button>
  <Button action="load" onClick={() => fileInputRef.current.click()}>
    Загрузить файл плана
  </Button>
  <input type="file" accept=".xls,.xlsx" ref={fileInputRef} onChange={handleFileUpload} />
</div>
```

### 4. Индикатор загрузки
```jsx
{uploadStatus && (
  <div className={`upload-status upload-status--${uploadStatus}`}>
    <p>{uploadMessage}</p>
    {uploadStatus === "loading" && (
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
      </div>
    )}
  </div>
)}
```

### 5. Таблица данных
```jsx
{activeTable && (
  <div className="table-container">
    {tableLoading && <p>Загрузка...</p>}
    {tableError && <p className="error-message">Ошибка: {tableError}</p>}
    <HandbookTable apiResponse={tableData} tableName={activeTable} onRowClick={...} />
  </div>
)}
```

### 6. Модальное окно сохранения
```jsx
<ConfirmationModal isOpen={isSaveModalOpen} onClose={handleCloseSaveModal} ...>
  <div className="template-name-input">
    <label htmlFor="templateName">Имя шаблона:</label>
    <input id="templateName" type="text" value={templateName} onChange={...} />
  </div>
</ConfirmationModal>
```

# Поток данных
## Загрузка файла плана
1. Пользователь настраивает структуру (разделы, циклы, модули).
2. Нажимает "Загрузить файл плана".
3. `handleFileUpload()` проверяет формат файла.
4. Собираются коды из списков.
5. Файл и коды отправляются через `uploadAndParsePlan()`.
6. Отображается статус операции.

## Применение шаблона
1. Пользователь открывает "Список шаблонов".
2. Кликает по строке шаблона.
3. `handleReferenceRowClick()` парсит данные.
4. Списки заполняются значениями из шаблона.

## Сохранение шаблона
1. Пользователь настраивает структуру.
2. Нажимает "Save".
3. Вводит имя шаблона в модальном окне.
4. `handleSaveTemplate()` сохраняет через `createReference()`.

# Пример использования
```jsx
import PlanLoader from './Plan/PlanLoader';

const PlansPage = () => {
  return (
    <div>
      <PlanLoader />
    </div>
  );
};
```

# Предложения по улучшению
## 1. Валидация данных
- **Проблема**: Нет валидации перед загрузкой файла (пустые списки).
- **Решение**: Добавить проверку на заполненность хотя бы одного списка.

## 2. Обработка ошибок
- **Проблема**: Используется `alert()` для уведомлений.
- **Решение**: Заменить на тосты/снекбары для лучшего UX.

## 3. Оптимизация ререндеров
- **Проблема**: `toggleTable` и `handleFileUpload` не мемоизированы.
- **Решение**: Обернуть в `useCallback`.

## 4. Разделение ответственности
- **Проблема**: Компонент слишком большой (347 строк).
- **Решение**: Выделить:
  - `StructureConfig` — конфигурация структуры
  - `FileUploader` — загрузка файла
  - `TemplateTable` — таблица шаблонов

## 5. Типизация
- **Проблема**: Нет PropTypes или TypeScript.
- **Решение**: Добавить типизацию для пропсов и состояний.

## 6. Тестирование
- **Проблема**: Нет тестов.
- **Решение**: Покрыть ключевые функции unit-тестами.

## 7. Доступность
- **Проблема**: Нет ARIA-атрибутов для индикатора загрузки.
- **Решение**: Добавить `role="status"`, `aria-live="polite"`.

## 8. Управление состоянием
- **Проблема**: Множество состояний, сложно отслеживать.
- **Решение**: Использовать `useReducer` для группировки связанных состояний.

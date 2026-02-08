import { API_BASE_URL } from "./apiURL";

export const uploadAndParsePlan = async (file, chapters, cycles, modules) => {
  const formData = new FormData();
  formData.append("file", file);

  formData.append("chapters", chapters.join(","));
  formData.append("cycles", cycles.join(","));
  formData.append("modules", modules.join(","));

  const response = await fetch(`${API_BASE_URL}/parser/upload/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Ошибка: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      console.warn("Не удалось распарсить тело ошибки:", e);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

// Получение списка доступных справочников
export const getAvailableReferences = async () => {
  const response = await fetch(`${API_BASE_URL}/parser/references/`, {
    method: "GET",
  });

  if (!response.ok) {
    let errorMessage = `Ошибка: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      console.warn("Не удалось распарсить тело ошибки:", e);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Преобразуем объект configs в массив объектов для таблицы
  const refsArray = Object.entries(data.configs || {}).map(([name, config]) => ({
    name,
    chapters: Array.isArray(config.chapters) ? config.chapters.join(', ') : '',
    cycles: Array.isArray(config.cycles) ? config.cycles.join(', ') : '',
    modules: Array.isArray(config.modules) ? config.modules.join(', ') : ''
  }));
  
  return {
    ...data,     
    references: refsArray  
  };
};

// Создание нового справочника
export const createReference = async (name, chapters, cycles, modules) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("chapters", Array.isArray(chapters) ? chapters.join(",") : chapters);
  formData.append("cycles", Array.isArray(cycles) ? cycles.join(",") : cycles);
  formData.append("modules", Array.isArray(modules) ? modules.join(",") : modules);

  const response = await fetch(`${API_BASE_URL}/parser/references/create/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Ошибка: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      console.warn("Не удалось распарсить тело ошибки:", e);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

// Удаление справочника
export const deleteReference = async (referenceName) => {
  const response = await fetch(`${API_BASE_URL}/parser/references/${referenceName}/`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let errorMessage = `Ошибка: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      console.warn("Не удалось распарсить тело ошибки:", e);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

// Обновление справочника
export const updateReference = async (referenceName, chapters, cycles, modules) => {
  const formData = new FormData();
  formData.append("chapters", Array.isArray(chapters) ? chapters.join(",") : chapters);
  formData.append("cycles", Array.isArray(cycles) ? cycles.join(",") : cycles);
  formData.append("modules", Array.isArray(modules) ? modules.join(",") : modules);

  const response = await fetch(`${API_BASE_URL}/parser/references/${referenceName}/`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Ошибка: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      console.warn("Не удалось распарсить тело ошибки:", e);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};
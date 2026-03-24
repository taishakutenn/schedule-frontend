import { API_BASE_URL } from "./apiURL";
import { getSubjectsByIds } from "./subjectAPI";

export const getStreams = async () => {
  const response = await fetch(`${API_BASE_URL}/streams/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const streams = data.streams.map((item) => item.stream);

  // Собираем уникальные subject_id
  const uniqueSubjectIds = [...new Set(streams.map((s) => s.subject_id))];

  if (uniqueSubjectIds.length === 0) {
    return streams;
  }

  // Загружаем данные о предметах
  const subjects = await getSubjectsByIds(uniqueSubjectIds);

  // Создаём мапу для быстрого поиска названия предмета по id
  const subjectMap = new Map(subjects.map((s) => [s.id, s.title]));

  // Добавляем название предмета к каждому потоку
  return streams.map((stream) => ({
    ...stream,
    subject_title: subjectMap.get(stream.subject_id) || "Неизвестный предмет",
  }));
};

export const getStreamsById = async (subject_id) => {
  const response = await fetch(`${API_BASE_URL}/streams/search/by_subject/${subject_id}`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.streams.map((item) => item.stream);
};

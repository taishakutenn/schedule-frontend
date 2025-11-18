import { API_BASE_URL } from "./apiURL";

export const getStreams = async () => {
  const response = await fetch(`${API_BASE_URL}/streams/search`);
  if (!response.ok) {
    throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.streams.map((item) => item.stream);
};


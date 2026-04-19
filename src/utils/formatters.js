export const formatGroupLabel = (mainGroup, streams) => {
  if (!mainGroup?.value) {
    return "";
  }

  if (!streams?.length) {
    return mainGroup.label || mainGroup.value;
  }

  // Собираем все группы: основную + потоки
  const allGroups = [
    mainGroup.value,
    ...streams
      .map((s) => s.group_name)
      .filter((name) => typeof name === "string" && name.length > 0),
  ];

  const prefixes = allGroups.map((group) => {
    const dashIndex = group.indexOf("-");
    return dashIndex !== -1 ? group.substring(0, dashIndex) : group;
  });

  // Убираем дубликаты и объединяем
  const uniquePrefixes = [...new Set(prefixes)];
  return uniquePrefixes.join(", ");
};

export const formatDateForApi = (dateInput) => {
  if (!dateInput) return "";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toISOString().split("T")[0];
};

export const formatDateForDisplay = (dateInput, locale = "ru-RU") => {
  if (!dateInput) return "";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

import React, { useMemo, useState } from "react";
import "./LoadTable.css";

export default function LoadTable({ loadData }) {
  if (!loadData || loadData.length === 0) {
    return <div>Нет данных</div>;
  }

  const groupedData = useMemo(() => {
    const map = new Map();
    loadData.forEach((item) => {
      const groupKey = `${item.teacher_id}-${item.subject}`;
      if (!map.has(groupKey)) {
        map.set(groupKey, {
          teacher_id: item.teacher_id,
          teacher_name: item.teacher_name,
          subject: item.subject,
          rows: [],
        });
      }
      map.get(groupKey).rows.push(item);
    });
    return Array.from(map.values());
  }, [loadData]);

  const [hoveredGroupKey, setHoveredGroupKey] = useState(null);

  const columns = [
    { key: "teacher_name", label: "Преподаватель" },
    { key: "subject", label: "Дисциплина" },
    { key: "lecture_1", label: "Лекции 1" },
    { key: "lecture_2", label: "Лекции 2" },
    { key: "practical_1", label: "Практика 1" },
    { key: "practical_2", label: "Практика 2" },
    { key: "course_project", label: "Курс. проектирование" },
    { key: "consultation", label: "Консультации" },
    { key: "diff_exam", label: "Диф. зачёт" },
    { key: "exam", label: "Экзамен" },
    { key: "budget_hours", label: "Бюджет (часы)" },
    { key: "budget_rate", label: "Бюджет (ставка)" },
    { key: "extrabudget_hours", label: "Внебюджет (часы)" },
    { key: "extrabudget_rate", label: "Внебюджет (ставка)" },
    { key: "hourly_budget", label: "Почасовка бюджет" },
    { key: "hourly_extrabudget", label: "Почасовка внебюджет" },
    { key: "group", label: "Группа" },
  ];

  return (
    <div className="table-container">
      <table className="load-table">
        <thead>
          <tr>
            <th rowSpan={2}>Преподаватель</th>
            <th rowSpan={2}>Дисциплина</th>
            <th colSpan={2}>Лекции, уроки</th>
            <th colSpan={2}>Практические, лабораторные</th>
            <th rowSpan={2}>Курсовое проектирование</th>
            <th rowSpan={2}>Консультации</th>
            <th rowSpan={2}>Диф. зачёт</th>
            <th rowSpan={2}>Экзамен</th>
            <th rowSpan={2}>Бюджет (часы)</th>
            <th rowSpan={2}>Бюджет (доля ставки)</th>
            <th rowSpan={2}>Внебюджет (часы)</th>
            <th rowSpan={2}>Внебюджет (доля ставки)</th>
            <th rowSpan={2}>Почасовка бюджет</th>
            <th rowSpan={2}>Почасовка внебюджет</th>
            <th rowSpan={2}>Группа</th>
          </tr>
          <tr>
            <th>1</th>
            <th>2</th>
            <th>1</th>
            <th>2</th>
          </tr>
        </thead>
        <tbody>
          {groupedData.map((group, groupIndex) => {
            const groupKey = `${group.teacher_id}-${group.subject}`;
            const isHovered = hoveredGroupKey === groupKey;

            return (
              <React.Fragment
                key={`${group.teacher_name}-${group.subject}-${groupIndex}`}
              >
                {group.rows.map((item, rowIndex) => (
                  <tr
                    key={item.id}
                    onMouseEnter={() => setHoveredGroupKey(groupKey)}
                    onMouseLeave={() => setHoveredGroupKey(null)}
                    className={isHovered ? "hovered-row" : ""}
                  >
                    {rowIndex === 0 ? (
                      <td
                        rowSpan={Math.max(1, group.rows.length)}
                        className={isHovered ? "hovered-cell" : ""}
                      >
                        {item.teacher_name}
                      </td>
                    ) : null}

                    {rowIndex === 0 ? (
                      <td
                        rowSpan={Math.max(1, group.rows.length)}
                        className={isHovered ? "hovered-cell" : ""}
                      >
                        {item.subject}
                      </td>
                    ) : null}

                    <td>{item.lecture_1}</td>
                    <td>{item.lecture_2}</td>
                    <td>{item.practical_1}</td>
                    <td>{item.practical_2}</td>
                    <td>{item.course_project}</td>
                    <td>{item.consultation}</td>
                    <td>{item.diff_exam}</td>
                    <td>{item.exam}</td>
                    <td>{item.budget_hours}</td>
                    <td>{item.budget_rate}</td>
                    <td>{item.extrabudget_hours}</td>
                    <td>{item.extrabudget_rate}</td>
                    <td>{item.hourly_budget}</td>
                    <td>{item.hourly_extrabudget}</td>
                    <td>{item.group}</td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

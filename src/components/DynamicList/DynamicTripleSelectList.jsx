import Button from "../Button/Button";
import "./DynamicList.css";

export default function DynamicTripleSelectList({
  title,
  items,
  onAdd,
  onRemove,
  onUpdate,
  options1 = [],
  getOptions2 = () => [],
  getOptions3 = () => [],
  placeholder1 = "Выберите значение 1",
  placeholder2 = "Выберите значение 2",
  placeholder3 = "Выберите значение 3",
  label = "Элемент",
  showSecondSelect = true,
  showThirdSelect = true,
}) {
  const handleUpdate = (index, field, value) => {
    const currentItem = items[index];
    let newValue1 = currentItem.value1;
    let newValue2 = currentItem.value2 || "";
    let newValue3 = currentItem.value3 || "";

    if (field === "value1") {
      newValue1 = value;
      newValue2 = "";
      newValue3 = "";
    } else if (field === "value2") {
      newValue2 = value;
      newValue3 = "";
    } else if (field === "value3") {
      newValue3 = value;
    }

    onUpdate(index, newValue1, newValue2, newValue3);
  };

  return (
    <div className="data">
      <h3>{title}</h3>
      {items.map((item, index) => {
        const options2 = getOptions2(item.value1);
        const options3 = getOptions3(item.value1, item.value2);

        return (
          <div key={index} className="item-row">
            <select
              value={item.value1 || ""}
              onChange={(e) => handleUpdate(index, "value1", e.target.value)}
            >
              <option value="">{placeholder1}</option>
              {options1.map((option, i) => (
                <option key={i} value={option.value}>
                  {" "}
                  {option.label}
                </option>
              ))}
            </select>

            {showSecondSelect && (
              <select
                value={item.value2 || ""}
                onChange={(e) => handleUpdate(index, "value2", e.target.value)}
                disabled={!item.value1}
              >
                <option value="">{placeholder2}</option>
                {options2.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {showThirdSelect && (
              <select
                value={item.value3 || ""}
                onChange={(e) => handleUpdate(index, "value3", e.target.value)}
                disabled={!item.value2}
              >
                <option value="">{placeholder3}</option>
                {options3.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            <Button
              size="small"
              onClick={() => onRemove(index)}
              action="remove-row"
            >
              Удалить
            </Button>
          </div>
        );
      })}
      <Button size="small" onClick={onAdd} action="add-row">
        + Добавить {label.toLowerCase()}
      </Button>
    </div>
  );
}

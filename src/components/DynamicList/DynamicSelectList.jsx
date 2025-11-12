import Button from "../Button/Button";
import "./DynamicList.css";

export default function DynamicSelectList({
  title,
  items,
  onAdd,
  onRemove,
  onUpdate,
  options = [],
  placeholder = "Выберите значение",
  label = "Элемент",
}) {
  return (
    <div className="data">
      <h3>{title}</h3>
      {items.map((item, index) => (
        <div key={index} className="item-row">
          <select
            value={item.value}
            onChange={(e) => onUpdate(index, e.target.value)}
          >
            <option value="">{placeholder}</option>
            {options.map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button onClick={() => onRemove(index)} action="remove-row">
            Удалить
          </Button>
        </div>
      ))}
      <Button onClick={onAdd} action="add-row">
        + Добавить {label.toLowerCase()}
      </Button>
    </div>
  );
}

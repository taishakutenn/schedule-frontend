import Button from "../Button/Button";
import "./DynamicList.css";

export default function DynamicList({
  title,
  items,
  onAdd,
  onRemove,
  onUpdate,
  placeholder,
}) {
  return (
    <div className="data">
      <h3>{title}</h3>
      {items.map((item, index) => (
        <div key={index} className="item-row">
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdate(index, e.target.value)}
            placeholder={placeholder}
          />
          <Button
            size="small"
            onClick={() => onRemove(index)}
            action="remove-row"
          >
            Удалить
          </Button>
        </div>
      ))}
      <Button size="small" onClick={onAdd} action="add-row">
        + Добавить {title.toLowerCase().slice(0, -1)}
      </Button>
    </div>
  );
}

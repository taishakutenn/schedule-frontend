import "./FilterInput.css";

const FilterInput = ({
  label,
  placeholder,
  filter,
  onToggle,
  onValueChange,
}) => {
  return (
    <div className="filter-item">
      <label>
        <input type="checkbox" checked={filter.enabled} onChange={onToggle} />
        {label}
      </label>
      <input
        type="text"
        value={filter.value}
        onChange={onValueChange}
        placeholder={`Введите ${placeholder.toLowerCase()}`}
        className="filter-input"
        disabled={!filter.enabled}
        style={{ opacity: filter.enabled ? 1 : 0.4 }}
      />
    </div>
  );
};

export default FilterInput;

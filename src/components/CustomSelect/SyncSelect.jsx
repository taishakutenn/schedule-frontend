import Select from "react-select";
import "./select.css";

export default function SyncSelect(props) {
  const options = props.options;
  const placeholder = props.placeholder;

  return (
    <Select
      placeholder={placeholder}
      options={options}
      className="react-select"
      classNamePrefix="react-select"
      styles={{
        container: (base) => ({
          ...base,
          width: "100%",
          minWidth: 0,
        }),
      }}
    />
  );
}

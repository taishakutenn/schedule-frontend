import Select from "react-select";
import "./select.css";

export default function SyncSelect(props) {
  const options = props.options;

  return (
    <Select
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

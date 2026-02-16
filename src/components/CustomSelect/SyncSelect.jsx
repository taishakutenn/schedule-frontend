import Select from "react-select";
import "./select.css";

export default function SyncSelect(props) {
  return (
    <Select
      {...props}
      className="react-select"
      classNamePrefix="react-select"
      menuPortalTarget={document.body}
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

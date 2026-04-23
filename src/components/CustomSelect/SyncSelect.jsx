import { memo } from "react";
import Select from "react-select";
import "./select.css";

function SyncSelect(props) {
  return (
    <Select
      {...props}
      className="react-select"
      classNamePrefix="react-select"
      menuPlacement="auto"
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

export default memo(SyncSelect, (prevProps, nextProps) => {
  // Сравниваем только критичные пропсы
  return (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.isDisabled === nextProps.isDisabled &&
    // Для массивов: сравниваем по длине и первым элементам (быстро)
    // Или используйте JSON.stringify для небольших массивов
    prevProps.options?.length === nextProps.options?.length &&
    prevProps.options?.[0]?.value === nextProps.options?.[0]?.value &&
    // onChange стабилен благодаря useCallback в родителе
    prevProps.onChange === nextProps.onChange
  );
});

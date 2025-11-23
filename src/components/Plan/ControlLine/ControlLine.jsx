import "./ControlLine.css";
import { useState, useCallback, useEffect } from "react";
import FilterInput from "./FilterInput";
import Button from "../../Button/Button";

const ControlLine = ({ onFilterChange, onEditClick }) => {
  // filters states
  const [teacherFilter, setTeacherFilter] = useState({
    enabled: false,
    value: "",
  });
  const [groupFilter, setGroupFilter] = useState({ enabled: false, value: "" });
  const [subjectFilter, setSubjectFilter] = useState({
    enabled: false,
    value: "",
  });

  const handleTeacherToggle = useCallback((e) => {
    const isEnabled = e.target.checked;
    setTeacherFilter((prev) => ({
      ...prev,
      enabled: isEnabled,
      //   value: isEnabled ? prev.value : "",
    }));
  }, []);

  const handleGroupToggle = useCallback((e) => {
    const isEnabled = e.target.checked;
    setGroupFilter((prev) => ({
      ...prev,
      enabled: isEnabled,
      //   value: isEnabled ? prev.value : "",
    }));
  }, []);

  const handleSubjectToggle = useCallback((e) => {
    const isEnabled = e.target.checked;
    setSubjectFilter((prev) => ({
      ...prev,
      enabled: isEnabled,
      //   value: isEnabled ? prev.value : "",
    }));
  }, []);

  const handleTeacherChange = useCallback((e) => {
    setTeacherFilter((prev) => ({ ...prev, value: e.target.value }));
  }, []);

  const handleGroupChange = useCallback((e) => {
    setGroupFilter((prev) => ({ ...prev, value: e.target.value }));
  }, []);

  const handleSubjectChange = useCallback((e) => {
    setSubjectFilter((prev) => ({ ...prev, value: e.target.value }));
  }, []);

  useEffect(() => {
    onFilterChange({
      teacher: teacherFilter,
      group: groupFilter,
      subject: subjectFilter,
    });
  }, [teacherFilter, groupFilter, subjectFilter, onFilterChange]);

  return (
    <div className="control-line">
      <FilterInput
        label="Преподаватель"
        placeholder="преподавателя"
        filter={teacherFilter}
        onToggle={handleTeacherToggle}
        onValueChange={handleTeacherChange}
      />
      <FilterInput
        label="Группа"
        placeholder="группу"
        filter={groupFilter}
        onToggle={handleGroupToggle}
        onValueChange={handleGroupChange}
      />
      <FilterInput
        label="Предмет"
        placeholder="предмет"
        filter={subjectFilter}
        onToggle={handleSubjectToggle}
        onValueChange={handleSubjectChange}
      />
      <Button size="small" onClick={onEditClick}>
        Назначить нагрузку
      </Button>
    </div>
  );
};

export default ControlLine;

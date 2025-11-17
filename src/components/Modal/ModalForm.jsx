import { useState, useEffect } from "react";
import Modal from "./Modal";
import { formConfig } from "../../utils/formConfig";
import Button from "../Button/Button";

export default function ModalForm({
  isOpen,
  onClose,
  handbook,
  rowData = null,
  onSubmit,
  loading = false,
  error = null,
  teachersCategoryData = [],
}) {
  const [formData, setFormData] = useState({});

  const config = formConfig[handbook];

  useEffect(() => {
    if (isOpen && rowData) {
      setFormData({ ...rowData });
    } else if (isOpen && !rowData) {
      setFormData({});
    }
  }, [isOpen, rowData]);

  if (!isOpen || !config) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const filteredFormData = {};
    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key];
        if (value !== "") {
          filteredFormData[key] = value;
        }
      }
    }

    if (rowData) {
      onSubmit(filteredFormData, rowData.id, () => {
        setFormData({});
        onClose();
      });
    } else {
      onSubmit(filteredFormData, () => {
        setFormData({});
        onClose();
      });
    }
  };

  const renderField = (fieldConfig) => {
    const { name, type, placeholder, required, options } = fieldConfig;
    const value = formData[name] || "";

    switch (type) {
      case "select":
        if (name === "teacher_category" && handbook === "teachers") {
          return (
            <select
              key={name}
              name={name}
              value={value}
              onChange={handleChange}
              required={required}
            >
              <option value="" disabled>
                {placeholder || "Выберите..."}
              </option>
              {teachersCategoryData.map((cat) => (
                <option key={cat.teacher_category} value={cat.teacher_category}>
                  {cat.teacher_category}
                </option>
              ))}
            </select>
          );
        }
        if (options && Array.isArray(options)) {
          return (
            <select
              key={name}
              name={name}
              value={value}
              onChange={handleChange}
              required={required}
            >
              <option value="" disabled>
                {placeholder || "Выберите..."}
              </option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }
        console.warn(`Поле ${name} типа select не имеет опций.`);
        return (
          <input
            key={name}
            type="text"
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            required={required}
          />
        );

      default:
        return (
          <input
            key={name}
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            required={required}
          />
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        rowData
          ? `Редактировать ${
              handbook === "teachers" ? "преподавателя" : handbook
            }`
          : `Добавить ${handbook === "teachers" ? "преподавателя" : handbook}`
      }
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <div className="teacher-add-container">
          {config.fields.map(renderField)}
        </div>

        <Button type="submit" size="small" disabled={loading}>
          {loading
            ? "Отправка..."
            : rowData
            ? "Сохранить изменения"
            : "Добавить"}
        </Button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </Modal>
  );
}

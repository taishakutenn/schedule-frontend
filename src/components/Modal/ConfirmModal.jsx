// ConfirmationModal.jsx
import Modal from "./Modal";
import Button from "../Button/Button";

import "./Modal.css";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтвердите действие",
  rowData = null,
  displayFields = [],
  confirmText = "Удалить",
  cancelText = "Отменить",
  loading = false,
  children,
  confirmDisabled = false,
  message, // ← Новый пропс: кастомное сообщение
}) {
  const getMessage = () => {
    // Если передано кастомное сообщение — используем его
    if (message !== undefined) {
      return message;
    }

    // Иначе — стандартная логика удаления
    if (
      !rowData ||
      !Array.isArray(displayFields) ||
      displayFields.length === 0
    ) {
      return "Вы уверены, что хотите удалить эту запись?";
    }

    const fieldParts = displayFields.map((field) => {
      const value = rowData[field];
      return value != null ? value : "N/A";
    });

    return `Вы уверены, что хотите удалить ${fieldParts.join(" ")}?`;
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="confirmation-modal-body">
        <p>{getMessage()}</p>

        {children && (
          <div className="confirmation-modal-content">{children}</div>
        )}

        <div className="confirmation-modal-actions">
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleConfirm}
            disabled={loading || confirmDisabled}
          >
            {loading ? "Обработка..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

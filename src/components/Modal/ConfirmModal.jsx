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
}) {
  const getMessage = () => {
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
        <div className="confirmation-modal-actions">
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
            disabled={loading}
          >
            {loading ? "Удаление..." : cancelText}
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={handleConfirm}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

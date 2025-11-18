import Modal from "./Modal";
import Button from "../Button/Button";

import "./Modal.css";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтвердите действие",
  message = "Вы уверены, что хотите удалить эту запись?",
  confirmText = "Удалить",
  cancelText = "Отменить",
  loading = false,
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="confirmation-modal-body">
        <p>{message}</p>
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

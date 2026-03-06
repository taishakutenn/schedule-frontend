import { useState } from "react";
import Modal from "../Modal/Modal";
import { infoTexts } from "./infoTexts";
import "./InfoButton.css";

export default function InfoButton({ textName = "default" }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const text = infoTexts[textName] || infoTexts.default;

  return (
    <>
      <button
        className="info-button"
        onClick={handleOpen}
        aria-label="Информация"
      >
        ?
      </button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        showCloseButton={true}
        closeOnOverlayClick={true}
        closeOnEscapeClick={true}
        size="xxl"
      >
        <div className="info-text">{text}</div>
      </Modal>
    </>
  );
}

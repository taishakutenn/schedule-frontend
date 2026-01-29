import { useEffect, useRef } from "react";
import "./Modal.css";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscapeClick = true,
  size = "md", // sm, md, lg, xl, xxl
}) {
  // Реф для доступа к DOM-элементу модального окна
  const modalRef = useRef(null);
  // Реф для доступа к DOM-элементу оверлея (фона)
  const overlayRef = useRef(null);

  // Закрытие при нажатии клавиши Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscapeClick) return;

    // Обработчик нажатия клавиши Escape
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose, closeOnEscapeClick]);

  // Отключение прокрутки фона при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Установка фокуса на модальное окно при его открытии
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Обработчик клика по оверлею
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  // Не отображать ничего, если модальное окно закрыто
  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`modal-content modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
      >
        {/* Шапка модального окна отображается только если есть заголовок или кнопка закрытия */}
        {(title || showCloseButton) && (
          <header className="modal-header">
            {title && <h2 id="modal-title">{title}</h2>}
            {showCloseButton && (
              <button
                className="modal-close-button"
                onClick={onClose}
                aria-label="Закрыть"
              >
                ×
              </button>
            )}
          </header>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

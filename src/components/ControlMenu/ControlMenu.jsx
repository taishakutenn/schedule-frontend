import { useRef, useEffect } from "react";

const ContextMenu = ({ isOpen, children }) => {
  // Реф для доступа к DOM-элементу оверлея (фона)
  const overlayRef = useRef(null);

  // Обработчик клика по оверлею
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

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

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="context-overlay"
      onClick={handleOverlayClick}
    >
      {" "}
      <div className="context-menu-container">{children}</div>
    </div>
  );
};

export default ContextMenu;

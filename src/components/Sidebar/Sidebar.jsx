import { useState } from "react";
import "./sidebar.css";

const Sidebar = ({ title = "Сайдбар", children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <div className="content">{children}</div>
      </div>

      {!isOpen && (
        <button className="toggle-btn" onClick={toggleSidebar}>
          «
        </button>
      )}
    </>
  );
};

export default Sidebar;

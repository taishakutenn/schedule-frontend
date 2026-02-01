import "./sidebar.css";
import { useState } from "react";

const Sidebar = ({ title = "Сайдбар", children, tabs = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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

        {tabs.length > 0 ? (
          <div className="tab-content">{tabs[activeTab]?.content}</div>
        ) : (
          <div className="content">{children}</div>
        )}
      </div>

      {/* Вкладки отображаются только если tabs есть и сайдбар открыт */}
      {tabs.length > 0 && (
        <div className={`tab-list-vertical ${isOpen ? "sidebar-open" : ""}`}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab-button ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {!isOpen && (
        <button className="toggle-btn" onClick={toggleSidebar}>
          «
        </button>
      )}
    </>
  );
};

export default Sidebar;

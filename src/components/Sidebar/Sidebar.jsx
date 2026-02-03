import { useState, useRef, useEffect } from "react";
import "./sidebar.css";

const Sidebar = ({ title = "Сайдбар", children, tabs = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [width, setWidth] = useState("20%");
  const sidebarRef = useRef(null);
  const resizerRef = useRef(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const newWidth = Math.max(200, window.innerWidth - e.clientX);
      setWidth(`${newWidth}px`);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResizing = () => {
    isResizing.current = true;
    document.body.style.userSelect = "none";
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <div
        ref={sidebarRef}
        className={`sidebar ${isOpen ? "open" : "closed"}`}
        style={{ width }}
      >
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

        <div ref={resizerRef} className="resizer" onMouseDown={startResizing} />
      </div>

      {tabs.length > 0 && isOpen && (
        <div className="tab-list-vertical" style={{ right: width }}>
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

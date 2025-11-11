import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Index from "./pages/Index";

import Plans from "./pages/Plans";
import Schedule from "./pages/Schedule";
import Handbooks from "./pages/Handbooks";

function App() {
  return (
    <Router>
      <div className="global-box">
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/handbooks" element={<Handbooks />} />
        </Routes>
        <footer>
          <div className="container">
            <h1>Что то</h1>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

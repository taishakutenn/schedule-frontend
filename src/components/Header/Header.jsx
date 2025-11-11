import { Link } from "react-router-dom";
import Navigation from "./Navigation/Navigation";

import "./header.css";

const navItems = [
  { title: "Расписание", link: "/schedule" },
  { title: "Учебные планы", link: "/plans" },
  { title: "Хендбуки", link: "/handbooks" },
];

export default function Header() {
  return (
    <header>
      <div className="container">
        <div className="header-box">
          <h1 className="header__logo">
            <Link to="/">Schedule</Link>
          </h1>
          <Navigation items={navItems} />
          <div className="header__account-container">
            <button className="btn primary">Вход</button>
            <button className="btn daungher">Регистрация</button>
          </div>
        </div>
      </div>
    </header>
  );
}

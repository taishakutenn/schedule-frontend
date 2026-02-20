import { Link } from "react-router-dom";
import Navigation from "./Navigation/Navigation";
import Button from "../Button/Button";
import ThemeSwitcher from "./ThemeSwitcher";

import "./header.css";

const navItems = [
  { title: "Расписание", link: "/schedule" },
  { title: "Нагрузка", link: "/plans" },
  { title: "Хендбуки", link: "/handbooks" },
  { title: "Отчёты", link: "/reports" },
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
            <ThemeSwitcher></ThemeSwitcher>
            <Link to="/auth?mode=login">
              <Button>Вход</Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button>Регистрация</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

import { Link } from "react-router-dom";

export function NavigationItem({ title, link }) {
  return (
    <li>
      <Link to={link}>{title}</Link>
    </li>
  );
}

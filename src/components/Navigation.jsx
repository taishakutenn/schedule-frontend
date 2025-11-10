import { NavigationItem } from "./NavigationItem";

export default function Navigation({ items }) {
  return (
    <nav className="header__nav">
      <ul>
        {items.map((item, index) => (
          <NavigationItem
            key={index}
            title={item.title}
            link={item.link}
          />
        ))}
      </ul>
    </nav>
  );
}
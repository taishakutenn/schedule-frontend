export function NavigationItem({ title, link }) {
  return (
    <li>
      <a href={link}>{title}</a>
    </li>
  );
}
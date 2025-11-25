import { useTheme } from './ThemeContext';

const ThemeSwitcher = () => {
  const { theme, changeTheme } = useTheme();

  const handleThemeChange = (e) => {
    changeTheme(e.target.value);
  };

  return (
    <select value={theme} onChange={handleThemeChange}>
      <option value="light">Светлая</option>
      <option value="dark">Тёмная</option>
    </select>
  );
};

export default ThemeSwitcher;
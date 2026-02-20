import { useState, useEffect } from "react";
import Button from "../Button/Button";
import "./authForm.css";

/**
 * Компонент формы авторизации/регистрации
 * @param {string} initialMode - начальный режим: 'login' или 'register'
 */
export default function AuthForm({ onSubmit, onClose, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");

  // При изменении initialMode обновляем состояние
  useEffect(() => {
    setIsLogin(initialMode === "login");
  }, [initialMode]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ type: isLogin ? "login" : "register", ...formData });
  };

  // Переключение между входом и регистрацией
  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Очищаем поля при переключении
    setFormData({ email: "", password: "", confirmPassword: "", name: "" });
  };

  return (
    <div
      className={`auth-form ${isLogin ? "auth-form--login" : "auth-form--register"}`}
    >
      {/* Заголовок формы */}
      <h2 className="auth-form__title">
        {isLogin ? "Вход в систему" : "Регистрация"}
      </h2>

      <form className="auth-form__content" onSubmit={handleSubmit}>
        {/* Поля для регистрации */}
        <div className="auth-form__fields auth-form__fields--register">
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="name">
              Имя
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="auth-form__input"
              placeholder="Введите ваше имя"
              value={formData.name}
              onChange={handleChange}
              required={!isLogin}
            />
          </div>
        </div>

        {/* Общие поля для входа и регистрации */}
        <div className="auth-form__fields">
          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="auth-form__input"
              placeholder="Введите email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form__field">
            <label className="auth-form__label" htmlFor="password">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="auth-form__input"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {/* Подтверждение пароля только для регистрации */}
          <div className="auth-form__field auth-form__field--confirm">
            <label className="auth-form__label" htmlFor="confirmPassword">
              Подтвердите пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="auth-form__input"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              required={!isLogin}
              minLength={6}
            />
          </div>
        </div>

        {/* Кнопка отправки */}
        <Button
          type="submit"
          variant="primary"
          size="large"
        >
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </Button>

        {/* Переключатель режима */}
        <div className="auth-form__footer">
          <span className="auth-form__text">
            {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          </span>
          <button
            type="button"
            className="auth-form__toggle"
            onClick={toggleMode}
          >
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </button>
        </div>
      </form>
    </div>
  );
}

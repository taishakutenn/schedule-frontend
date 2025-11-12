import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  action = "click",
  onClick,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} btn--${action}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

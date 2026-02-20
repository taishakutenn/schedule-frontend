import { useSearchParams } from "react-router-dom";
import AuthForm from "../components/AuthForm/AuthForm";
import "./Auth.css";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";

  const handleSubmit = async (data) => {
    if (data.type === "login") {
      // Логика входа
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
    } else {
      // Логика регистрации
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
    }
  };

  return (
    <div className="auth-page">
      <AuthForm onSubmit={handleSubmit} initialMode={mode} />
    </div>
  );
}

import { useSessionStore } from "../../store/store";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ApiError } from "../../interfaces";

function LoginFormPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ credential?: string }>({});
  const { user, login, isLoading } = useSessionStore();

  if (user) return <Navigate to="/" replace={true}></Navigate>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      await login({ email, password });
      // On success, clear form
      setEmail("");
      setPassword("");
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errors) {
        setErrors(apiError.errors);
      } else {
        setErrors({ credential: "An unexpected error occurred" });
      }
    }
  };

  const handleInputChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setErrors({});
      setter(e.target.value);
    };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email}
          onChange={handleInputChange(setEmail)}
          placeholder="Email"
          required
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={handleInputChange(setPassword)}
          placeholder="Password"
          required
        />
      </div>
      {errors.credential && <p style={{ color: "red" }}>{errors.credential}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginFormPage;

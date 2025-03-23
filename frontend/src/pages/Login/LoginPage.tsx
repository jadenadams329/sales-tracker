import { useSessionStore } from "../../store/SessionStore";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ApiError } from "../../interfaces";
import Form from "../../components/Form/Form";
import "../../components/Form/Form.css";
import "./LoginPage.css";

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

  const handleDemoLogin = async () => {
    setErrors({});
    try {
      
      await login({ email: "demo.closer@goaptive.com", password: "password" });
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errors) {
        setErrors(apiError.errors);
      } else {
        setErrors({ credential: "An unexpected error occurred" });
      }
    }
  };

  const handleClearError = () => {
    setErrors({});
  };

  const formFields = [
    {
      name: "email",
      type: "email" as const,
      label: "Email",
      placeholder: "Enter your email",
      required: true,
      value: email,
      onChange: setEmail,
    },
    {
      name: "password",
      type: "password" as const,
      label: "Password",
      placeholder: "Enter your password",
      required: true,
      value: password,
      onChange: setPassword,
    },
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-header">Log in</h1>
        <Form
          fields={formFields}
          onSubmit={handleSubmit}
          submitButtonText="Login"
          isLoading={isLoading}
          globalError={errors.credential}
          onClearError={handleClearError}
          className="login-form"
        />
        <button onClick={handleDemoLogin} className="demo-button">
          Sign in as Demo User
        </button>
      </div>
    </div>
  );
}

export default LoginFormPage;

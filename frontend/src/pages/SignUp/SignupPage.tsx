import React from 'react'
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionStore } from '../../store/SessionStore';
import { ApiError } from '../../interfaces';
import Form from '../../components/Form';
import '../../components/Form.css';

function SignupPage() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [role, setRole] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [errors, setErrors] = useState<{ global?: string; password?: string; credential?: string }>({});
    const { user, signup, isLoading } = useSessionStore();

    if (user) return <Navigate to="/" replace={true}></Navigate>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        try {
            if (password !== confirmPassword) {
                setErrors({ password: "Passwords do not match" });
                return;
            }
            await signup({ email, password, firstName, lastName, role });
            // On success, clear form
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setFirstName("");
            setLastName("");
            setRole("");
        } catch (err) {
            const apiError = err as ApiError;
            setErrors(apiError.errors); 
        }
    };

    const handleClearError = () => {
        setErrors({});
    };
    
    const formFields = [
        {
            name: "firstName",
            type: "text" as const,
            label: "First Name",
            placeholder: "John",
            required: true,
            value: firstName,
            onChange: setFirstName,
        },
        {
            name: "lastName",
            type: "text" as const,
            label: "Last Name",
            placeholder: "Doe",
            required: true,
            value: lastName,
            onChange: setLastName,
        },
        {
            name: "email",
            type: "email" as const,
            label: "Email",
            placeholder: "john.doe@example.com",
            required: true,
            value: email,
            onChange: setEmail,
            error: errors.credential
        },
        {
            name: "role",
            type: "select" as const,
            label: "Role",
            options: [
                { value: "Admin", label: "Admin" },
                { value: "Manager", label: "Manager" },
                { value: "Closer", label: "Closer" }
            ],
            required: true,
            value: role,
            onChange: setRole,
        },
        {
            name: "password",
            type: "password" as const,
            label: "Password",
            placeholder: "********",
            required: true,
            value: password,
            onChange: setPassword,
            error: errors.password
        },
        {
            name: "confirmPassword",
            type: "password" as const,
            label: "Confirm Password",
            placeholder: "********",
            required: true,
            value: confirmPassword,
            onChange: setConfirmPassword,
            error: errors.password
        }
    ]

  return (
    <div>
      <Form 
        fields={formFields} 
        onSubmit={handleSubmit} 
        submitButtonText="Sign Up"
        isLoading={isLoading}
        globalError={errors.global}
        onClearError={handleClearError}
      />
    </div>
  )
}

export default SignupPage;

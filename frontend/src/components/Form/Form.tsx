import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface RadioOption {
  value: string;
  label: string;
}

interface FormField {
  name: string;
  type: "text" | "email" | "password" | "number" | "tel" | "textarea" | "select" | "radio";
  label?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options?: SelectOption[] | RadioOption[];
  radioGroupName?: string; // For radio buttons to group them together
}

interface FormProps {
  fields: FormField[];
  onSubmit: (e: React.FormEvent) => void;
  submitButtonText: string;
  isLoading?: boolean;
  className?: string;
  globalError?: string;
  onClearError?: () => void;
}

function Form({ fields, onSubmit, submitButtonText, isLoading = false, className = "", globalError, onClearError }: FormProps) {
  const handleInputChange = (onChange: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value);
    onClearError?.();
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "select":
        return (
          <select
            id={field.name}
            name={field.name}
            value={field.value}
            onChange={handleInputChange(field.onChange)}
            required={field.required}
            className="form-select"
          >
            <option value="">Select an option</option>
            {(field.options as SelectOption[])?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="radio-group">
            {(field.options as RadioOption[])?.map((option) => (
              <div key={option.value} className="radio-option">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.radioGroupName || field.name}
                  value={option.value}
                  checked={field.value === option.value}
                  onChange={handleInputChange(field.onChange)}
                  required={field.required}
                />
                <label htmlFor={`${field.name}-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </div>
        );

      case "textarea":
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={field.value}
            onChange={handleInputChange(field.onChange)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      default:
        return (
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={field.value}
            onChange={handleInputChange(field.onChange)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      {fields.map((field) => (
        <div key={field.name} className="form-field">
          {field.label && field.type !== "radio" && (
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
          )}
          {renderField(field)}
          {field.error && <p className="error-message">{field.error}</p>}
        </div>
      ))}
      {globalError && <p className="error-message global-error">{globalError}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : submitButtonText}
      </button>
    </form>
  );
}

export default Form;

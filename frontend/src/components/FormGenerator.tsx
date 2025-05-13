// src/components/FormGenerator.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'date' | 'checkbox' | 'password';
  options?: { value: any; label: string }[]; // pour les select
  required?: boolean;
}

export interface FormGeneratorProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({ fields, initialValues = {}, onSubmit }) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setValues(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      const target = e.target as HTMLInputElement | HTMLSelectElement;
      setValues(prev => ({
        ...prev,
        [name]: target.value,
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(field => (
        <div key={field.name} className="flex flex-col">
          <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
            {field.label}{field.required && ' *'}
          </label>
          {field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={values[field.name] ?? ''}
              onChange={handleChange}
              className="mt-1 rounded border px-3 py-2 focus:outline-none focus:ring"
            >
              <option value="">-- Sélectionner --</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              value={field.type === 'checkbox' ? undefined : (values[field.name] ?? '')}
              checked={field.type === 'checkbox' ? Boolean(values[field.name]) : undefined}
              onChange={handleChange}
              className="mt-1 rounded border px-3 py-2 focus:outline-none focus:ring"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Enregistrer
      </button>
    </form>
  );
};

export default FormGenerator;
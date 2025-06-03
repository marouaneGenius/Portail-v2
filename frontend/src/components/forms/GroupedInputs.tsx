import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'email'; // Ajoute les types nécessaires
  value: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  options?: Option[]; // Seulement pour type select
  required?: boolean;
}

interface GroupedInputsProps {
  fields: FieldConfig[];
}

const GroupedInputs: React.FC<GroupedInputsProps> = ({ fields }) => {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label htmlFor={field.name} className="mb-1 font-medium">
            {field.label}
          </label>

          {field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              required={field.required}
              className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border color-border"
            >
              <option value="">—</option>
              {field.options?.map((opt) => (
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
              value={field.value}
              onChange={field.onChange}
              required={field.required}
              className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border color-border"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupedInputs;

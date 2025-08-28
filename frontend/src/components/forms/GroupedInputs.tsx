/* GroupedInputs.tsx */
import { Switch } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FIXED_END_DATE } from '../../mocks/constants';

interface Option {
  value: string | number;
  label: string;
}

interface FieldConfig {
  name     : string;
  description?: string;
  label    : string;
  type     : 'text' | 'date' | 'number' | 'select' | 'email';
  value    : any;
  onChange : (e: React.ChangeEvent<any>) => void;
  options ?: Option[];
  required?: boolean;
  min?: string;
  max?: string;
  hidden?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  defaultValue?: string | any;
}

interface GroupedInputsProps {
  fields: FieldConfig[];
  defaultOpen?: boolean; 
}

const GroupedInputs: React.FC<GroupedInputsProps> = ({ fields, defaultOpen }) => {
  const [open, setOpen] = useState<boolean>(true);
  const hasOffreField = fields.some(field => field.name === 'offer_amount');

  const toggle = () => setOpen(o => !o);

  useEffect(() => { 
    if (hasOffreField) {
      setOpen(false);
    }
  }, [defaultOpen]);

  return (
    <div className="space-y-4 bg-white/80 rounded-xl p-6 ">
      {/* {hasOffreField && defaultOpen && (
        <div className="bg-hello-yellow/10 flex items-center px-4 py-2 rounded-xl mb-2">
          <p className="text-mister-anthracite font-medium flex-1">
            Est-ce qu'une offre a été effectuée ?
          </p>
          <Switch
            checked={open}
            onChange={toggle}
            color="primary"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#FEC601',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#FEC601',
              },
            }}
          />
        </div>
      )} */}
      { fields
        .filter(f => !f.hidden)
        .map((field) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label
              htmlFor={field.name}
              className="mb-1 font-semibold text-mister-anthracite"
            >
              {field.label}{field.required && <span className="text-crazy-magenta">*</span>}
            </label>
            <p className='text-xs text-gray-400'>{field.description}</p>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                required={field.required}
                disabled={field.disabled}
                className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm"
              >
                <option value="">—</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                min={field.min}
                max={field.max}
                disabled={field.disabled}
                readOnly={field.readOnly}
                defaultValue={field.defaultValue}
                className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite placeholder:text-mister-anthracite/40 transition shadow-sm"
                placeholder={field.label}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default GroupedInputs;

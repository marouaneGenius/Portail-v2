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
  label    : string;
  type     : 'text' | 'date' | 'number' | 'select' | 'email';
  value    : any;
  onChange : (e: React.ChangeEvent<any>) => void;
  options ?: Option[];
  required?: boolean;
  /* NEW  ↓  passer un min / max ou disabled si besoin */
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
  const hasOffreField = fields.some(field => field.name === 'offer_amount' ? true : false);

  const toggle = () => {
    if (open) {
      setOpen(true)
    } else {
      setOpen(false)
    }
    setOpen(o => !o);
  };

  useEffect(() => { 
    if(hasOffreField) {
      setOpen(false)
    }
  },[defaultOpen]);

  return (
    <div className="space-y-4">
      {
        hasOffreField &&  defaultOpen && <div className='bg-gray-100 flex items-center px-4 py-2 rounded'>
          <p>Est-ce qu'une offre a été effectuée ?</p>
          <Switch
              checked={open}
              onChange={toggle}
              color="primary"
            />
        </div>
      }  
      {open && fields
        .filter(f => !f.hidden)            
        .map((field) => (
        <div key={field.name} className="flex flex-col">
          <label htmlFor={field.name} className="mb-1 font-medium">
            {field.label}{field.required && ' *'}
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
              className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border color-border"
              min={field.min}
              max={field.max}
              disabled={field.disabled}
              readOnly={field.readOnly}
              defaultValue={field.defaultValue} // exemple de valeur par défaut pour la date de fin d'abonnement
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default GroupedInputs;

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import api from '../api/aixos';
import { SchoolSubjectOptions } from '../mocks/SchoolSubjects';
import { parentFields } from '../forms/schemas';
import {renameFields } from '../services/functions';


export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'date' | 'checkbox' | 'password';
  options?: { value: any; label: string }[]; // pour les select
  required?: boolean;
  className?: String;
}

export interface FormGeneratorProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  endpoint?:String;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({ fields, initialValues = {}, onSubmit, endpoint }) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [currentFields, setFields] = useState(fields);
  const [roleFieldValue, useRoleFieldValue] = useState<Boolean>(false);
  const [currenParentFields, setCurrenParentFields] = useState(parentFields);
  const [emptyFields, useEmptyFields] = useState<Boolean>(Object.keys(initialValues).length === 0);
  const [loading, setLoading] = useState(true);
  const optionalFields = ['siret', 'max_session', 'price_per_hour'];

  useEffect(() => {
    const hasRoleField = fields.find((item:any) => item.name === 'role');
    const hasClassField = fields.find((item:any) => item.name === 'class');

    if(hasRoleField) {
      const filteredFields = currentFields.filter((item) => !optionalFields.includes(item.name))
      setFields(filteredFields)
    }

    if(roleFieldValue) {
      setFields(fields)
    }

    // For all forms to remove required for all fields to update only wanted fields
    if(emptyFields) {
      const fieldWithOutRequired = currentFields.map(({ required, ...rest }) => rest);
      setFields(fieldWithOutRequired)
    }

    // For student form tu add centers ans classes dynamically
    if(hasClassField) {
      let fieldWithOutRequired :any = [];
      setLoading(true)
      api.get<{ id: number; name: string }[]>('/api/center')
      .then((res) => {
        const centerOptions = res.data.map(c => ({
          value: String(c.id),
          label: c.name,
        }));

        if(Object.keys(initialValues).length !== 0) {
          fieldWithOutRequired = currentFields.map(({ required, ...rest }) => rest);
        } else {
          fieldWithOutRequired = currentFields
        }

        const updatedFields: FormField[] = fieldWithOutRequired.map((f:any) => {
          if (f.name === 'id_center') {
            return { ...f, options: centerOptions };
          }
          if(f.name === 'class'){
            return { ...f, options: SchoolSubjectOptions };
          }
          return f as FormField;
        });
        setFields(updatedFields);
      })
      .catch((err) => {
        console.error('Erreur fetch centres', err);
      })
      .finally(() => {
        setLoading(false);
      });

      const filteredFields = currentFields.filter((item) => !optionalFields.includes(item.name))
      setFields(filteredFields)
    } else {
      setLoading(false)
    }
  }, [fields, roleFieldValue])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked }:any = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if(type === "select-one"){
      if(value === 'ROLE_TUTOR') {
        useRoleFieldValue(true)
      } else {
        useRoleFieldValue(false)
      }
    } 
  };

  useEffect(() => {
    if(endpoint === 'student' && emptyFields) {
      const withParentKeys:any = renameFields (currenParentFields);
      console.log(withParentKeys)
      setCurrenParentFields(withParentKeys)
    }

  }, [emptyFields, endpoint])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  if (loading) {
    return <p>Chargement …</p>;
  }

  return (
    <div className="p-4 flex items-center justify-center">
      <div className="bg-white w-3/5 p-3 rounded shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentFields.map((f:any) => (
              <div key={f.name} className={f.className ?? ''}>
                <label
                  htmlFor={f.name}
                  className="block text-sm font-medium mb-1"
                >
                  {f.label}
                </label>

                {f.type === 'select' ? (
                  <select
                    id={f.name}
                    name={f.name}            
                    value={values[f.name] || ''}
                    onChange={handleChange}   
                    className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300"
                    required={!!f.required}
                  >
                    <option value="">—</option>
                    {(f.options || []).map((opt:any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={f.name}
                    name={f.name}             
                    type={f.type}
                    checked={f.type === 'checkbox' ? values[f.name] : undefined}
                    value={f.type !== 'checkbox' ? values[f.name] || '' : undefined}
                    onChange={handleChange}   
                    className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300"
                    required={!!f.required}
                  />
                )}
              </div>
            ))}

            {
              endpoint === 'student' && emptyFields &&
              (
                <h1 className='col-span-2 text-xl bg-orange-100 p-2 text-center rounded my-2 border-orange-300 border-2'>Ajouter le Parent</h1>
              )
            }

            {
              endpoint === 'student' && emptyFields && currenParentFields.map((f:any) => (
                <div key={f.name} className={f.className ?? ''}>
                  <label
                    htmlFor={f.name}
                    className="block text-sm font-medium mb-1"
                  >
                    {f.label}
                  </label>
  
                  {f.type === 'select' ? (
                    <select
                      id={f.name}
                      name={f.name}            
                      value={values[f.name] || ''}
                      onChange={handleChange}   
                      className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300"
                      required={!!f.required}
                    >
                      <option value="">—</option>
                      {(f.options || []).map((opt:any) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={f.name}
                      name={f.name}             
                      type={f.type}
                      checked={f.type === 'checkbox' ? values[f.name] : undefined}
                      value={f.type !== 'checkbox' ? values[f.name] || '' : undefined}
                      onChange={handleChange}   
                      className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300"
                      required={!!f.required}
                    />
                  )}
                </div>  
              ))
            }
          </div>

          <div className="mt-6 flex items-center justify-center">
            <button
              type="submit"
              className="md:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormGenerator;
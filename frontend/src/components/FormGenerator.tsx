import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import api from '../api/aixos';
import { Days, SchoolSubjectOptions } from '../mocks/SchoolSubjects';
import { parentFields } from '../forms/schemas';
import {renameFields } from '../services/functions';
import { ScheduleArrayField } from './forms/TutorScheduleForm';
import { getCenters } from '../api/api';
import { MultiSelectNoCtrl } from './forms/customInput';
import { useParams } from 'react-router-dom';


export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'date' | 'checkbox' | 'password' | 'radio' | 'time' | 'array';
  options?: { value: any; label: string }[]; // pour les select
  required?: boolean;
  className?: String;
  multiple?:boolean;
}

export interface FormGeneratorProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  endpoint?:String;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({ fields, initialValues = {}, onSubmit, endpoint }) => {

  const defaultValues = endpoint === "user" ? {
    centers: [],            
    ...initialValues,
  }: {...initialValues};

  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [currentFields, setFields] = useState(fields);
  const [roleFieldValue, useRoleFieldValue] = useState<Boolean>(false);
  const [currenParentFields, setCurrenParentFields] = useState(parentFields);
  const [emptyFields, useEmptyFields] = useState<Boolean>(Object.keys(initialValues).length === 0);
  const [loading, setLoading] = useState(true);
  const optionalFields = ['siret', 'max_session', 'price_per_hour', 'centers'];
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const hasRoleField = fields.find((item:any) => item.name === 'role');
    const hasClassField = fields.find((item:any) => item.name === 'class');

    // show optional fields if we chose tutor role
    if(hasRoleField) {
      const filteredFields = currentFields.filter((item) => !optionalFields.includes(item.name));
      if(roleFieldValue) {
        setFields(fields)
      } else {
        setFields(filteredFields)
      }
    } 

    // For all forms to remove required for all fields to update only wanted fields

    if (!emptyFields) {
      // Retirer la propriété 'required' des champs actuels
      const fieldsWithoutRequired = currentFields.map(({ required, ...rest }) => rest);
    
      // Récupérer les centres et mettre à jour les options si nécessaire
      getCenters().then((res) => {
        const centerOptions = res.map((c: any) => ({
          value: String(c.id),
          label: c.name,
        }));
    
        const updatedFields: FormField[] = fieldsWithoutRequired.map((f: any) => {
          if (f.name === 'centers') {
            return { ...f, options: centerOptions };
          }
          return f as FormField;
        });
    
        setFields(updatedFields);
      });
    }

    // For student form tu add centers ans classes dynamically
    if(hasClassField) {
      let fieldWithOutRequired :any = [];
      try {
        // on suppose que getCenters() renvoie une Promise<{ id: number; name: string }[]>
        getCenters().then((res) => {
          const centerOptions = res.map((c:any) => ({
            value: String(c.id),
            label: c.name,
          }));

          if(Object.keys(initialValues).length !== 0) {
              fieldWithOutRequired = currentFields.map(({ required, ...rest }) => rest);
          } else {
            fieldWithOutRequired = currentFields
          }
  
          // on injecte nos options centre & class
          const updatedFields: FormField[] = fieldWithOutRequired.map((f: any) => {
            if (f.name === 'id_center') {
              return { ...f, options: centerOptions };
            }
            if (f.name === 'class') {
              return { ...f, options: SchoolSubjectOptions };
            }
            return f as FormField;
          });
          setFields(updatedFields);
        })
        // on recrée le tableau de champs sans la clef `required` si on est en update
      } catch (err) {
        console.error('Erreur fetch centres', err);
      } finally {
        setLoading(false);
      }

      const filteredFields = currentFields.filter((item) => !optionalFields.includes(item.name))
      setFields(filteredFields)
    } 
    
    setLoading(false)
  }, [fields, roleFieldValue]);

  const removeCenter = (centerValue: string) => {
    setValues((prev) => ({
      ...prev,
      centers: (prev.centers as string[]).filter((c) => c !== centerValue),
    }));
  };

  const handleChange = ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked,  options }:any = e.target ;
    const multiple = e.target.multiple ;

    setValues(prev => ({
      ...prev,
      [name]: multiple
        ? Array.from(options)
            .filter((opt:any) => opt.selected)
            .map((opt:any) => opt.value)
        : type === 'checkbox'
        ? checked
        : value,
    }));

    if(type === "select-one" && name === "role"){
      if(value === 'ROLE_TUTOR') {
        let fieldWithOutRequired :any = fields;
        useRoleFieldValue(true)
        getCenters().then((res) => {
          const centerOptions = res.map((c:any) => ({
            value: String(c.id),
            label: c.name,
          }));
          const updatedFields: FormField[] = fieldWithOutRequired.map((f: any) => {
            if(f.name === 'centers') {
              return { ...f, options: centerOptions };
            }
            return f as FormField;
          });
        setFields(updatedFields);
        })
      } else {
        useRoleFieldValue(false)
      }
    } 
  };

  useEffect(() => {
    if(endpoint === 'student' && emptyFields) {
      const withParentKeys:any = renameFields (currenParentFields);
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

            {endpoint !== 'tutorschedule' && currentFields.map((f:any) => (
              <div key={f.name} className={f.className ?? ''}>
                <label
                  htmlFor={f.name}
                  className="block text-sm font-medium mb-1 bg-border h-10 p-2 border-b-2  my-2 text-lg"
                >
                  {f.label}
                </label>
                {values.centers && f.name === 'centers' && f.multiple ? (
                    <>
                      {
                       f.options && <MultiSelectNoCtrl
                        options={f.options!}
                        values={values.centers as string[]}
                        onChange={(newVals) =>
                          setValues((prev) => ({ ...prev, centers: newVals }))
                        }
                      />
                      }
                      <div className="flex flex-wrap gap-2 mt-2 bg-gray-100">
                        {values[f.name] &&
                          Array.isArray(values[f.name]) &&
                          values[f.name].map((val: any) => {
                            if (f.options) {
                              const option = f.options.find((o: any) => o.value === (val.value || val));
                              const label =
                                option?.label || (typeof val === 'object' ? val.label || val.name || JSON.stringify(val) : val);
                              const key = typeof val === 'object' ? val.id || val.value : val;
                              return (
                                <div
                                  key={key}
                                  className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
                                >
                                  {label}
                                  <button
                                    type="button"
                                    onClick={() => removeCenter(val)}
                                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                                  >
                                    &times;
                                  </button>
                                </div>
                              );
                            }
                            return null; // ensure a return statement
                          })}
                      </div>
                    </>
                  ) : f.type === 'select' ? (
                    <select
                    id={f.name}
                    name={f.name}            
                    value={ 
                      f.multiple 
                        ? values[f.name] ?? []     // un tableau pour le multiple
                        : values[f.name] || ''     // une string sinon
                    }

                    onChange={handleChange}   
                    className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border color-border"
                    required={!!f.required && !f.multiple}
                    multiple={!!f.multiple}
                  >
                    {!f.multiple && <option value="">—</option>}
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
                    className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border color-border"
                    required={!!f.required}
                  />
                  )}
              </div>
            ))}

            { endpoint === 'student' && emptyFields && (
                <h1 className='col-span-2 text-xl bg-border p-2 text-center rounded my-3 border-b-2  '>Ajouter le Parent</h1>
            )}

            { endpoint === 'student' && emptyFields && currenParentFields.map((f:any) => (
                <div key={f.name} className={f.className ?? ''}>
                  <label
                    htmlFor={f.name}
                    className="block text-sm font-medium mb-1 bg-border h-10 p-2 border-b-2 my-2 text-lg"
                  >
                    {f.label}
                  </label>
  
                  {f.type === 'select' ? (
                    <select
                      id={f.name}
                      name={f.name}            
                      value={values[f.name] || ''}
                      onChange={handleChange}   
                      className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border color-border"
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
                      className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border color-border"

                      required={!!f.required}
                    />
                  )}
                </div>  
            ))}
          
          </div>
          {endpoint === 'tutorschedule' && (
            <ScheduleArrayField
              dayOptions={Days}
              initialSchedules={values.schedules}
              onChange={(schedules) => setValues({ ...values, schedules })}
              id={id}
            />
          )}

          <div className="mt-6 flex items-center justify-center">
            <button
              type="submit"
              className="w-full bg-white-600 text-color px-6 py-2 rounded hover:bg border-2 border"
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
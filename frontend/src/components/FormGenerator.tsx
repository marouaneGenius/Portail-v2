import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import api from '../api/aixos';
import { Days, SchoolSubjectOptions } from '../mocks/SchoolSubjects';
import { parentFields } from '../forms/schemas';
import {renameFields } from '../services/functions';
import { ScheduleArrayField } from './forms/TutorScheduleForm';
import { getCenters } from '../api/api';
import { MultiSelectNoCtrl } from './forms/customInput';
import { HiEye, HiEyeOff } from 'react-icons/hi';


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
  const defaultValues = {
    centers: [],
    ...initialValues,
  };

  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [currentFields, setFields] = useState(fields);
  const [roleFieldValue, useRoleFieldValue] = useState<Boolean>(false);
  const [currenParentFields, setCurrenParentFields] = useState(parentFields);
  const [emptyFields, useEmptyFields] = useState<Boolean>(Object.keys(initialValues).length === 0);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const optionalFields = ['siret', 'max_session', 'price_per_hour', 'centers'];

  useEffect(() => {
    const hasRoleField = fields.find((item: any) => item.name === 'role');
    const hasClassField = fields.find((item: any) => item.name === 'class');

    if (hasRoleField) {
      const filteredFields = currentFields.filter((item) => !optionalFields.includes(item.name));
      if (roleFieldValue) {
        setFields(fields);
      } else {
        setFields(filteredFields);
      }
    }

    if (!emptyFields) {
      const fieldWithOutRequired = currentFields.map(({ required, ...rest }) => rest);
      setFields(fieldWithOutRequired);
    }

    if (hasClassField) {
      let fieldWithOutRequired: any = [];
      getCenters()
        .then((res) => {
          const centerOptions = res.map((c: any) => ({
            value: String(c.id),
            label: c.name,
          }));

          if (Object.keys(initialValues).length !== 0) {
            fieldWithOutRequired = currentFields.map(({ required, ...rest }) => rest);
          } else {
            fieldWithOutRequired = currentFields;
          }

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
        .catch((err) => console.error('Erreur fetch centres', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fields, roleFieldValue]);

  const removeCenter = (centerValue: string) => {
    setValues((prev) => ({
      ...prev,
      centers: (prev.centers as string[]).filter((c) => c !== centerValue),
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked, options }: any = e.target;
    const multiple = e.target.multiple;

    setValues((prev) => ({
      ...prev,
      [name]: multiple
        ? Array.from(options).filter((opt: any) => opt.selected).map((opt: any) => opt.value)
        : type === 'checkbox'
        ? checked
        : value,
    }));

    if (type === 'select-one' && name === 'role') {
      if (value === 'ROLE_TUTOR') {
        useRoleFieldValue(true);
        getCenters().then((res) => {
          const centerOptions = res.map((c: any) => ({
            value: String(c.id),
            label: c.name,
          }));
          const updatedFields: FormField[] = fields.map((f: any) => {
            if (f.name === 'centers') {
              return { ...f, options: centerOptions };
            }
            return f;
          });
          setFields(updatedFields);
        });
      } else {
        useRoleFieldValue(false);
      }
    }
  };

  useEffect(() => {
    if (endpoint === 'student' && emptyFields) {
      const withParentKeys: any = renameFields(currenParentFields);
      setCurrenParentFields(withParentKeys);
    }
  }, [emptyFields, endpoint]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  if (loading) return <p>Chargement …</p>;

  return (
    <div className="p-4 flex items-center justify-center">
      <div className="bg-[#FFFFFF] w-3/5 p-6 rounded shadow-lg border border-[#F2F2F2]">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {endpoint !== 'tutorschedule' &&
              currentFields.map((f: any) => (
                <div key={f.name} className={f.className ?? ''}>
                  <label
                    htmlFor={f.name}
                    className="block text-sm font-semibold text-[#333333] mb-1 px-1 py-1 rounded"
                  >
                    {f.label}
                  </label>

                  {/* Mot de passe avec visibilité */}
                  {f.type === 'password' ? (
                    <div className="relative">
                      <input
                        id={f.name}
                        name={f.name}
                        type={showPassword[f.name] ? 'text' : 'password'}
                        value={values[f.name] || ''}
                        onChange={handleChange}
                        className="w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333] pr-10"
                        required={!!f.required}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FFB800]"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            [f.name]: !prev[f.name],
                          }))
                        }
                        aria-label={showPassword[f.name] ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword[f.name] ? (
                          <HiEyeOff className="w-5 h-5" />
                        ) : (
                          <HiEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  ) : f.name === 'centers' && f.multiple ? (
                    <>
                      {f.options && (
                        <MultiSelectNoCtrl
                          options={f.options!}
                          values={values.centers as string[]}
                          onChange={(newVals) =>
                            setValues((prev) => ({ ...prev, centers: newVals }))
                          }
                        />
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(values[f.name] as string[]).map((val) => {
                          const label = f.options!.find((o: any) => o.value === val)?.label || val;
                          return (
                            <div
                              key={val}
                              className="inline-flex items-center bg-[#F2F2F2] text-[#333333] px-3 py-1 rounded-full"
                            >
                              {label}
                              <button
                                type="button"
                                onClick={() => removeCenter(val)}
                                className="ml-2 text-[#FF1585] hover:text-[#FFB800]"
                              >
                                &times;
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : f.type === 'select' ? (
                    <select
                      id={f.name}
                      name={f.name}
                      value={f.multiple ? values[f.name] ?? [] : values[f.name] || ''}
                      onChange={handleChange}
                      className="w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333]"
                      required={!!f.required && !f.multiple}
                      multiple={!!f.multiple}
                    >
                      {!f.multiple && <option value="">—</option>}
                      {(f.options || []).map((opt: any) => (
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
                      className="w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333]"
                      required={!!f.required}
                    />
                  )}
                </div>
              ))}

            {endpoint === 'student' && emptyFields && (
              <>
                <h1 className="col-span-2 text-xl font-semibold bg-[#F2F2F2] text-center rounded p-2 border-b-2 border-[#FFB800] my-3">
                  Ajouter le Parent
                </h1>

                {currenParentFields.map((f: any) => (
                  <div key={f.name} className={f.className ?? ''}>
                    <label
                      htmlFor={f.name}
                      className="block text-sm font-semibold text-[#333333] mb-1 bg-[#F2F2F2] px-2 py-2 rounded"
                    >
                      {f.label}
                    </label>
                    {f.type === 'select' ? (
                      <select
                        id={f.name}
                        name={f.name}
                        value={values[f.name] || ''}
                        onChange={handleChange}
                        className="w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333]"
                        required={!!f.required}
                      >
                        <option value="">—</option>
                        {(f.options || []).map((opt: any) => (
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
                        className="w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333]"
                        required={!!f.required}
                      />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

          {endpoint === 'tutorschedule' && (
            <ScheduleArrayField
              dayOptions={Days}
              initialSchedules={values.schedules}
              onChange={(schedules) => setValues({ ...values, schedules })}
            />
          )}

          <div className="mt-6 flex items-center justify-center">
            <button
              type="submit"
              className="w-full bg-[#FFB800] text-[#333333] font-semibold px-6 py-3 rounded hover:bg-[#F2F2F2] border border-[#FFB800] transition"
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
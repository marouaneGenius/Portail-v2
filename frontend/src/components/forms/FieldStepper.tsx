import React, { ChangeEvent, useEffect, useState } from 'react';
import { FormField } from '../FormGenerator';
import { MultiSelectNoCtrl, MultiSelectWrapper, RenderField } from './customInput';
import { TutorRaw } from '../../services/planing-functions';
import api from '../../api/aixos';
import { AlertMessage } from '../Alert';
import { TutorAvailabilityPicker } from '../subscriptions/TutorAvailabilityPicker';

interface Props {
  title: string;
  fields: FormField[];
  onBack: () => void;
  onNext: (section: string, values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  isLast: boolean;
  showAllFields?: boolean; // Nouveau prop pour afficher tous les champs ensemble
}

const FieldStepper: React.FC<Props> = ({ title, fields, onBack, onNext, initialValues = {}, isLast, showAllFields = false }) => {
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [touched, setTouched] = useState(false);
  const current = fields[index];
  const isFirst = index === 0;
  const isFinalField = index === fields.length - 1;
  const value = values[current.name];
  const [showError, setShowError] = useState(false);
  const todayISO = new Date().toISOString().split('T')[0];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked, options }: any = e.target;
    const multiple = e.target.multiple;

    setValues(prev => ({
      ...prev,
      [name]: multiple
        ? Array.from(options)
            .filter((opt: any) => opt.selected)
            .map((opt: any) => opt.value)
        : type === 'checkbox'
        ? checked
        : value,
    }));
  };


  useEffect(() => {
    if (index >= fields.length) {
      setIndex(0);
    }
  }, [index, fields.length]);

  const required = Boolean(
    current &&
      (current.required 
        ||  (current.name === 'subscription_end_date' && !values.subscription_start_date)
        ||  (current.name === 'first_debit_date' && !values.recurrent_debit_date))

  );

  // check si le champ requis est vide
  const isRequiredAndEmpty = required && (
    // Validation spéciale pour le champ stage_config
    title === 'Stage' && current.name === 'stage_config' 
      ? values.stage_config_valid !== true
      : (value === undefined || value === '' || (Array.isArray(value) && value.length === 0))
  );

  useEffect(() => {
    if (index && values && Object.keys(values).length > 0) {
      setIndex(0);
    }
  }, [fields]);


  useEffect(() => {
    if(values.recurrent_debit_date && !values.first_debit_date){
      setValues((prev) => ({
        ...prev,
        first_debit_date: todayISO,
      }));
    }

  }, [values]);

  useEffect(() => {
    // title OU fields si c’est plus fiable
    setValues(initialValues ?? {});
    setIndex(0);
    setTouched(false);
  }, [title]);


  const next = () => {
    if (isRequiredAndEmpty) return;
  
    // console.log(values)
    if (isFinalField) {
      onNext(title, structuredClone(values));
      setValues({});
    } else {
      setIndex(i => i + 1);
      setTouched(false);
    }
  };

  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const removeValueFromField = (field: any, value: any) => {
    setValues((prev: any) => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? prev[field].filter((v: any) => (typeof v === 'object' ? v.value || v.id : v) !== (typeof value === 'object' ? value.value || value.id : value))
        : prev[field],
    }));
  };

  if (loading) {
    return <p>Chargement…</p>;
  }

  // Mode affichage de tous les champs ensemble
  if (showAllFields) {
    const allFieldsValid = fields.every(field => {
      const fieldValue = values[field.name];
      const fieldRequired = field.required;
      
      // Validation spéciale pour les stages
      if (title === 'Stage' && field.name === 'stage_config') {
        return values.stage_config_valid === true;
      }
      
      return !fieldRequired || (fieldValue !== undefined && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0));
    });

    const nextAllFields = () => {
      if (allFieldsValid) {
        onNext(title, structuredClone(values));
        setValues({});
      }
    };

    return (
      <div className="p-6 bg-white/80 rounded-2xl shadow-lg w-3/4 border border-fading-grey mx-auto">
        {showError && <AlertMessage message={'Un problème est survenu lors du chargement des créneaux !'} />}
        <h2 className="text-2xl font-bold mb-6 text-mister-anthracite">{title}</h2>
        
        <div className="space-y-6">
          {fields.map((field) => {
            const fieldValue = values[field.name];
            const fieldRequired = field.required;
            const fieldEmpty = fieldRequired && (fieldValue === undefined || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0));
            
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-base font-semibold text-mister-anthracite">
                  {field.label} {field.required && <span className="text-crazy-magenta">*</span>}
                </label>
                
                <RenderField
                  f={field}
                  values={values}
                  setValues={setValues}
                  removeValueFromField={removeValueFromField}
                  handleChange={handleChange}
                  fieldName={field.name}
                  title={title}
                />
                
                {fieldEmpty && touched && (
                  <p className="text-crazy-magenta text-sm">Ce champ est requis.</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-xl bg-fading-grey text-mister-anthracite font-semibold hover:bg-hello-yellow/40 transition"
          >
            Retour
          </button>

          <button
            onClick={nextAllFields}
            disabled={!allFieldsValid}
            className={`px-8 py-2 rounded-xl font-bold transition text-lg flex items-center gap-2 shadow
              ${!allFieldsValid
                ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-hello-yellow text-mister-anthracite hover:bg-crazy-magenta hover:text-white'}
            `}
          >
            {isLast ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    );
  }

  // Mode original (un champ à la fois)
  return (
    <div className="p-4 bg-white/80 rounded-2xl shadow-lg w-3/4 border border-fading-grey mx-auto">
      {showError && <AlertMessage message={'Un problème est survenu lors du chargement des créneaux !'} />}
      <h2 className="text-2xl font-bold mb-2 text-mister-anthracite">{title}</h2>
      <p className="text-sm text-mister-anthracite/60 mb-4">
        Champ <span className="font-semibold">{index + 1}</span> sur <span className="font-semibold">{fields.length}</span>
      </p>

      <label className="block text-base font-semibold mb-1 text-mister-anthracite">
        {current.label} {current.required && <span className="text-crazy-magenta">*</span>}
      </label>

      <RenderField
        f={current}
        values={values}
        setValues={setValues}
        removeValueFromField={removeValueFromField}
        handleChange={handleChange}
        fieldName={current.name}
        title={title}
      />

      {isRequiredAndEmpty && touched && (
        <p className="text-crazy-magenta text-sm mt-1">Ce champ est requis.</p>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={isFirst ? onBack : prev}
          className="px-6 py-2 rounded-xl bg-fading-grey text-mister-anthracite font-semibold hover:bg-hello-yellow/40 transition"
        >
          {isFirst ? 'Retour' : 'Précédent'}
        </button>

        <button
          onClick={next}
          disabled={isRequiredAndEmpty}
          className={`px-8 py-2 rounded-xl font-bold transition text-lg flex items-center gap-2 shadow
            ${isRequiredAndEmpty
              ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-hello-yellow text-mister-anthracite hover:bg-crazy-magenta hover:text-white'}
          `}
        >
          {isFinalField ? (isLast ? 'Terminer' : 'Suivant abonnement') : 'Suivant'}
        </button>
      </div>
    </div>
  );
};

export default FieldStepper;

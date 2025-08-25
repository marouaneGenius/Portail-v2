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
}

const FieldStepper: React.FC<Props> = ({ title, fields, onBack, onNext, initialValues = {}, isLast }) => {
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [touched, setTouched] = useState(false);
  const current:any = fields[index];
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
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
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
    // Réinitialiser quand on change d'étape (title)
    setValues(initialValues ?? {});
    setIndex(0);
    setTouched(false);
  }, [title]);

  // Mettre à jour les valeurs quand les initialValues changent (retour en arrière)
  useEffect(() => {
    if (Object.keys(initialValues ?? {}).length > 0) {
      setValues(initialValues);
    }
  }, [JSON.stringify(initialValues)]);


  const next = () => {
    if (isRequiredAndEmpty) return;
  
    // console.log(values)
    if (isFinalField) {
      onNext(title, structuredClone(values));
      // Ne pas vider les values ici, elles seront réinitialisées par le useEffect ci-dessous
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

  return (
    <div className="p-8 bg-white rounded-3xl shadow-2xl w-full border-2 border-hello-yellow/20 max-w-2xl mx-auto relative overflow-hidden">
      {/* Gradient de fond décoratif */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-hello-yellow/10 to-crazy-magenta/10 rounded-full -translate-y-16 translate-x-16"></div>
      
      {showError && <AlertMessage message={'Un problème est survenu lors du chargement des créneaux !'} />}
      
      {/* Header amélioré */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-crazy-magenta rounded-full"></div>
          <h2 className="text-3xl font-bold text-mister-anthracite capitalize">{title}</h2>
        </div>
        
        {/* Indicateur de progression du champ */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium text-mister-anthracite/70">
            Question {index + 1} sur {fields.length}
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-hello-yellow to-crazy-magenta h-1 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / fields.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs text-mister-anthracite/50">
            {Math.round(((index + 1) / fields.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Label amélioré */}
      <div className="mb-6">
        <label className="block text-lg font-semibold mb-2 text-mister-anthracite">
          {current.label} 
          {current.required && <span className="text-crazy-magenta ml-1">*</span>}
        </label>
        
        {/* Description du champ si disponible */}
        {current.description && (
          <p className="text-sm text-mister-anthracite/60 bg-gray-50 p-3 rounded-xl border-l-4 border-hello-yellow">
            {current.description}
          </p>
        )}
      </div>

      <RenderField
        f={current}
        values={values}
        setValues={setValues}
        removeValueFromField={removeValueFromField}
        handleChange={handleChange}
        fieldName={current.name}
        title={title}
      />

      {/* Message d'erreur amélioré */}
      {isRequiredAndEmpty && touched && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <p className="text-red-600 text-sm font-medium">Ce champ est requis pour continuer.</p>
        </div>
      )}

      {/* Boutons améliorés */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={isFirst ? onBack : prev}
          className="px-6 py-3 rounded-2xl bg-gray-100 text-mister-anthracite font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {isFirst ? 'Retour' : 'Précédent'}
        </button>

        <button
          onClick={() => {
            setTouched(true);
            next();
          }}
          disabled={isRequiredAndEmpty}
          className={`px-8 py-3 rounded-2xl font-bold transition-all duration-200 text-lg flex items-center gap-2 shadow-lg transform hover:scale-105 ${
            isRequiredAndEmpty
              ? 'bg-gray-300 text-gray-400 cursor-not-allowed hover:scale-100'
              : 'bg-gradient-to-r from-hello-yellow to-crazy-magenta text-white hover:shadow-xl'
          }`}
        >
          {isFinalField ? (isLast ? 'Terminer' : 'Suivant abonnement') : 'Suivant'}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FieldStepper;

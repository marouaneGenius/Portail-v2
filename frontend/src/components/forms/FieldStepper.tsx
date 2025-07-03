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
  if (index >= fields.length) {
    setIndex(0);
    return null;
  }
  const current = fields[index];
  const isFirst = index === 0;
  const isFinalField = index === fields.length - 1;
  const value = values[current.name];
  const isRequiredAndEmpty = current.required && (!value || value === '');
  const [showError, setShowError] = useState(false);

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
    if (index && values && Object.keys(values).length > 0) {
      setIndex(0);
    }
  }, [fields]);

  const next = () => {
    if (isRequiredAndEmpty) return;
    if (isFinalField) {
      onNext(title, values);
    } else {
      setIndex((i) => i + 1);
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
    <div className="p-6 bg-white/80 rounded-2xl shadow-lg w-full border border-fading-grey max-w-xl mx-auto">
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

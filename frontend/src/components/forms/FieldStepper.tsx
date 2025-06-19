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
  // onNext: (values: Record<string, any>) => void;
  onNext: (section: string, values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  isLast: boolean;
}

const FieldStepper: React.FC<Props> = ({ title, fields, onBack, onNext, initialValues = {}, isLast }) => {
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [touched, setTouched] = useState(false); // pour afficher le message seulement si l'utilisateur a interagi
  if (index >= fields.length) {
    setIndex(0);
    return null;           // le temps que l’état se mette à jour
  }
  const current = fields[index];
  const isFirst = index === 0;
  const isFinalField = index === fields.length - 1;
  const value = values[current.name];
  const isRequiredAndEmpty = current.required && (!value || value === '');
  const [showError, setShowError] = useState(false);

  const handleChange = ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked,  options }:any = e.target ;
    const multiple = e.target.multiple ;

    //pour gerer les select multiple
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
  };


  useEffect(() => {
    if(index && values && Object.keys(values).length > 0) {
      setIndex(0)
    }
  }, [fields])

  const next = () => {
    if (isRequiredAndEmpty) return;
    if (isFinalField) {
      onNext(title, values);
    } else {
      setIndex((i) => i + 1);
      setTouched(false); // reset touched for next field
    }
  };

  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  // pour supprimer une valeur du champ multi select
  const removeValueFromField = (field: any, value: any) => {
    setValues((prev: any) => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? prev[field].filter((v: any) => (typeof v === 'object' ? v.value || v.id : v) !== (typeof value === 'object' ? value.value || value.id : value))
        : prev[field],
    }));
  };
console.log(current.name, values, current)

  if (loading) {
    return <p>Chargement…</p>;

  }

  return (
    <div className="p-4 bg-white rounded shadow  w-full  ">
      {showError &&  <AlertMessage message={'Un problème est survenu lors du chargement des créneaux !'} /> }
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">Champ {index + 1} sur {fields.length}</p>

      <label className="block text-sm font-medium mb-1">
        {current.label} {current.required && <span className="text-red-500">*</span>}
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
        <p className="text-red-500 text-sm mt-1">Ce champ est requis.</p>
      )}

      <div className="flex justify-between mt-4">
        <button
          onClick={isFirst ? onBack : prev}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          {isFirst ? 'Retour' : 'Précédent'}
        </button>

        <button
          onClick={next}
          disabled={isRequiredAndEmpty}
          className={`px-4 py-2 rounded text-white ${
            isRequiredAndEmpty ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isFinalField ? (isLast ? 'Terminer' : 'Suivant abonnement') : 'Suivant'}
        </button>
      </div>
    </div>
  );
};

export default FieldStepper;

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import api from '../api/aixos';
import { NameNormalizer } from '../utils/nameNormalizer';
import { PhoneValidator } from '../utils/phoneValidator';
import { ClassesOptions, Days, SchoolSubjects } from '../mocks/mocks';
import { parentFields } from '../forms/schemas';
import { renameFields } from '../services/functions';
import { ScheduleArrayField } from './forms/TutorScheduleForm';
import { getCenters, getUser } from '../api/api';
import { MultiSelectNoCtrl, MultiSelectSchoolSubjectsWithLevels, RenderField } from './forms/customInput';
import { useParams } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useModal } from '@/Hooks/useModal';
import ParentSelector from './ParentFinder';
import ParentFormOrModal from './ParentFormOrModal';
import AddressAutocomplete from './AddressAutocomplete';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'date' | 'checkbox' | 'password' | 'radio' | 'time' | 'array' | 'datetime-local' | 'textarea';
  options?: { value: any; label: string }[]; // pour les select
  required?: boolean;
  className?: String;
  multiple?: boolean;
  value?: any; // pour les champs avec valeur par défaut
}

export interface FormGeneratorProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  endpoint?: String;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({ fields, initialValues = {}, onSubmit, endpoint }) => {
  const defaultValues = endpoint === "user" ? {
    centers: [],
    school_subjects: [],
    // class: [],
    ...initialValues,
  } : { ...initialValues };
  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [currentFields, setFields] = useState(fields);
  const [roleFieldValue, useRoleFieldValue] = useState<Boolean>(false);
  const [currenParentFields, setCurrenParentFields] = useState(parentFields);
  const [emptyFields, useEmptyFields] = useState<Boolean>(Object.keys(initialValues).length === 0);
  const [loading, setLoading] = useState(true);
  const [parentData, setParentData] = useState<any[]>([]);
  const [action, setAction] = useState<any>();
  const [scheduleUpdateFunction, setScheduleUpdateFunction] = useState<((updatedSchedule: any) => void) | null>(null);

  const [parentValues, setParentValues] = useState<Record<string, any>>(defaultValues);
  const {resource, id } = useParams<{ id: any, resource:any }>();
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const optionalFields = ['siret', 'max_session', 'price_per_hour', 'centers', 'school_subjects', 'class'];
  const { isOpen, open, close } = useModal();
  const isEmpty = (obj: any) => Object.keys(obj).length === 0;

  useEffect(() => {
    console.log(resource)
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
      const fieldsWithoutRequired = currentFields.map(({ required, ...rest }) => rest);

      getCenters().then((res) => {
        const centerOptions = res.map((c: any) => ({
          value: String(c.id),
          label: c.name,
        }));

        const updatedFields: FormField[] = fieldsWithoutRequired.map((f: any) => {
          if (f.name === 'centers') {
            return { ...f, options: centerOptions };
          }
          if (f.name === "school_subjects") {
            return { ...f, options: SchoolSubjects };
          }
          if (f.name === 'class') {
            return { ...f, options: ClassesOptions };
          }

          return f as FormField;
        });
        setFields(updatedFields);
      });
    }

    if (!emptyFields) {
      const fieldWithOutRequired = currentFields.map(({ required, ...rest }) => rest);
      setFields(fieldWithOutRequired);
    }

    if (hasClassField && !hasRoleField) {
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
              return { ...f, options: ClassesOptions };
            }
            return f as FormField;
          });
          setFields(updatedFields);
        })
        .catch((err) => console.error('Erreur fetch centres', err))
        .finally(() => setLoading(false));
    } else if (endpoint === 'report') {
      // Charger les options pour les rapports
      const studentId = initialValues.id_student;
      
      const promises = [api.get('/api/student')];
      
      // Si on a un student_id, charger seulement ses séances disponibles
      if (studentId) {
        promises.push(api.get(`/api/report/available-sessions/${studentId}`));
      }
      
      Promise.all(promises)
        .then((responses) => {
          const [studentsRes, sessionsRes] = responses;
          
          const studentOptions = studentsRes.data.map((s: any) => ({
            value: String(s.id),
            label: `${s.firstname} ${s.lastname}`,
          }));
          
          const sessionOptions = sessionsRes ? sessionsRes.data.map((s: any) => ({
            value: String(s.id),
            label: s.label,
          })) : [];

          const updatedFields: FormField[] = currentFields.map((f: any) => {
            if (f.name === 'id_student') {
              return { ...f, options: studentOptions };
            }
            if (f.name === 'id_session') {
              return { ...f, options: sessionOptions };
            }
            return f as FormField;
          });
          setFields(updatedFields);
        })
        .catch((err) => console.error('Erreur fetch données rapport', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fields, roleFieldValue]);

  const removeShoolSubject = (subjectToRemove: any) => {
    setValues(prev => ({
      ...prev,
      school_subjects: Array.isArray(prev.school_subjects)
        ? prev.school_subjects.filter((s) => s !== subjectToRemove)
        : [],
    }));
  };

  const removeCenter = (center: any) => {
    setValues(prev => ({
      ...prev,
      centers: Array.isArray(prev.centers)
        ? prev.centers.filter((s: any) => s !== center)
        : [],
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value, checked, options }: any = e.target;
    const multiple = 'multiple' in e.target ? e.target.multiple : false;

    let processedValue = value;

    // Normalisation automatique pour les champs nom/prénom
    if (name === 'firstname') {
      processedValue = NameNormalizer.normalizeOnInput(value, true);
    } else if (name === 'lastname') {
      processedValue = NameNormalizer.normalizeOnInput(value, false);
    } else if (name === 'phone') {
      // Validation et normalisation du téléphone
      processedValue = PhoneValidator.normalizeOnInput(value);
    }

    //pour gerer les select multiple
    setValues(prev => ({
      ...prev,
      [name]: multiple
        ? Array.from(options).filter((opt: any) => opt.selected).map((opt: any) => opt.value)
        : type === 'checkbox'
          ? checked
          : processedValue,
    }));

    // pour gerer les select one
    if (type === "select-one" && name === "role") {
      if (value === 'ROLE_TUTOR') {
        let fieldWithOutRequired: any = fields;
        useRoleFieldValue(true)

        getCenters().then((res) => {
          const centerOptions = res.map((c: any) => ({
            value: String(c.id),
            label: c.name,
          }));
          const updatedFields: FormField[] = fields.map((f: any) => {

            if (f.name === 'centers') {
              return { ...f, options: centerOptions };
            }
            if (f.name === 'school_subjects') {
              return { ...f, options: SchoolSubjects };
            }
            return f as FormField;

          });
          setFields(updatedFields);
        });
      } else {
        useRoleFieldValue(false);
      }
    }

    // Recharger les séances disponibles quand l'élève change (pour les rapports)
    if (endpoint === 'report' && name === 'id_student' && value) {
      api.get(`/api/report/available-sessions/${value}`)
        .then((res) => {
          const sessionOptions = res.data.map((s: any) => ({
            value: String(s.id),
            label: s.label,
          }));

          setFields(prev => prev.map((f: any) => {
            if (f.name === 'id_session') {
              return { ...f, options: sessionOptions };
            }
            return f;
          }));

          // Reset la session sélectionnée
          setValues(prev => ({ ...prev, id_session: '' }));
        })
        .catch((err) => console.error('Erreur fetch séances', err));
    }
  };

  const handleChangeParentFields = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked, options }: any = e.target;
    const multiple = e.target.multiple;

    let processedValue = value;

    // Normalisation automatique pour les champs nom/prénom et téléphone des parents
    if (name === 'firstname') {
      processedValue = NameNormalizer.normalizeOnInput(value, true);
    } else if (name === 'lastname') {
      processedValue = NameNormalizer.normalizeOnInput(value, false);
    } else if (name === 'phone') {
      processedValue = PhoneValidator.normalizeOnInput(value);
    }

    setParentValues(prev => ({
      ...prev,
      [name]: multiple
        ? Array.from(options).filter((opt: any) => opt.selected).map((opt: any) => opt.value)
        : type === 'checkbox'
          ? checked
          : processedValue,
    }));

    // Ajouter tous les champs du parent à parentData
    if (e.target.id && e.target.id.includes('_parent')) {
      const key = name.replace(/_parent$/, '');
      setParentData(prev => ({ ...prev, [key]: value }));
    } else {
      // Pour les champs normaux du parent (firstname, lastname, email, phone, gender)
      setParentData(prev => ({ ...prev, [name]: processedValue }));

    }
  }

  // Synchroniser parentData avec values.parent
  useEffect(() => {
    if (endpoint === 'student' && Object.keys(parentData).length > 0) {
      setValues(prev => ({
        ...prev,
        parent: parentData
      }));
    }
  }, [parentData, endpoint]);

  useEffect(() => {
    if (endpoint === 'student' && Object.keys(parentData).length > 0) {
      setValues(prev => ({
        ...prev,
        parent: parentData
      }));
    }
  }, [parentData, endpoint]);

  useEffect(() => {
    if (endpoint === 'student' && emptyFields) {
      const withParentKeys: any = renameFields(currenParentFields);
      setCurrenParentFields(withParentKeys);
    }
  }, [emptyFields, endpoint]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Values before submit:', values, endpoint);

    // Validation côté client pour les téléphones
    if (values.phone && !PhoneValidator.isValidPhone(values.phone)&& resource !== 'student') {
      const validation = PhoneValidator.validateAndFormat(values.phone);
      alert(`Numéro de téléphone invalide: ${values.phone}\n\nSuggestions: ${validation.suggestions.join(', ') || 'Aucune'}\n\nExemple: 06 12 34 56 78`);
      return;
    }

    // Validation pour les parents si présents
    if (values.parent && values.parent.phone && !PhoneValidator.isValidPhone(values.parent.phone) ) {
      const validation = PhoneValidator.validateAndFormat(values.parent.phone);
      alert(`Numéro de téléphone parent invalide: ${values.parent.phone}\n\nSuggestions: ${validation.suggestions.join(', ') || 'Aucune'}\n\nExemple: 06 12 34 56 78`);
      return;
    }

    // Vérifier que l'email du parent est présent s'il y a un parent
    if (values.parent && !values.parent.email) {
      alert('L\'email du parent est requis');
      return;
    }

    if (action === 'update') {
      const scheduleData = values.schedules[0];
      const id = scheduleData.id;

      // Préparer les données pour la mise à jour (sans l'id dans les données)
      const updateData = {
        day: scheduleData.day,
        start_hour: scheduleData.start_hour,
        end_hour: scheduleData.end_hour,
        id_user: scheduleData.id_user,
        center: scheduleData.center
      };

      const { data: created } = await api.put<Record<string, any>>(`/api/tutorschedule/${id}`, updateData);
      // Afficher une alerte de succès
      alert('Créneau modifié avec succès !');

    } else {
      // Vérifier si on a des données valides pour tutorschedule
      if (endpoint === 'tutorschedule') {
        if (!values.schedules || values.schedules.length === 0) {
          console.log('Pas de soumission - aucun créneau à créer');
          return;
        }
      }
      onSubmit(values)
    }
  };

  const getParent = (parent: any) => {
    setValues(prev => ({
      ...prev,
      parent: parent
    }));
  };

  const handleAddressSelect = (addressData: any) => {
    setValues(prev => ({
      ...prev,
      address: addressData.address,
      city: addressData.city,
      zip_code: addressData.zip_code
    }));
  };

  const handleParentAddressSelect = (addressData: any) => {
    setParentValues(prev => ({
      ...prev,
      address_parent: addressData.address,
      city_parent: addressData.city,
      zip_code_parent: addressData.zip_code
    }));

    setParentData(prev => ({
      ...prev,
      address: addressData.address,
      city: addressData.city,
      zip_code: addressData.zip_code
    }));
  };

  if (loading) return <p>Chargement …</p>;

  return (
    <div className="p-4 flex items-center justify-center flex-col justify-between">
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
                  ) : (f.name === 'centers') && f.multiple ? (
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
                        {(values[f.name] as string[]).map((val: any) => {

                          if (Array.isArray(f.options) && f.options) {
                            const option: any = f.options!.find((o: any) => o.value === val);
                            const label = typeof option?.label === "object" ? option.label.name : option?.label || val;

                            return (
                              <div
                                key={val.id}
                                className="inline-flex items-center bg-[#F2F2F2] text-[#333333] px-3 py-1 rounded-full"
                              >
                                {label.name ? label.name : label}
                                <button
                                  type="button"
                                  onClick={() => removeCenter(val)}
                                  className="ml-2 text-[#FF1585] hover:text-[#FFB800]"
                                >
                                  &times;
                                </button>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </>
                  ) : (f.name === 'school_subjects') && f.multiple ? (
                    <>
                      {f.options && (
                        <MultiSelectSchoolSubjectsWithLevels
                          subjectOptions={SchoolSubjects}
                          values={values}
                          setValues={setValues}
                        />
                      )}


                      <div className="flex flex-wrap gap-2 mt-2">
                        {(values[f.name] as string[]).map((val) => {

                          if (Array.isArray(f.options) && f.options) {
                            const option = f.options!.find((o: any) => o.value === val);
                            const label = typeof option?.label === "object" ? option.label.name : option?.label || val;

                            return (
                              <div
                                key={val}
                                className="inline-flex items-center bg-[#F2F2F2] text-[#333333] px-3 py-1 rounded-full"
                              >
                                {label}
                                <button
                                  type="button"
                                  onClick={() => removeShoolSubject(val)}
                                  className="ml-2 text-[#FF1585] hover:text-[#FFB800]"
                                >
                                  &times;
                                </button>
                              </div>
                            );
                          }
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
                  ) : f.name === 'address' ? (
                    <AddressAutocomplete
                      name={f.name}
                      value={values[f.name] || ''}
                      onChange={handleChange}
                      onAddressSelect={handleAddressSelect}
                      placeholder="Tapez votre adresse..."
                      required={!!f.required}
                    />
                  ) : f.type === 'textarea' ? (
                    <textarea
                      id={f.name}
                      name={f.name}
                      value={values[f.name] || ''}
                      onChange={handleChange}
                      className="w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333] min-h-[100px] resize-vertical"
                      required={!!f.required}
                      placeholder="Étudiant très motivé, excellentes notes en mathématiques. Objectif : obtenir mention très bien au bac."
                    />
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
              ))
            }

          </div>
          {
            endpoint == "student" &&
            <ParentFormOrModal
              endpoint={endpoint}
              emptyFields={emptyFields}
              currenParentFields={currenParentFields}
              values={parentValues}
              handleChange={handleChangeParentFields}
              isOpen={isOpen}
              close={close}
              getParent={getParent}
              ParentSelector={ParentSelector}
              onAddressSelect={handleParentAddressSelect}
            />
          }
          {endpoint === 'tutorschedule' && (
            <ScheduleArrayField
              dayOptions={Days}
              action={setAction}
              initialSchedules={values.schedules}
              onChange={(schedules) => setValues({ ...values, schedules })}
              onScheduleUpdated={setScheduleUpdateFunction}
              id={id}
            />
          )}

          <div className="mt-6 flex items-center justify-center">
            <button
              type="submit"
              disabled={isEmpty(values)}
              // className="w-full bg-[#FFB800] text-[#333333] font-semibold px-6 py-3 rounded hover:bg-[#F2F2F2] border border-[#FFB800] transition"
              className={isEmpty(values)
                ? "w-full bg-gray-200 text-[#333333] font-semibold px-6 py-3 rounded hover:bg-gray-200 border border-gray-200 transition cursor-not-allowed"
                : "w-full bg-[#FFB800] text-[#333333] font-semibold px-6 py-3 rounded hover:bg-[#F2F2F2] border border-[#FFB800] transition"}
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
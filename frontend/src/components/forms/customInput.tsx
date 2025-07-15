import { DateTimePickerToolbar } from "@mui/x-date-pickers/DateTimePicker/DateTimePickerToolbar";
import { FIXED_END_DATE } from "../../mocks/constants";
import { ClassesOptions, WeeksOptions, WeeksOptionss } from "../../mocks/mocks";
import SlotSelector from "../subscriptions/SlotSelector";
import { TutorAvailabilityPicker } from "../subscriptions/TutorAvailabilityPicker";
import VacationWeekSelector from "../subscriptions/WeeksAvailiabilityPicker";
import GroupedInputs from "./GroupedInputs";
import { DateTimePicker } from "../ui/date-time-picker";
import { TutorListComponent } from "../sessions/TutorListComponent";

export interface RenderFieldProps {
  f: any;
  values: any | null;
  setValues: any | null;
  removeValueFromField: (field: string, value: any)  => void;
  handleChange: (item:any) => void;
  fieldName?: any;
  tutors?:any,
  title?:any,
  student?:any
}

interface MultiSelectWrapperProps {
  field: {
    name: string;
    label?: string;
    options?: { value: string; label: string }[];
  };
  values: Record<string, any>;
  // setValues: (fn: (prev: Record<string, any>) => Record<string, any>) => void;
  onChange: (newValues: string[]) => void;
  removeValueFromField: (fieldName: string, value: any) => void;
}

export function MultiSelectNoCtrl({
    options,
    values,
    onChange,
  }: {
    options: { value: string; label: string }[];
    values: string[];
    onChange: (newValues: string[]) => void;
  }) {
    
    const toggleOption = (value: string) => {
      const safeValues = Array.isArray(values) ? values : [];
      onChange(
        safeValues.includes(value)
          ? safeValues.filter((v) => v !== value)
          : [...safeValues, value]
      );
    };
    
    return (
      <select
        multiple
        size={options.length}
        className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm h-64"
      >
        {
        options.map((opt:any) => {
          // const isSelected = Array.isArray(values) && (values.includes(opt.value) || values.includes(opt.label) || values.includes(opt.name));
          const isSelected =
          Array.isArray(values) &&
          values.some(
            (v:any) =>
              (typeof v === "object" && String(v.id) === String(opt.value)) ||
              v === opt.value // fallback si jamais values contient aussi des strings
          );

          return (
            <option
              key={opt.value}
              value={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                toggleOption(opt.value);
              }}
              // applique une classe différente si sélectionné
              className={`
                block cursor-pointer border-2 my-1 p-2 rounded-xl
                ${isSelected
                  ? 'bg-hello-yellow text-mister-anthracite border-hello-yellow font-semibold'
                  : 'bg-white text-mister-anthracite border-fading-grey hover:bg-hello-yellow/10'}
              `}
              selected={isSelected}
            >
              {opt.label}
            </option>
          );
        })}
      </select>
    );
}


export function MultiSelectSchoolSubjectsWithLevels({
  subjectOptions,
  values,
  setValues,
}:any) {
  const toggleSubject = (subject:any) => {
    let newSubjects = Array.isArray(values.school_subjects) ? [...values.school_subjects] : [];
    let newClassLevels = Array.isArray(values.class) ? [...values.class] : [];
    if (newSubjects.includes(subject)) {
      newSubjects = newSubjects.filter(s => s !== subject);
      newClassLevels = newClassLevels.filter(cl => cl.subject !== subject);
    } else {
      newSubjects.push(subject);
      newClassLevels.push({ subject, level: "" }); // Ajout à compléter après
    }
    setValues((prev:any) => ({ ...prev, school_subjects: newSubjects, class: newClassLevels }));
  };

  // Changer la classe max d'une matière
  const handleLevelChange = (subject:any, level:any) => {
    let newClassLevels = Array.isArray(values.class) ? [...values.class] : [];
    const idx = newClassLevels.findIndex(cl => cl.subject === subject);
    if (idx !== -1) newClassLevels[idx] = { subject, level };
    else newClassLevels.push({ subject, level });
    setValues((prev:any) => ({ ...prev, class: newClassLevels }));
  };

  return (
    <div>
      <label className="block font-semibold mb-2">Matières</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {subjectOptions.map((opt:any) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggleSubject(opt.value)}
            className={
              (values.school_subjects?.includes(opt.value)
                ? "bg-yellow-300 border-yellow-500"
                : "bg-white border-gray-300") +
              " border px-3 py-1 rounded-full"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {values.school_subjects?.map((subject:any) => (
        <div key={subject} className="mb-3">
          <label className="text-sm">
            Jusqu’à quelle classe peux-tu enseigner <b>{subject}</b> ?
          </label>
          <select
            className="border rounded w-full mt-1"
            value={values.class?.find((cl:any) => cl.subject === subject)?.level || ""}
            onChange={e => handleLevelChange(subject, e.target.value)}
          >
            <option value="">Sélectionner une classe</option>
            {ClassesOptions.map((opt, i) => (
              <option key={opt.value} value={i+1}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

export const renderMultiSelect = (f:any, values:any, fieldName:string,setValues:any, removeValueFromField:any) => (
  <>
    {f.options && (
      <MultiSelectNoCtrl
        options={f.options}
        values={values[fieldName]}
        onChange={(newVals) =>
          setValues((prev:any) => ({ ...prev, [fieldName]: newVals }))
        }
      />
    )}

    <div className="flex flex-wrap gap-2 mt-2  ">
      {Array.isArray(values[fieldName]) && values[fieldName].map((val) => {
        if (f.options) {
          const option = f.options.find((o:any) => o.value === (val?.value || val));
          const label = option?.label || (typeof val === 'object' ? val.label || val.name || JSON.stringify(val) : val);
          const key = typeof val === 'object' ? val.id || val.value : val;
          return (
            <div
              key={key}
              className="inline-flex items-center bg-hello-yellow/20 text-mister-anthracite px-3 py-1 rounded-full font-medium shadow-sm border border-hello-yellow/40"
            >
              {label}
              <button
                type="button"
                onClick={() => removeValueFromField(f.name, val)}
                className="ml-2 text-crazy-magenta hover:text-crazy-magenta/80 font-bold"
              >
                &times;
              </button>
            </div>
          );
        }
        return null;
      })}
    </div>
  </>
);

export const MultiSelectWrapper: React.FC<MultiSelectWrapperProps> = ({
  field,
  values,
  onChange,
  removeValueFromField,
}) => {
  const fieldName = field.name;
  const selectedValues = values[fieldName] || [];

  return (
    <>
      {field.options && (
        <MultiSelectNoCtrl
          options={field.options}
          values={selectedValues}
          onChange={onChange}
        />
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        {Array.isArray(selectedValues) &&
          selectedValues.map((val) => {
            const option = field.options?.find(
              (o) => o.value === (val?.value || val)
            );
            const label =
              option?.label ||
              (typeof val === 'object'
                ? val.label || val.name || JSON.stringify(val)
                : val);
            const key = typeof val === 'object' ? val.id || val.value : val;

            return (
              <div
                key={key}
                className="inline-flex items-center bg-hello-yellow/20 text-mister-anthracite px-3 py-1 rounded-full font-medium shadow-sm border border-hello-yellow/40"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeValueFromField(fieldName, val)}
                  className="ml-2 text-crazy-magenta hover:text-crazy-magenta/80 font-bold"
                >
                  &times;
                </button>
              </div>
            );
          })}
      </div>
    </>
  );
};

export const RenderField : React.FC<RenderFieldProps> = ({f, values, setValues, removeValueFromField, handleChange, fieldName, tutors, title}) => {
  const todayISO = new Date().toISOString().split('T')[0];


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Annuel ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if(title === 'Annuel'){
    if(f.name === 'favorite_slots' || f.name === 'session_per_week'){
      return  <TutorAvailabilityPicker
                  school_subjects={values.school_subjects}
                  // f={f} 
                  values={values}
                  setValues={setValues} 
                  removeValueFromField={removeValueFromField}
                  onSelect={(slots: any[]) => {
                    setValues((prev: any) => ({
                      ...prev,
                      favorite_slots: slots
                    }));
                  }}
                />
    }
  
    if (f.name === 'subscription_start_date' || f.name === 'subscription_end_date') {
      return (
        <GroupedInputs
          fields={[
            {
              name: 'subscription_start_date',
              label: 'On commaence le',
              type: 'date',
              value: values.subscription_start_date,
              onChange: handleChange,
              min: todayISO,
              max: FIXED_END_DATE, // max value for annual subscription
            },
            {
              name: 'subscription_end_date',
              label: 'Finis le',
              type: 'date',
              value: values.subscription_end_date,
              onChange: handleChange,
              defaultValue: FIXED_END_DATE, // default value for annual subscription
              disabled: true, // disable this field  
              // disabled: true, 
            },
          ]}
        />
      );
    }
  
    if (f.name === 'recurrent_debit_date' || f.name === 'first_debit_date') {
      return (
        <GroupedInputs
          fields={[
            {  name: 'recurrent_debit_date', label: 'Prélevé tous les ', type: 'select',    
              options: [
                { value: '5', label: '5 du mois' },
                { value: '15', label: '15 du mois' },
                { value: '28', label: '28 du mois' },
              ],
              value: values.recurrent_debit_date,
              onChange: handleChange,
            },
            { name: 'first_debit_date', label: 'Date du premier prélèvement',
              type: 'date',
              value: values.first_debit_date,
              onChange: handleChange,
              min: todayISO,
            },
          ]}
        />
      );
    }
  
    if (f.name === 'offer_amount' || f.name === 'offer_type' || f.name === 'discount') {
      return (
        <GroupedInputs
          defaultOpen={true}  

          fields={[
            {  name: 'offer_amount', label: 'Offre', type: 'text',
              value: values.offer_amount,
              onChange: handleChange,
              defaultValue: '0',   
            },
            { name: 'offer_type', label: 'Type d\'Offre',
              type: 'text',
              value: values.offer_type,
              onChange: handleChange,
            },
            { name: 'discount', label: 'Reduction',
              type: 'text',
              value: values.discount,
              onChange: handleChange,
              defaultValue: '0',   
            }
          ]}
        />
      );
    }

    if (f.name === 'membership_fee' ) {
      return (
        <GroupedInputs
          fields={[
            {  name: 'membership_fee', label: 'Frais d\'inscription', type: 'text',
              value: values.membership_fee,
              onChange: handleChange,
              defaultValue: '90',   
            },
       
          ]}
        />
      );
    }
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Stage ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if(title === 'Stage'){
    if(f.name === 'week_count'){
      return <VacationWeekSelector
        onSelect={(data:any) => {
          setValues((prev: any) => ({
            ...prev,
            week_count: data.week_count,
            known_weeks: data.known_weeks,
            selected_weeks: data.selected_weeks
          }));
        }}
      />
    }

    if(f.name === 'subscription_start_date') {
      return <GroupedInputs
      fields={[
        {
          name: 'subscription_start_date',
          label: 'On commence le',
          type: 'date',
          value: values.subscription_start_date,
          onChange: handleChange,
          min: todayISO,
        },
      ]}
    />
    }

    if(f.name === 'first_debit_date') {
      return <GroupedInputs
        fields={[
          {
            name: 'first_debit_date',
            label: 'Date du premier paiement',
            type: 'date',
            value: values.first_debit_date,
            onChange: handleChange,
            min: todayISO,
          },
        ]}
      />
    }

    if(f.name === 'discount') {
      return <GroupedInputs
        fields={[
          { name: 'discount', label: 'Reduction',
            type: 'text',
            value: values.discount,
            onChange: handleChange,
            defaultValue: '0',   
          }
        ]}
      />
    }



  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Pré-inscription ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if(title === 'Preinscription'){
    if(f.name === 'favorite_slots'){
      return <SlotSelector
        form_values={values}
        onSelect={(data:any) => {
          setValues((prev:any) => ({
            ...prev,
            favorite_slots_mode: data.mode,
            favorite_slots: data.slots,
          }));
        }}
      />
    }

    if(f.name === 'recurrent_debit_date') {
      return <GroupedInputs
      fields={[
        {  name: 'recurrent_debit_date', label: 'Prélevé tous les ', type: 'select',    
          options: [
            { value: '5', label: '5 du mois' },
            { value: '15', label: '15 du mois' },
            { value: '28', label: '28 du mois' },
          ],
          value: values.recurrent_debit_date,
          onChange: handleChange,
        },
    
      ]}
    />
    }



    
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // OTHER FIELDS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (f.name === 'centers' && f.multiple) {
    return renderMultiSelect(f, values, 'centers', setValues, removeValueFromField);
  }

  if (f.name === 'school_subjects' && f.multiple && title !== 'Annuel') {
    return renderMultiSelect(f, values, 'school_subjects', setValues, removeValueFromField);
  }

  if (f.type === 'select') {
    return (
      <select
        id={f.name}
        name={f.name}
        value={f.multiple ? values[f.name] ?? [] : values[f.name] || ''}
        // onChange={handleChange}
        onChange={(e) => handleChange(e)}
        className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm"
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
    );
  }

  return (
    <input
      id={f.name}
      name={f.name}
      type={f.type}
      checked={f.type === 'checkbox' ? values[f.name] : undefined}
      value={f.type !== 'checkbox' ? values[f.name] || '' : undefined}
      onChange={(e) => handleChange(e)}
      className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite placeholder:text-mister-anthracite/40 transition shadow-sm"
      required={!!f.required}
    />
  );
};



export const RenderTrialField: React.FC<RenderFieldProps> = ({
  f,
  values,
  setValues,
  removeValueFromField,
  handleChange,
  student
}) => {
  const todayISO = new Date().toISOString().split("T")[0];

  // 1) Matières → multi-select
  if (f.name === "school_subjects" && f.type === "select" && f.multiple) {
    return <>
    {renderMultiSelect(
        f,
        values,
        "school_subjects",
        setValues,
        removeValueFromField
      )}
 
    </> 
  }

  // 2) Date de fin (date_slot)
  if (f.name === "date_slot") {
    return (
      <GroupedInputs
        fields={[
          {
            name: "date_slot",
            label: "Date de fin",
            type: "date",
            value: values.date_slot,
            onChange: handleChange,
            min: todayISO,
          },
        ]}
      />
    );
  }

  // 3) Date et heure (scheduled_at)
  if (f.name === "scheduled_at") {
    return (
      <>
       <div className="space-y-1">
         <label htmlFor="scheduled_at" className="block text-sm font-medium">
           Date et heure de cours
         </label>
         <DateTimePicker
           value={values.scheduled_at ? new Date(values.scheduled_at) : undefined}
           onChange={(date) => {
             setValues({
               ...values,
               scheduled_at: date.toISOString()
             })
           }}
         />
       </div>
      <div className="mt-0 bg-gray-100  p-2 rounded">
      <TutorListComponent
        values={values}
        student={student}
        onSelect={(tutorId) => {
          setValues({
            ...values,
            tutor_id: tutorId,

          })
        }}
      />
    </div>
    </>

    );
  }

  return (
    <input
      id={f.name}
      name={f.name}
      type={f.type}
      value={values[f.name] || ""}
      onChange={handleChange}
      className="w-full rounded border px-3 py-2 focus:ring focus:ring-blue-300"
      required={!!f.required}
    /> 
  );
};


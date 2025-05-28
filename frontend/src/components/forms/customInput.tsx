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
        className="w-full  rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-900 bg-white"
      >
        {
        options.map((opt:any) => {
          // const isSelected = values && (values.includes(opt.value));
          const isSelected = Array.isArray(values) && (values.includes(opt.value) || values.includes(opt.label));

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
                block cursor-pointer border-2 my-1 p-2 rounded
                ${isSelected
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-gray-100 text-gray-800 border-transparent'}
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

export interface RenderFieldProps {
  f: any;
  values: any | null;
  setValues: any | null;
  removeValueFromField: (field: string, value: any)  => void;
  handleChange: (item:any) => void;
  fieldName: any;
}

export const RenderField : React.FC<RenderFieldProps> = ({f, values, setValues, removeValueFromField, handleChange, fieldName}) => {


  const renderMultiSelect = (field:string) => (
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
      <div className="flex flex-wrap gap-2 mt-2 ">
        {Array.isArray(values[fieldName]) && values[fieldName].map((val) => {
          if (f.options) {
            const option = f.options.find((o:any) => o.value === (val?.value || val));
            const label = option?.label || (typeof val === 'object' ? val.label || val.name || JSON.stringify(val) : val);
            const key = typeof val === 'object' ? val.id || val.value : val;
            return (
              <div
                key={key}
                className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeValueFromField(f.name, val)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
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

  if (f.name === 'centers' && f.multiple) {
    return renderMultiSelect('centers');
  }

  if (f.name === 'school_subjects' && f.multiple) {
    return renderMultiSelect('school_subjects');
  }

  if (f.type === 'select') {
    return (
      <select
        id={f.name}
        name={f.name}
        value={f.multiple ? values[f.name] ?? [] : values[f.name] || ''}
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
    );
  }

  return (
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
  );
};

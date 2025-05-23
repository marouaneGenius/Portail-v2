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
      onChange(
        values.includes(value)
          ? values.filter((v) => v !== value)
          : [...values, value]
      );
    };
  
    return (
      <select
        multiple
        size={options.length}
        className="w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-900 bg-white"
      >
        {options.map((opt) => {
          const isSelected = values.includes(opt.value);
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
  
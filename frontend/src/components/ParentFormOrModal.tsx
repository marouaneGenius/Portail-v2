import { useState } from "react";
import { NameNormalizer } from "../utils/nameNormalizer";
import { PhoneValidator } from "../utils/phoneValidator";
import AddressAutocomplete from "./AddressAutocomplete";

export default function ParentFormOrModal({
  emptyFields,
  currenParentFields,
  values,
  handleChange,
  getParent,
  ParentSelector,
  onAddressSelect,
}:any) {
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handler personnalisé avec validation
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked, options }:any = e.target;
    const multiple = (e.target as HTMLSelectElement).multiple;
    
    let processedValue = value;
    let error = '';

    // Normalisation et validation
    if (name === 'firstname') {
      processedValue = NameNormalizer.normalizeOnInput(value, true);
    } else if (name === 'lastname') {
      processedValue = NameNormalizer.normalizeOnInput(value, false);
    } else if (name === 'phone') {
      processedValue = PhoneValidator.normalizeOnInput(value);
      
      // Validation en temps réel pour le téléphone
      if (value && !PhoneValidator.isValidPhone(value)) {
        error = PhoneValidator.getValidationMessage(value) || 'Numéro invalide';
      }
    }

    // Mettre à jour les erreurs
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Créer un événement synthétique compatible
    const syntheticEvent = {
      target: {
        name,
        type,
        value: processedValue,
        checked,
        options,
        multiple,
        id: e.target.id
      }
    } as any;

    handleChange(syntheticEvent);
  };

  return (
    <div className="mb-8 w-full mt-3">
      <button
        className="mb-4 px-4 py-2 w-full rounded bg-[#FFB800] text-white font-semibold shadow hover:bg-[#FFA800] transition"
        onClick={() => setShowModal((v) => !v)}
        type="button"
      >
        {showModal ? "Creer le parent" : "Chercher le parent"}
      </button>

      {showModal ? (
        <ParentSelector onClose={() => setShowModal(false)} updateItem={getParent} />
      ) : (
        emptyFields && (
          <div className="bg-[#F9F9F9] p-6 rounded-xl border border-[#FFD47A] shadow-sm w-full">
            <h1 className="col-span-2 text-lg font-semibold bg-[#F2F2F2] text-center rounded p-2 border-b-2 border-[#FFB800] my-3">
              Ajouter le Parent
            </h1>
            {currenParentFields.map((f:any) => (
              <div key={f.name} className={f.className ?? ""}>
                <label
                  htmlFor={f.name}
                  className="block text-xs font-semibold text-[#333333] mb-1 bg-[#F2F2F2] px-2 py-2 rounded"
                >
                  {f.label}
                  {f.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {f.type === "select" ? (
                  <select
                    id={f.name}
                    name={f.name}
                    value={values[f.name] || ""}
                    onChange={handleLocalChange}
                    className="w-full rounded border border-[#FFB800] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFB800] bg-[#FFFFFF] text-[#333333] text-sm"
                    required={!!f.required}
                  >
                    <option value="">—</option>
                    {(f.options || []).map((opt:any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : f.name === 'address_parent' ? (
                  <>
                    <AddressAutocomplete
                      name={f.name}
                      value={values[f.name] || ''}
                      onChange={handleLocalChange}
                      onAddressSelect={onAddressSelect}
                      placeholder="Tapez votre adresse..."
                      required={!!f.required}
                      className={errors[f.name] 
                        ? 'border-red-500 focus:ring-red-300' 
                        : 'border-[#FFB800] focus:ring-[#FFB800]'
                      }
                    />
                    {errors[f.name] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[f.name]}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      id={f.name}
                      name={f.name}
                      type={f.type}
                      checked={f.type === "checkbox" ? values[f.name] : undefined}
                      value={f.type !== "checkbox" ? values[f.name] || "" : undefined}
                      onChange={handleLocalChange}
                      className={`w-full rounded border px-3 py-2 outline-none focus:ring-2 bg-[#FFFFFF] text-[#333333] text-sm ${
                        errors[f.name] 
                          ? 'border-red-500 focus:ring-red-300' 
                          : 'border-[#FFB800] focus:ring-[#FFB800]'
                      }`}
                      required={!!f.required}
                    />
                    {errors[f.name] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[f.name]}
                        {f.name === 'phone' && (
                          <span className="block text-gray-500 mt-1">
                            Exemple: 06 12 34 56 78
                          </span>
                        )}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

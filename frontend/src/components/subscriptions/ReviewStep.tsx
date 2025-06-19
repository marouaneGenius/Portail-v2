import React from "react";
import { HiPencil, HiCheckCircle } from "react-icons/hi";

export interface ReviewStepProps {
  values: Record<string, any>;
  order: string[];
  onEdit: (type: string) => void;
  onConfirm: () => void;
}

/** Affiche un récapitulatif lisible et permet de revenir en arrière avant l'envoi. */
const ReviewStep: React.FC<ReviewStepProps> = ({ values, order, onEdit, onConfirm }) => {
  return (
    <div className="space-y-8">
      {order.map((type) => {
        const data = values[type] || {};
        return (
          <section key={type} className="border rounded shadow-sm p-4 bg-white">
            <header className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold capitalize">{type}</h3>
              <button
                type="button"
                onClick={() => onEdit(type)}
                className="flex items-center gap-1 text-indigo-600 hover:underline"
              >
                <HiPencil className="w-4 h-4" /> Modifier
              </button>
            </header>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(data).map(([k, v]) => (
                <div key={k} className="flex flex-col text-sm">
                  <dt className="font-medium text-gray-500">{k}</dt>
                  <dd className="text-gray-900 break-words">
                    {Array.isArray(v) ? v.join(", ") : String(v)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}

      <button
        type="button"
        onClick={onConfirm}
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded flex items-center justify-center gap-2"
      >
        <HiCheckCircle className="w-5 h-5" /> Valider et envoyer
      </button>
    </div>
  );
};

export default ReviewStep;

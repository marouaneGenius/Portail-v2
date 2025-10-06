import { TranslateHeaderNames } from "@/services/functions";
import React from "react";
import { HiPencil, HiCheckCircle } from "react-icons/hi";

export interface ReviewStepProps {
  values: Record<string, any>;
  order: string[];
  onEdit: (type: string) => void;
  onConfirm: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ values, order, onEdit, onConfirm }) => {

  const renderValue = (key:any, value:any) => {
    if((Array.isArray(value) && value.length ===0 )|| value === null) {
      if(values.annuel) {
        delete values.annuel[key]
        return null;
      }
    }

    if (key === "favorite_slots_annuel"  && Array.isArray(value)) {
      return value.map((slot, i) => (
        <div key={i} className="pl-4">
          <div>Jour : <b>{slot.day}</b></div>
          <div>Heure : <b>{slot.hour}</b></div>
          <div>
            Matières :{" "}
            {Array.isArray(slot.matieres) ? slot.matieres.join(", ") : slot.matieres}
          </div>
        </div>
      ));
    }
  
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "—";
    }
  
    return String(value);
  };
  
  return (
    <div className="space-y-10">
      {order.map((type) => {
        const data = values[type] || {};
        return (
          <section
            key={type}
            className="border-2 border-hello-yellow/60 rounded-2xl shadow-lg p-6 bg-white/90 transition hover:shadow-xl"
          >
            <header className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold capitalize text-mister-anthracite flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-crazy-magenta" />
                {type}
              </h3>
              <button
                type="button"
                onClick={() => onEdit(type)}
                className="flex items-center gap-1 text-crazy-magenta font-semibold hover:underline hover:text-hello-yellow transition"
              >
                <HiPencil className="w-4 h-4" /> Modifier
              </button>
            </header>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(data).map(([k, v]) => (
                <div key={k} className="flex flex-col text-sm">

                  <dt className="font-semibold text-mister-anthracite/70">
                    { TranslateHeaderNames(k)}
                  </dt>
                  <dd className="text-mister-anthracite break-words">
                    {renderValue(k, v)}
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
        className="w-full sm:w-auto bg-hello-yellow hover:bg-crazy-magenta text-mister-anthracite hover:text-white font-bold px-10 py-3 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2"
      >
        <HiCheckCircle className="w-6 h-6" /> Valider
      </button>
    </div>
  );
};

export default ReviewStep;

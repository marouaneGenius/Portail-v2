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
    <div className="max-w-4xl mx-auto">
      {/* Header de révision */}
      <div className="text-center mb-10 p-6 bg-gradient-to-r from-hello-yellow/10 to-crazy-magenta/10 rounded-3xl border border-hello-yellow/30">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <HiCheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-mister-anthracite mb-2">Révision de votre demande</h2>
        <p className="text-mister-anthracite/70">Vérifiez vos informations avant de finaliser votre abonnement</p>
      </div>

      <div className="space-y-8">
        {order.map((type, index) => {
          const data = values[type] || {};
          return (
            <section
              key={type}
              className="bg-white rounded-3xl shadow-xl border-2 border-hello-yellow/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Header avec gradient */}
              <div className="bg-gradient-to-r from-hello-yellow/20 to-crazy-magenta/20 px-8 py-6 border-b border-hello-yellow/30">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-hello-yellow to-crazy-magenta rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold capitalize text-mister-anthracite">
                        Abonnement {type}
                      </h3>
                      <p className="text-sm text-mister-anthracite/60">
                        {Object.keys(data).length} informations renseignées
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEdit(type)}
                    className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-crazy-magenta font-semibold hover:bg-hello-yellow hover:text-mister-anthracite transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <HiPencil className="w-4 h-4" /> Modifier
                  </button>
                </header>
              </div>
              
              {/* Contenu */}
              <div className="p-8">
                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(data).map(([k, v]) => {
                    const renderedValue = renderValue(k, v);
                    if (!renderedValue) return null;
                    
                    return (
                      <div key={k} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <dt className="font-semibold text-mister-anthracite/70 text-sm mb-2 uppercase tracking-wide">
                          {TranslateHeaderNames(k)}
                        </dt>
                        <dd className="text-mister-anthracite font-medium break-words">
                          {renderedValue}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bouton de confirmation amélioré */}
      <div className="text-center mt-12 p-8 bg-gradient-to-r from-hello-yellow/10 to-crazy-magenta/10 rounded-3xl border border-hello-yellow/30">
        <p className="text-mister-anthracite/70 mb-6">
          En cliquant sur "Valider", vous confirmez que toutes les informations sont correctes
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="bg-gradient-to-r from-hello-yellow to-crazy-magenta hover:from-crazy-magenta hover:to-hello-yellow text-white font-bold px-12 py-4 rounded-2xl shadow-xl transition-all duration-300 text-xl flex items-center justify-center gap-3 mx-auto hover:shadow-2xl transform hover:scale-105"
        >
          <HiCheckCircle className="w-7 h-7" /> 
          Valider et créer l'abonnement
        </button>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-mister-anthracite/60">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Vos données sont sécurisées
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;

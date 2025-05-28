import React, { useState, FormEvent, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AnnuelFields, PreinscriptionFields, StageFields } from '../../../forms/schemas';
import { FormField } from '../../FormGenerator';
import MultiStepForm from '../../forms/MultiStepForm';

const schemaMap: Record<string, FormField[]> = {
  annuel: AnnuelFields,
  stage: StageFields,
  preinscription: PreinscriptionFields,
};

const SubscriptionsFormView: React.FC<any> = () => {
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  // 🔍 Récupère les types valides présents dans les query params
  const selectedTypes = Array.from(searchParams.keys()).filter((key) =>
    Object.keys(schemaMap).includes(key)
  );

  // 📦 Concatène tous les champs associés aux types présents
  const fields = selectedTypes.flatMap(type => schemaMap[type]);

  useEffect(() => {
    if (selectedTypes.length > 0) {
      setLoading(false);
      console.log("Champs actifs:", selectedTypes);
    }
  }, [searchParams]);

  const handleSubmit = (e: Record<string, any>) => {
    e.preventDefault();
    // Traite les valeurs du formulaire ici
  };

  if (loading) {
    return <p>Chargement…</p>;
  }

  return (
    <div className="p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-bold mb-4">
          Formulaire(s) sélectionné(s) : {selectedTypes.join(', ')}
        </h1>
            <MultiStepForm
                steps={selectedTypes.map((type) => ({
                    title: type.charAt(0).toUpperCase() + type.slice(1), // capitalise le titre
                    fields: schemaMap[type],
                }))}
                onSubmit={handleSubmit}
            />
      </div>
    </div>
  );
};

export default SubscriptionsFormView;

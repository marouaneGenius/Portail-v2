import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnnuelFields, PreinscriptionFields, StageFields } from '../../../forms/schemas';
import { FormField } from '../../FormGenerator';
import MultiStepForm from '../../forms/MultiStepForm';
import { SchoolSubjects } from '../../../mocks/mocks';
import api from '../../../api/aixos';
import { useAuth } from '../../../Hooks/auth';
import { HiChevronDoubleLeft, HiChevronLeft, HiOutlineArrowCircleLeft } from 'react-icons/hi';

const schemaMap: Record<string, FormField[]> = {
  annuel: AnnuelFields,
  stage: StageFields,
  preinscription: PreinscriptionFields,
};

const SubscriptionsFormView: React.FC<any> = () => {
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate(); 

  // 🔍 Récupère les types valides présents dans les query params
  const selectedTypes = Array.from(searchParams.keys()).filter((key) =>
    Object.keys(schemaMap).includes(key)
  );
  const [currentFields, setFields] = useState<any>();

  // Concatène tous les champs associés aux types présents
  const fields = selectedTypes.flatMap(type => schemaMap[type]);

  useEffect(() => {
    if (selectedTypes.length > 0) {
      setLoading(false);
  
      // Crée un nouvel objet indexé par type, comme schemaMap
      const updatedSchemaMap: Record<string, FormField[]> = {};
  
      selectedTypes.forEach((type) => {
        const updatedFields = schemaMap[type].map((field) => {
          if (field.name === 'school_subjects') {
            return { ...field, options: SchoolSubjects };
          }
          return field;
        });
        updatedSchemaMap[type] = updatedFields;
      });
  
      setFields(updatedSchemaMap);
    }
  }, [searchParams]);
  

  const handleSubmit = (values: Record<string, any>) => {
    if(values) {
      if(selectedTypes.length === 1) {

        const formatedValues =  
        {...values, offer_type: selectedTypes[0], student_id: id, created_by: user?.email};
        console.log(formatedValues)
        try{
          api.post(`/api/subs`, formatedValues)
          .then((response) => {
            console.log("✅ Formulaire soumis avec succès :", response.data);
            alert("Formulaire soumis avec succès !");
          })
        } catch (error) {
          console.error("❌ Erreur lors de la soumission du formulaire :", error);
        }
      } else {
        alert("plusieurs form ==  plusieurs insertions !");

      }
    }
  };


  if (loading) {
    return <p>Chargement…</p>;
  }



  return (
    <div className="p-4 flex items-center justify-center">
      <div className="w-full w-4/6">
      <div className='flex items-center justify-between mb-4'>
        <span className="text-gray-500 bg-white rounded-full p-1 border-2 " onClick={() => navigate(-1)} >
            <HiOutlineArrowCircleLeft className='h-10 w-10 ' />
        </span>
        <h1 className="text-xl font-bold mb-4">
            {selectedTypes.join(', ')}
        </h1>
      </div>

            {currentFields && <MultiStepForm
                steps={selectedTypes.map((type) => ({
                    title: type.charAt(0).toUpperCase() + type.slice(1), // capitalise le titre
                    fields: currentFields[type],
                }))}
                onSubmit={handleSubmit}
            />}
      </div>
    </div>
  );
};

export default SubscriptionsFormView;

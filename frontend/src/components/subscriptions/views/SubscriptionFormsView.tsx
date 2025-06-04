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

  // const handleSubmit = (values: Record<string, any>) => {
  //   if(values) {
  //     if(selectedTypes.length === 1) {
  //       let formatedValues:any = {};
  //       const newValues = values.annuel;

  //       if(Object.keys(values)[0] === 'annuel'){
  //         formatedValues = {...newValues, subscription_type: selectedTypes[0], student_id: id, created_by: user?.email, session_per_week: newValues.favorite_slots.length };
  //       } else {
  //         formatedValues = {...newValues, subscription_type: selectedTypes[0], student_id: id, created_by: user?.email};
  //       }

  //       try{
  //         api.post(`/api/subs`, formatedValues)
  //         .then((response) => {
  //           console.log("✅ Formulaire soumis avec succès :", response.data);
  //           alert("Formulaire soumis avec succès !");
  //         })
  //       } catch (error) {
  //         console.error("❌ Erreur lors de la soumission du formulaire :", error);
  //       }
  //     } else {
  //       console.log(values)

  //       Object.keys(values).map((key) => {

  //         console.log(key, values[key]);
  //       })


  //     }
  //   }
  // };


  function buildPayload(
    type: string,
    raw : Record<string, any>,
    studentId: any | number,
    author   : string | undefined
  ) {
    const common = {
      ...raw,
      subscription_type: type,
      student_id      : studentId,
      created_by      : author,
    };

    if (type === 'annuel') {
      return {
        ...common,
        session_per_week: Array.isArray(raw.favorite_slots)
                          ? raw.favorite_slots.length
                          : undefined,
      };
    }

    return common; // stage / preinscription
  }


  const handleSubmit = (allValues: Record<string, any>) => {
    if (!allValues) return;

    const formKeys = Object.keys(allValues);              // ['annuel'] ou ['stage','annuel']
    if (formKeys.length === 0) return;

    /* ---------------- CAS 1 : un seul formulaire ------------------- */
    if (formKeys.length === 1) {
      const type    = formKeys[0];
      const payload = buildPayload(type, allValues[type], id, user?.email);

      api.post('/api/subs', payload)
        .then((r:any) => {
          console.log(`✅ ${type} OK`, r.data);
          alert('Formulaire soumis avec succès !');
        })
        .catch((e:any) => {
          console.error(`❌ ${type} KO`, e);
          alert('Erreur lors de la soumission du formulaire.');
        });

      return;
    }

    /* --------------- CAS 2 : plusieurs formulaires ------------------ */
    Promise.all(
      formKeys.map(type => {
        const raw     = allValues[type];
        const payload = buildPayload(type, raw, id, user?.email);

        return api.post('/api/subs', payload)
                  .then(r => ({ type, ok: true , data: r.data }))
                  .catch(e => ({ type, ok: false, err : e      }));
      })
    ).then(results => {
        const fails = results.filter(r => !r.ok);

        if (fails.length) {
          console.error('🚨  Certains appels ont échoué :', fails);
          alert('Une ou plusieurs insertions ont échoué. Vérifiez la console.');
        } else {
          console.log('🎉  Tous les abonnements ont été créés :', results);
          alert('Tous les formulaires ont été enregistrés avec succès !');
        }
    });
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

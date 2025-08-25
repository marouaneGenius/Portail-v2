import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnnuelFields, PreinscriptionFields, StageFields } from '../../../forms/schemas';
import { FormField } from '../../FormGenerator';
import MultiStepForm from '../../forms/MultiStepForm';
import { SchoolSubjects } from '../../../mocks/mocks';
import api from '../../../api/aixos';
import { useAuth } from '../../../Hooks/auth';
import { HiChevronDoubleLeft, HiChevronLeft, HiOutlineArrowCircleLeft } from 'react-icons/hi';
import { FIXED_END_DATE } from '../../../mocks/constants';
import { formatDateToYYYYMMDD, uuid } from '../../../services/functions';

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
  const selectedTypes = Array.from(searchParams.keys()).filter((key) =>
    Object.keys(schemaMap).includes(key)
  );
  const [currentFields, setFields] = useState<any>();
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

  function buildPayload(
    type: string,
    raw : Record<string, any>,
    studentId: any | number,
    author   : string | undefined,
    combined? : string 
  ) {
    // Convertir les champs numériques
    const processedRaw = { ...raw };
    if (processedRaw.offer_amount !== undefined && processedRaw.offer_amount !== '') {
      processedRaw.offer_amount = parseInt(processedRaw.offer_amount) || 0;
    }
    if (processedRaw.discount !== undefined && processedRaw.discount !== '') {
      processedRaw.discount = parseInt(processedRaw.discount) || 0;
    }
    if (processedRaw.membership_fee !== undefined && processedRaw.membership_fee !== '') {
      processedRaw.membership_fee = parseInt(processedRaw.membership_fee) || 0;
    }

    const common = {
      ...processedRaw,
      subscription_type: type,
      student_id      : studentId,
      created_by      : author,
      combined_id       : combined ?? null,
    };
    if (type === 'annuel') {
      return {
        ...common,
        session_per_week: Array.isArray(raw.favorite_slots)
                          ? raw.favorite_slots.length
                          : undefined,
        subscription_end_date: formatDateToYYYYMMDD(FIXED_END_DATE)

      };
    }

    return common; 
  }

  const handleSubmit = (allValues: Record<string, any>) => {
    if (!allValues) return;

    const formKeys = Object.keys(allValues);              
    if (formKeys.length === 0) return;

    if (formKeys.length === 1) {
      const type    = formKeys[0];
      const payload = buildPayload(type, allValues[type], id, user?.email);
      api.post('/api/subs', payload)
        .then((r:any) => {
          const path = `/contract/${r.data.id}/${r.data.student}`;
          navigate(path);
          console.log(`✅ ${type} OK`, r.data);
          alert('Formulaire soumis avec succès !');
        })
        .catch((e:any) => {
          console.error(`❌ ${type} KO`, e);
          alert('Erreur lors de la soumission du formulaire.');
        });

      return;
    }

    const token = uuid(); 

    /* --------------- CAS 2 : plusieurs formulaires ------------------ */
    Promise.all(
      formKeys.map(type => {
        const raw     = allValues[type];
        const payload = buildPayload(type, raw, id, user?.email, token);

        return api.post('/api/subs', payload)
                  .then(r => ({ type, ok: true , data: r.data }))
                  .catch(e => ({ type, ok: false, err : e      }));
      })
    ).then((results:any) => {
        const fails = results.filter((r:any) => !r.ok);

        if (fails.length) {
          console.error('🚨  Certains appels ont échoué :', fails);
          alert('Une ou plusieurs insertions ont échoué. Vérifiez la console.');
        } else {
          const data = results[0].data;
          const path = `/contract/${data.id}/${data.student}/${data.combined_id}`;
          navigate(path);
          console.log('🎉  Tous les abonnements ont été créés :', results);
          alert('Tous les formulaires ont été enregistrés avec succès !');
        }
    });
  };

  if (loading) {
    return <p>Chargement…</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-hello-yellow/10">
      {/* Background décoratif */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-hello-yellow/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-crazy-magenta/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-6 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {/* Header amélioré */}
          <div className='flex items-center justify-between mb-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-hello-yellow/20'>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 text-mister-anthracite hover:text-crazy-magenta transition-all duration-200 bg-gray-50 hover:bg-hello-yellow/20 px-4 py-2 rounded-2xl"
            >
              <HiOutlineArrowCircleLeft className='h-8 w-8' />
              <span className="font-medium">Retour</span>
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-2 text-mister-anthracite">
                Création d'abonnement
              </h1>
              <div className="flex items-center justify-center gap-4">
                {selectedTypes.map((type, index) => (
                  <div key={type} className="flex items-center">
                    <span className="bg-gradient-to-r from-hello-yellow to-crazy-magenta text-white px-4 py-2 rounded-full font-semibold capitalize text-sm">
                      {type}
                    </span>
                    {index < selectedTypes.length - 1 && (
                      <svg className="w-4 h-4 mx-2 text-mister-anthracite/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-16"></div> {/* Spacer pour équilibrer */}
          </div>

          {/* Formulaire avec container amélioré */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-hello-yellow/30">
            {currentFields && <MultiStepForm
                steps={selectedTypes.map((type) => ({
                    title: type.charAt(0).toUpperCase() + type.slice(1),
                    fields: currentFields[type],
                }))}
                onSubmit={handleSubmit}
            />}
          </div>
          
          {/* Footer informatif */}
          <div className="text-center mt-8 text-mister-anthracite/60">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Sécurisé
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Rapide
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Simple
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsFormView;

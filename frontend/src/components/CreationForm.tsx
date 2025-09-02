import { useParams, useNavigate } from 'react-router-dom';
import FormGenerator, { FormField } from './FormGenerator';
import { userFields ,
        centerFields,
        studentFields,
        parentFields,
        tutorScheduleFields,
        reportFields,
} from '../forms/schemas';
import api from '../api/aixos';
import { useState } from 'react';
import { splitParentKeys } from '../services/functions';

const schemaMap: Record<string, FormField[] > = {
  user: userFields,
  center: centerFields,
  student: studentFields,
  parent: parentFields,
  tutorschedule: tutorScheduleFields,
  report: reportFields,
//   sessions: sessionFields,
//   subscriptions: subscriptionFields,
};

export default function CreationForm() {
  const { resource, id } = useParams<{ resource: string, id:any }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState<Record<string, any>[]>([]);

  // Récupérer les paramètres de query
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('student_id');
  const sessionId = urlParams.get('session_id');

  const fields = schemaMap[resource ?? ''] as FormField[] | undefined;

  if (!fields) {
    return <p>Ressource inconnue : {resource}</p>;
  }

  const insertMultipleCenters = async (values: Record<string, any>) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        // si besoin, convertir les strings en entiers
        centers: (values.centers as string[]).map((id) => parseInt(id, 10)),
      };
  
      const { data: createdUser } = await api.post<Record<string, any>>(
        '/api/user',
        payload
      );

      if(createdUser) {
        navigate(`/${resource}/${createdUser.id}`);
      }
  
      // mise à jour locale, navigation, etc.
      console.log('Utilisateur créé', createdUser);
    } catch (err: any) {
      console.error('Erreur création user', err);
    } finally {
      setLoading(false);
    }
  }

  const postData = async (values: Record<string, any>) => {
    setLoading(true);
    setError(null);

    if(values.centers) {
      insertMultipleCenters(values)
    } else {
      // get parent & student data
      const { mainValues, parentValues } =  splitParentKeys(values, resource);
      try {
        // create item
        const { data: created } = await api.post<Record<string, any>>(
          `/api/${resource}`,
          mainValues ? mainValues : values,
        );

        setData(prev => [created, ...prev]);
        return created;
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Erreur lors de la création');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    try{
      const created = await postData(values);

      if(resource === "tutorschedule") {
        navigate(`/user/${id}`);
      } else if(created && resource) { 
        navigate(`/${resource}/${created.id}`);
      }

      console.log('Création réussie', created);
    }catch(err: any){
      alert('error')
      setError(err.response?.data?.error || 'Erreur lors de la Validation du formulaire');
    }
  };

  // Valeurs initiales basées sur les paramètres de query
  const initialValues = resource === 'report' 
    ? { 
        ...(studentId && { id_student: studentId }),
        ...(sessionId && { id_session: sessionId })
      } 
    : {};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Créer un {resource === 'report' ? 'compte-rendu' : resource}
      </h1>
      <FormGenerator 
        fields={fields} 
        onSubmit={handleSubmit} 
        endpoint={resource}
        initialValues={initialValues}
      />
    </div>
  );
}

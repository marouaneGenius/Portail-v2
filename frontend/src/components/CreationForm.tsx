import { useParams, useNavigate } from 'react-router-dom';
import FormGenerator, { FormField } from './FormGenerator';
import { userFields ,
        centerFields,
        studentFields,
        parentFields,
        tutorScheduleFields,
} from '../forms/schemas';
import api from '../api/aixos';
import { useState } from 'react';
import { splitParentKeys } from '../services/functions';

const schemaMap: Record<string, FormField[] > = {
  user: userFields,
  center: centerFields,
  student: studentFields,
  parent: parentFields,
  tutorschedule: tutorScheduleFields
//   sessions: sessionFields,
//   subscriptions: subscriptionFields,
};

export default function CreationForm() {
  const { resource } = useParams<{ resource: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState<Record<string, any>[]>([]);

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
     await postData(values);
      if(resource === "tutorschedule") {
        navigate(`/users`);
      } else {
        navigate(`/${resource}s`);
      }
    }catch(err: any){
      alert('error')
      setError(err.response?.data?.error || 'Erreur lors de la Validation du formulaire');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Créer un {resource}
      </h1>
      <FormGenerator fields={fields} onSubmit={handleSubmit} endpoint={resource} />
    </div>
  );
}

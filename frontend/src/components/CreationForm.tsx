// src/components/CreationForm.tsx
import { useParams, useNavigate } from 'react-router-dom';
import FormGenerator, { FormField } from './FormGenerator';
import { userFields ,
        centerFields,
        studentFields,
        parentFields,
//   sessionFields,
//   subscriptionFields,

} from '../forms/schemas';
import api from '../api/aixos';
import { useState } from 'react';

const schemaMap: Record<string, FormField[]> = {
  user: userFields,
  center: centerFields,
  student: studentFields,
  parent: parentFields,
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

  const postData = async (values: Record<string, any>) => {
    setLoading(true);
    setError(null);
  
    try {
      const { data: created } = await api.post<Record<string, any>>(
        `/api/${resource}`,
        values,
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
  };
  

  const handleSubmit = async (values: Record<string, any>) => {
    try{
        const newItem = await postData(values);
        console.log(newItem)
    }catch(err: any){
        setError(err.response?.data?.error || 'Erreur lors de la Validation du formulaire');
    }
    navigate(`/${resource}s`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Créer un {resource}
      </h1>
      <FormGenerator fields={fields} onSubmit={handleSubmit} />
    </div>
  );
}

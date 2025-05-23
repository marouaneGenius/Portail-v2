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
import { splitParentKeys } from '../services/functions';

const schemaMap: Record<string, FormField[] > = {
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

    // get parent & student data
    const { mainValues, parentValues } =  splitParentKeys(values);
    try {
      // create item
      const { data: created } = await api.post<Record<string, any>>(
        `/api/${resource}`,
      //check if we get student anad parent data, or we passe original values
        mainValues ? mainValues : values,
      );

      //check if we get parent data, to create parent
      if( created && parentValues ){
        const { data: parent } = await api.post<Record<string, any>>(
          `/api/parent`,
          parentValues,
        );
        //check if we create parent and student &  create colone on many to many table
        if(parent && created) {
          api.post(`/api/student/${created.id}/parents`, {
            parentId: parent.id,
            }).then()
            .catch(console.error);
        }
      }
  
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
      <FormGenerator fields={fields} onSubmit={handleSubmit} endpoint={resource} />
    </div>
  );
}

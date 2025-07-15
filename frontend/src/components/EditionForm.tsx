// src/pages/EditItem.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import {
  userFields,
  centerFields,
  studentFields,
  parentFields,
//   sessionFields,
//   subscriptionFields,
} from '../forms/schemas';
import FormGenerator, { FormField } from './FormGenerator';
import api from '../api/aixos';

const schemaMap: Record<string, FormField[]> = {
  user: userFields,
  center: centerFields,
  student: studentFields,
  parent: parentFields,
//   session: sessionFields,
//   subscription: subscriptionFields,
};

export default function EditionForm() {
  const { resource, id } = useParams<{ resource: string; id: string }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const fields = schemaMap[resource ?? ''];

  useEffect(() => {
    if (!resource || !id) return;
    api
      .get(`/api/${resource}/${id}`)
      .then(({ data }) => {
        setInitialValues(data);
      })
      .catch(() => {
        // gérer l’erreur (toast, redirection…)
      })
      .finally(() => setLoading(false));
  }, [resource, id]);

  const handleSubmit = async (values: Record<string, any>) => {
    const payload: Record<string, any> = {};
    fields.forEach(field => {
      // ne prendre que les clés de ton schema
      if (values[field.name] !== undefined) {
        payload[field.name] = values[field.name];
      }
    });


    await api.put(`/api/${resource}/${id}`, payload);
    navigate(`/${resource}s`);
  };

  if (loading) {
    return <p>Chargement des données…</p>;
  }
  if (!fields) {
    return <p>Ressource inconnue : {resource}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Modifier {resource?.slice(0, -1)} #{id}
      </h1>
      <FormGenerator
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

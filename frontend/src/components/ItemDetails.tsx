// src/pages/DetailPage.tsx
import { useParams, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/aixos';

interface DetailPageParams {
  resource: string;
  id: string;
  [key: string]: string | undefined;
}

const ItemDetails: React.FC = () => {
  const { resource, id } = useParams<DetailPageParams>();
  const [item, setItem] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resource || !id) return;
    setLoading(true);
    api
      .get(`/api/${resource}/${id}`)
      .then(({ data }:any) => {
        setItem(data);
      })
      .catch((err:any) => {
        setError(err.response?.data?.message || 'Erreur de chargement');
      })
      .finally(() => setLoading(false));
  }, [resource, id]);

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!item) return <Navigate to={`/${resource}`} replace />;

  return (


    <div className=" mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">
            Détails de l'élève 
        </h1>
        <div className="max-w-4xl mx-auto py-10 px-4 bg-white shadow rounded">

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(item).map(([key, value]) => (
                <div key={key}>
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                    {key.replace('_', ' ')}
                    </dt>
                    <dd className="mt-1 text-gray-700">
                    {/* Cas null */}
                    {value === null && '—'}

                    {/* Cas simple */}
                    {typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
                        ? String(value)
                        : null}

                    {/* Cas center (objet) */}
                    {key === 'center' && value && (
                        <ul className="list-disc list-inside">
                        {Object.entries(value).map(([cKey, cVal]) => (
                            <li key={cKey}>
                            <strong className="capitalize">{cKey.replace('_',' ')}:</strong>{' '}
                            {String(cVal)}
                            </li>
                        ))}
                        </ul>
                    )}

                    {/* Cas reports (tableau d’objets) */}
                    {key === 'reports' && Array.isArray(value) && (
                        <table className="w-full text-left text-sm mb-2">
                        <thead className="bg-gray-100">
                            <tr>
                            {value.length > 0 &&
                                Object.keys(value[0]).map((col) => (
                                <th
                                    key={col}
                                    className="px-2 py-1 font-medium text-gray-600"
                                >
                                    {col}
                                </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {value.map((row: Record<string, any>, idx: number) => (
                            <tr
                                key={idx}
                                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                                {Object.values(row).map((cell, i) => (
                                <td key={i} className="px-2 py-1">
                                    {String(cell)}
                                </td>
                                ))}
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    )}

                    {key === 'tutor_schedules' && Array.isArray(value) && (
                        <table className="w-full text-left text-sm mb-2">
                        <thead className="bg-gray-100">
                            <tr>
                            {value.length > 0 &&
                                Object.keys(value[0]).map((col) => (
                                <th
                                    key={col}
                                    className="px-2 py-1 font-medium text-gray-600"
                                >
                                    {col.replace('_',' ')}
                                </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {value.map((row: Record<string, any>, idx: number) => (
                            <tr
                                key={idx}
                                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                                {Object.entries(row).map(([col, cell], i) => (
                                <td key={i} className="px-2 py-1">
                                    {col.toLowerCase().includes('date') || col.includes('hour')
                                    ? String(cell).substring(0, 10)
                                    : String(cell)}
                                </td>
                                ))}
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    )}
                    </dd>
                </div>
                ))}
            </dl>
        </div>
    </div>

  );
};

export default ItemDetails;

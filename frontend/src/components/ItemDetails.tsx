// src/pages/DetailPage.tsx
import { useParams, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/aixos';
import { useModal } from '../Hooks/useModal';
import Modal from './Modal';
import ParentSelector from './ParentFinder';

interface DetailPageParams {
  resource: string;
  id: string;
  [key: string]: string | undefined;
}



const ItemDetails: React.FC = () => {
  const { resource, id } = useParams<DetailPageParams>();
  const [item, setItem] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateItem, setUpdateItem] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const { isOpen, open, close } = useModal();

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
  }, [resource, id, updateItem]);

  const updateCurrentItem = (student:any) => {
    setUpdateItem(student)
  }

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!item) return <Navigate to={`/${resource}`} replace />;

  return (
    <div className=" mx-auto py-10 px-4">
        <h1 className="text-4xl font-bold mb-4">
            Détails du {resource}
        </h1>
        <div className="mx-auto py-10 px-4 bg-white shadow rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(item).map(([key, value]) => (

                    <div key={key}>

                        <div className="text-sm font-medium text-gray-500 capitalize">

                        {value !== null &&  key.replace('_', ' ')}

                        </div>
                        <div className="mt-1 text-gray-700">

                            {/* Cas simple */}
                            {typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value)  : null }

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

                            {key === 'students' && Array.isArray(value) && (
                                <div className="md:col-span-2">
                                    <dd className="mt-1 text-gray-700">
                                    <table className="w-full text-left text-sm mb-2">
                                        <thead className="bg-gray-100">
                                        <tr>
                                            {value.length > 0 &&
                                            Object.keys(value[0]).map((col) => (
                                                <th
                                                key={col}
                                                className="px-2 py-1 font-medium text-gray-600"
                                                >
                                                {col.replace('_', ' ')}
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {value.map((child: Record<string, any>, idx: number) => (
                                            <tr
                                            key={idx}
                                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                            >
                                            {Object.values(child).map((cell, i) => (
                                                <td key={i} className="px-2 py-1">
                                                {String(cell)}
                                                </td>
                                            ))}
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    </dd>
                                </div>
                            )}
                            
                            {key === 'parents' && Array.isArray(value) && value.length !== 0  && (
                            <div className="md:col-span-2">
                                <dd className="mt-1 text-gray-700">
                                <table className="w-full text-left text-sm mb-4">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        {/* colonnes déduites du premier parent */}
                                        {value.length > 0 &&
                                        Object.keys(value[0]).map((col) => (
                                            <th
                                            key={col}
                                            className="px-2 py-1 font-medium text-gray-600"
                                            >
                                            {col.replace('_', ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {value.map((parent: Record<string, any>, idx: number) => (
                                        <tr
                                        key={idx}
                                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                        >
                                        {Object.values(parent).map((cell, i) => (
                                            <td key={i} className="px-2 py-1">
                                            {String(cell)}
                                            </td>
                                        ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </dd>
                            </div>
                            )}

                            { key === 'parents' && value.length === 0 &&  (
                                <div className=" text-center py-4   ">
                                    <div className="p-2 bg-orange-400 items-center text-gray-100 leading-none lg:rounded-full flex lg:inline-flex w-full" role="alert" onClick={open}>
                                        <span className="flex rounded-full bg-orange-600 uppercase px-2 py-1 text-xs font-bold mr-3">Attention !</span>
                                        <span className="font-semibold mr-2 text-left flex-auto">l'élève n'a pas de parent! Cliquez ici pour créer ou l'attencher l'élève a son parent</span>
                                        <svg className="fill-current opacity-75 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z"/></svg>
                                    </div>
                                </div>
                            )} 

                            {key === 'sessions' && Array.isArray(value) && (
                            <div className="md:col-span-2">
                                <dd className="mt-1 text-gray-700">
                                <table className="w-full text-left text-sm mb-4">
                                    <thead className="bg-gray-100">
                                    <tr>
                                        {/* colonnes déduites de la première session */}
                                        {value.length > 0 &&
                                        Object.keys(value[0]).map((col) => (
                                            <th
                                            key={col}
                                            className="px-2 py-1 font-medium text-gray-600"
                                            >
                                            {col.replace('_', ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {value.map((session: Record<string, any>, idx: number) => (
                                        <tr
                                        key={idx}
                                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                        >
                                        {Object.values(session).map((cell, i) => (
                                            <td key={i} className="px-2 py-1">
                                            {String(cell)}
                                            </td>
                                        ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </dd>
                            </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <Modal
            isOpen={isOpen}
            title="Attacher ou créer le parent"
            onClose={close}
            footer={
                <>
                    <button
                    onClick={close}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                    Fermer
                    </button>
                </>
            }
        >
            <ParentSelector student={item} onClose={close} updateItem={updateCurrentItem} />
        </Modal>
    </div>

  );
};

export default ItemDetails;

// src/pages/DetailPage.tsx
import { useParams, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/aixos';
import { useModal } from '../Hooks/useModal';
import Modal from './Modal';
import ParentSelector from './ParentFinder';
import CustomAlert from './CustomAlert';
import { TranslateHeaderNames } from '../services/functions';

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
        console.log(data)
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

  const showDataDetails = (value:any, key: any) => {


    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          // Format français « 13/05/2025 à 11:32 »
          const datePart = date.toLocaleDateString('fr-FR');
          const timePart = date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          });
          return `${datePart} à ${timePart}`;
        }
    }

    if(key === 'is_active') {
        return value === true ?
        (
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/10 ring-inset">Activé</span>
        ):
        (
            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">Désactivé</span>
        )
        
    }
    
    // 2️⃣ Booléen
    if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non';
    }

    // 3️⃣ Null ou undefined
    if (value == null) {
    return '—';
    }
    
    if(key === 'roles') {
    switch(value[0]) {
        case "ROLE_TUTOR":
            return "Tuteur"
        case "ROLE_USER":
            return "Utilisateur"
        case "ROLE_ADMIN":
            return "Admin"
    }
    }
    
    return String(value);
  }


  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!item) return <Navigate to={`/${resource}`} replace />;

  return (
    <div className=" mx-auto py-4 px-4">
        {/* <h1 className="text-4xl font-bold mb-4">
            Détails du {resource}
        </h1> */}
        <div className="mx-auto py-10 px-2 bg-white shadow rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
                {Object.entries(item).map(([key, value]) => (

                    <div key={key} className="bg-gray-200 w-full p-2 rounded">
                        <div className="text-sm font-medium  capitalize w-full">
                            <div className='bg-orange-100 text-lg w-full flex items-center h-10 border-b-2 border-orange-400 px-1'>
                                {value !== null ? TranslateHeaderNames(key) :  key.replace('_', ' ')}
                            </div>
                        </div>
                        <div className="mt-1 text-gray-700">

                            { showDataDetails(value, key) }
                           
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
                                <CustomAlert title='Attention !' message="l'élève n'a pas de parent! Cliquez ici pour créer ou l'attencher l'élève a son parent" onClose={open}/>
                            )} 

                            {key === 'sessions' && Array.isArray(value) && (
                            <div className="md:col-span-2">
                                <dd className="mt-1 text-gray-700">
                                <table className="w-full text-left text-sm mb-4">
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

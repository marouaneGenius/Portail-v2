// src/pages/DetailPage.tsx
import { useParams, Navigate, redirect, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/aixos';
import { useModal } from '../Hooks/useModal';
import Modal from './Modal';
import ParentSelector from './ParentFinder';
import { showDataDetails, TranslateHeaderNames } from '../services/functions';
import { CustomAlert, CustomCenterComponent, CustomParentComponent, CustomReportsComponent, CustomSessionComponent, CustomStudentsComponent, CustomTutorScheduleComponent } from './CustomAlert';

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
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!resource || !id) return;
    setLoading(true);
    api
      .get(`/api/${resource}/${id}`)
      .then(({ data }:any) => {
        const {id, ...newobj} = data
        delete data.id;
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

  const redirection = (route:any) => {
    navigate(`/${route}`);
  }

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!item) return <Navigate to={`/${resource}`} replace />;

  return (
    <div className=" mx-auto py-3 px-4">
        <h1 className="text-4xl font-bold mb-4">
            Détails du {resource}
        </h1>
        <div className="mx-auto py-3 px-2 bg-white shadow-xl rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(item).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 w-full p-2 rounded">
                        <div className="text-sm font-medium  capitalize w-full">
                            <div className='bg-orange-100 text-lg w-full flex items-center h-10 border-b-2 border-orange-400 px-1'>
                                {value !== null ? TranslateHeaderNames(key) :  key.replace('_', ' ')}
                            </div>
                        </div>
                        <div className=''>
                            { showDataDetails(value, key) }
                        </div>

                        <div className="mt-0 text-gray-900 p-1 ">
                          <CustomParentComponent currentkey={key} value={value} onRedirect={redirection} />
                            <CustomStudentsComponent currentkey={key} value={value} onRedirect={redirection} />
                            <CustomReportsComponent currentkey={key} value={value} />
                            <CustomTutorScheduleComponent currentkey={key} value={value} />
                            <CustomSessionComponent currentkey={key} value={value} />
                            <CustomCenterComponent currentkey={key} value={value} onRedirect={redirection} />   {/* */}
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

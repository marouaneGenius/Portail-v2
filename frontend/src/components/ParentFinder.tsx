// src/components/ParentSelector.tsx
import React, { useState, useEffect } from 'react';
import api from '../api/aixos';
import FormGenerator from './FormGenerator';
import { parentFields } from '../forms/schemas';
import { useParams } from 'react-router-dom';

export interface Parent {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  zip_code?: string;
  city?: string;
}

export interface Student {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  }

interface ParentSelectorProps {
  student?: any
  onClose: () => void;
  updateItem: (res:any)=> void;
}

const ParentSelector: React.FC<ParentSelectorProps> = ({student, onClose, updateItem}) => {
    const [search, setSearch] = useState('');
    const [parents, setParents] = useState<Parent[]>([]);
    const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const noResults = !loading && search.trim() !== '' && parents.length === 0;
      const { id } = useParams();
    console.log

    useEffect(() => {
        setLoading(true);
        api.get<Parent[]>(`/api/parent`)
        .then((res) => {
            setParents(res.data)
            setFilteredParents(res.data)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }, []);

    const findParent = (term: string) => {
        setSearch(term);
        const t = term.trim().toLowerCase();

        if (!t) {
          setFilteredParents(parents);
          return;
        }
    
        const filteredItems =  parents.filter((item) => {
            if(item.firstname.toLowerCase().includes(t) || item.lastname.toLowerCase().includes(t) ) {
                return item;
            }
        })
        setFilteredParents(filteredItems)
    };

    const handleCreate = (values: Record<string, any>) => {
        api
        .post<Parent>('/api/parent', values)
        .then((res:any) => {
            onSelect(res.data);
        })
        .catch(console.error);
    };

    const onSelect = async (parent:any) => {
        try {
            api.post(`/api/student/${id}/parents`, {
            parentId: parent.id,
            }).then((res:any) => {
                onClose()
                updateItem(res)
            })
            .catch(console.error);

        } catch (err) {
            console.error('Erreur liaison parent/élève', err);
        }
    } 

    return (
        <div className="space-y-4">
            <input
                type="text"
                placeholder="Rechercher un parent…"
                value={search}
                onChange={e => {
                    findParent(e.target.value);
                    setCreating(false);
                }}
                className="w-full rounded border px-3 py-2 focus:ring focus:ring-blue-300"
            />
            {!creating && (
                <div className="max-h-60 overflow-auto">
                {loading && <p>Chargement…</p>}

                {!loading && parents.length > 0 && (
                    <ul className="divide-y border rounded">

                    { filteredParents.map((p) => (
                        <li
                        key={p.id}
                        onClick={() => onSelect(p)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                        >
                        <span>{p.firstname} {p.lastname}</span>
                        <span className="text-sm text-gray-500">{p.email}</span>
                        </li>
                    ))}
                    </ul>
                )}
                </div>
            )}
            <p className="text-sm text-gray-500">
                <button
                onClick={() => setCreating(true)}
                className="text-blue-600 hover:underline"
                >
                Créer un nouveau parent
                </button>
            </p>

            {creating && (
                <FormGenerator
                fields={parentFields}
                onSubmit={handleCreate}
                initialValues={{}}
                />
            )}
        </div>
    );
};

export default ParentSelector;

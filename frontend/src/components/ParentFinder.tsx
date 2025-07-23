// src/components/ParentSelector.tsx
import React, { useState, useEffect } from 'react';
import api from '../api/aixos';
import { debounce } from 'lodash';           // ≈ 2 ko dans le bundle

interface Parent {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

interface Props {
  onClose: () => void;
  updateItem: (p: Parent) => void;
}

const ParentSelector: React.FC<Props> = ({ onClose, updateItem }) => {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const doSearch = React.useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get<Parent[]>('/api/parent/search', {
          params: { q }
        });
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );


  useEffect(() => {
    doSearch(term);
  }, [term, doSearch]);

  const handleSelect = (p: Parent) => {
    setSelectedId(p.id);
    updateItem(p);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Rechercher un parent…"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="w-full rounded border px-3 py-2 focus:ring focus:ring-blue-300"
      />

      {/* Résultats ------------------------------------------------ */}
      {loading && <p>Chargement…</p>}

      {!loading && term && results.length === 0 && (
        <p className="text-sm text-gray-500">Aucun parent trouvé.</p>
      )}

      {!loading && results.length > 0 && (
        <ul className="max-h-60 overflow-auto divide-y border rounded">
          {results.map((p) => (
            <li
              key={p.id}
              onClick={() => handleSelect(p)}
              className={
                'px-4 py-2 cursor-pointer flex justify-between hover:bg-gray-100 ' +
                (selectedId === p.id ? 'bg-blue-100 font-semibold' : '')
              }
            >
              <span>
                {p.firstname} {p.lastname}
              </span>
              <span className="text-sm text-gray-500">{p.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParentSelector;

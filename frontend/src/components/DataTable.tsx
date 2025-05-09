// src/components/DataTable.tsx
import { useEffect, useState } from 'react';
import api from '../api/aixos';
import { HiEye, HiPencil, HiTrash } from 'react-icons/hi';

interface DataTableProps {
  endpoint: string;          // 'users' | 'centers' | 'students' | ...
  pageSize?: number;         // optionnel, taille de page
}

const DataTable: React.FC<DataTableProps> = ({ endpoint, pageSize = 10 }) => {
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
        setLoading(true);
        try {
            const { data: response } = await api.get<{
            data?: any[];
            total?: number;
            }>(`/api/${endpoint}?page=${page}&limit=${pageSize}`);

            // supporte deux formats : {data:[],total} ou [] direct
            const items: any = Array.isArray(response)
            ? response
            : response.data;

            setData(items);
            setTotal(response.total ?? null);

            if (items.length && columns.length === 0) {
            setColumns(Object.keys(items[0]));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, [endpoint, page, pageSize]);

    const handleDelete = (id:any) => {
        console.log(id)

    }

    if (loading) return <p>Chargement…</p>;
    if (!data.length) return <p>Aucune donnée.</p>;

    return (
        <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded mb-4">
            <thead className="bg-gray-100">
                <tr>
                    {columns.map((col) => (
                        <th
                            key={col}
                            className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                        >
                            {col}
                        </th>
                    ))}
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                            Actions
                        </th>
                </tr>
            </thead>
            <tbody>
            {data.map((row, idx) => (
                <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                {columns.map((col) => (
                    <td key={col} className="px-4 py-2 text-sm text-gray-700">
                        {String(row[col])}
                    </td>
                ))}
                    <td className="flex px-4 py-2 text-sm text-gray-700 space-x-2">
                        <a
                            href={`/${endpoint}/${row.id}`}
                            className="text-blue-600 hover:underline"
                        >
                            {/* Voir */}
                            <HiEye className="h-5 w-5 text-blue-600" />
                        </a>
                        <a
                            href={`/${endpoint}/${row.id}/edit`}
                            className="text-green-600 hover:underline"
                        >
                            {/* Modifier */}
                            <HiPencil className="h-5 w-5 text-green-600" />
                        </a>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600 hover:underline"
                        >
                            {/* Supprimer */}
                            <HiTrash className="h-5 w-5 text-red-600" />
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>

        {/* Pagination simple */}
        {total !== null && (
            <div className="flex justify-between items-center">
            <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                Précédent
            </button>
            <span>
                Page {page}
                {total !== null && ` / ${Math.ceil(total / pageSize)}`}
            </span>
            <button
                onClick={() =>
                total !== null &&
                setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))
                }
                disabled={total !== null && page >= Math.ceil(total / pageSize)}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                Suivant
            </button>
            </div>
        )}
        </div>
    );
};

export default DataTable;
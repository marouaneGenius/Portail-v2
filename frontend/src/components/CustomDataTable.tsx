// src/components/DataTable.tsx
import { useEffect, useMemo, useState } from 'react';
import api from '../api/aixos';
import { HiEye, HiOutlineUser, HiOutlineUserAdd, HiOutlineUserCircle, HiPencil, HiTrash } from 'react-icons/hi';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { TranslateHeaderNames } from '../services/functions';

interface DataTableProps {
  endpoint: string;          // 'users' | 'centers' | 'students' | ...
  pageSize?: number;         // optionnel, taille de page
}

interface Center {
    id: number;
    name: string;
    address: string;
    city: string;
  }
  
  interface Row {
    id: number;
    id_center: number;
  }

const CustomDataTable: React.FC<DataTableProps> = ({ endpoint, pageSize = 10 }) => {
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [centerMap, setCenterMap] = useState<Record<number, string>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: response } = await api.get<{
            data?: any[];
            total?: number;
            }>(`/api/${endpoint}?page=${page}&limit=${pageSize}`);
            const items: any = Array.isArray(response)
            ? response
            : response.data;
            const filteredData = items.map(({ is_deleted, ...rest }:any) => rest);
            
            setData(filteredData);
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

    useEffect(() => {
        api.get<Center[]>('/api/center').then((res) => {
          const map: Record<number,string> = {};
          res.data.forEach((c) => {
            map[c.id] = c.name;
          });
          setCenterMap(map);
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [endpoint, page, pageSize]);

    const columns_ = useMemo(() => {
        if (!data.length) return [];
        return Object.keys(data[0])
          .filter((k) => k !== 'is_deleted')
          .map((key) => {
            const header = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            const body = (row: any) => {
              const v = row[key];
                if (key === 'created_at') {
                    return v
                    ? new Date(v).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        })
                    : '—';
                }
                if (key === 'id_center' && centerMap) {
                    return `${centerMap[row.id_center]}`
                }
                if (key === 'is_active') {
                    return row.is_active ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/10 ring-inset">Activé</span>
                    ) : (<span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">Désactivé</span>)
                }
                if (key === 'google_id') {
                    return row.google_id ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/10 ring-inset">
                        <img src="logo/logo-google.svg" alt="Google" className="mr-2 h-5 w-5" />
                            GOOGLE</span>
                    ) : (<span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-600/10 ring-inset">Auth</span>)
               
                }
                if(key === 'roles'){
                    if (row.roles[0] === 'ROLE_ADMIN') {
                        return  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/10 ring-inset">
                                    <HiOutlineUserAdd className="h-5 w-5"  /> Admin
                                </span>
                    } else if(row.roles[0] === 'ROLE_USER') {
                        return  <span className="inline-flex items-center rounded-md bg px-2 py-1 text-xs font-medium text-color ring-1 ring-green-600/10 ring-inset">
                                    <HiOutlineUser className="h-5 w-5"  /> User
                                </span>
                    } else {
                        return  <span className="inline-flex items-center rounded-md bg-white-50 px-2 py-1 text-xs font-medium text-black-700 ring-1 ring-green-600/10 ring-inset">
                                    <HiOutlineUserCircle className="h-5 w-5"  /> Tuteur
                                </span>
                    }
                }

              return v == null ? '—' : String(v);
            };
            return {
              field: key,
              header,
              body,
              headerClassName: 'bg-gray-100 text-gray-700',  // style header
              bodyClassName: 'text-gray-800',                // style cellules
            };
          })
          .concat({
            field: 'actions',
            header: 'Actions',
            body: (row: any) => (
                <div className="flex space-x-2">
                        <a
                            href={`/${endpoint}/${row.id}`}
                            className="text-blue-600 hover:underline"
                        >
                            <HiEye className="h-5 w-5 text-blue-600" />
                        </a>
                        <a
                            href={`/${endpoint}/${row.id}/edit`}
                            className="text-green-600 hover:underline"
                        >
                            <HiPencil className="h-5 w-5 text-green-600" />
                        </a>
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="text-red-600 hover:underline"
                        >
                            <HiTrash className="h-5 w-5 text-red-600" />
                        </button>
                </div>
            ),
            headerClassName: 'bg-gray-100 text-gray-700',
            bodyClassName: 'text-gray-800',
        });
    }, [data]);
    
    const header = (
        <div className="flex justify-between items-center p-3 bg-white border-b bg">
            <span className="p-input-icon-left w-full  py-1">
            <InputText
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Rechercher..."
                className="border color-border border-2 rounded px-2 py-1 w-full h-12 "
            />
            </span>
        </div>
    );
    
    const handleDelete = async (id:any) => {
        if (!window.confirm('Confirmer la suppression de cet utilisateur ?')) {
          return;
        }
        try {
            await api.delete(`/api/${endpoint}/${id}`);
            fetchData();
        } catch (err) {
          console.error(err);
          alert('Erreur lors de la suppression');
        }
    };

    if (loading) return <p>Chargement…</p>;
    if (!data.length) return <p>Aucune donnée.</p>;

    return (
        <div 
            className="overflow-x-auto "
        >
            <div className='py-3'>
                <button 
                    className="bg-white hover:bg-gray-100 text-color font-semibold py-2 px-4 border color-border rounded shadow"
                >
                    <a
                        href={`/form/${endpoint}/`}
                        className="text-color  hover:underline"
                    >
                        Ajouter +
                    </a>
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md rounded shadow">
                <DataTable
                    showGridlines
                    value={data}
                    header={header}                       
                    globalFilter={globalFilter}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10,25,50]}
                    className="shadow-lg rounded-lg overflow-hidden"
                    tableClassName="min-w-full "
                    rowClassName={(_, i:any) => i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    paginatorClassName="bg-white border-t border-gray-200 p-3 flex justify-between items-center"
                    currentPageReportTemplate="Page {first}–{last} / {totalRecords}"
                    paginatorTemplate="
                      RowsPerPageDropdown 
                      CurrentPageReport 
                      PrevPageLink 
                      PageLinks 
                      NextPageLink
                    "
                >
                {columns_.map((col) => {
                    const styleOfTable:any = {
                        backgroundColor: 'rgba(36, 153, 46, 0.36)',  // Indigo 800
                        color: 'black',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',           
                        padding: '0.75rem 1.5rem',     
                        paddingBlock: '1rem'
                    }
                    let header_name:any = '';
                    header_name = TranslateHeaderNames(col.field.toLowerCase())
                    return (  
                    <Column
                        key={col.field}
                        field={col.field}
                        header={header_name}
                        body={col.body}
                        sortable
                        filter={col.field !== 'actions'}
                        style={{ width: '25%' }}
                        bodyClassName="px-4 py-2 border-b border-gray-200 text-gray-800"
                        headerStyle={styleOfTable}

                    />
                    )
                } )}
            </DataTable>
            </div>
        </div>
    );
};

export default CustomDataTable;
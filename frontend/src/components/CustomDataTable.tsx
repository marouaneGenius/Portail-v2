import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/aixos';
import { Center } from '@/types/entities';
import {
  Plus, Search, Eye, Pencil, Trash2,
  ShieldCheck, UserRound, GraduationCap, Mail, Phone, Mars, Venus
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TranslateHeaderNames } from '../services/functions';

interface DataTableProps {
  endpoint: string;
  title?: string;
  addLabel?: string; // <- Texte personnalisable pour le bouton "Ajouter"
}

export default function CustomDataTable({
  endpoint,
  title = '',
  addLabel = 'Ajouter',
}: DataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [centerMap, setCenterMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get(`/api/${endpoint}`);
      const items = Array.isArray(response) ? response : response.data;
      const cleaned = items.map(({ is_deleted, ...rest }: any) => rest);
      setData(cleaned);
    } catch (err) {
      console.error('Erreur fetchData:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const fetchCenters = useCallback(async () => {
    try {
      const res = await api.get<Center[]>('/api/center');
      const map: Record<number, string> = {};
      res.data.forEach((c) => {
        map[c.id] = c.name;
      });
      setCenterMap(map);
    } catch (err) {
      console.error('Erreur fetchCenters:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchCenters();
  }, [fetchData, fetchCenters]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await api.delete(`/api/${endpoint}/${id}`);
      fetchData();
    } catch (err) {
      console.error('Erreur delete:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(globalFilter.toLowerCase())
      )
    );
  }, [data, globalFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    setCurrentPage((prev) => {
      if (direction === 'next') return Math.min(prev + 1, totalPages);
      if (direction === 'prev') return Math.max(prev - 1, 1);
      return prev;
    });
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-mister-anthracite">{title}</h1>
        <Button
          className="bg-hello-yellow text-mister-anthracite hover:bg-hello-yellow/90 transition"
          onClick={() => navigate(`/form/${endpoint}`)}
        >
          <Plus className="w-4 h-4 mr-2" />
          {addLabel}
        </Button>
      </div>

      <Card className="border-fading-grey shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <CardTitle className="text-xl text-mister-anthracite">Résultats</CardTitle>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mister-anthracite/50 w-4 h-4" />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Rechercher…"
                className="pl-10 border-fading-grey"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-sm text-mister-anthracite/70 py-8 text-center">Chargement des données…</div>
          ) : filteredData.length === 0 ? (
            <div className="text-sm text-mister-anthracite/70 py-8 text-center">Aucune donnée trouvée.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-fading-grey">
                    {Object.keys(paginatedData[0]).map((key) => (
                      <TableHead key={key} className="text-mister-anthracite uppercase text-xs">
                        {TranslateHeaderNames(key)}
                      </TableHead>
                    ))}
                    <TableHead className="text-mister-anthracite uppercase text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-fading-grey/50">
                      {Object.keys(row).map((key) => {
                        const value = row[key];

                        return (
                          <TableCell key={key} className="text-mister-anthracite text-sm">
                            {(() => {
                              // Role badge + icon
                              if (key === 'roles' && Array.isArray(value)) {
                                const role = value[0];
                                const roleMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
                                  ROLE_ADMIN: {
                                    label: 'Admin',
                                    color: 'bg-crazy-magenta/10 text-crazy-magenta',
                                    icon: <ShieldCheck className="w-3 h-3 mr-1" />,
                                  },
                                  ROLE_USER: {
                                    label: 'Utilisateur',
                                    color: 'bg-fading-grey text-mister-anthracite',
                                    icon: <UserRound className="w-3 h-3 mr-1" />,
                                  },
                                  ROLE_TUTOR: {
                                    label: 'Tuteur',
                                    color: 'bg-blue-100 text-blue-600',
                                    icon: <GraduationCap className="w-3 h-3 mr-1" />,
                                  },
                                };
                                const roleStyle = roleMap[role] || roleMap.ROLE_USER;
                                return (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleStyle.color}`}>
                                    {roleStyle.icon} {roleStyle.label}
                                  </span>
                                );
                              }

                              if(key === 'email') {
                                return (
                                  <span className="inline-flex items-center rounded-md bg-[#F2F2F2] px-2 py-1 text-xs font-medium text-[#333333] ring-1 ring-[#FFB800]/20 ring-inset">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {value}
                                  </span>
                                );
                              }

                              if(key === 'phone') {
                                return value ?(
                                  <span className="inline-flex items-center rounded-md bg-[#FFB800]/10 px-2 py-1 text-xs font-medium text-[#FFB800] ring-1 ring-[#FFB800]/20  ring-inset">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {value}
                                  </span>
                                ): (
                                  <span className="inline-flex items-center rounded-md bg-[#FFB800]/10 px-2 py-1 text-xs font-medium text-[#FFB800] ring-1 ring-[#FFB800]/20 ring-inset">
                                    <Phone className="w-3 h-3 mr-1" />
                                    Non renseigné
                                  </span>
                                );
                              }

                              if (key === 'is_active') {
                                return value ? (
                                  <span className="inline-flex items-center rounded-full bg-green-100 text-green-600 text-xs font-medium px-2 py-1">
                                    Actif
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 text-xs font-medium px-2 py-1">
                                    Désactivé
                                  </span>
                                );
                              }

                              if (key === 'google_id') {
                                return value ? (
                                  <span className="inline-flex items-center rounded-md bg-[#F2F2F2] px-2 py-1 text-xs font-medium text-[#333333] ring-1 ring-[#FFB800]/20 ring-inset">
                                    <img src="/logo/logo-google.svg" alt="Google" className="mr-2 h-5 w-5" />
                                    GOOGLE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-md bg-[#FFB800]/10 px-2 py-1 text-xs font-medium text-[#FFB800] ring-1 ring-[#FFB800]/20 ring-inset">
                                    Auth
                                  </span>
                                );
                              }

                              if (key === 'created_at' && value) {
                                return new Date(value).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                });
                              }

                              if (typeof value === 'boolean') return value ? 'Oui' : 'Non';

                              if (key === 'id_center') return centerMap[value] || '—';

                              if (key === 'gender') {
                                if (value === 'male' || value === 'homme' || value === 'M') {
                                  return (
                                    <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600  ring-1 ring-[#FFB800]/20  ring-inset">
                                    <Mars className="w-3 h-3 mr-1" />
                                    Homme
                                  </span>
                                  );
                                }
                                if (value === 'female' || value === 'femme' || value === 'F') {
                                  return (
                                    <span className="inline-flex items-center rounded-md bg-pink-100 px-2 py-1 text-xs font-medium text-pink-600  ring-1 ring-[#FFB800]/20  ring-inset">
                                    <Venus className="w-3 h-3 mr-1" />
                                    Femme
                                  </span>
                                  );
                                }
                                return (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1">
                                    Autre
                                  </span>
                                );
                              }

                              return value || '—';
                            })()}
                          </TableCell>
                        );
                      })}

                      <TableCell>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" className='hover:bg-hello-yellow/20' size="sm" onClick={() => navigate(`/${endpoint}/${row.id}`)}>
                                  <Eye className="w-4 h-4 text-mister-anthracite/70" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Voir</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" className='hover:bg-hello-yellow/20' size="sm" onClick={() => navigate(`/${endpoint}/${row.id}/edit`)}>
                                  <Pencil className="w-4 h-4 text-hello-yellow" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Modifier</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" className='hover:bg-hello-yellow/20' size="sm" onClick={() => handleDelete(row.id)}>
                                  <Trash2 className="w-4 h-4 text-crazy-magenta" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Supprimer</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-mister-anthracite/70">
                  <label htmlFor="rows">Afficher</label>
                  <select
                    id="rows"
                    value={rowsPerPage}
                    onChange={handleRowsChange}
                    className="border border-fading-grey rounded px-2 py-1 text-sm"
                  >
                    <option value={20}>20 lignes</option>
                    <option value={50}>50 lignes</option>
                    <option value={100}>100 lignes</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => handlePageChange('prev')}>
                    Précédent
                  </Button>
                  <span className="text-sm text-mister-anthracite/70">
                    Page {currentPage} / {totalPages || 1}
                  </span>
                  <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => handlePageChange('next')}>
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

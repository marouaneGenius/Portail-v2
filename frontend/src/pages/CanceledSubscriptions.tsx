import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import api from '../api/aixos';
import {
  Search, Eye, Calendar, User, FileText, AlertCircle, XCircle, Download
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
import { Badge } from '@/components/ui/badge';

interface CanceledSubscription {
  id: number;
  combined_id: string;
  subscription_type: string;
  subscription_start_date: string;
  subscription_end_date: string;
  resiliation_date: string | null;
  is_canceled: boolean;
  canceled_by: string;
  canceled_at: string;
  is_suspended: boolean;
  student: {
    id: number;
    firstname: string;
    lastname: string;
    class: string;
    email: string | null;
    phone: string | null;
  } | null;
  created_at: string;
  created_by: string;
}

const CanceledSubscriptions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<CanceledSubscription[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<string>('canceled_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get('/api/subs/canceled');
      setData(response);
    } catch (err) {
      console.error('Erreur lors de la récupération des contrats résiliés:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchStr = globalFilter.toLowerCase();
      return (
        item.student?.firstname?.toLowerCase().includes(searchStr) ||
        item.student?.lastname?.toLowerCase().includes(searchStr) ||
        item.combined_id?.toLowerCase().includes(searchStr) ||
        item.subscription_type?.toLowerCase().includes(searchStr) ||
        item.canceled_by?.toLowerCase().includes(searchStr)
      );
    });
  }, [data, globalFilter]);

  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal: any = a[sortBy as keyof CanceledSubscription];
      let bVal: any = b[sortBy as keyof CanceledSubscription];

      // Gestion des champs imbriqués
      if (sortBy === 'student_name' && a.student && b.student) {
        aVal = `${a.student.lastname} ${a.student.firstname}`;
        bVal = `${b.student.lastname} ${b.student.firstname}`;
      }

      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal), 'fr', { sensitivity: 'base' })
        : String(bVal).localeCompare(String(aVal), 'fr', { sensitivity: 'base' });
    });
  }, [filteredData, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubscriptionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'genius_access': 'Genius Access',
      'genius_plus': 'Genius Plus',
      'genius_premium': 'Genius Premium',
      'annuel': 'Annuel',
      'trimestriel': 'Trimestriel',
      'stage': 'Stage',
      'ponctuel': 'Ponctuel'
    };
    return types[type] || type;
  };

  const exportToCSV = () => {
    const headers = [
      'ID Contrat',
      'Type Contrat',
      'Nom Élève',
      'Prénom Élève',
      'Classe',
      'Email Élève',
      'Téléphone',
      'Date Début',
      'Date Fin',
      'Date Résiliation',
      'Résilié Le',
      'Résilié Par',
      'Suspendu',
      'Créé Le',
      'Créé Par'
    ];

    const rows = sortedData.map(item => [
      item.combined_id || item.id,
      getSubscriptionTypeLabel(item.subscription_type),
      item.student?.lastname || '',
      item.student?.firstname || '',
      item.student?.class || '',
      item.student?.email || '',
      item.student?.phone || '',
      formatDate(item.subscription_start_date),
      formatDate(item.subscription_end_date),
      formatDate(item.resiliation_date),
      formatDateTime(item.canceled_at),
      item.canceled_by || '',
      item.is_suspended ? 'Oui' : 'Non',
      formatDateTime(item.created_at),
      item.created_by || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contrats_resilies_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto py-6 px-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <CardTitle className="text-2xl">Contrats Résiliés</CardTitle>
            </div>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche et statistiques */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, type de contrat, résilié par..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Résiliés</p>
                      <p className="text-2xl font-bold text-red-600">{data.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Suspendus</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {data.filter(s => s.is_suspended).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Résultats</p>
                      <p className="text-2xl font-bold text-blue-600">{filteredData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('combined_id')}
                      >
                        <div className="flex items-center gap-1">
                          ID Contrat
                          {sortBy === 'combined_id' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('subscription_type')}
                      >
                        <div className="flex items-center gap-1">
                          Type
                          {sortBy === 'subscription_type' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('student_name')}
                      >
                        <div className="flex items-center gap-1">
                          Élève
                          {sortBy === 'student_name' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('resiliation_date')}
                      >
                        <div className="flex items-center gap-1">
                          Date Résiliation
                          {sortBy === 'resiliation_date' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('canceled_at')}
                      >
                        <div className="flex items-center gap-1">
                          Résilié Le
                          {sortBy === 'canceled_at' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('canceled_by')}
                      >
                        <div className="flex items-center gap-1">
                          Résilié Par
                          {sortBy === 'canceled_by' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                          Aucun contrat résilié trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {item.combined_id || `#${item.id}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getSubscriptionTypeLabel(item.subscription_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.student ? (
                              <div>
                                <p className="font-medium">
                                 {item.student.firstname} {item.student.lastname}
                                </p>
                                {item.student.email && (
                                  <p className="text-xs text-gray-500">{item.student.email}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{item.student?.class || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {formatDate(item.resiliation_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {formatDateTime(item.canceled_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{item.canceled_by}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.is_suspended ? (
                              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                <XCircle className="h-3 w-3" />
                                Suspendu
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="w-fit">
                                Résilié
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {item.student ? (
                                    <Link to={`/student/${item.student.id}`}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Voir l'élève</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Lignes par page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsChange}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages || 1} ({sortedData.length} résultats)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage >= totalPages}
                  >
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
};

export default CanceledSubscriptions;

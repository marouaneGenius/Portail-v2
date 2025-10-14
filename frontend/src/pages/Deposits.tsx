import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import api from '../api/aixos';
import { Coins, Building, Users, Phone, Mail, ArrowUpDown } from 'lucide-react';

interface Deposit {
  id: number;
  firstname: string;
  lastname: string;
  class: string;
  phone: string;
  deposit_amount: string;
  deposit_status: string;
  center: {
    id: number;
    name: string;
    city: string;
  } | null;
  parent: {
    id: number;
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
  } | null;
  created_at: string;
  completed_sessions_count: number;
  next_session: {
    scheduled_at: string;
    tutor: {
      firstname: string;
      lastname: string;
    } | null;
    subjects: string[] | null;
  } | null;
}

interface Center {
  id: number;
  name: string;
  city: string;
}

const Deposits: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'lastname' | 'amount' | 'status'>('lastname');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    fetchDeposits();
  }, [selectedCenter]);

  const fetchCenters = async () => {
    try {
      const response = await api.get('/api/center');
      setCenters(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des centres:', error);
    }
  };

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const params = selectedCenter !== 'all' ? { center_id: selectedCenter } : {};
      const response = await api.get('/api/student/deposits', { params });
      setDeposits(response.data.deposits);
    } catch (error) {
      console.error('Erreur lors du chargement des cautions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string | null) => {
    switch (status) {
      case 'en_attente_reception':
        return { label: 'En attente', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'reception_centre':
        return { label: 'Au centre', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'reception_siege':
        return { label: 'Au siège', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'rendu_parent':
        return { label: 'Rendue', color: 'bg-green-100 text-green-800 border-green-200' };
      default:
        return { label: 'Non défini', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const handleSort = (field: 'lastname' | 'amount' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDeposits = [...deposits].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'lastname':
        comparison = a.lastname.localeCompare(b.lastname);
        break;
      case 'amount':
        comparison = parseFloat(a.deposit_amount) - parseFloat(b.deposit_amount);
        break;
      case 'status':
        comparison = (a.deposit_status || '').localeCompare(b.deposit_status || '');
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalAmount = deposits.reduce((sum, d) => sum + parseFloat(d.deposit_amount), 0);

  const statusCounts = deposits.reduce((acc, d) => {
    const status = d.deposit_status || 'non_defini';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-mister-anthracite">Gestion des Cautions</h1>
        <p className="text-mister-anthracite/70 mt-2">
          Vue d'ensemble de toutes les cautions d'élèves
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-fading-grey">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mister-anthracite/70">Total Cautions</p>
                <p className="text-2xl font-bold text-mister-anthracite">{deposits.length}</p>
              </div>
              <Users className="w-8 h-8 text-hello-yellow" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-fading-grey">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mister-anthracite/70">Montant Total</p>
                <p className="text-2xl font-bold text-mister-anthracite">
                  {totalAmount.toFixed(2)} €
                </p>
              </div>
              <Coins className="w-8 h-8 text-crazy-magenta" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-fading-grey">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mister-anthracite/70">En Attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {statusCounts['en_attente_reception'] || 0}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-bold">!</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-fading-grey">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-mister-anthracite/70">Rendues</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts['rendu_parent'] || 0}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et Table */}
      <Card className="border-fading-grey">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-mister-anthracite">
                Liste des Cautions
              </CardTitle>
              <CardDescription>
                {deposits.length} caution{deposits.length > 1 ? 's' : ''} enregistrée{deposits.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-mister-anthracite/50" />
              <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les centres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les centres</SelectItem>
                  {centers.map((center) => (
                    <SelectItem key={center.id} value={center.id.toString()}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-mister-anthracite/70">
              Chargement...
            </div>
          ) : deposits.length === 0 ? (
            <div className="text-center py-8 text-mister-anthracite/70">
              Aucune caution trouvée
            </div>
          ) : (
            <div className="rounded-md border border-fading-grey overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-fading-grey/30">
                    <TableHead
                      className="cursor-pointer hover:bg-fading-grey/50"
                      onClick={() => handleSort('lastname')}
                    >
                      <div className="flex items-center gap-2">
                        Élève
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Centre</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-fading-grey/50"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        Montant
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-fading-grey/50"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Statut
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead>Séances effectuées</TableHead>
                    <TableHead>Prochaine séance</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDeposits.map((deposit) => {
                    const statusInfo = getStatusInfo(deposit.deposit_status);
                    return (
                      <TableRow key={deposit.id} className="hover:bg-fading-grey/20">
                        <TableCell className="font-medium">
                          {deposit.firstname} {deposit.lastname}
                        </TableCell>
                        <TableCell>{deposit.class}</TableCell>
                        <TableCell>
                          {deposit.center ? (
                            <div className="text-sm">
                              <div className="font-medium">{deposit.center.name}</div>
                            </div>
                          ) : (
                            <span className="text-mister-anthracite/50">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-mister-anthracite">
                          {parseFloat(deposit.deposit_amount).toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <span className="font-semibold text-mister-anthracite">
                              {deposit.completed_sessions_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {deposit.next_session ? (
                            <div className="text-sm space-y-1">
                              <div className="font-medium text-mister-anthracite">
                                {(() => {
                                  const date = new Date(deposit.next_session.scheduled_at);
                                  const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
                                  const dayNum = date.getDate();
                                  const month = date.toLocaleDateString('fr-FR', { month: 'long' });
                                  const time = date.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' });
                                  return `${day} ${dayNum} ${month} à ${time}`;
                                })()}
                              </div>
                              {deposit.next_session.tutor && (
                                <div className="text-mister-anthracite/70">
                                 👨‍🏫 {deposit.next_session.tutor.firstname} {deposit.next_session.tutor.lastname}
                                </div>
                              )}
                              {deposit.next_session.subjects && deposit.next_session.subjects.length > 0 && (
                                <div className="text-xs text-mister-anthracite/60">
                                  📚 {deposit.next_session.subjects.join(', ')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-mister-anthracite/50 text-sm">Aucune séance</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {deposit.parent ? (
                            <div className="text-sm">
                              <div>{deposit.parent.firstname} {deposit.parent.lastname}</div>
                            </div>
                          ) : (
                            <span className="text-mister-anthracite/50">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {deposit.parent && (
                            <div className="flex flex-col gap-1 text-xs">
                              {deposit.parent.phone && (
                                <div className="flex items-center gap-1 text-mister-anthracite/70">
                                  <Phone className="w-3 h-3" />
                                  {deposit.parent.phone}
                                </div>
                              )}
                              {deposit.parent.email && (
                                <div className="flex items-center gap-1 text-mister-anthracite/70">
                                  <Mail className="w-3 h-3" />
                                  {deposit.parent.email}
                                </div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/student/${deposit.id}`)}
                          >
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Deposits;

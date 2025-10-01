import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/aixos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Users,
  MapPin,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Download,
  RotateCcw
} from 'lucide-react';

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  class: string;
  phone: string;
}

interface Tutor {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface Center {
  id: number;
  name: string;
  city: string;
  address: string;
}

interface TrialSession {
  id: number;
  scheduled_at: string;
  date_slot: string;
  school_subjects: string[];
  is_paid: boolean;
  is_canceled: boolean;
  is_absent: boolean;
  stripe_number: string | null;
  resume: string | null;
  created_at: string;
  created_by: string;
  students: Student[];
  tutor: Tutor | null;
  center: Center | null;
}

interface ApiResponse {
  total: number;
  sessions: TrialSession[];
}

const TrialSessions: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<TrialSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState<Center[]>([]);

  // Filtres
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [cancelStatus, setCancelStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    thisWeek: 0,
    lastWeek: 0,
    weekPercentage: 0,
    upcoming: 0,
  });

  // Chargement des centres
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await api.get('/api/center');
        setCenters(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des centres:', error);
      }
    };
    fetchCenters();
  }, []);

  // Chargement des séances d'essai
  const fetchTrialSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // N'ajouter les paramètres que si ce ne sont pas les valeurs par défaut
      if (selectedCenter && selectedCenter !== 'all') {
        params.append('center_id', selectedCenter);
      }
      if (paymentStatus && paymentStatus !== 'all') {
        params.append('is_paid', paymentStatus);
      }
      if (cancelStatus && cancelStatus !== 'all') {
        params.append('is_canceled', cancelStatus);
      }
      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }

      const url = params.toString()
        ? `/api/sessions/trial-sessions?${params.toString()}`
        : '/api/sessions/trial-sessions';

      const response = await api.get<ApiResponse>(url);

      // Trier par date de création (plus récent en premier)
      const sortedSessions = response.data.sessions.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setSessions(sortedSessions);

      // Calculer les statistiques
      const now = new Date();

      // Calculer le début et la fin de la semaine actuelle (lundi à dimanche)
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Si dimanche (0), reculer de 6 jours

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Calculer la semaine dernière
      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfWeek.getDate() - 7);

      const endOfLastWeek = new Date(startOfWeek);
      endOfLastWeek.setDate(startOfWeek.getDate() - 1);
      endOfLastWeek.setHours(23, 59, 59, 999);

      // Compter les séances de cette semaine (basé sur created_at)
      const thisWeekSessions = response.data.sessions.filter(s => {
        const createdDate = new Date(s.created_at);
        return createdDate >= startOfWeek && createdDate <= endOfWeek;
      }).length;

      // Compter les séances de la semaine dernière
      const lastWeekSessions = response.data.sessions.filter(s => {
        const createdDate = new Date(s.created_at);
        return createdDate >= startOfLastWeek && createdDate <= endOfLastWeek;
      }).length;

      // Calculer le pourcentage d'évolution
      let weekPercentage = 0;
      if (lastWeekSessions > 0) {
        weekPercentage = ((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100;
      } else if (thisWeekSessions > 0) {
        weekPercentage = 100; // Si pas de séances la semaine dernière mais qu'il y en a cette semaine
      }

      const stats = {
        total: response.data.sessions.length,
        paid: response.data.sessions.filter(s => s.is_paid).length,
        unpaid: response.data.sessions.filter(s => !s.is_paid && !s.is_canceled).length,
        thisWeek: thisWeekSessions,
        lastWeek: lastWeekSessions,
        weekPercentage: Math.round(weekPercentage),
        upcoming: response.data.sessions.filter(s => new Date(s.scheduled_at) > now && !s.is_canceled).length,
      };
      setStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des séances d\'essai:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialSessions();
  }, [selectedCenter, paymentStatus, cancelStatus, startDate, endDate]);

  // Filtrage par recherche locale
  const filteredSessions = sessions.filter(session => {
    if (!searchTerm || searchTerm.trim() === '') return true;

    const term = searchTerm.toLowerCase().trim();

    // Recherche dans les étudiants
    const matchStudent = session.students.some(s =>
      (s.firstname && s.firstname.toLowerCase().includes(term)) ||
      (s.lastname && s.lastname.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.class && s.class.toLowerCase().includes(term))
    );

    // Recherche dans le tuteur
    const matchTutor = session.tutor && (
      (session.tutor.firstname && session.tutor.firstname.toLowerCase().includes(term)) ||
      (session.tutor.lastname && session.tutor.lastname.toLowerCase().includes(term)) ||
      (session.tutor.email && session.tutor.email.toLowerCase().includes(term))
    );

    // Recherche dans le centre
    const matchCenter = session.center && (
      (session.center.name && session.center.name.toLowerCase().includes(term)) ||
      (session.center.city && session.center.city.toLowerCase().includes(term))
    );

    // Recherche dans les matières
    const matchSubjects = session.school_subjects && session.school_subjects.some(subject =>
      subject.toLowerCase().includes(term)
    );

    // Recherche dans le créateur
    const matchCreator = session.created_by && session.created_by.toLowerCase().includes(term);

    return matchStudent || matchTutor || matchCenter || matchSubjects || matchCreator;
  });

  const resetFilters = () => {
    setSelectedCenter('all');
    setPaymentStatus('all');
    setCancelStatus('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  // Fonction pour exporter les données en CSV
  const exportToCSV = () => {
    // Préparer les données
    const csvData = filteredSessions.map(session => ({
      'Date séance': formatDate(session.scheduled_at),
      'Étudiant(s)': session.students.map(s => `${s.firstname} ${s.lastname}`).join(', '),
      'Classe': session.students.map(s => s.class).join(', '),
      'Email étudiant': session.students.map(s => s.email).join(', '),
      'Centre': session.center?.name || '-',
      'Ville': session.center?.city || '-',
      'Tuteur': session.tutor ? `${session.tutor.firstname} ${session.tutor.lastname}` : 'Non assigné',
      'Matières': session.school_subjects?.join(', ') || '-',
      'Statut': session.is_canceled ? 'Annulée' : session.is_paid ? 'Payée' : 'En attente',
      'Date création': formatDate(session.created_at),
      'Créé par': session.created_by,
    }));

    // Créer le CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(';'),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(';'))
    ].join('\n');

    // Télécharger le fichier
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `seances_essai_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (session: TrialSession) => {
    if (session.is_canceled) {
      return (
        <Badge variant="destructive" className="gap-1 shadow-sm">
          <X className="w-3 h-3" />
          Annulée
        </Badge>
      );
    }
    if (session.is_paid) {
      return (
        <Badge className="gap-1 bg-green-500 hover:bg-green-600 text-white shadow-sm">
          <CheckCircle className="w-3 h-3" />
          Payée
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 shadow-sm">
        <Clock className="w-3 h-3" />
        En attente
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Chargement des séances d'essai...</p>
          <p className="mt-2 text-sm text-gray-500">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* En-tête amélioré */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Séances d'essai
              </h1>
              <p className="text-gray-500 mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Vue globale de toutes les séances d'essai
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques améliorées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-gray-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">séances au total</p>
            </CardContent>
          </Card>

          {/* Payées */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                Payées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.paid}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}% du total
              </p>
            </CardContent>
          </Card>

          {/* En attente */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.unpaid}</div>
              <p className="text-xs text-gray-500 mt-1">paiement en cours</p>
            </CardContent>
          </Card>

          {/* Cette semaine */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                Cette semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-purple-600">{stats.thisWeek}</div>
                {stats.weekPercentage !== 0 && (
                  <div className={`text-sm font-semibold flex items-center gap-0.5 px-2 py-1 rounded-full ${
                    stats.weekPercentage > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {stats.weekPercentage > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(stats.weekPercentage)}%
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                vs {stats.lastWeek} la semaine dernière
              </p>
            </CardContent>
          </Card>

          {/* À venir */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                À venir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.upcoming}</div>
              <p className="text-xs text-gray-500 mt-1">séances planifiées</p>
            </CardContent>
          </Card>
        </div>

      {/* Filtres améliorés */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Filter className="w-5 h-5 text-purple-600" />
            </div>
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher (étudiant, tuteur, centre...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Centre */}
            <div>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors"
              >
                <option value="all">📍 Tous les centres</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id.toString()}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut paiement */}
            <div>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors"
              >
                <option value="all">💳 Paiement</option>
                <option value="true">✅ Payées</option>
                <option value="false">⏳ Non payées</option>
              </select>
            </div>

            {/* Statut annulation */}
            <div>
              <select
                value={cancelStatus}
                onChange={(e) => setCancelStatus(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors"
              >
                <option value="all">📋 Statut</option>
                <option value="false">✓ Actives</option>
                <option value="true">✕ Annulées</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Date de début
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                Date de fin
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser les filtres
            </Button>
            <Button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all"
              disabled={filteredSessions.length === 0}
            >
              <Download className="w-4 h-4" />
              Exporter ({filteredSessions.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des séances amélioré */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              Séances d'essai
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                {filteredSessions.length} résultat{filteredSessions.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold">Date/Heure séance</TableHead>
                  <TableHead className="font-semibold">Étudiant(s)</TableHead>
                  <TableHead className="font-semibold">Centre</TableHead>
                  <TableHead className="font-semibold">Tuteur</TableHead>
                  <TableHead className="font-semibold">Matières</TableHead>
                  <TableHead className="font-semibold">Statut</TableHead>
                  <TableHead className="font-semibold">Créée le</TableHead>
                  <TableHead className="font-semibold">Créée par</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Aucune séance d'essai trouvée</p>
                        <p className="text-sm text-gray-400">Essayez de modifier vos filtres de recherche</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session, index) => (
                    <TableRow
                      key={session.id}
                      className={`hover:bg-purple-50 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(session.scheduled_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {session.students.map((student) => (
                            <div key={student.id} className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-gray-400" />
                              <span
                                className="text-blue-600 hover:underline cursor-pointer"
                                onClick={() => navigate(`/student/${student.id}`)}
                              >
                                {student.firstname} {student.lastname}
                              </span>
                              <span className="text-xs text-gray-500">({student.class})</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.center ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">
                              {session.center.name}
                              <span className="text-xs text-gray-500 ml-1">
                                ({session.center.city})
                              </span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {session.tutor ? (
                          <span className="text-sm">
                            {session.tutor.firstname} {session.tutor.lastname}
                          </span>
                        ) : (
                          <span className="text-gray-400">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {session.school_subjects?.map((subject, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(session)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatDate(session.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <span className="text-xs">
                          {session.created_by}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {session.students[0] && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/student/${session.students[0].id}`)}
                              className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors"
                            >
                              Voir
                            </Button>
                          )}
                          {!session.is_paid && !session.is_canceled && session.stripe_number && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                              onClick={async () => {
                                try {
                                  const response = await api.get(`/api/sessions/${session.id}/payment-status`);
                                  if (response.data.is_paid) {
                                    alert('Paiement confirmé !');
                                    fetchTrialSessions();
                                  } else {
                                    alert('Paiement en attente');
                                  }
                                } catch (error) {
                                  alert('Erreur lors de la vérification du paiement');
                                }
                              }}
                            >
                              <DollarSign className="w-3 h-3" />
                              Vérifier
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default TrialSessions;

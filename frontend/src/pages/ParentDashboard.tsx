import React, { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, AlertTriangle, CheckCircle, XCircle, LogOut, Settings, FileText, Download, Ban, Euro, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePermissions } from '../Hooks/usePermissions';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import { toast } from 'sonner';
import api from '@/api/aixos';
import Modal from '../components/Modal';
import { UpdateSlotForm } from '@/forms/schemas';
import { RenderTrialField } from '../components/forms/customInput';
import { formatDateTimeParent } from '@/services/functions';

interface ChildSession {
  id: number;
  child_name: string;
  child_id: number;
  subject: string;
  scheduled_at: string;
  tutor_name: string;
  center_name?: string;
  is_canceled: boolean;
  is_absent: boolean;
  can_mark_absent: boolean; // Si on peut encore marquer absent (48h avant)
  hours_until_session: number;
  canceled_by?: string | null;
  absent_by?: string | null;
  marked_by_parent?: boolean;
}

interface ChildContract {
  id: number;
  child_name: string;
  child_id: number;
  subscription_type: string;
  offer_type: string;
  offer_amount: number;
  school_subjects: string[];
  session_per_week: number;
  week_count: number;
  subscription_start_date: string;
  subscription_end_date: string;
  is_valide: boolean;
  is_canceled: boolean;
  payment_mode: string;
  membership_fee: number;
  combined_id: string;
  created_at: string;
}

const ParentDashboard: React.FC = () => {
  const { isParent, user } = usePermissions();
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<ChildSession[]>([]);
  const [student, setStudent] = useState<any>();
  const [contracts, setContracts] = useState<ChildContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'contracts'>('sessions');
  const [viewMode, setViewMode] = useState<'upcoming' | 'past' | 'monthly'>('upcoming');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showRescheduleModal, setShowRescheduleModal] = useState<number | null>(null);
  const [rescheduleValues, setRescheduleValues] = useState<any>({
    scheduled_at: '',
    school_subjects: [],
    tutor_id: ''
  });
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Vérifier que c'est bien un parent
  if (!isParent()) {
    return <Navigate to="/dashboard" replace />;
  }

  const loadChildrenSessions = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const response = await api.get(`/api/parents/${user.id}/children-sessions`);
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions des enfants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildrenContracts = async () => {
    setContractsLoading(true);
    try {
      if (user?.id) {
        const response = await api.get(`/api/parents/${user.id}/children-contracts`);
        setContracts(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contrats des enfants:', error);
    } finally {
      setContractsLoading(false);
    }
  };

  const getStundent = async (studentId:any, sessionId:any)  => {
    if(studentId){
      const response = await api.get(`/api/student/${studentId}`);
      const studentdATA = {
        id: studentId,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        email: response.data.email,
        class: response.data.class,
        centers: response.data.centers,
        session_id: sessionId,
      }
      setStudent(studentdATA);
    }
  };

  useEffect(() => {
    loadChildrenSessions();
    loadChildrenContracts();
  }, []);

  const handleCancelSession = async (sessionId: number, childId: number, isCanceled: boolean) => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    try {
      await api.patch(`/api/parents/${user?.id}/sessions/${sessionId}/absence`, {
        child_id: childId,
        is_canceled: isCanceled,
        canceled_by: user?.email,
        marked_by_parent: true
      });

      // Mettre à jour l'état local
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId && session.child_id === childId
            ? { ...session, is_canceled: isCanceled }
            : session
        )
      );
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Une erreur est survenue lors de la modification');
    }
  };

  const handleDownloadContract = async (contract:any) => {
    try {
      const response = await api.get(`/api/subs/${contract.id}/download-pdf`, {
        responseType: 'blob'
      });

      // Créer un URL pour le blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire pour télécharger
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrat_${contract.id}_${contract.child_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success('Contrat téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du contrat');
    }
  };

  const handleCancelContract = async (contractId: number, childName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler le contrat de ${childName} ?`)) {
      return;
    }

    const reason = window.prompt('Raison de l\'annulation (optionnel):') || 'Annulation demandée par le parent';

    try {
      await api.patch(`/api/parents/${user?.id}/contracts/${contractId}/cancel`, {
        reason: reason
      });

      // Mettre à jour l'état local
      setContracts(prev =>
        prev.map(contract =>
          contract.id === contractId
            ? { ...contract, is_canceled: true }
            : contract
        )
      );

      toast.success('Contrat annulé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error('Erreur lors de l\'annulation du contrat');
    }
  };

  const handleRescheduleSession = async () => {
    if (!showRescheduleModal) return;
    
    // Vérifier les conflits de créneaux
    const selectedDateTime = new Date(rescheduleValues.scheduled_at);
    const selectedSession = sessions.find(s => s.id === showRescheduleModal);
    
    if (selectedSession) {
      // Vérifier s'il y a déjà une session à ce créneau avec le même tuteur
      const hasConflict = sessions.some(session => {
        if (session.id === showRescheduleModal) return false; // Ignorer la session actuelle
        
        const sessionDateTime = new Date(session.scheduled_at);
        const isSameDateTime = 
          sessionDateTime.getTime() === selectedDateTime.getTime();
        const isSameTutor = session.tutor_name === selectedSession.tutor_name;
        
        return isSameDateTime && isSameTutor && !session.is_canceled;
      });
      
      if (hasConflict) {
        toast.error('Un cours est déjà prévu à cette heure avec le même tuteur');
        return;
      }
    }
    
    try {
      // Utiliser la route des sessions générales au lieu de la route parent
      await api.put(`/api/sessions/move-future-slots/${showRescheduleModal}`, {
        scheduled_at: rescheduleValues.scheduled_at,
        school_subjects: rescheduleValues.school_subjects,
        tutor_id: rescheduleValues.tutor_id,
        update_all: false,
        updated_by: user?.email + ' (Parent)',
        rescheduled_by_parent: true
      });

      // Mettre à jour l'état local
      setSessions(prev =>
        prev.map(session =>
          session.id === showRescheduleModal
            ? { 
                ...session, 
                scheduled_at: rescheduleValues.scheduled_at,
                subject: Array.isArray(rescheduleValues.school_subjects) 
                  ? rescheduleValues.school_subjects.join(', ')
                  : rescheduleValues.school_subjects || session.subject,
                tutor_name: rescheduleValues.tutor_id ? 'Nouveau tuteur' : session.tutor_name, // Sera mis à jour lors du rechargement
                is_canceled: false, // Réactiver la séance
                canceled_by: null   // Supprimer l'info d'annulation
              }
            : session
        )
      );

      setShowRescheduleModal(null);
      setRescheduleValues({ scheduled_at: '', school_subjects: [], tutor_id: '' });
      setConflictWarning(null);
      toast.success('Séance reprogrammée avec succès');
      
      // Recharger les sessions pour avoir les données à jour
      await loadChildrenSessions();
    } catch (error) {
      console.error('Erreur lors de la reprogrammation:', error);
      toast.error('Erreur lors de la reprogrammation de la séance');
    }
  };

  const handleRescheduleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setRescheduleValues((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    // Vérifier les conflits en temps réel si c'est la date/heure qui change
    if (name === 'scheduled_at' && value && showRescheduleModal) {
      const selectedDateTime = new Date(value);
      const selectedSession = sessions.find(s => s.id === showRescheduleModal);
      
      if (selectedSession) {
        const hasConflict = sessions.some(session => {
          if (session.id === showRescheduleModal) return false;
          
          const sessionDateTime = new Date(session.scheduled_at);
          const isSameDateTime = sessionDateTime.getTime() === selectedDateTime.getTime();
          const isSameTutor = session.tutor_name === selectedSession.tutor_name;
          
          return isSameDateTime && isSameTutor && !session.is_canceled;
        });
        
        if (hasConflict) {
          setConflictWarning(`⚠️ Un cours avec ${selectedSession.tutor_name} est déjà prévu à cette heure`);
        } else {
          setConflictWarning(null);
        }
      }
    }
  };

  const removeValueFromField = (field: any, value: any) => {
    setRescheduleValues((prev: any) => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? prev[field].filter((v: any) => (typeof v === 'object' ? v.value || v.id : v) !== (typeof value === 'object' ? value.value || value.id : value))
        : prev[field],
    }));
  };



  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter(session => new Date(session.scheduled_at) > now)
                   .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  };

  const getPastSessions = () => {
    const now = new Date();
    return sessions.filter(session => new Date(session.scheduled_at) <= now)
                   .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  };

  const getMonthSessions = () => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduled_at);
      return sessionDate >= monthStart && sessionDate <= monthEnd;
    }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const generateCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Premier jour de la semaine (lundi = 1, dimanche = 0)
    const startDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - mondayOffset);
    
    // Générer 42 jours (6 semaines)
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getSessionsForDay = (day: Date) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduled_at);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
  };

  const upcomingSessions = getUpcomingSessions();
  const pastSessions = getPastSessions();
  const monthSessions = getMonthSessions();
  const activeContracts = contracts.filter(contract => contract.is_valide && !contract.is_canceled);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header avec navigation */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Espace Parent
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {user?.firstname} {user?.lastname} ! Gérez les cours de vos enfants.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/profile">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Mon Profil
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Prochains cours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Prochains cours
            </CardTitle>
            <CardDescription>
              Cours à venir pour vos enfants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {upcomingSessions.length}
            </div>
            <p className="text-sm text-gray-600">
              {upcomingSessions.length > 0 
                ? `Prochain cours le ${formatDateTimeParent(upcomingSessions[0].scheduled_at).date}`
                : 'Aucun cours planifié'
              }
            </p>
          </CardContent>
        </Card>

        {/* Contrats actifs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Contrats actifs
            </CardTitle>
            <CardDescription>
              Contrats en cours pour vos enfants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {activeContracts.length}
            </div>
            <p className="text-sm text-gray-600">
              {activeContracts.length > 0 ? 'Contrats valides' : 'Aucun contrat actif'}
            </p>
          </CardContent>
        </Card>

        {/* Alertes */}
        <Card className=" bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  Règles d'annulation
                </h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Vous pouvez annuler le cours de votre enfant jusqu'à 48h avant</li>
                  <li>• Les annulations de dernière minute (moins de 48h) ne sont pas autorisées</li>
                  <li>• Pour toute urgence, contactez directement le centre</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Actions requises
            </CardTitle>
            <CardDescription>
              Cours nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {sessions.filter(s => s.can_mark_absent && !s.is_canceled).length}
            </div>
            <p className="text-sm text-gray-600">
              Cours où vous pouvez signaler une annulation
            </p>
          </CardContent>
        </Card> */}
      </div>

      {/* Navigation par onglets */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
            activeTab === 'sessions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            Sessions ({sessions.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
            activeTab === 'contracts'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            Contrats ({contracts.length})
          </div>
        </button>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Navigation entre les vues */}
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('upcoming')}
                className={`py-2 px-4 rounded-md transition-colors duration-200 ${
                  viewMode === 'upcoming'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                À venir
              </button>
              <button
                onClick={() => setViewMode('past')}
                className={`py-2 px-4 rounded-md transition-colors duration-200 ${
                  viewMode === 'past'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Passées
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`py-2 px-4 rounded-md transition-colors duration-200 ${
                  viewMode === 'monthly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Vue mensuelle
              </button>
            </div>
          </div>

          {/* Card selon la vue sélectionnée */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {viewMode === 'upcoming' ? 'Séances à venir' : 
                     viewMode === 'past' ? 'Séances passées' : 
                     `Séances de ${formatMonthYear(selectedMonth)}`}
                  </CardTitle>
                  <CardDescription>
                    {viewMode === 'upcoming' 
                      ? 'Vous pouvez annuler les cours de vos enfants jusqu\'à 48h avant'
                      : viewMode === 'past'
                      ? 'Historique des sessions de vos enfants'
                      : 'Toutes les séances du mois sélectionné'
                    }
                  </CardDescription>
                </div>
                
                {/* Navigation pour la vue mensuelle */}
                {viewMode === 'monthly' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[120px] text-center">
                      {formatMonthYear(selectedMonth)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des sessions...</p>
            </div>
          ) : viewMode === 'upcoming' ? (
            // Séances à venir
            upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">Aucune session à venir pour vos enfants</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                const { date, time } = formatDateTimeParent(session.scheduled_at);
                const isPast = new Date(session.scheduled_at) < new Date();
                
                return (
                  <div
                    key={`${session.id}-${session.child_id}`}
                    className={`border rounded-lg p-4 ${
                      isPast 
                        ? 'bg-gray-50 opacity-75' 
                        : session.is_canceled || session.is_absent
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{session.child_name}</h3>
                          <span className="text-sm text-gray-600">• {session.subject}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><Calendar className="inline h-4 w-4 mr-1" />{date} à {time}</p>
                          <p><User className="inline h-4 w-4 mr-1" />Tuteur: {session.tutor_name}</p>
                          {session.center_name && (
                            <p>📍 {session.center_name}</p>
                          )}
                    
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {/* État actuel */}
                        {session.is_canceled ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                              <XCircle className="h-4 w-4" />
                              Annulé
                            </span>
                            {session.is_canceled && (
                              <span className="text-xs text-gray-500">
                                Annulé par Vous
                              </span>
                            )}
                          </div>
                        ) : isPast ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Terminé
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                            <Calendar className="h-4 w-4" />
                            Planifié
                          </span>
                        )}


                        {session.is_absent && (
                          <div className="flex flex-col items-end gap-1">
                            <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                              <XCircle className="h-4 w-4" />
                              Absent
                            </span>
                            {session.absent_by && (
                              <span className="text-xs text-gray-400">
                                Marqué comme Absent par {session.absent_by}
                              </span>
                            )}
                          </div>
                        )}        

                        {/* Boutons d'action (seulement pour les cours futurs) */}
                        {!isPast && session.can_mark_absent && (
                          <div className="flex gap-1 flex-col">
                            <div className="flex gap-1">
                              {!session.is_canceled ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancelSession(session.id, session.child_id, true)}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Annuler
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelSession(session.id, session.child_id, false)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Maintenir
                                </Button>
                              )}
                            </div>
                            {/* Bouton reprogrammer */}

                            {
                              session.is_canceled && 
                              <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                getStundent(session.child_id, session.id);
                                setRescheduleValues({
                                  scheduled_at: new Date(session.scheduled_at).toISOString().slice(0, 16),
                                  school_subjects: session.subject,
                                  tutor_id: ''
                                });
                                setShowRescheduleModal(session.id);
                              }}
                              className="mt-1"
                            >
                              
                              <Clock className="h-3 w-3 mr-1" />
                              Reprogrammer
                            </Button>
                            }
     
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )
          ) : viewMode === 'past' ? (
            // Séances passées
            pastSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">Aucune session passée trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastSessions.map((session) => {
                  const { date, time } = formatDateTimeParent(session.scheduled_at);
                  
                  return (
                    <div
                      key={`${session.id}-${session.child_id}`}
                      className="border rounded-lg p-4 bg-gray-50 opacity-75"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{session.child_name}</h3>
                            <span className="text-sm text-gray-600">• {session.subject}</span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><Calendar className="inline h-4 w-4 mr-1" />{date} à {time}</p>
                            <p><User className="inline h-4 w-4 mr-1" />Tuteur: {session.tutor_name}</p>
                            {session.center_name && (
                              <p>📍 {session.center_name}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {session.is_canceled ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                <XCircle className="h-4 w-4" />
                                Annulé
                              </span>
                              {session.canceled_by && (
                                <span className="text-xs text-gray-500">
                                  Annulé par Vous
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                              <CheckCircle className="h-4 w-4" />
                              Terminé
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // Vue calendrier mensuelle
            <div className="space-y-4">
              {/* En-têtes des jours de la semaine */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays().map((day, index) => {
                  const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const daySessions = getSessionsForDay(day);
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] border rounded-lg p-2 ${
                        isCurrentMonth 
                          ? 'bg-white border-gray-200' 
                          : 'bg-gray-50 border-gray-100'
                      } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                    >
                      {/* Numéro du jour */}
                      <div className={`text-sm font-medium mb-2 ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                        {day.getDate()}
                      </div>
                      
                      {/* Séances du jour */}
                      <div className="space-y-1">
                        {daySessions.map((session) => {
                          const { time } = formatDateTimeParent(session.scheduled_at);
                          const isPast = new Date(session.scheduled_at) < new Date();
                          
                          return (
                            <div
                              key={`${session.id}-${session.child_id}`}
                              className={`text-xs p-1 rounded cursor-pointer ${
                                session.is_canceled 
                                  ? 'bg-red-100 text-red-700 border border-red-200' 
                                  : isPast
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}
                              title={`${session.child_name} - ${session.subject} avec ${session.tutor_name}`}
                            >
                              <div className="font-medium">{time}</div>
                              <div className="truncate">{session.child_name}</div>
                              <div className="truncate text-gray-500">{session.subject}</div>
                              {session.is_canceled && (
                                <div className="text-red-600 font-medium">Annulé</div>
                              )}
                              {session.is_absent && (
                                <div className="text-red-600 font-medium">Absent</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglet Contrats */}
      {activeTab === 'contracts' && (
        <Card>
          <CardHeader>
            <CardTitle>Contrats de vos enfants</CardTitle>
            <CardDescription>
              Consultez et gérez les contrats de vos enfants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des contrats...</p>
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">Aucun contrat trouvé pour vos enfants</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className={`border rounded-lg p-4 ${
                      contract.is_canceled 
                        ? 'bg-red-50 border-red-200 opacity-75' 
                        : contract.is_valide 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{contract.child_name}</h3>
                          <span className="text-sm text-gray-600">• {contract.subscription_type}</span>
                          {contract.is_canceled && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              Annulé
                            </span>
                          )}
                          {contract.is_valide && !contract.is_canceled && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Actif
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><Calendar className="inline h-4 w-4 mr-1" />
                            Du {new Date(contract.subscription_start_date).toLocaleDateString('fr-FR')} 
                            au {new Date(contract.subscription_end_date).toLocaleDateString('fr-FR')}
                          </p>
                          <p><User className="inline h-4 w-4 mr-1" />
                            {contract.session_per_week} séance(s)/semaine • {contract.week_count} semaines
                          </p>
                          {contract.school_subjects && contract.school_subjects.length > 0 && (
                            <p>📚 Matières: {contract.school_subjects.join(', ')}</p>
                          )}
                          <p><Euro className="inline h-4 w-4 mr-1" />
                            {contract.offer_amount}€ • {contract.payment_mode}
                          </p>
                          {contract.membership_fee > 0 && (
                            <p className="text-xs">Frais d'adhésion: {contract.membership_fee}€</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {/* Bouton téléchargement PDF */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadContract(contract)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>

                        {/* Bouton annulation (seulement pour contrats actifs) */}
                        {/* {contract.is_valide && !contract.is_canceled && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelContract(contract.id, contract.child_name)}
                            className="flex items-center gap-1"
                          >
                            <Ban className="h-3 w-3" />
                            Annuler
                          </Button>
                        )} */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informations importantes */}


      {/* Modal de reprogrammation */}
      {showRescheduleModal && (
        <Modal 
          isOpen={true} 
          onClose={() => {
            setShowRescheduleModal(null);
            setRescheduleValues({ scheduled_at: '', school_subjects: [], tutor_id: '' });
            setConflictWarning(null);
          }} 
          title="Reprogrammer la séance"
        >
          <div className="p-4 space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Attention :</strong> La reprogrammation d'une séance doit être effectuée au moins 48h à l'avance.
                Veuillez choisir une nouvelle date et heure pour le cours de votre enfant.
              </p>
            </div>

            <div className="space-y-4">
              {student && UpdateSlotForm.map((field: any) => (
                <div key={field.name} className="space-y-2">
                  <RenderTrialField
                    f={field}
                    values={rescheduleValues}
                    setValues={setRescheduleValues}
                    handleChange={handleRescheduleChange}
                    removeValueFromField={removeValueFromField}
                    fieldName={field.name}
                    student={student}
                  />
                </div>
              ))}
              
              {/* Avertissement de conflit */}
              {conflictWarning && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-red-800">{conflictWarning}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRescheduleModal(null);
                  setRescheduleValues({ scheduled_at: '', school_subjects: [], tutor_id: '' });
                  setConflictWarning(null);
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleRescheduleSession}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!rescheduleValues.scheduled_at || !!conflictWarning}
              >
                Reprogrammer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ParentDashboard;
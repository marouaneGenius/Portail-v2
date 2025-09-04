import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { usePermissions } from '../Hooks/usePermissions';
import { Navigate } from 'react-router-dom';
import WeeklySchedule from '../components/WeeklySchedule';
import { SessionData } from '../components/SessionCard';
import api from '@/api/aixos';
import { formatDateTimeParent } from '../services/functions';
import { toast } from 'sonner';

const Planning: React.FC = () => {
  const { hasPermission, isTutor, isAdmin, isUser, user } = usePermissions();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Vérifier les permissions d'accès
  if (!hasPermission('planning:view')) {
    return <Navigate to="/dashboard" replace />;
  }

  const loadSessions = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        // Si tuteur, récupérer ses sessions
        if (isTutor()) {
          const response = await api.get(`/api/sessions/tutor/${user.id}`);
          const tutorSessions = response.data;

          console.log(response)
          
          // Convertir les données au format SessionData
          const formattedSessions: SessionData[] = tutorSessions.flatMap((session: any) => {
            return (session.students || []).map((student: any) => ({
              id: session.id,
              date: new Date(session.scheduled_at).toISOString().split('T')[0],
              startTime: (() => {
                // Utiliser la fonction formatDateTimeParent pour éviter le décalage de fuseau horaire
                const { time } = formatDateTimeParent(session.scheduled_at);
                return time;
              })(),
              endTime: (() => {
                // Calculer l'heure de fin en ajoutant 90 minutes
                const dateStr = session.scheduled_at;
                if (dateStr.includes('T')) {
                  const timeStr = dateStr.split('T')[1].split(/[Z+\-]/)[0];
                  const [hours, minutes] = timeStr.split(':').map(Number);
                  const totalMinutes = hours * 60 + minutes + 90;
                  const endHours = Math.floor(totalMinutes / 60);
                  const endMinutes = totalMinutes % 60;
                  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
                }
                // Fallback si le format n'est pas ISO
                const endTime = new Date(new Date(session.scheduled_at).getTime() + 90 * 60 * 1000);
                const { time } = formatDateTimeParent(endTime.toISOString());
                return time;
              })(),
              subject: session.school_subjects?.[0] || 'Non spécifié',
              student: {
                id: student.id,
                name: `${student.firstname} ${student.lastname}`,
                class: student.class || 'Non spécifié',
                attendance: session.is_absent === true ? 'absent' : 
                           session.is_absent === false ? 'present' : null
              },
              center: session.center ? {
                id: session.center.id,
                name: session.center.name,
                address: session.center.address
              } : undefined,
              status: session.is_canceled ? 'cancelled' : 
                      new Date(session.scheduled_at) < new Date() ? 'completed' : 'scheduled',
              notes: session.notes || undefined,
              canceled_by: session.canceled_by || undefined,
              absent_by: session.absent_by || undefined,
              is_absent: session.is_absent || undefined,

              markedByParent: session.marked_by_parent || false,
              sessionType: session.session_type || 'regular'
            }));
          });
          setSessions(formattedSessions);
        } 
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger les vraies données de sessions


    loadSessions();
  }, []);

  const handleSessionClick = (session: SessionData) => {
    console.log('Session clicked:', session);
    // TODO: Ouvrir un modal avec les détails de la session
    // ou naviguer vers une page de détail
  };

  const handleAttendanceChange = async (sessionId: number, studentId: number, attendance: 'present' | 'absent') => {
    try {
      // Trouver le nom de l'élève pour l'alerte
      const session = sessions.find(s => s.id === sessionId && s.student.id === studentId);
      const studentName = session?.student.name || 'Élève';
      
      // Appel API pour mettre à jour la présence en utilisant la route existante
      const isAbsent = attendance === 'absent';
      await api.patch(`/api/sessions/manage/${sessionId}`, {
        student_ids: [studentId],
        update_all: false,
        is_absent: isAbsent,
        absent_by: user?.email,
        updated_by: user?.email
      });

      // Mettre à jour l'état local
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId && session.student.id === studentId
            ? {
                ...session,
                student: {
                  ...session.student,
                  attendance: attendance
                }
              }
            : session
        )
      );

      // Toast de confirmation avec le nom de l'élève
      const statusText = attendance === 'present' ? 'présent(e)' : 'absent(e)';
      if (attendance === 'present') {
        toast.success(`${studentName} a été marqué(e) ${statusText} - Sonnet`);
      } else {
        toast.error(`${studentName} a été marqué(e) ${statusText} - Sonnet`);
      }
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la présence:', error);
      toast.error("Une erreur est survenue lors de la modification de la présence - Sonnet");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isTutor() ? 'Mon Planning' : 'Planning'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isTutor() 
            ? 'Consultez vos cours et étudiants assignés'
            : 'Gestion du planning des cours'
          }
        </p>
      </div>

      {/* Vue spécifique pour les tuteurs */}
      {isTutor() && (
        <>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Card Mes cours aujourd'hui */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Cours aujourd'hui
                </CardTitle>
                <CardDescription>
                  Vos séances prévues pour aujourd'hui
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {sessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length}
                </div>
                <p className="text-sm text-gray-600">
                  {sessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length > 0 
                    ? `Prochaine séance à ${sessions.filter(s => s.date === new Date().toISOString().split('T')[0])[0]?.startTime}`
                    : 'Aucun cours aujourd\'hui'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Card Mes étudiants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Mes étudiants
                </CardTitle>
                <CardDescription>
                  Étudiants que vous accompagnez
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {new Set(sessions.map(s => s.student.id)).size}
                </div>
                <p className="text-sm text-gray-600">
                  Répartis sur {new Set(sessions.map(s => s.subject)).size} matières
                </p>
              </CardContent>
            </Card>

            {/* Card Horaires de la semaine */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Cette année
                </CardTitle>
                <CardDescription>
                  Votre charge de travail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {Math.round(sessions.reduce((total, session) => {
                    const start = new Date(`1970-01-01T${session.startTime}`);
                    const end = new Date(`1970-01-01T${session.endTime}`);
                    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  }, 0))}h
                </div>
                <p className="text-sm text-gray-600">
                  Réparties sur {sessions.length} séances
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Planning hebdomadaire détaillé */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement de votre planning...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <WeeklySchedule 
              sessions={sessions} 
              onSessionClick={handleSessionClick}
              onAttendanceChange={handleAttendanceChange}
              isTutor={isTutor()}
            />
          )}
        </>
      )}

      {/* Vue pour les autres rôles (future implémentation) */}
      {(isUser() || isAdmin()) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Calendrier principal */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Planning général
              </CardTitle>
              <CardDescription>
                Vue d'ensemble des cours et disponibilités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Planning en construction
                  </h3>
                  <p className="text-gray-600">
                    Cette fonctionnalité sera implémentée prochainement
                  </p>
                </div>
              </div>
              {/* TODO: Intégrer le composant calendrier complet */}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section d'aide contextuelle */}
      <div className="mt-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <BookOpen className="h-5 w-5 text-blue-600 mt-1" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  {isTutor() ? 'Guide du tuteur' : 'Guide du planning'}
                </h3>
                <p className="text-blue-700 text-sm">
                  {isTutor() 
                    ? 'Cette page est votre point central : consultez vos créneaux, gérez vos disponibilités et accédez à vos étudiants. C\'est votre seul accès à la gestion des étudiants qui vous sont assignés.'
                    : 'Planifiez les cours, gérez les créneaux et assignez les tuteurs aux étudiants.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Planning;
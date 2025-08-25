import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import SessionCard, { SessionData } from './SessionCard';

interface WeeklyScheduleProps {
  sessions: SessionData[];
  onSessionClick?: (session: SessionData) => void;
  onAttendanceChange?: (sessionId: number, studentId: number, attendance: 'present' | 'absent') => void;
  isTutor?: boolean;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ 
  sessions, 
  onSessionClick,
  onAttendanceChange,
  isTutor = false
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Calculer le début et la fin de la semaine courante
  const getWeekBounds = (date: Date) => {
    const inputDate = new Date(date.getTime()); // Copie complète
    
    const start = new Date(inputDate);
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
    start.setHours(0, 0, 0, 0);
  
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const { start: weekStart, end: weekEnd } = getWeekBounds(currentWeek);

  // Filtrer les sessions pour la semaine courante
  const weekSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });
  }, [sessions, weekStart, weekEnd]);

  // Grouper les sessions par jour et centre
  const sessionsByDay = useMemo(() => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const grouped: { [key: string]: { sessions: SessionData[], centers: Set<string> } } = {};

    // Initialiser tous les jours
    days.forEach(day => {
      grouped[day] = { sessions: [], centers: new Set() };
    });

    // Grouper les sessions
    weekSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const dayName = days[sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1];
      grouped[dayName].sessions.push(session);
      if (session.center?.name) {
        grouped[dayName].centers.add(session.center.name);
      }
    });

    // Trier les sessions de chaque jour par heure
    Object.keys(grouped).forEach(day => {
      grouped[day].sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [weekSessions]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatWeekRange = () => {
    const endFormatted = new Date(weekEnd);
    return `${weekStart.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    })} - ${endFormatted.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    })}`;
  };

  const getTotalHours = () => {
    return weekSessions.reduce((total, session) => {
      const start:any = new Date(`1970-01-01T${session.startTime}`);
      const end:any = new Date(`1970-01-01T${session.endTime}`);
      return total + (end - start) / (1000 * 60 * 60); // Conversion en heures
    }, 0);
  };

  const isCurrentWeek = () => {
    const now = new Date();
    const { start, end } = getWeekBounds(now);
    return weekStart.getTime() === start.getTime();
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">
                  Planning de la semaine
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {formatWeekRange()}
                  {isCurrentWeek() && <span className="text-blue-600 font-medium ml-2">(Semaine actuelle)</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
                Semaine précédente
              </Button>
              
              {!isCurrentWeek() && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setCurrentWeek(new Date())}
                >
                  Semaine actuelle
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateWeek('next')}
              >
                Semaine suivante
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                <strong>{weekSessions.length}</strong> cours cette semaine
              </span>
              <span className="text-gray-600">
                <strong>{getTotalHours().toFixed(1)}h</strong> de cours au total
              </span>
              <span className="text-gray-600">
                <strong>{new Set(weekSessions.map(s => s.student.id)).size}</strong> élèves différents
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planning par jour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(sessionsByDay).map(([day, { sessions: daySessions, centers }]) => (
          <Card key={day} className="min-h-[200px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                <div className="flex items-center justify-between">
                  <span>{day}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {daySessions.length} cours
                  </span>
                </div>
                {centers.size > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(centers).map((centerName) => (
                      <span
                        key={centerName}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {centerName}
                      </span>
                    ))}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {daySessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun cours prévu</p>
                </div>
              ) : (
                daySessions.map((session, index) => (
                  <SessionCard
                    key={`${session.id}-${index}`}
                    session={session}
                    compact={true}
                    onClick={() => onSessionClick?.(session)}
                    onAttendanceChange={onAttendanceChange}
                    isTutor={isTutor}
                  />
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun cours */}
      {weekSessions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun cours prévu cette semaine
            </h3>
            <p className="text-gray-600">
              Vous n'avez aucun cours planifié pour la semaine du {formatWeekRange()}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeeklySchedule;
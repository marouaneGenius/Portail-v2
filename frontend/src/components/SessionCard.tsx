import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, BookOpen, MapPin, Calendar, XCircle } from 'lucide-react';

export interface SessionData {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  student: {
    id: number;
    name: string;
    class: string;
    attendance?: 'present' | 'absent' | null;
  };
  center?: {
    id: number;
    name: string;
    address?: string;
  };
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  is_canceled?: any;
  is_absent?: string;

  absent_by?: string;
  markedByParent?: boolean;
  canceled_by?: string;
}

interface SessionCardProps {
  session: SessionData;
  compact?: boolean;
  onClick?: () => void;
  onAttendanceChange?: (sessionId: number, studentId: number, attendance: 'present' | 'absent') => void;
  isTutor?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  compact = false, 
  onClick,
  onAttendanceChange,
  isTutor = false
}) => {

  console.log(session)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      case 'scheduled':
      default:
        return 'Planifié';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (compact) {
    return (
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all ${
          session.status === 'cancelled' ? 'opacity-60' : ''
        }`}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={getStatusColor(session.status)} variant="secondary">
                {getStatusText(session.status)}
              </Badge>
              {/* Informations sur qui a annulé ou marqué absent */}
              {session.status === 'cancelled' && session.is_canceled && (
                <span className="text-xs text-gray-500">
                  Annulé par : {session.markedByParent ? 'Parent' : session.is_canceled}
                </span>
              )}
              {session.is_absent  && (
                <span className="text-xs text-gray-500">
                  Marqué absent par : {session.markedByParent ? 'Parent' : session.absent_by}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-sm">{session.subject}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{session.student.name}</span>
            <Badge variant="outline" className="text-xs">
              {session.student.class}
            </Badge>
          </div>
          
          {/* Bouton toggle de présence pour les tuteurs en mode compact */}
          {isTutor && onAttendanceChange && (
            <div className="flex mt-2">
              <Button
                size="sm"
                variant={session.student.attendance === 'absent' ? 'destructive' : 'outline'}
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  const newAttendance = session.student.attendance === 'absent' ? 'present' : 'absent';
                  onAttendanceChange(session.id, session.student.id, newAttendance);
                }}
              >
                <XCircle className="h-3 w-3 mr-1" />
                {session.student.attendance === 'absent' ? 'Marquer présent' : 'Marquer absent'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all ${
        session.status === 'cancelled' ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {formatDate(session.date)}
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge className={getStatusColor(session.status)}>
              {getStatusText(session.status)}
            </Badge>
            {/* Informations sur qui a annulé ou marqué absent */}
            {session.status === 'cancelled' && session.canceled_by && (
              <span className="text-xs text-gray-500">
                Annulé par : {session.markedByParent ? 'Parent' : session.canceled_by}
              </span>
            )}
            {session.student.attendance === 'absent' && session.absent_by && (
              <span className="text-xs text-gray-500">
                Marqué absent par : {session.markedByParent ? 'Parent' : session.absent_by}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Horaire */}
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-500" />
          <div>
            <p className="font-semibold text-lg">
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </p>
            <p className="text-sm text-gray-600">
              Durée : {
                Math.round(
                  (new Date(`1970-01-01T${session.endTime}`).getTime() - 
                   new Date(`1970-01-01T${session.startTime}`).getTime()) / 60000
                )
              } minutes
            </p>
          </div>
        </div>

        {/* Matière */}
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-orange-500" />
          <div>
            <p className="font-semibold text-lg">{session.subject}</p>
            <p className="text-sm text-gray-600">Matière enseignée</p>
          </div>
        </div>

        {/* Étudiant */}
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-blue-500" />
          <div>
            <p className="font-semibold text-lg">{session.student.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Classe :</p>
              <Badge variant="outline">{session.student.class}</Badge>
            </div>
          </div>
        </div>

        {/* Centre (si disponible) */}
        {session.center && (
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-semibold">{session.center.name}</p>
              {session.center.address && (
                <p className="text-sm text-gray-600">{session.center.address}</p>
              )}
            </div>
          </div>
        )}

        {/* Notes (si disponibles) */}
        {session.notes && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Notes :</p>
            <p className="text-sm text-gray-600">{session.notes}</p>
          </div>
        )}

        {/* Section de gestion de la présence pour les tuteurs */}
        {isTutor && onAttendanceChange && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 mb-2">Présence de l'élève :</p>
              {session.student.attendance && (
                <Badge 
                  className={session.student.attendance === 'present' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                  }
                >
                  {session.student.attendance === 'present' ? 'Présent' : 'Absent'}
                </Badge>
              )}
            </div>
            <div className="flex justify-center">
              <Button
                variant={session.student.attendance === 'absent' ? 'destructive' : 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const newAttendance = session.student.attendance === 'absent' ? 'present' : 'absent';
                  onAttendanceChange(session.id, session.student.id, newAttendance);
                }}
                className="w-48"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {session.student.attendance === 'absent' ? 'Marquer présent' : 'Marquer absent'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionCard;
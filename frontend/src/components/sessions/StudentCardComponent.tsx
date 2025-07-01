import React, { useEffect, useState } from 'react';
import api from '@/api/aixos';
import { useDraggable } from '@dnd-kit/core';
import { extractExactHour } from '@/services/functions';

type SessionData = {
  id: number;
  payment_date: string;
  date_slot: string;
  stripe_number?: string;
  school_subjects?: string[];
  resume?: string;
  scheduled_at?: string;
  scheduled_by?: string;
  session_type?: string;
  is_canceled: boolean;
  canceled_by?: number;
  is_paid?: boolean;
};

type Student = {
  id: number;
  firstname: string;
  lastname: string;
  gender?: string;
  class?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  is_deleted?: boolean;
  school_subjects?: string[];
};

interface StudentCardProps {
  student: Student;
  tutorId:any;
  sessionHour?:any;
  // day: string;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, tutorId, sessionHour }:any) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const currentSession = student.sessions?.find((s: any) => {
    const hour = s.exactHour ?? extractExactHour(s.scheduled_at);
    return hour === sessionHour && s.tutor_id === tutorId;
  });

  console.log(student.sessions)



  const { attributes, listeners, setNodeRef, transform, isDragging } =useDraggable({
    id: student.id,
    data: {
      type: 'student',
      studentId: student.id,
      tutorId,
      sessionHour,
      sessionId: currentSession?.id
      // day, // Ajout du jour
    },
  });
  useEffect(() => {
    if(student) {
        setSessions(student.sessions);
        setLoading(false)
    }
  }, [student.id]);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 100 : 'auto',
    transition: isDragging ? 'none' : 'transform 0.2s ease',
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-gray-200 rounded shadow p-4 w-full ${isDragging ? 'shadow-lg cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="font-medium">
        {student.firstname} {student.lastname}
      </div>
      
      {currentSession && (
        <div className="mt-2 text-sm">
          <div className="font-medium">Session #{currentSession.id}</div>
          <div>
            {new Date(currentSession.scheduled_at).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div>
            Heure: {   extractExactHour(currentSession.scheduled_at)}
          </div>
        </div>
      )}
    </div>
  );
};

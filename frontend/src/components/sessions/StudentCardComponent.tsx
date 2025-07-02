import React, { useEffect, useState } from 'react';
import api from '@/api/aixos';
import { useDraggable } from '@dnd-kit/core';
import { extractExactHour } from '@/services/functions';
import Modal from '../Modal';

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
  student: any;
  tutorId:any;
  sessionHour?:any;
  session:any
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, tutorId, sessionHour, session }:any) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentSession = student.session
  const currentStudent = student.student

  // const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({


  //   id: `${currentStudent.id}-${currentSession.id}`,
  //   data: {
  //     type: 'student',
  //     studentId: currentStudent.id,
  //     sessionId: currentSession.id,
  //     tutorId,
  //     sessionHour,
  //   },
  // });

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${currentStudent.id}-${currentSession.id}`,   // OK
    data: {
      type: 'student',
      studentId: currentStudent.id,
      sessionId: currentSession.id,
      tutorId,
      sessionHour,
    },
  });
  
  
  useEffect(() => {
    if(session) {
        setLoading(false)
    }
  }, [session]);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 100 : 'auto',
    transition: isDragging ? 'none' : 'transform 0.2s ease',
  };

  return (


    <>
      <div 
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`bg-gray-200 rounded shadow p-4 w-full ${isDragging ? 'shadow-lg cursor-grabbing' : 'cursor-grab'}`}
      >
        <div className="font-medium">
          {currentStudent.firstname} {currentStudent.lastname} {currentStudent.id}
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



    
    
    </>

  );
};

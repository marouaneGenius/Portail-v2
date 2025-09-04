import React, { useState, useEffect } from 'react';
import { StudentCard } from './StudentCardComponent';
import { useDroppable } from '@dnd-kit/core';
import { User, UserCheck, UserRoundPen} from "lucide-react";

type Tutor = { 
  id: number; 
  firstname: string; 
  lastname: string; 
  school_subjects?: string[]; 
  events: Array<{
    id: number;
    day: string;
    start_hour: string;
    end_hour: string;
    centers: { id: number; name: string }[];
  }>;
};

export type StudentFromSession = { 
  id: number; 
  firstname: string; 
  lastname: string; 
  email: string; 
  class?: string; 
  school_subjects?: string[]; 
};

interface TutorCardProps { 
  tutor: Tutor; 
  selectedCenter: number;
  students: any;
  droppableId?: any;
  hourSlot: string;
  session:any;
  onExceptionalChange?: (sessionIds: number[], studentIds: number[], tutorId: number, description: string, tutorName: string) => void;
  // day: string;
}

export const TutorCard: React.FC<TutorCardProps> = ({ 
  tutor, 
  selectedCenter, 
  students,
  droppableId,
  hourSlot,
  session,
  onExceptionalChange
  // day
}) => {
  // Debug: vérifier si la fonction arrive
  useEffect(() => {
    console.log('TutorCard - onExceptionalChange function:', onExceptionalChange ? 'Available' : 'Not available');
  }, [onExceptionalChange]);

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: {
      type: 'tutor',
      tutorId: tutor.id,
      hourSlot,
    },
  });


  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-white border rounded-lg shadow-sm p-4
                  ${isOver ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
    >
      <div className="mb-3  flex flex-row justify-between">
        <div className="font-medium text-gray-900">
          <User className="inline-block text-crazy-magenta mr-1" /> {tutor.firstname} {tutor.lastname}
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {(tutor.school_subjects ?? []).map((subject) => (
            <span 
              key={subject} 
              className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
            >
              {subject}
            </span>
          ))}
        </div>

        {/* Bouton Changement exceptionnel pour TOUS les étudiants du tuteur */}
        {onExceptionalChange && students.length > 0 && (
          <div className="  ">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Récupérer toutes les séances de ce tuteur pour ce créneau
                const tutorSessions = session.sessions.filter((s: any) => 
                  students.some((student: any) => student.session_id === s.id)
                );
                const sessionIds = tutorSessions.map((s: any) => s.id);
                const studentIds = students.map((s: any) => s.id);
                if (onExceptionalChange) {
                  onExceptionalChange(
                    sessionIds, // Toutes les sessions
                    studentIds, // Tous les étudiants
                    tutor.id,
                    `${students.length} étudiant(s)`,
                    `${tutor.firstname} ${tutor.lastname}`
                  );
                }
              }}
              className="w-full px-3 py-2 text-xs bg-gray-100 text-black rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 "
              title="Remplacer ce tuteur pour tous ses étudiants à ce créneau"
            >
              <UserRoundPen className="w-3 h-3" />
              Remplacer le tuteur ({students.length} élève{students.length > 1 ? 's' : ''})
            </button>
          </div>
        )}
        
      </div>



      <div className="mt-2">
        <div className="space-y-2 min-h-[60px]"> 

          {students.length > 0 ? (
            students.map((student:any) => {
              const currentSession = session.sessions.find((s:any) => s.id === student.session_id)
              return(
                <StudentCard
                  key={`${student.id}-${student.session_id}`}
                  student={
                    {
                      student,
                      session: currentSession
                    }
                  }
                  tutorId={tutor.id}
                  sessionHour={hourSlot}
                  session={session}
                />
              )
            })
          ) : (
            <p className="text-xs text-gray-400 italic">Aucun étudiant à cette heure</p>
          )}
        </div>
      </div>
    </div>
  );
};
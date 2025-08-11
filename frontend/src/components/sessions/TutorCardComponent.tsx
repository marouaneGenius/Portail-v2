import React, { useState } from 'react';
import { StudentCard } from './StudentCardComponent';
import { useDroppable } from '@dnd-kit/core';
import { User} from "lucide-react";

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
  // day: string;
}

export const TutorCard: React.FC<TutorCardProps> = ({ 
  tutor, 
  selectedCenter, 
  students,
  droppableId,
  hourSlot,
  session
  // day
}) => {

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
      <div className="mb-3">
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
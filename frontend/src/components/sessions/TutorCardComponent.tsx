import api from '@/api/aixos';
import React, { useEffect, useState } from 'react';
import { StudentCard } from './StudentCardComponent';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

type Event = { id: number; day: string; start_hour: string; end_hour: string; centers: { id: number; name: string }[]; };

type Tutor = { id: number; firstname: string; lastname: string; school_subjects?: string[]; events: Event[]; };

export type StudentFromSession = { id: number; firstname: string; lastname: string; email: string; class?: string; school_subjects?: string[]; };

interface TutorCardProps { tutor: Tutor; day: string; selectedCenter: number;students:any,droppableId: string;  }


export const TutorCard: React.FC<TutorCardProps> = ({ tutor, day, selectedCenter, students,droppableId} :any) => {
    const { setNodeRef, isOver  } = useDroppable({
        id: droppableId,
        data: { type: 'tutor', tutorId: tutor.id , day:day },
      });

  const slots:any = tutor.events
    .filter((ev:any) => ev.day.toLowerCase() === day.toLowerCase() && ev.centers.some((c:any) => c.id === selectedCenter))
    .map((ev:any) => {
      const h0 = new Date(ev.start_hour).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const h1 = new Date(ev.end_hour).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${h0}–${h1}`;
    }).join(', ');

  return (
    <div
    ref={setNodeRef}
    className={`flex flex-col bg-gray-100 p-3 rounded shadow-sm w-96 m-2
                ${isOver ? 'ring-2 ring-indigo-500' : ''}`}
  >
      <div className="bg-white p-2 mb-2">
      <div className="font-medium">ID: {tutor.id}  </div>
        <div className="font-medium">{tutor.firstname} {tutor.lastname} </div>
        <div className="text-gray-600 text-sm mb-1">Disponibilité: {slots || '—'}</div>
        <div className="flex flex-wrap gap-1">Matières: {(tutor.school_subjects ?? []).map((sub:any) => (
          <span key={sub} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{sub}</span>
        ))}</div>
      </div>

      <div className="bg-white p-2 rounded" 
    //   ref={setNodeRef}
       >
        <h4 className="font-semibold mb-2">Étudiants assignés</h4>
            <div className="space-y-2 min-h-[40px]"> 
                {students.map((stu:any) => (
                    <StudentCard key={stu.id} student={stu} tutorId={tutor.id}/>
                ))}
            </div>
      </div>
    </div>
  );
};

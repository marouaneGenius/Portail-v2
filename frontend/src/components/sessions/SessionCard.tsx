import React, { useEffect, useState } from 'react';
import api from '@/api/aixos';
import { useDraggable } from '@dnd-kit/core';
import { extractExactHour } from '@/services/functions';

interface SessionCardProps {
    session: any;
    hourSlot: string;
  }
  
  export const SessionCard: React.FC<SessionCardProps> = ({ session, hourSlot }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: `session-${session.id}`,
      data: {
        type: 'session',
        sessionId: session.id,
        tutorId: session.tutor_id,
        sessionHour: hourSlot,
        students: session.students // Conserver les étudiants
      }
    });
  
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
  
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="bg-white border rounded p-2 shadow-sm cursor-move"
      >
        {session.students.map((student: any) => (
          <div key={student.id} className="flex items-center mb-1 last:mb-0">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2" />
            <div>
              <p className="font-medium">{student.firstname} {student.lastname}</p>
              <p className="text-xs text-gray-500">
                {student.class} • Centre: {student.center_id}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };
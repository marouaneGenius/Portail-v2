import api from '@/api/aixos';
import React, { useEffect, useState } from 'react';
import { StudentCard } from './StudentCardComponent';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

type Event = { id: number; day: string; start_hour: string; end_hour: string; centers: { id: number; name: string }[]; };

type Tutor = { id: number; firstname: string; lastname: string; school_subjects?: string[]; events: Event[]; };

type StudentFromSession = { id: number; firstname: string; lastname: string; email: string; class?: string; school_subjects?: string[]; };

interface TutorCardProps { tutor: Tutor; day: string; selectedCenter: number; }

// Component isolating sortable behavior
function DraggableStudent({ student, tutorId }: { student: StudentFromSession; tutorId: number; }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: String(student.id),
    data: { sortable: { containerId: tutorId } }
  });
  const style = { transform: CSS.Translate.toString(transform), transition, cursor: 'grab' };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <StudentCard student={student} />
    </div>
  );
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor, day, selectedCenter }) => {
  const [students, setStudents] = useState<StudentFromSession[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    setLoadingStudents(true);
    api.get<{ students: StudentFromSession[] }[]>(`/api/sessions/tutor/${tutor.id}`)
      .then(res => {
        const all = res.data.flatMap(session => session.students);
        const uniq = Array.from(new Map(all.map(stu => [stu.id, stu])).values());
        setStudents(uniq);
      })
      .catch(console.error)
      .finally(() => setLoadingStudents(false));
  }, [tutor.id]);

  const slots = tutor.events
    .filter(ev => ev.day.toLowerCase() === day.toLowerCase() && ev.centers.some(c => c.id === selectedCenter))
    .map(ev => {
      const h0 = new Date(ev.start_hour).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const h1 = new Date(ev.end_hour).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${h0}–${h1}`;
    }).join(', ');

  return (
    <div className="flex flex-col bg-gray-100 p-3 rounded shadow-sm h-auto w-96 m-2">
      <div className="bg-white p-2 mb-2">
        <div className="font-medium">{tutor.firstname} {tutor.lastname}</div>
        <div className="text-gray-600 text-sm mb-1">Disponibilité: {slots || '—'}</div>
        <div className="flex flex-wrap gap-1">Matières: {(tutor.school_subjects ?? []).map(sub => (
          <span key={sub} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{sub}</span>
        ))}</div>
      </div>

      <div className="bg-white p-2 rounded">
        <h4 className="font-semibold mb-2">Étudiants assignés</h4>
        {loadingStudents ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : students.length === 0 ? (
          <p className="text-sm italic text-gray-400">Aucun étudiant</p>
        ) : (
          <SortableContext
            items={students.map(stu => String(stu.id))}
            strategy={rectSortingStrategy}
          >
            <div className="space-y-2">
              {students.map(stu => (
                <DraggableStudent key={stu.id} student={stu} tutorId={tutor.id} />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
};

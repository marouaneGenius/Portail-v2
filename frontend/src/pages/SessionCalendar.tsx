import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../Hooks/auth';
import api from '@/api/aixos';
import { getCenters } from '@/api/api';
import { StudentFromSession, TutorCard } from '@/components/sessions/TutorCardComponent';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { extractExactHour, formatScheduledAt } from '@/services/functions';
import { DaysCalendar } from '@/components/ui/days-canlendar';

// Vos heures disponibles
export const HoursOptions = [
  { value: '9h30', label: '9h30'},
  { value: '11h00', label: '11h00'},
  { value: '13h30', label: '13h30'},
  { value: '15h00', label: '15h00'},
  { value: '16h30', label: '16h30'},
  { value: '18h00', label: '18h00' }
];

type Tutor = {
  id: number;
  firstname: string;
  lastname: string;
  centers: { id: number; name: string }[];
  school_subjects: string[];
  events: Array<{
    id: number;
    day: string;
    start_hour: string;
    end_hour: string;
    centers: { id: number; name: string }[];
  }>;
  students?: StudentFromSession[];
};

// Fonction utilitaire pour convertir les heures en minutes
const timeToMinutes = (time: string): number => {
  if (time.includes('T')) {
    // Format ISO
    const date = new Date(time);
    return date.getHours() * 60 + date.getMinutes();
  }
  
  // Format "9h30"
  const [hours, minutes] = time.replace('h', ':').split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

export default function SessionCalendar() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<{id: number; name: string}[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | ''>('');
  // const [selectedDay, setSelectedDay] = useState<string>('lundi');
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Jours français en ordre
  const frenchDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
  
 // Dans SessionCalendar.tsx
  useEffect(() => {
    Promise.all([
      api.get<Tutor[]>('/api/user/tutors'),
      getCenters(),
    ]).then(async ([tRes, cRes]) => {
      setCenters(cRes);

      const tutorsWithStudents = await Promise.all(
        tRes.data.map(async tutor => {
          const { data } = await api.get<{ 
            id: number;
            scheduled_at: string;
            tutor_id: number;
            students: StudentFromSession[];
          }[]>(`/api/sessions/tutor/${tutor.id}`);

          // Associer l'heure exacte aux étudiants
          const studentsWithHour = data.flatMap(session => 
            session.students.map(student => ({
              ...student,
              sessions: [{
                ...session,
                exactHour: extractExactHour(session.scheduled_at)
              }]
            }))
          );

          // Fusionner les données
          const studentsMap = new Map<number, StudentFromSession>();
          studentsWithHour.forEach(student => {
            if (studentsMap.has(student.id)) {
              const existing:any = studentsMap.get(student.id)!;
              studentsMap.set(student.id, {
                ...existing,
                sessions: [...(existing.sessions || []), ...student.sessions]
              });
            } else {
              studentsMap.set(student.id, student);
            }
          });

          return { 
            ...tutor, 
            students: Array.from(studentsMap.values()) 
          };
        })
      );

      setTutors(tutorsWithStudents);
    }).catch(console.error);
  }, []);

  // Filtrer tuteurs par centre sélectionné
  const tutorsForCenter = useMemo(() => {
    if (!selectedCenter) return [];
    return tutors.filter(tutor =>
      tutor.events.some(ev => ev.centers.some(c => c.id === selectedCenter))
    );
  }, [tutors, selectedCenter, selectedDate]);

  // Fonction pour vérifier si un tuteur est disponible à une heure donnée
  const isTutorAvailableAtHour = (
    tutor: Tutor,
    hour: string
  ): boolean => {
    if (!selectedDate) return false;
  
    const weekday = selectedDate
      .toLocaleDateString('fr-FR', { weekday: 'long' })
      .toLowerCase();
    const hourMinutes = timeToMinutes(hour);
    return tutor.events.some(ev => {
      if (ev.day.toLowerCase() !== weekday) return false;
      const startMinutes = timeToMinutes(ev.start_hour);
      const endMinutes   = timeToMinutes(ev.end_hour);
      return hourMinutes >= startMinutes && hourMinutes < endMinutes;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== 'student') return;
  
    // 1) Source
    const {
      studentId,
      tutorId: fromTutorId,
      sessionHour: fromHour,
      sessionId: fromSessionId 
    } = active.data.current;
  
    // 2) Récupérer l'étudiant + sa session exacte
    const fromTutor = tutors.find(t => t.id === fromTutorId);
    const movedStudent: any = fromTutor?.students?.find(s => s.id === studentId);
    if (!movedStudent) {
      console.error('Étudiant introuvable');
      return;
    }

  
    const sessionToMove:any = movedStudent.sessions?.find((sess: any) => {
      // si exactHour a déjà été mis à jour, on l'utilise, sinon on fallback sur scheduled_at
      const hour = sess.exactHour ?? extractExactHour(sess.scheduled_at);
      return sess.tutor_id === fromTutorId && hour === fromHour;
    });

    if (!sessionToMove) {
      console.error('Session introuvable');
      return;
    }
  
    // 3) Cible depuis over.data.current
    const {
      tutorId: targetTutorId,
      hourSlot: targetHour,
      sessionId: draggedSessionId
    }:any = over.data.current;

    // 4) Retirer la session déplacée
    const filteredSessions = movedStudent.sessions.filter(
      (sess: any) => sess.id !== sessionToMove.id
    );
  
    // 5) Créer la nouvelle session :
    //    - on change juste tutor_id et exactHour  
    const newSession = {
      ...sessionToMove,
      tutor_id: targetTutorId,
      exactHour: targetHour
      // scheduled_at reste inchangé
    };
  
    const updatedStudent = {
      ...movedStudent,
      sessions: [...filteredSessions, newSession]
    };
  
    // 6) Mettre à jour les tuteurs
    setTutors(prev =>
      prev.map((tutor: any) => {
        // ─── Cas spécial : même tuteur, on ne fait que “mettre à jour” l'étudiant ───
        if (tutor.id === fromTutorId && fromTutorId === targetTutorId) {
          return {
            ...tutor,
            students: tutor.students.map((s: any) =>
              s.id === studentId ? updatedStudent : s
            )
          };
        }
    
        // ─── Sinon, cas “source” (différent tuteur ou plusieurs sessions restantes) ───
        if (tutor.id === fromTutorId) {
          const stillHas = filteredSessions.length > 0;
          return {
            ...tutor,
            students: stillHas
              ? tutor.students.map((s: any) =>
                  s.id === studentId ? updatedStudent : s
                )
              : tutor.students.filter((s: any) => s.id !== studentId)
          };
        }
    
        // ─── Cas “cible” si tuteur différent ───
        if (tutor.id === targetTutorId) {
          const exists = tutor.students.some((s: any) => s.id === studentId);
          return {
            ...tutor,
            students: exists
              ? tutor.students.map((s: any) =>
                  s.id === studentId ? updatedStudent : s
                )
              : [...(tutor.students ?? []), updatedStudent]
          };
        }
    
        return tutor;
      })
    );

    const values = {
      tutor_id: targetTutorId,
      scheduled_at : formatScheduledAt(sessionToMove.scheduled_at, targetHour) 
    }

    try{
      api.patch(`/api/sessions/${fromSessionId}`,values).then((res) => {
        if(res) {
          alert('Modification reussi');
        }
      })
    } catch(e:any) {
      alert('une erreur est servenu lors de la modification')
      console.error('error ==>', e)
    }
    
  }

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl mb-4">Disponibilités des tuteurs</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Centre :</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={selectedCenter}
            onChange={e => setSelectedCenter(e.target.value ? +e.target.value : '')}
          >
            <option value="">— Choisir —</option>
            {centers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* <div>
          <label className="block mb-1 font-medium">Jour :</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value)}
          >
            {frenchDays.map(day => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
        </div> */}
        <div>
          <DaysCalendar
            value={selectedDate}
            onChange={setSelectedDate}
            label="Date de la séance"
            placeholder="Choisir une date"
          />
        </div>
      </div>

      {!selectedCenter ? (
        <p className="text-gray-500">Sélectionnez un centre pour voir les disponibilités.</p>
      ) : (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCenter}>
          <div className="space-y-8">
          {HoursOptions.map(hourSlot => {

              const availableTutors = tutorsForCenter.filter(tutor => 
                isTutorAvailableAtHour(tutor, hourSlot.value)
              );

              return (
                <div key={hourSlot.value} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4">
                  {hourSlot.label}
                </h3>
          
                {availableTutors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {availableTutors.map(tutor => {
                     const studentsAtThisHour = tutor.students?.filter((student: any) => {
                        if (student.id_center !== selectedCenter) {
                          return false;
                        } else{
                          console.log(student, student.id_center )
                        }

                      return student.sessions?.some((session: any) => {
                        // on utilise d’abord exactHour, sinon fallback sur scheduled_at
                        const sessionHour = session.exactHour ?? extractExactHour(session.scheduled_at);
                        return (
                          session.tutor_id === tutor.id &&
                          sessionHour === hourSlot.value
                        );
                      });
                    }) || [];
                    
                              
                            return (
                              <TutorCard
                                key={`${hourSlot.value}-${tutor.id}`}
                                tutor={tutor}
                                selectedCenter={selectedCenter}
                                students={studentsAtThisHour}
                                droppableId={`${hourSlot.value}-${tutor.id}`} // clef unique par jour/heure/tuteur !
                                hourSlot={hourSlot.value}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">Aucun tuteur disponible à cette heure.</p>
                      )}
                    </div>
                  );
                })}
          </div>
        </DndContext>
      )}
    </div>
  );
}
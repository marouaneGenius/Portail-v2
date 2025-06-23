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
  DragEndEvent,
  pointerWithin
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

type Tutor = {
  id: number;
  firstname: string;
  lastname: string;
  centers: { id: number; name: string }[];
  school_subjects: string[];
  events: Array<{
    id: number;
    day: string;        // "lundi", "mardi", ...
    start_hour: string; // ISO "1970-01-01T09:30:00+00:00"
    end_hour: string;
    centers: { id: number; name: string }[];
  }>;
  // on ajoute le champ students ici pour stocker localement la liste
  students?: Array<{ id: number }>;
};

export default function SessionCalendar() {
    const { user } = useAuth();
    const [centers, setCenters] = useState<{id:number;name:string}[]>([]);
    const [tutors,  setTutors]  = useState<Tutor[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<number|''>('');
    const [studentsByTutor, setStudentsByTutor] = useState<Record<number, any[]>>({});
    const [students, setStudents] = useState<StudentFromSession[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(true);

    // Jours français en ordre
    const frenchDays = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'] as const;
    useEffect(() => {
        Promise.all([
        api.get<Tutor[]>('/api/user/tutors'),
        getCenters(),
        ])
        .then(async ([tRes, cRes]) => {
            setCenters(cRes);

            const tutorsWithStudents = await Promise.all(
            tRes.data.map(async tutor => {
                const { data } =
                await api.get<{ students: StudentFromSession[] }[]>(
                    `/api/sessions/tutor/${tutor.id}`,
                );

                const all   = data.flatMap(s => s.students);
                const uniq  = Array.from(
                new Map(all.map(stu => [stu.id, stu])).values(),
                );

                return { ...tutor, students: uniq };  // ↩️ on attache ici
            }),
            );
            setTutors(tutorsWithStudents);

        
        })
        .catch(console.error)

    }, []);


    useEffect(() => {
        console.log(tutors)
    }, [tutors])



  


  // Filtrer tuteurs par centre sélectionné
  const tutorsForCenter = useMemo(() => {
    if (!selectedCenter) return [];
    return tutors.filter(tutor =>
      tutor.events.some(ev =>
        ev.centers.some(c => c.id === selectedCenter)
      )
    );
  }, [tutors, selectedCenter]);

  const availabilityByDay = useMemo(() => {
    const map: Record<string,Tutor[]> = {};
    frenchDays.forEach(day => {
      map[day] = tutorsForCenter.filter(tutor =>
        tutor.events.some(ev =>
          ev.day.toLowerCase() === day
        )
      );
    });
    return map;
  }, [tutorsForCenter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;                                     // rien sous le curseur
  
    // On ne gère que « un étudiant → un tuteur »
    if (active.data.current?.type !== 'student' || over.data.current?.type !== 'tutor') {
      return;
    }
  
    const studentId   = active.data.current.studentId  as number; // étudiant déplacé
    const fromTutorId = active.data.current.tutorId    as number; // ancien tuteur
    const toTutorId   = over.data.current.tutorId      as number; // nouveau tuteur


    console.log(studentId, fromTutorId, toTutorId)
  
    if (fromTutorId === toTutorId) return;                        // pas de changement
  
    // On retrouve l’étudiant pour le ré-insérer
    const movedStudent = tutors
      .find(t => t.id === fromTutorId)
      ?.students?.find(s => s.id === studentId);
  
    if (!movedStudent) return;                                    // sécurité
  
    // Mise à jour immuable
    setTutors(prev =>
      prev.map(tutor => {
        if (tutor.id === fromTutorId) {
          return {
            ...tutor,
            students: tutor.students!.filter(s => s.id !== studentId),
          };
        }
        if (tutor.id === toTutorId) {
          return {
            ...tutor,
            students: [...(tutor.students ?? []), movedStudent],
          };
        }
        return tutor;
      }),
    );
  }
  const collisionDetection = (args: any) => {
    // d’abord pointerWithin
    const pointer = pointerWithin(args);
    return pointer?.length ? pointer : closestCenter(args);
  };
  

  if (!user) return null;

  return (

      <div className="p-6 space-y-6">
        <h2 className="text-2xl mb-4">Disponibilités hebdo des tuteurs</h2>

        <div className="mb-4">
          <label className="mr-2 font-medium">Centre :</label>
          <select
            className="border px-2 py-1 rounded"
            value={selectedCenter}
            onChange={e => setSelectedCenter(e.target.value ? +e.target.value : '')}
          >
            <option value="">— Choisir —</option>
            {centers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        { !selectedCenter ? (
          <p className="text-gray-500">Sélectionnez un centre pour voir les disponibilités.</p>
        ) : 
        
        <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCenter} collisionDetection={collisionDetection} >
        
            {frenchDays.map(day => (

            <div key={day} className="w-full border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2">
                {day.charAt(0).toUpperCase() + day.slice(1)}
                </h3>

                {availabilityByDay[day].length > 0 ? (

                <div className="flex flex-row">
                    {availabilityByDay[day].map(tutor => (
                            <TutorCard 
                            key={tutor.id}
                            droppableId={`${day}-${tutor.id}`}
                            tutor={tutor}
                            day={day}
                            selectedCenter={selectedCenter as number}
                            students={tutor.students}
                            />
                    ))}

                </div>

                ) : (
                <p className="text-gray-400 italic">Pas de tuteur disponible.</p>
                )}

            </div>

            )) }

        </DndContext>

        
        }

      </div>
  );
}

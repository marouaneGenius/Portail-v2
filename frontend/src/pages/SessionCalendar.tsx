import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../Hooks/auth';
import api from '@/api/aixos';
import { getCenters } from '@/api/api';
import { TutorCard } from '@/components/sessions/TutorCardComponent';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
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

  // Jours français en ordre
  const frenchDays = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'] as const;

  // Chargement initial des tuteurs et centres
  useEffect(() => {
    Promise.all([ api.get<Tutor[]>('/api/user/tutors'), getCenters() ])
      .then(([tRes, cRes]) => {
        setTutors(tRes.data);
        setCenters(cRes);
      })
      .catch(console.error);
  }, []);

  // Filtrer tuteurs par centre sélectionné
  const tutorsForCenter = useMemo(() => {
    if (!selectedCenter) return [];
    return tutors.filter(tutor =>
      tutor.events.some(ev =>
        ev.centers.some(c => c.id === selectedCenter)
      )
    );
  }, [tutors, selectedCenter]);

  // Disponibilités par jour
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

  // --- DRAG & DROP SETUP ---
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over }:any = event;
    if (!over) return;

    const studentId   = Number(active.id);
    const fromTutorId = Number(active.data.current.sortable.containerId);
    const toTutorId   = Number(over.data.current.sortable.containerId);

    if (fromTutorId === toTutorId) return;

    // 1) Mettre à jour localement le state tutors,
    //    en déplaçant studentId de fromTutorId vers toTutorId
    setTutors(prev => {
      // clonage profond pour immutabilité
      const copy = structuredClone(prev) as Tutor[];
      const from  = copy.find(t => t.id === fromTutorId);
      const to    = copy.find(t => t.id === toTutorId);
      if (!from || !to) return prev;

      const idx = from.students?.findIndex(s => s.id === studentId) ?? -1;
      if (idx < 0) return prev;
      const [moved] = from.students!.splice(idx, 1);
      to.students = to.students ?? [];
      to.students.push(moved);

      return copy;
    });


    console.log(active, over)

    // 2) Appel API pour persister la réaffectation
    // api.post('/api/sessions/transfer-student', {
    //   studentId,
    //   fromTutorId,
    //   toTutorId
    // }).catch(console.error);
  }

  if (!user) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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
        
        frenchDays.map(day => (
          <div key={day} className="w-full border rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </h3>

            {availabilityByDay[day].length > 0 ? (
              <div className="flex flex-row">
                {availabilityByDay[day].map(tutor => (
                  <SortableContext
                    key={tutor.id}
                    items={(tutor.students ?? []).map(s => String(s.id))}
                    strategy={rectSortingStrategy}
                  >
                    <TutorCard 
                      tutor={tutor}
                      day={day}
                      selectedCenter={selectedCenter as number}
                    />
                  </SortableContext>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">Pas de tuteur disponible.</p>
            )}
          </div>
        )) 
        
        }
      </div>
    </DndContext>
  );
}

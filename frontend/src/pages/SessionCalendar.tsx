import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../Hooks/auth';
import api from '@/api/aixos';
import { v4 as uuid } from 'uuid';
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
import { extractExactHour, formatDate, formatScheduledAt, timeToMinutes, toLocalDateString } from '@/services/functions';
import { DaysCalendar } from '@/components/ui/days-canlendar';
import { format } from "date-fns";
import Modal from '../components/Modal';

import { useModal } from '@/Hooks/useModal';

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

export default function SessionCalendar() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<{id: number; name: string}[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<any>();
  const { isOpen, open, close } = useModal();
  const [applyAll, setApplyAll] = useState<any>(false);
  const [dragContext, setDragContext] = useState<{
    sessionId: number;
    fromTutorId: number;
    toTutorId: number;
    scheduledAt: string;
    studentId: number;
  } | null>(null);
  
  
  
  
  useEffect(() => {
    getCenters().then(setCenters)
  }, []);

  useEffect(() => {
    if(selectedDate) {
      const date = new Date(selectedDate);
      api.get(`/api/sessions/center/${selectedCenter}/sessions-by-date`, {
        params: { date: formatDate(date) }
      })
        .then(({ data }) => {
          const filteredTutors = data.map((item:any) => {

            return {
              tutor: item,
              sessions: item.sessions
            }
          })
          setTutors(filteredTutors)
        })
    }
  }, [selectedCenter, selectedDate]);

  const handleDragEnd = (event: DragEndEvent) => {

    const { active, over } = event;
    if (!over || active.data.current?.type !== "student") return;
  
    const {
      studentId,
      tutorId: fromTutorId,
      sessionHour: fromHour,
      sessionId: fromSessionId,
    } = active.data.current;
  
    const {
      tutorId: targetTutorId,
      hourSlot: targetHour,
    }: any = over.data.current;
  
    const fromTutor = tutors.find(t => t.tutor.id === fromTutorId);
    if (!fromTutor) return;
  
    const sessionToMove = (fromTutor.sessions ?? []).find((sess: any) => sess.id === fromSessionId);
    if (!sessionToMove) return;
  
    const movedStudent = (sessionToMove.students ?? []).find((s:any) => s.id === studentId);
    if (!movedStudent) return;


    const scheduledAt = formatScheduledAt(sessionToMove.scheduled_at, targetHour);
    setDragContext({
      sessionId:    sessionToMove.id,
      fromTutorId,
      toTutorId:    targetTutorId,
      scheduledAt,
      studentId,
    });
    open();
  
    setTutors(prevTutors =>
      prevTutors.map((tutor: any) => {

        if (tutor.tutor.id === fromTutorId && fromTutorId === targetTutorId) {

          return {
            ...tutor,
            sessions: (tutor.sessions ?? []).map((sess: any) =>
              sess.id === sessionToMove.id
                ? { ...sess, scheduled_at: formatScheduledAt(sess.scheduled_at, targetHour) }
                : sess
            ),
          };
        }
  
        if (tutor.tutor.id === fromTutorId) {
          const newSessions = (tutor.sessions ?? []).map((sess: any) =>
            sess.id === sessionToMove.id
              ? { ...sess, students: (sess.students ?? []).filter((s: any) => s.id !== studentId) }
              : sess
          ).filter((sess:any) => (sess.students ?? []).length > 0);
  
          return {
            ...tutor,
            sessions: newSessions,
          };
        }
  
        if (tutor.tutor.id === targetTutorId) {
          const updatedSessions = [...(tutor.sessions ?? [])];
          sessionToMove.students = [ movedStudent ];
          sessionToMove.scheduled_at =
            formatScheduledAt(sessionToMove.scheduled_at, targetHour);
          updatedSessions.push(sessionToMove);
        
          return {
            ...tutor,
            sessions: updatedSessions,
          };
        }

        // updateSession(sessionToMove, tutor.tutor.id, targetTutorId, targetHour, studentId,  )


  
        return tutor;
      })

    );

  };


  const updateSession = (
    sessionId: number,
    fromTutorId: number,
    toTutorId: number,
    scheduledAt: string,
    studentId: number,
    updateAll: boolean
  ) => {

    // console.log(sessionId,fromTutorId,toTutorId, scheduledAt,  studentId, updateAll )

    api.patch(`/api/sessions/${sessionId}`, {
      tutor_id:     fromTutorId !== toTutorId ? toTutorId : undefined,
      scheduled_at: scheduledAt,
      student_ids:  [studentId],
      update_all:   updateAll,
    }).catch(err =>console.error(err.response.data));

  };
  
  const currentStudents = (item:any, hourSlot:any) => {
    const sessionsForSlot = item.sessions.filter((sess:any) =>
      extractExactHour(sess.scheduled_at) === hourSlot.value
    );
  
    let students:any = [];
    for (const sess of sessionsForSlot) {
      if (sess.students && Array.isArray(sess.students)) {
        students = students.concat(sess.students);
      }
    }
    return students;
  };

  if (!user) return null;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  return (

    <>
   
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
            return (
              <div key={hourSlot.value} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4">
                  {hourSlot.label}
                </h3>
                {tutors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tutors.map(block => {
                          const students = currentStudents(block, hourSlot);
                          const hasSession = block.sessions.length > 0;
                          const key = hasSession
                            ? String(block.sessions[0].id)
                            : `no-session-${block.tutor.id}-${hourSlot.value}`;
                          return (
                            <TutorCard
                              key={key}
                              tutor={block.tutor}
                              selectedCenter={selectedCenter}
                              students={students}
                              droppableId={`${selectedDate}-${hourSlot.value}-${key}`}
                              hourSlot={hourSlot.value}
                              session={block}
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

{/* Overlay fixe, centré */}
{/* Overlay fixe centré */}







    </div>

  {/* Conteneur du Modal, largeur fixe et petite */}
  <div className="bg-white rounded-lg shadow-lg w-full max-w-xs mx-2">
    <Modal
      isOpen={isOpen}
      title="Sauvegarder les modifications"
      onClose={close}
      footer={
        <div className="flex justify-end space-x-2 bg-green-300">
          <button
            onClick={close}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              if (!dragContext) return;
              updateSession(
                dragContext.sessionId,
                dragContext.fromTutorId,
                dragContext.toTutorId,
                dragContext.scheduledAt,
                dragContext.studentId,
                applyAll
              );
              close();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Enregistrer
          </button>
        </div>
      }
    >
      <p className="mb-4">Appliquer le changement :</p>
      <div className="space-y-3">
        <label className="flex items-center text-sm">
          <input
            type="radio"
            name="scope"
            value="single"
            checked={!applyAll}
            onChange={() => setApplyAll(false)}
            className="form-radio"
          />
          <span className="ml-2">Uniquement cette séance</span>
        </label>
        <label className="flex items-center text-sm">
          <input
            type="radio"
            name="scope"
            value="all"
            checked={applyAll}
            onChange={() => setApplyAll(true)}
            className="form-radio"
          />
          <span className="ml-2">Toutes les séances de cet étudiant</span>
        </label>
      </div>
    </Modal>
  </div>




 </>
  );
}
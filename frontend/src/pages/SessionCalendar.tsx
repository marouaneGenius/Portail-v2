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
import { Building } from "lucide-react"

// Vos heures disponibles
export const HoursOptions = [
  { value: '9h30', label: '9h30' },
  { value: '11h00', label: '11h00' },
  { value: '13h30', label: '13h30' },
  { value: '15h00', label: '15h00' },
  { value: '16h30', label: '16h30' },
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
  const [centers, setCenters] = useState<{ id: number; name: string }[]>([]);
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
    if (selectedDate) {
      const date = new Date(selectedDate);
      api.get(`/api/sessions/center/${selectedCenter}/sessions-by-date`, {
        params: { date: formatDate(date) }
      })
        .then(({ data }) => {
          console.log(data)

          const filteredTutors = data.map((item: any) => {

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

    const movedStudent = (sessionToMove.students ?? []).find((s: any) => s.id === studentId);
    if (!movedStudent) return;


    const scheduledAt = formatScheduledAt(sessionToMove.scheduled_at, targetHour);
    setDragContext({
      sessionId: sessionToMove.id,
      fromTutorId,
      toTutorId: targetTutorId,
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
          ).filter((sess: any) => (sess.students ?? []).length > 0);

          return {
            ...tutor,
            sessions: newSessions,
          };
        }

        if (tutor.tutor.id === targetTutorId) {
          const updatedSessions = [...(tutor.sessions ?? [])];
          sessionToMove.students = [movedStudent];
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
      tutor_id: fromTutorId !== toTutorId ? toTutorId : undefined,
      scheduled_at: scheduledAt,
      student_ids: [studentId],
      update_all: updateAll,
    }).catch(err => console.error(err.response.data));

  };

  const currentStudents = (item: any, hourSlot: any) => {
    const sessionsForSlot = item.sessions.filter((sess: any) =>
      extractExactHour(sess.scheduled_at) === hourSlot.value
    );

    let students: any = [];
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
      <div className="p-6 space-y-8 ">
        <h2 className="text-3xl font-bold mb-6 text-mister-anthracite flex items-center gap-3">
          Planning des séances
        </h2>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 flex flex-col">
            <label className="mb-2 font-semibold text-mister-anthracite flex items-center gap-2">
              <Building className="w-5 h-5 text-hello-yellow" />
              Centre
            </label>
            <select
              className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm min-h-[48px]"
              value={selectedCenter}
              onChange={e => setSelectedCenter(e.target.value ? +e.target.value : '')}
            >
              <option value="">Choisissez un centre</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col">
            <DaysCalendar
              value={selectedDate}
              onChange={setSelectedDate}
              label="Date de la séance"
              placeholder="Choisir une date"
              // inputClassName="w-full min-h-[48px]" // voir ci-dessous pour l'ajout dans DaysCalendar
              buttonClassName="w-full min-h-[48px]" // voir ci-dessous pour l'ajout dans DaysCalendar
            />
          </div>
        </div>


        {!selectedCenter ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-mister-anthracite/50 text-lg italic">
              Sélectionnez un centre pour voir les disponibilités.
            </p>
          </div>
        ) : (
          <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCenter}>
            <div className="space-y-10">
              {HoursOptions.map(hourSlot => (
                <div key={hourSlot.value} className="border-2 border-hello-yellow/30 rounded-2xl p-6 bg-white/80 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-mister-anthracite flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-hello-yellow" />
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
                    <p className="text-mister-anthracite/40 italic">Aucune séance prévue à cette heure.</p>
                  )}
                </div>
              ))}
            </div>
          </DndContext>
        )}

        {/* Modal d'action */}
        <Modal
          isOpen={isOpen}
          title="Sauvegarder les modifications"
          onClose={close}
          footer={
            <div className="flex justify-end space-x-2 bg-transparent">
              <button
                onClick={close}
                className="px-4 py-2 bg-fading-grey text-mister-anthracite rounded-xl hover:bg-hello-yellow/30 font-semibold transition"
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
                className="px-4 py-2 bg-crazy-magenta text-white rounded-xl hover:bg-hello-yellow hover:text-mister-anthracite font-bold transition"
              >
                Enregistrer
              </button>
            </div>
          }
        >
          <p className="mb-4 text-mister-anthracite font-medium">Appliquer le changement :</p>
          <div className="space-y-3">
            <label className="flex items-center text-sm text-mister-anthracite">
              <input
                type="radio"
                name="scope"
                value="single"
                checked={!applyAll}
                onChange={() => setApplyAll(false)}
                className="form-radio accent-hello-yellow"
              />
              <span className="ml-2">Uniquement cette séance</span>
            </label>
            <label className="flex items-center text-sm text-mister-anthracite">
              <input
                type="radio"
                name="scope"
                value="all"
                checked={applyAll}
                onChange={() => setApplyAll(true)}
                className="form-radio accent-crazy-magenta"
              />
              <span className="ml-2">Toutes les séances de cet étudiant</span>
            </label>
          </div>
        </Modal>
      </div>
    </>
  );
}
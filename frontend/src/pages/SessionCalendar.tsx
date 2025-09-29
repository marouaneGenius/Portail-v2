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
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, UserCheck } from "lucide-react";
import Modal from '../components/Modal';

import { useModal } from '@/Hooks/useModal';
import { Building } from "lucide-react"
import { Badge } from "@/components/ui/badge";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { isOpen, open, close } = useModal();
  const [applyAll, setApplyAll] = useState<any>(false);
  const [dragContext, setDragContext] = useState<{
    sessionId: number;
    fromTutorId: number;
    toTutorId: number;
    scheduledAt: string;
    studentId: number;
  } | null>(null);
  const [currentView, setCurrentView] = useState<'daily' | 'weekly'>('daily');
  const [hideEmptyTutors, setHideEmptyTutors] = useState(true);
  const [showExceptionalChangeModal, setShowExceptionalChangeModal] = useState(false);
  const [allTutors, setAllTutors] = useState<any[]>([]);
  const [selectedReplacementTutor, setSelectedReplacementTutor] = useState<number | null>(null);
  const [selectedSessionForChange, setSelectedSessionForChange] = useState<{
    sessionIds: number[];
    studentIds: number[];
    tutorId: number;
    description: string;
    tutorName: string;
  } | null>(null);
  const [conflictCheck, setConflictCheck] = useState<{hasConflict: boolean, message: string}>({hasConflict: false, message: ''});

  useEffect(() => {
    getCenters().then((centersList) => {
      setCenters(centersList);
      if (centersList.length > 0) {
        setSelectedCenter(centersList[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const period = currentView === 'weekly' ? 'week' : 'day';

      if(selectedCenter) {
        api.get(`/api/sessions/center/${selectedCenter}/sessions-by-date`, {
          params: { date: formatDate(date), period }
        })
          .then(({ data }) => {
            const filteredTutors = data.map((item: any) => ({
              tutor: item,
              sessions: item.sessions
            }));
            setTutors(filteredTutors);
          });
      }

    }
  }, [selectedCenter, selectedDate, currentView]);

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


    const scheduledAt = formatScheduledAt(sessionToMove.scheduled_at, targetHour, selectedDate);
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
                ? { ...sess, scheduled_at: formatScheduledAt(sess.scheduled_at, targetHour, selectedDate) }
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
            formatScheduledAt(sessionToMove.scheduled_at, targetHour, selectedDate);
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

  const loadAllTutors = async () => {
    try {
      const response = await api.get('/api/users/tutors');
      setAllTutors(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des tuteurs:', error);
    }
  };

  const checkTutorConflict = async (tutorId: number, sessionIds: number[], scheduledAt: string) => {
    try {
      // Vérifier pour la première session (toutes ont le même créneau)
      const response = await api.get(`/api/sessions/check-conflict/${tutorId}`, {
        params: {
          date: scheduledAt,
          session_id: sessionIds[0] // Utiliser la première session comme référence
        }
      });
      
      if (response.data.hasConflict) {
        setConflictCheck({
          hasConflict: true, 
          message: `Ce tuteur a déjà une séance à cette heure avec: ${response.data.conflictingSessions.map((s: any) => s.student_name).join(', ')}`
        });
      } else {
        setConflictCheck({hasConflict: false, message: ''});
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des conflits:', error);
      setConflictCheck({hasConflict: false, message: ''});
    }
  };

  const handleExceptionalChange = async () => {
    if (!selectedReplacementTutor || !selectedSessionForChange || conflictCheck.hasConflict) return;
    try {
      // Vérifier que sessionIds est bien un tableau
      if (!Array.isArray(selectedSessionForChange.sessionIds)) {
        console.error('sessionIds is not an array:', selectedSessionForChange.sessionIds);
        alert('Erreur: données de session invalides');
        return;
      }

      // Changer toutes les sessions en une seule fois
      const promises = selectedSessionForChange.sessionIds.map(sessionId =>
        api.patch(`/api/sessions/exceptional-change/${sessionId}`, {
          new_tutor_id: selectedReplacementTutor,
          new_center_id: selectedCenter,
          student_ids: selectedSessionForChange.studentIds,
          changed_by: user?.email,
          reason: `Changement exceptionnel depuis planning - ${selectedSessionForChange.description}`
        })
      );

      await Promise.all(promises);
      
      setShowExceptionalChangeModal(false);
      setSelectedSessionForChange(null);
      setSelectedReplacementTutor(null);
      setConflictCheck({hasConflict: false, message: ''});
      
      alert(`Tuteur remplacé avec succès pour ${selectedSessionForChange.sessionIds.length} séance(s)`);
      
      // Recharger les données
      refreshSessions();
    } catch (error) {
      console.error('Erreur lors du changement exceptionnel:', error);
      alert('Erreur lors du changement de tuteur');
    }
  };

  const refreshSessions = () => {
    if (selectedCenter && selectedDate) {
      const date = new Date(selectedDate);
      const period = currentView === 'weekly' ? 'week' : 'day';
      api.get(`/api/sessions/center/${selectedCenter}/sessions-by-date`, {
        params: { date: formatDate(date), period }
      })
        .then(({ data }) => {
          const filteredTutors = data.map((item: any) => ({
            tutor: item,
            sessions: item.sessions
          }));
          setTutors(filteredTutors);
        });
    }
  };

  const openExceptionalChangeModal = (sessionIds: number[], studentIds: number[], tutorId: number, description: string, tutorName: string) => {
    
    // S'assurer que les paramètres sont des tableaux
    const safeSessionIds = Array.isArray(sessionIds) ? sessionIds : [sessionIds];
    const safeStudentIds = Array.isArray(studentIds) ? studentIds : [studentIds];
    
    console.log('openExceptionalChangeModal - Safe arrays:', {safeSessionIds, safeStudentIds});
    
    setSelectedSessionForChange({
      sessionIds: safeSessionIds,
      studentIds: safeStudentIds, 
      tutorId,
      description,
      tutorName
    });
    setShowExceptionalChangeModal(true);
    if (allTutors.length === 0) {
      loadAllTutors();
    }
  };

  const updateSession = (
    sessionId: number,
    fromTutorId: number,
    toTutorId: number,
    scheduledAt: string,
    studentId: number,
    updateAll: boolean
  ) => {

    // Extraire la date de scheduled_at pour date_slot
    const scheduledDate = new Date(scheduledAt);
    const dateSlot = scheduledDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

    api.patch(`/api/sessions/${sessionId}`, {
      tutor_id: fromTutorId !== toTutorId ? toTutorId : undefined,
      scheduled_at: scheduledAt,
      date_slot: dateSlot,
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

  // Pour la vue semaine
  const startWeek = startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));
  const timeSlots = [
    { id: "9h30", label: "09h30" },
    { id: "11h00", label: "11h00" },
    { id: "13h30", label: "13h30" },
    { id: "15h00", label: "15h00" },
    { id: "16h30", label: "16h30" },
    { id: "18h00", label: "18h00" }
  ];

  // Navigation semaine
  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(addDays(selectedDate || new Date(), direction === 'prev' ? -7 : 7));
  };

  // Récupère les groupes/sessions pour un jour et un créneau (à adapter selon ta structure)
  const getSessionsForDayAndSlot = (day: Date, slot: string) => {
    return tutors
      .map(t => ({
        tutor: t.tutor,
        sessions: (t.sessions ?? []).filter(
          (sess: any) =>
            format(new Date(sess.scheduled_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
            extractExactHour(sess.scheduled_at) === slot
        )
      }))
      .filter(t => t.sessions.length > 0);
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
              value={selectedDate || new Date()}
              onChange={setSelectedDate}
              label="Date de la séance"
              placeholder="Choisir une date"
              // inputClassName="w-full min-h-[48px]" // voir ci-dessous pour l'ajout dans DaysCalendar
              buttonClassName="w-full min-h-[48px]" // voir ci-dessous pour l'ajout dans DaysCalendar
            />
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <Button
                variant={currentView === 'daily' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('daily')}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Jour
              </Button>
              <Button
                variant={currentView === 'weekly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('weekly')}
                className="flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Semaine
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-self-start mb-6">
          <div className="hidden items-center gap-3 mb-2 pr-10">
            <label className="flex items-center gap-2 cursor-pointer text-mister-anthracite text-sm">
              <input
                type="checkbox"
                checked={hideEmptyTutors}
                onChange={() => setHideEmptyTutors(v => !v)}
                className="accent-hello-yellow"
              />
              Masquer les tuteurs sans élève sur ce créneau
            </label>
          </div>
          <div />
          {currentView === 'daily' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Jour précédent
              </Button>
              <div className="font-semibold text-mister-anthracite">
                {selectedDate ? format(selectedDate, "EEEE d MMMM yyyy", { locale: fr }) : ""}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="flex items-center gap-1"
              >
                Jour suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div />
        </div>

        {/* Vue conditionnelle */}
        {currentView === 'daily' ? (
          <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCenter}>
            <div className="space-y-10">
              {HoursOptions.map(hourSlot => (
                <div key={hourSlot.value} className="p-6 shadow-sm border-l-4 border-l-hello-yellow border-2 bg-white/80 backdrop-blur-sm">
                  {/* Bloc d'en-tête créneau inspiré de ton exemple */}
                  <div className="lg:w-48 flex-shrink-0 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-hello-yellow" />
                      <h3 className="text-xl font-semibold text-mister-anthracite">{hourSlot.label}</h3>
                    </div>
                    <p className="text-sm text-mister-anthracite/60">
                      {
                        tutors.reduce((acc, block) => {
                          // Compte le nombre de groupes (sessions) pour ce créneau
                          const count = (block.sessions ?? []).filter(
                            (sess: any) => extractExactHour(sess.scheduled_at) === hourSlot.value
                          ).length;
                          return acc + count;
                        }, 0)
                      } élève(s)
                    </p>
                  </div>
                  {/* ...le reste de ta vue (grille des TutorCard, etc.) ... */}
                  {tutors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tutors
                        .filter(block => {
                          const students = currentStudents(block, hourSlot);
                          return !hideEmptyTutors || students.length > 0;
                        })
                        .map(block => {
                          const students = currentStudents(block, hourSlot);
                          const hasSession = block.sessions.length > 0;
                          const key = hasSession
                            ? String(block.sessions[0].id)
                            : `no-session-${block.tutor.id}-${hourSlot.value}`;
                          return (
                            <TutorCard
                              key={key}
                              tutor={block.tutor}
                              selectedCenter={typeof selectedCenter === 'number' ? selectedCenter : 0}
                              students={students}
                              droppableId={`${selectedDate}-${hourSlot.value}-${key}`}
                              hourSlot={hourSlot.value}
                              session={block}
                              onExceptionalChange={openExceptionalChangeModal}
                              onSessionUpdate={refreshSessions}
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
        ) : (
          // VUE SEMAINE
          currentView === 'weekly' && (
            <div className="space-y-4">
              {/* Navigation semaine */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-hello-yellow" />
                    <h2 className="text-lg font-semibold text-mister-anthracite">
                      Semaine du {format(startWeek, "d MMMM", { locale: fr })} au {format(addDays(startWeek, 6), "d MMMM yyyy", { locale: fr })}
                    </h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {/* Grille hebdomadaire */}
              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                  {/* En-têtes des jours */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="font-medium text-slate-600 text-center py-2">Créneaux</div>
                    {weekDays.map((day) => (
                      <div key={day.toISOString()} className="text-center">
                        <div className="font-medium text-mister-anthracite">
                          {format(day, "EEEE", { locale: fr })}
                        </div>
                        <div className="text-sm text-slate-600">
                          {format(day, "d MMM", { locale: fr })}
                        </div>
                        {isSameDay(day, selectedDate) && (
                          <div className="w-2 h-2 bg-hello-yellow rounded-full mx-auto mt-1"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Grille des créneaux */}
                  {timeSlots.map((slot) => (
                    <div key={slot.id} className="grid grid-cols-8 gap-2 mb-3 border-b border-fading-grey pb-3">
                      {/* Colonne heure */}
                      <div className="flex items-center justify-center bg-fading-grey rounded p-2">
                        <span className="text-sm font-semibold text-mister-anthracite">{slot.label}</span>
                      </div>
                      {/* Colonnes jours */}
                      {weekDays.map((day) => {
                        const slotSessions = getSessionsForDayAndSlot(day, slot.id);
                        return (
                          <div
                            key={day.toISOString() + slot.id}
                            className="min-h-[90px] rounded-xl border-2 border-dashed p-2 border-hello-yellow/30 bg-white/80 transition-colors"
                          >
                            {slotSessions.length > 0 ? (
                              <div className="space-y-2">
                                {slotSessions.map((block, idx) => (
                                  <div
                                    key={block.tutor.id + '-' + idx}
                                    className="bg-white border border-fading-grey rounded-lg shadow-sm p-1 max-w-[260px] overflow-hidden"
                                  >
                                    {/* Tuteur */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-[12px] font-bold text-mister-anthracite">
                                        {block.tutor.firstname} {block.tutor.lastname}
                                      </span>
                                     {block.sessions.flatMap((s: any) => s.students ?? []).length > 5 && (
                                        <span
                                          role="img"
                                          aria-label="warning"
                                          title="Séance surchargée : plus de 5 élèves sur ce créneau !"
                                          className="cursor-pointer"
                                        >
                                          ⚠️
                                        </span>
                                    )}
                                      <div className="flex flex-wrap gap-1 max-w-full">
                                        {(block.tutor.school_subjects ?? []).slice(0, 3).map((subject: string) => (
                                          <span
                                            key={subject}
                                            className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full"
                                          >
                                            {subject}
                                          </span>
                                        ))}
                                        {block.tutor.school_subjects && block.tutor.school_subjects.length > 3 && (
                                          <span className="text-xs bg-fading-grey text-mister-anthracite px-2 py-0.5 rounded-full">
                                            +{block.tutor.school_subjects.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {/* Étudiants */}
                                    <div className="space-y-1">
                                      {block.sessions.flatMap((s: any) => s.students ?? []).length > 0 ? (
                                        block.sessions.flatMap((s: any) => s.students ?? []).map((student: any) => {
                                          const currentSession = block.sessions.find((sess: any) => sess.id === student.session_id);
                                          return (
                                            <div
                                              key={`${student.id}-${student.session_id}`}
                                              className={`rounded-md hover:bg-slate-100 transition-colors px-0.5 py-0.5 mb-1 border
                                                ${currentSession?.is_canceled ? 'opacity-50 bg-red-50 border-red-200' : 
                                                  currentSession?.session_type === 'trial_session' ? 
                                                    (currentSession?.is_paid ? 'bg-green-50 border-green-300' : 'bg-yellow-100 border-orange-300') : 
                                                    'bg-slate-50 border-fading-grey'}
                                              `}
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <div className="flex flex-col gap-1 flex-1">
                                                  <div className="flex items-center gap-1 flex-wrap">
                                                    <span className={`text-[10px] font-medium ${currentSession?.is_canceled ? 'line-through text-slate-500' : 'text-mister-anthracite'}`}>
                                                      {student.firstname} {student.lastname}
                                                    </span>
                                                    <div className='flex flex-row text-xs'>
                                                      {student.class && (
                                                        <Badge
                                                          variant="outline"
                                                          className="text-[8px] px-0.5 py-0 bg-orange-50 text-orange-700 border-orange-200"
                                                        >
                                                          {student.class}
                                                        </Badge>
                                                      )}
                                                      {(currentSession?.school_subjects ?? []).map((subject: string) => (
                                                        <Badge
                                                          key={subject}
                                                          variant="outline"
                                                          className="text-[8px] bg-blue-50 text-blue-700 border-blue-200 px-0.5 py-0.5"
                                                        >
                                                          {subject}
                                                        </Badge>
                                                      ))}
                                                    </div>
                                           
                                                    {currentSession?.is_absent && !currentSession?.is_canceled && (
                                                      <Badge variant="destructive" className="text-xs px-2 py-0.5">Absent</Badge>
                                                    )}
                                                    {currentSession?.is_canceled && (
                                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                                        Annulé
                                                      </span>
                                                    )}
                                                  </div>
                                  
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <span className="text-xs text-mister-anthracite/40 italic">Aucun étudiant</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full text-xs text-mister-anthracite/40 italic">
                                Libre
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
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
              <span className="ml-2">Pour toutes les prochaines séances de cet étudiant à ce créneau</span>
            </label>
          </div>
        </Modal>

        {/* Modal Changement exceptionnel */}
        <Modal
          isOpen={showExceptionalChangeModal}
          onClose={() => {
            setShowExceptionalChangeModal(false);
            setSelectedSessionForChange(null);
            setSelectedReplacementTutor(null);
            setConflictCheck({hasConflict: false, message: ''});
          }}
          title="Changement exceptionnel de tuteur"
        >
          <div className='p-4 space-y-4'>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-semibold text-orange-800 mb-2">⚠️ Changement exceptionnel</h4>
              <p className="text-sm text-orange-700">
                Ce changement remplacera le tuteur <strong>{selectedSessionForChange?.tutorName}</strong> pour <strong>{selectedSessionForChange?.description}</strong> à ce créneau.
                Tous les étudiants de ce tuteur à cette heure seront transférés au nouveau tuteur.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un tuteur de remplacement
                </label>
                <select
                  value={selectedReplacementTutor || ''}
                  onChange={(e) => {
                    const tutorId = Number(e.target.value);
                    setSelectedReplacementTutor(tutorId);
                    if (tutorId && selectedSessionForChange) {
                      // Trouver la session pour obtenir scheduled_at
                      const session = tutors
                        .flatMap(t => t.sessions)
                        .find(s => s.id === selectedSessionForChange.sessionIds[0]);
                      if (session) {
                        checkTutorConflict(tutorId, selectedSessionForChange.sessionIds, session.scheduled_at);
                      }
                    } else {
                      setConflictCheck({hasConflict: false, message: ''});
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                >
                  <option value="">-- Choisir un tuteur --</option>
                  {allTutors
                    .filter(tutor => tutor.id !== selectedSessionForChange?.tutorId) // Exclure le tuteur actuel
                    .map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.firstname} {tutor.lastname} 
                      {tutor.school_subjects && tutor.school_subjects.length > 0 && 
                        ` (${tutor.school_subjects.join(', ')})`
                      }
                    </option>
                  ))}
                </select>
              </div>


              {conflictCheck.hasConflict && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-medium">🚫 Conflit détecté</p>
                  <p className="text-sm text-red-600 mt-1">{conflictCheck.message}</p>
                </div>
              )}

              {selectedReplacementTutor && !conflictCheck.hasConflict && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">✅ Aucun conflit détecté</p>
                  <p className="text-sm text-green-600 mt-1">Ce tuteur est disponible pour cette séance.</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  setShowExceptionalChangeModal(false);
                  setSelectedSessionForChange(null);
                  setSelectedReplacementTutor(null);
                  setConflictCheck({hasConflict: false, message: ''});
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleExceptionalChange}
                disabled={!selectedReplacementTutor || conflictCheck.hasConflict}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmer le changement
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
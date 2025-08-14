import React, { ChangeEvent, useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { extractExactHour, formatDateTime } from '@/services/functions';
import Modal from '../Modal';
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { renderMultiSelect, RenderTrialField } from '../forms/customInput';
import api from '@/api/aixos';
import SessionScopeRadio from './SessionScopeRadio';
import { UpdateSlotForm } from '@/forms/schemas';
import { useAuth } from '@/Hooks/auth';
import { school_subjects_field } from '../subscriptions/TutorAvailabilityPicker';
import { StudentInfoCard } from './StudentInfoCard';

interface StudentCardProps {
  student: any;
  tutorId: number;
  sessionHour: string;
  session: any;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  tutorId,
  sessionHour,
  session,
}) => {
  const [showEditModal, setShowEditModal] = useState<'tutor' | 'subjects' | 'cancel' | 'absent' | null>(null);
  const [isCanceled, setIsCanceled] = useState(student.session.is_canceled);
  const [isPaid, isIsPaid] = useState(student.session.is_paid);
  const [sessionType, setSessionType] = useState(student.session.session_type);
  const [isAbsent, setIsAbsent] = useState(student.session.is_absent);
  const [applyAll, setApplyAll] = useState<any>(false);
  const [values, setValues] = useState<any>({
    school_subjects: student.session.school_subjects || [],
    scheduled_at: student.session.scheduled_at
  });
  const navigate = useNavigate();
  const currentSession = student.session;
  const currentStudent = student.student;
  const { user } = useAuth();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${currentStudent.id}-${currentSession.id}`,
    data: {
      type: 'student',
      studentId: currentStudent.id,
      sessionId: currentSession.id,
      tutorId,
      sessionHour,
    },
  });
  console.log(isPaid , sessionType , isPaid === false, sessionType === 'trial_session')
  const updateStudentSlots = () => {
    const newValues = {
      tutor_id: values.tutor_id,
      scheduled_at: values.scheduled_at,
      update_all:   applyAll,
      updated_by: user?.email,
    }
    api.patch(`/api/sessions/move-future-slots/${currentSession.id}`, newValues)
    .then((r) =>  {
      setShowEditModal(null)
      alert('Creneaux modifiés')})
    .catch((e) => alert('Une erreur est survenu lors de la modification'))
  }

  const updateSchoolSubjects = () => {
    return api.patch(`/api/sessions/update-subjects/${currentSession.id}`, {
      school_subjects: values.school_subjects,
      update_all:   applyAll,
      student_ids: [currentStudent.id],
    }).then((r) => setShowEditModal(null))
    .catch((e) => alert('Une erreur est survenu lors de la modification'))
  }

  const sessionManagement = () => {
    const canceled = isCanceled ? false : true;
    return api.patch(`/api/sessions/manage/${currentSession.id}`, {
      student_ids: [currentStudent.id],
      update_all:   applyAll,
      is_canceled: canceled,
      canceled_by: user?.id,
      updated_by: user?.email,
    }).then((r) => {
      setShowEditModal(null)
      setIsCanceled(r.data.is_canceled)})
    .catch((e) => alert('Une erreur est survenu lors de la modification'))
  }

  const studentManagement = () => {
    const absent = isAbsent ? false : true;
    return api.patch(`/api/sessions/manage/${currentSession.id}`, {
      student_ids: [currentStudent.id],
      update_all:   applyAll,
      is_absent: absent,
      absent_by: user?.email,
      updated_by: user?.email
    })
    .then((r) => {
      setShowEditModal(null)
      setIsAbsent(r.data.is_absent)
    })
    .catch((e) => alert('Une erreur est survenu lors de la modification'))
  }

  const removeValueFromField = (field: any, value: any) => {
    setValues((prev: any) => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? prev[field].filter((v: any) => (typeof v === 'object' ? v.value || v.id : v) !== (typeof value === 'object' ? value.value || value.id : value))
        : prev[field],
    }));
  };

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 100 : 'auto',
    transition: isDragging ? 'none' : 'transform 0.2s ease',
  };

  const handleChange = ( e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked,  options }:any = e.target ;
    const multiple = e.target.multiple ;

    setValues((prev:any) => ({
      ...prev,
      [name]: multiple
          ? Array.from(options)
              .filter((opt:any) => opt.selected)
              .map((opt:any) => opt.value)
          : type === 'checkbox'
          ? checked
          : value,
    }));
  };

  // UI améliorée inspirée du StudentBadge
  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`rounded-xl shadow p-2 w-full transition
          ${isDragging ? 'shadow-lg cursor-grabbing' : 'cursor-grab'}
          ${isAbsent && !isCanceled ? 'bg-red-50 border border-red-200' : 'bg-white border border-fading-grey'}
          ${isCanceled ? 'bg-gray-100 border border-gray-300 opacity-60' : ''}
          ${!isAbsent && !isCanceled ? 'bg-fading-grey/60' : ''}
          ${sessionType === 'trial_session' ? 'border-hello-yellow bg-yellow-100' : ''}
        `}
      >


                                                 
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-mister-anthracite ${isCanceled ? 'line-through text-gray-400' : ''}`}>
                <GraduationCap className="h-4 w-4 text-mister-anthracite inline-block" /> {currentStudent.firstname} {currentStudent.lastname}
                {currentStudent.class && (
                  <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-700 border-orange-200">
                    {currentStudent.class}
                  </Badge>
                )}
              </span>
              {isAbsent && !isCanceled && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">Absent</Badge>
              )}
              {isCanceled && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">Séance annulée</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {values.school_subjects.map((matiere: any, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5"
                >
                  {matiere}
                </Badge>
              ))}
            </div>
          </div>
  
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-fading-grey rounded transition">
                <MoreVertical className="h-5 w-5 text-mister-anthracite" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-lg border border-fading-grey bg-white">
              <DropdownMenuItem onClick={() => navigate(`/student/${currentStudent.id}`)}>
                Afficher les informations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditModal('tutor')}>
                Modifier la séance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditModal('subjects')}>
                Modifier les Matières
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditModal('absent')}>
                Marquer comme {isAbsent ? 'Présent' : 'Absent'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowEditModal('cancel')}
                className={isCanceled ? 'bg-red-100 text-red-700' : ''}
              >
                {isCanceled ? 'Reprogrammer' : 'Annuler'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {
           (  isPaid === false && sessionType === 'trial_session') && (
              <div className='text-red-500 text-xs mt-2'>
                Attention, cette séance n'est pas encore payée. Veuillez vérifier le statut de paiement.
              </div>
            )
          }
      </div>
  
      {showEditModal === 'cancel' && (
        <Modal isOpen onClose={() => setShowEditModal(null)} title="Annuler ou reprogrammer la séance" >
          <div className='p-3'>
            <div className='p-3'> 
              <SessionScopeRadio value={applyAll} onChange={setApplyAll} />
            </div>
            <button onClick={sessionManagement} className='bg-green-500 text-white rounded p-3 w-full' >Sauvegarder</button>
          </div>
        </Modal>
      )}

      {showEditModal === 'absent' && (
        <Modal isOpen onClose={() => setShowEditModal(null)} title="Gérer l'absence" >
          <div className='p-3'>
            <div className='p-3'> 
              <SessionScopeRadio value={applyAll} onChange={setApplyAll} />
            </div>
            <button onClick={studentManagement} className='bg-green-500 text-white rounded p-3 w-full' >Sauvegarder</button>
          </div>
        </Modal>
      )}

      {showEditModal === 'tutor' && (
        <Modal isOpen onClose={() => setShowEditModal(null)} title="Modifier la séance">
          <div className='p-2 m-2 bg-gray-100 rounded'>
            <StudentInfoCard student={student.student} />
            <SessionScopeRadio value={applyAll} onChange={setApplyAll} />
          </div>

          <div className='p-2 m-2 bg-gray-100 rounded'>
            {UpdateSlotForm.map((field:any) => (
              <div key={field.name} className="space-y-2">
                  <RenderTrialField
                    f={field}
                    values={values}
                    setValues={setValues}
                    handleChange={handleChange}
                    removeValueFromField={removeValueFromField}
                    fieldName={field.name}
                    student={student.student}
                  />
              </div>
          ))}
          </div>

          <div className='p-2 m-2 bg-gray-100 rounded flex  '>
            <button onClick={updateStudentSlots} className='bg-green-500 text-white rounded p-3 w-full m-1' >Sauvegarder</button>
          </div>
        </Modal>
      )}

      {showEditModal === 'subjects' && (
        <Modal isOpen onClose={() => setShowEditModal(null)} title="Modifier les matières" >
          <div className='p-3'>
            <div className='p-3'> 
              <SessionScopeRadio value={applyAll} onChange={setApplyAll} />
              {
                renderMultiSelect(school_subjects_field, values, 'school_subjects', setValues, removeValueFromField)
              }
            </div>
            <button onClick={updateSchoolSubjects} className='bg-green-500 text-white rounded p-3 w-full' >Sauvegarder</button>
          </div>
        </Modal>
      )}
    </>
  );
};

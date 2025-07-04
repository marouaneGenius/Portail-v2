import React, { ChangeEvent, useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { extractExactHour, formatDateTime } from '@/services/functions';
import Modal from '../Modal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, MoreVertical } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { renderMultiSelect, RenderTrialField } from '../forms/customInput';
import { school_subjects_file } from '../subscriptions/TutorAvailabilityPicker';
import api from '@/api/aixos';
import SessionScopeRadio from './SessionScopeRadio';
// import { DateTimePicker } from '../ui/date-time-picker';
import { TutorListComponent } from './TutorListComponent';
import FrenchDateTimePicker from '../FrenchDateTimePicker';
import FrenchDatePicker from '../FrenchDateTimePicker';
import { UpdateSlotForm } from '@/forms/schemas';

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
  const [showEditModal, setShowEditModal] = useState<'tutor' | 'subjects' | null>(null);
  const [isCanceled, setIsCanceled] = useState(student.session.is_canceled);
  const [isAbsent, setIsAbsent] = useState(student.session.is_absent);
  const [applyAll, setApplyAll] = useState<any>(false);
  const [dateTimeSchedule, setDateTimeSchedule] = useState<any>(null);
  const [values, setValues] = useState<any>({
    school_subjects: student.session.school_subjects || [],
    scheduled_at: student.session.scheduled_at
  });
  const navigate = useNavigate();
  const currentSession = student.session;
  const currentStudent = student.student;

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

  const updateStudentSlots = () => {
    const newValues = {
      tutor_id: values.tutor_id,
      scheduled_at: values.scheduled_at,
      update_all:   applyAll,
    }
    console.log(newValues)
    // api.patch(`/api/sessions/move-future-slots/${currentSession.id}`, newValues)
    // .then((r) =>  alert('Creneaux modifiés'))
    // .catch((e) => alert('Une erreur est survenu lors de la modification'))
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
    // setShowCancelModal(true)
    const canceled = isCanceled ? false : true;
    return api.patch(`/api/sessions/${currentSession.id}`, {
      student_ids: [currentStudent.id],
      is_canceled: canceled
    }).then((r) => setIsCanceled(r.data.is_canceled))
    .catch((e) => alert('Une erreur est survenu lors de la modification'))

  }

  const studentManagement = () => {
    const absent = isAbsent ? false : true;
    return api.patch(`/api/sessions/${currentSession.id}`, {
      student_ids: [currentStudent.id],
      is_absent: absent
    })
    .then((r) => setIsAbsent(r.data.is_absent))
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

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`rounded shadow p-1 w-full 
        ${isDragging ? 'shadow-lg cursor-grabbing' : 'cursor-grab'}  
        ${isAbsent ? 'bg-red-100 ' : 'bg-gray-300 '} 
        ${isCanceled ? 'bg-gray-200 ' : ''}`}
      >
        <div className="flex justify-between items-center ">
          <div className="font-medium ">
            {currentStudent.firstname} {currentStudent.lastname}
          </div>

          <div>
          {isAbsent && !isCanceled && 'Absent'}
          {isCanceled && 'Seance Annuler'}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="">
              <DropdownMenuItem onSelect={() =>navigate(`/student/${currentStudent.id}`)}>
                Afficher les informations
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={()=>setShowEditModal('tutor')}>
                Modifier la séance
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={()=>    setShowEditModal('subjects')}>
                Modifier les Matières
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={studentManagement}>
                Marquer comme 
                {isAbsent ? ' Present ' : ' absent '}
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={sessionManagement} className={`${isCanceled ? 'bg-red-100 ' : ''}`}>
                {isCanceled ? 'Reprogrammer ' : 'Annuler '}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {currentSession && (
          <div className="mt-2 text-sm">
            {/* <div className="font-medium">Session #{currentSession.id}</div> */}
            <div>
              {new Date(currentSession.scheduled_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div>Heure: {extractExactHour(currentSession.scheduled_at)}</div>
          </div>
        )}
        <div className='mt-2'>
        {
          values.school_subjects.map((matiere:any, index:any) => (
            <span key={index} className='rounded bg-blue-400 text-white text-sm m-1 p-1'>{matiere}</span>
          )) 
        }
      </div>
      </div>




      {showEditModal === 'tutor' && (
        <Modal isOpen onClose={() => setShowEditModal(null)} title="Modifier la séance">
          {/* <FrenchDatePicker
            selectedDate={dateTimeSchedule}
            onDateChange={handleDateChange}
          /> */}

          <div className='p-2 m-2 bg-gray-100 rounded'>
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
            {/* <button onClick={()=>setValues({...values, scheduled_at: '' })} className='bg-gray-500 text-white rounded p-3 w-full m-1' >Reset</button> */}
          </div>

        </Modal>
      )}
      {showEditModal === 'subjects' && (
        <Modal isOpen onClose={() => setShowEditModal(null)} title="Modifier les matières" >
          <div className='p-3'>
            <div className='p-3'> 
              <SessionScopeRadio value={applyAll} onChange={setApplyAll} />
              {
                renderMultiSelect(school_subjects_file, values, 'school_subjects', setValues, removeValueFromField)
              }
            </div>
            <button onClick={updateSchoolSubjects} className='bg-green-500 text-white rounded p-3 w-full' >Sauvegarder</button>
          </div>
        </Modal>
      )}
    </>
  );
};

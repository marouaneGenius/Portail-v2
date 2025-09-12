import React, { useEffect, useState } from 'react';
import { getUser } from '../../api/api';
import { getFrenchDayLabel, normalizeHour, timeToMinutes } from '../../services/functions';
import { HoursOptions, SchoolSubjects, SessionOptions } from '../../mocks/mocks';
import { TutorRaw } from '../../services/planing-functions';
import api from '../../api/aixos';
import { useParams } from 'react-router-dom';
import { renderMultiSelect } from '../forms/customInput';
import { UnavailableTutorsListComponent } from '../sessions/UnavailableTutorsListComponent';
import { hasLevelForSubject } from './SubscriptionFunctions';
import { StudentInfoCard } from '../sessions/StudentInfoCard';

interface Props {
  onSelect: (result: [{ tutorId: number; day: string; hour: string }]) => void;
  tutors?: any;
  school_subjects?: string[];
  // f:any 
  values:any 
  setValues:any 
  removeValueFromField :any 
}
export const school_subjects_field =  { name: 'school_subjects', label: 'Matieres', type: 'select',  multiple: true, required: true, options: SchoolSubjects };

export const TutorAvailabilityPicker: React.FC<Props> = ({tutors, onSelect, school_subjects, values, setValues, removeValueFromField }:any) => {
  const [day, setDay] = useState('');
  const [sessionLength, setSessionLength] = useState<any>(null);
  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [hours, setHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState(null);
  const [errorMessage, setErrorMessage] = useState<String>('');
  const [isAvailable, setIsAvailable] = useState<Boolean>(false);
  const [availabilitys, setAvailabilitys] = useState<any[]>([]);
  const [hoursList, setHoursList] = useState<any[]>(HoursOptions);
  const [isSlotExist, setIsSlotExist] = useState<boolean>(false);
  const [student, setStudent] = useState<any>(null);
  const { id } = useParams();

  // Initialiser availabilitys avec les valeurs existantes
  useEffect(() => {
    if (values?.favorite_slots_annuel && Array.isArray(values.favorite_slots_annuel)) {
      setAvailabilitys(values.favorite_slots_annuel);
    }
  }, []);


  //get all tutors by school subjects
  useEffect(() => {
    Promise.all([ api.get<TutorRaw[]>('/api/user/tutors'), ])
    .then(([tutorsRes]) => {
      if(tutorsRes && id) {
        api.get<TutorRaw[]>(`/api/student/${id}`).then((studentRes:any) => {
          setStudent(studentRes.data)
          const allTutors = searchTutorBySchoolSubject(school_subjects?.join(',') || '', tutorsRes.data);
          const targetCenterId = studentRes.data.centers.id;
          const tutorsWithMatchingCenter:any = allTutors
            .filter((item: any) => 
              Array.isArray(item.events) 
              && item.events.some((event: any) =>
                event.centers &&  event.centers.id === targetCenterId
              )
            )
            .map((item: any) => ({
              ...item,
              events: item.events.filter((event: any) => 
                event.centers && event.centers.id === targetCenterId
              )
            }));

            const filterBySchoolSubject =  tutorsWithMatchingCenter.filter((item:any) => {
              return hasLevelForSubject(item,studentRes.data.class, school_subjects )
            })  

            if(filterBySchoolSubject.length === 0 && (!availabilitys || availabilitys.length === 0) && school_subjects && school_subjects.length !== 0) {
              setErrorMessage(`❌ Aucun tuteur disponible n'enseigne ${school_subjects ? school_subjects.join().toUpperCase() : ''} pour  ${studentRes.data.class}`);
            } else {
              setErrorMessage('');
              setIsAvailable(false)
            }

            if (day && selectedHour && filterBySchoolSubject) {
              const filtered = filterBySchoolSubject.filter((tutor:any) => {
              const sched = tutor.events.find((s: any) => s.day === day);
              if (sessionLength && sched) {
                const sessionStr = normalizeHour(sessionLength.value);
                const sessionMins = timeToMinutes(sessionStr);
                const startMins = timeToMinutes(sched.start_hour);
                const endMins = timeToMinutes(sched.end_hour);
                const availablety = sessionMins >= startMins && sessionMins <= endMins;
                return availablety;
              }
              return false;
            });
      
            if(sessionLength && filtered.length === 0) {
              setErrorMessage('Aucun tuteur disponible, changez le jour ou l\'heure ');
              setIsAvailable(false)
            } else {
              setErrorMessage('');
              setAvailableTutors(filtered)
              setIsAvailable(true)
            }
          } else {
            setAvailableTutors(filterBySchoolSubject)
          }
        })
      }
    });
  }, [school_subjects, day, sessionLength]);

  // function to filter tutors by school subjects
  const searchTutorBySchoolSubject = (subjects: string, tutors:any) => {
    const subjectArray = subjects.split(',').map(s => s.trim().toLowerCase());
    if(tutors) {
      return tutors.filter((tutor:any) => {
        const tutorSubjects = tutor.school_subjects || [];
        return subjectArray.some(subject => 
          tutorSubjects.some((t:any) => t.toLowerCase() === subject)
        );
      });
    }
  };

  const handleSessionChange = (val: any) => {
    const found = hoursList.find((opt) => opt.value === val);
    setSelectedHour(val)
    setSessionLength(found);
  };

  const handleTutorSelect = async (id: any) => {
    setSelectedTutor(id);
    const tutor:any = await getUser(id);
    const match = tutor.tutor_schedules.find((s: any) => s.day === day);
    setHours(match?.hours || []);
    console.log('test')
    setIsAvailable(false)
    setSelectedHour(null);
    setSelectedTutor(null);
    setDay('');
    setSessionLength(null);
    setIsSlotExist(false);
    setValues((prev: any) => ({
      ...prev,
      school_subjects: [] 
    }));
  };

  useEffect(() => {
    if (selectedTutor && day && selectedHour) {
      // Récupérer les infos du tuteur sélectionné
      const tutorInfo = availableTutors.find(t => t.id === selectedTutor);
      const tutorName = tutorInfo ? `${tutorInfo.firstname} ${tutorInfo.lastname}` : '';
      
      const newSlot = { 
        tutorId: selectedTutor, 
        tutorName: tutorName,
        day, 
        hour: selectedHour, 
        matieres: values.school_subjects 
      };
      setAvailabilitys((prev) => {
        if (prev.length >= 4) {
          setErrorMessage("Vous ne pouvez pas ajouter plus de 4 créneaux.");
          return prev;
        }

        const alreadyExists = prev.some(
          (slot) =>
            slot.tutorId === newSlot.tutorId &&
            slot.day === newSlot.day &&
            slot.hour === newSlot.hour
        );
  
        if (!alreadyExists) {
          setIsSlotExist(true);
          setErrorMessage('');
          setIsAvailable(false)
          return [...prev, newSlot];
        } else {
          setErrorMessage('Ce créneau existe déjà');
          return prev;
        }
      });
    }
  }, [selectedTutor]);


  useEffect(() => {
    if(availabilitys && availabilitys.length !== 0){
      setIsAvailable(false)

      const matieres = availabilitys.map((slot:any) => {
        if(slot.matieres) { 
          return slot.matieres.join();
        }
      })
      setValues((prev: any) => ({
        ...prev,
        school_subjects: matieres
      }));
      onSelect(availabilitys)
    }
  }, [availabilitys]);

  return (

  <div className='flex  flex-row gap-1 w-full'>
    <div className={!isAvailable && availableTutors.length !== 0 ? 'p-2 rounded  space-y-4 w-1/2': 'p-2 rounded  space-y-4 w-full'}>
      {
        student && 
        <StudentInfoCard student={student} />
      }

      {
        renderMultiSelect(school_subjects_field, values, 'school_subjects', setValues, removeValueFromField)
      }

      <div>
        <label className="block mb-1 font-medium">Quel Jour ?</label>
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Sélectionner un jour</option>
          {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map(d => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Durée */}
      <div>
        <label className="block mb-1 font-medium">Quel Heure ?</label>
        <select
          value={selectedHour || ''}
          onChange={(e) => handleSessionChange(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Sélectionner une Heure</option>
          {hoursList.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Tuteurs */}
      {isAvailable && sessionLength && availableTutors.length > 0 ? (
        <div>
          <label className="block mb-1 font-medium">Tuteurs disponibles</label>
          <select
            value={selectedTutor || ''}
            onChange={(e) => handleTutorSelect(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Sélectionner un tuteur</option>
            {availableTutors.map(t => (
              <option key={t.id} value={t.id}>
                {t.firstname} {t.lastname}
              </option>
            ))}
          </select>
        </div>
      ):  
        <div className="text-red-500">
          {  errorMessage !== "" && errorMessage }
        </div>
      }


      <div className="mt-4 space-y-2">
        {availabilitys && availabilitys.map((slot, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
            <span>
              🗓️ {slot.day} <br/>🕒 {slot.hour}<br/>📕 {slot.matieres.join()}<br/>👨‍🏫 {slot.tutorName}
            </span>
            <button
              onClick={() =>
                setAvailabilitys((prev) =>
                  prev.filter((_, i) => i !== index)
                )
              }
              className="text-red-500 hover:text-red-700 text-sm ml-4"
            >
              ❌ Supprimer
            </button>
          </div>
        ))}
      </div>

    </div>
    
      {
        !isAvailable&& 
        availableTutors.length !== 0 &&
          <div className=" p-0 rounded  space-y-4 w-1/2">

              <UnavailableTutorsListComponent tutors={availableTutors} student={student}/>
          </div>

      }
  </div>


  );
};

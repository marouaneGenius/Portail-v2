import React, { useEffect, useState } from 'react';
import { getUser } from '../../api/api';
import { getFrenchDayLabel, normalizeHour } from '../../services/functions';
import { HoursOptions, SchoolSubjects, SessionOptions } from '../../mocks/mocks';
import { TutorRaw } from '../../services/planing-functions';
import api from '../../api/aixos';
import { Student } from '../ParentFinder';
import { useParams } from 'react-router-dom';
import { renderMultiSelect } from '../forms/customInput';

interface Props {
  onSelect: (result: [{ tutorId: number; day: string; hour: string }]) => void;
  tutors?: any;
  school_subjects?: string[];
  // f:any 
  values:any 
  setValues:any 
  removeValueFromField :any 
}
export const school_subjects_file =  { name: 'school_subjects', label: 'Matieres', type: 'select',  multiple: true, required: true, options: SchoolSubjects };


export const TutorAvailabilityPicker: React.FC<Props> = ({tutors, onSelect, school_subjects, values, setValues, removeValueFromField }:any) => {
  const [day, setDay] = useState('');
  const [sessionLength, setSessionLength] = useState<any>(null);
  const [availableTutors, setAvailableTutors] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [hours, setHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState(null);
  const [currentTutors, setTutors] = useState<TutorRaw[]>(tutors);
  const [errorMessage, setErrorMessage] = useState<String>('');
  const [isAvailable, setIsAvailable] = useState<Boolean>(false);
  const [availabilitys, setAvailabilitys] = useState<any[]>([]);
  const [hoursList, setHoursList] = useState<any[]>(HoursOptions);
  const [isSlotExist, setIsSlotExist] = useState<boolean>(false);
  const [sessionPerWeek, setSessionPerWeek] = useState<any>(null);
  const { id } = useParams();
  const hoursPerSession = [
    { value: '1', label: '1h30' },
    { value: '2', label: '3h' },
    { value: '3', label: '4h30' },
    { value: '4', label: '6h' },
  ]

  //get all tutors by school subjects
  useEffect(() => {
    Promise.all([ api.get<TutorRaw[]>('/api/user/tutors'), ])
    .then(([tutorsRes]) => {
      if(tutorsRes && id) {
        api.get<TutorRaw[]>(`/api/student/${id}`).then((studentRes:any) => {
          const allTutors = searchTutorBySchoolSubject(school_subjects?.join(',') || '', tutorsRes.data);
          setTutors(allTutors || []);
          // filterer les tutors by centers
          const filteredTutors = allTutors.filter((tutor:any) => {
              const centers = tutor.centers.map( (c:any) => c.id)
              return centers.includes(studentRes.data.centers.id);
          });
          setAvailableTutors(filteredTutors);
        })
      }
    });
  }, [school_subjects]);

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
  };

  useEffect(() => {
    if (day && currentTutors) {
      Promise.all(currentTutors.map((t:any) => getUser(t.id)))
      .then((results) => {
        const filtered = results.filter((tutor: any) => {
          const sched = tutor.tutor_schedules.find((s: any) => s.day === day);
            if (sessionLength && sched) {
              const sessionStr = normalizeHour(sessionLength.value); // "09:30"
              const toMinutes = (timeStr: string) => {
                const [h, m] = timeStr.split(':').map(Number);
                return h * 60 + m;
              };
              const sessionMins = toMinutes(sessionStr);
              const startMins = toMinutes(sched.start_hour);
              const endMins = toMinutes(sched.end_hour);
              const availablety = sessionMins >= startMins && sessionMins <= endMins;

              if(availablety) {
                setErrorMessage('');
                setIsAvailable(true);
                return sched;
              } else{
                setIsSlotExist(false)
                setIsAvailable(false);
              }
            }
        });

        if(sessionLength && filtered.length === 0) {
          if(!isAvailable) {
            setErrorMessage('Aucun tuteur disponible, changez le jour ou l\'heure ');
          }else {
            setErrorMessage('Aucun tuteur disponible pour à cette heure');
          }
        }else {
          setErrorMessage('');
          setAvailableTutors(filtered)
        }
      }).catch(console.error);
    }
  }, [day, sessionLength, currentTutors]);

  useEffect(() => {
    if (selectedTutor && day && selectedHour) {
      const newSlot = { tutorId: selectedTutor, day, hour: selectedHour, matieres: values.school_subjects };

      // console.log(availabilitys)
  
      setSelectedHour(null);
      setSelectedTutor(null);
      setDay('');
      setSessionLength(null);
      setIsSlotExist(false);
      setValues((prev: any) => ({
        ...prev,
        school_subjects: [] 
      }));
  
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
          // onSelect(newSlot);
          // onSelect([...availabilitys, newSlot]);
          setErrorMessage('');
          return [...prev, newSlot];
        } else {
          setErrorMessage('Ce créneau existe déjà');
          return prev;
        }
      });
    }
  }, [selectedTutor]);


  useEffect(() => {
    if(availabilitys.length !== 0){
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
  }, [availabilitys])
  
  return (
    <div className="bg-white p-4 rounded shadow space-y-4 ">
        {/* <div>
          <label className="block mb-1 font-medium">Seance par semaine</label>
          <select
            value={selectedTutor || ''}
            onChange={(e) => setSessionPerWeek(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Sélectionner le nombre d'heure de cours par semaine</option>
            {hoursPerSession.map(l => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div> */}

      <div>
        {
          renderMultiSelect(school_subjects_file, values, 'school_subjects', setValues, removeValueFromField)
        }
      </div>
      {/* Jour */}
      <div>
        <label className="block mb-1 font-medium">Jour</label>
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
        <label className="block mb-1 font-medium">Durée de cours par semaine</label>
        <select
          onChange={(e) => handleSessionChange(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Choisir une durée</option>
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
        {availabilitys.map((slot, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
            <span>
              📅 {slot.day} à 🕒 {slot.hour},  Matières: {slot.matieres.join()}
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
  );
};

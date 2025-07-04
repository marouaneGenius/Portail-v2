import api from '@/api/aixos';
import React, { useEffect, useState } from 'react';
import { UnavailableTutorsListComponent } from './UnavailableTutorsListComponent';

interface Tutor {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  school_subjects: string[];
  events: {
    id: number;
    day: string;
    start_hour: string;
    end_hour: string;
    centers: { id: number }[];
  }[];
}

interface TutorListProps {
  values: {
    school_subjects: string[];
    scheduled_at?: string;
  };
  student:any;
  onSelect: (tutorId: number) => void;
}

export const TutorListComponent: React.FC<TutorListProps> = ({ values, onSelect, student }) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);


  useEffect(() => {
    api.get(`/api/user/tutors`).then((response) => {
      const filteresTutorsPeStudentCenter = response.data.filter((tutor:any) => {
        if(tutor.centers && tutor.centers.length !== 0) {
          return tutor.centers.find((center:any) => center.name == student.centers.name)
        }
      })
      setTutors(filteresTutorsPeStudentCenter);
    })

    fetchAvailableTutors();
  }, [values.school_subjects, values.scheduled_at, student]);

  const fetchAvailableTutors = async () => {

    try {
      setLoading(true);
      
      // Vérifier qu'on a les données nécessaires
      if (!values.school_subjects?.length || !values.scheduled_at) {
        return;
      }

      const subjectsOfTutor = filterTutorBySchoolSubject(tutors);
      if(subjectsOfTutor) {
        const dateFilteredTutors = filterAvailableTutors(subjectsOfTutor)
        setAvailableTutors(dateFilteredTutors)
      }
      setError(null);
    } catch (err) {
      setError('Impossible de charger les tuteurs disponibles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const filterTutorBySchoolSubject = (tutorsList: Tutor[]) => {
    const wanted = Array.isArray(values.school_subjects)
      ? values.school_subjects
      : [];
  
    // Si rien n’est précisé, on ne filtre pas
    if (wanted.length === 0) {
      return tutorsList;
    }

    return tutorsList.filter(tutor => {
      // S’assure que tutor.school_subjects est bien un tableau
      const have = Array.isArray(tutor.school_subjects)
        ? tutor.school_subjects
        : [];
  
      // On ne garde que si chaque matière recherchée est présente
      // return wanted.every(subj => have.includes(subj));


      // On ne garde que si y'a au moins une matière recherchée est présente
      return wanted.some(subj => have.includes(subj));

    });
  };

  const filterAvailableTutors = (tutorsList: Tutor[]): Tutor[] => {
    if (!values.scheduled_at) {
      // si pas de date planifiée, on ne filtre pas
      return tutorsList;
    }
  
    const scheduledDate = new Date(values.scheduled_at);
  
    // 1) Traduction du jour en français
    const frenchDays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const dayOfWeek = frenchDays[scheduledDate.getDay()];
  
    const totalScheduledMinutes = scheduledDate.getHours() * 60 + scheduledDate.getMinutes();
  
    return tutorsList.filter(tutor => {
      return tutor.events.some(event => {
        if (event.day.toLowerCase() !== dayOfWeek) {
          return false;
        }


        console.log(event.start_hour, event.end_hour)
  
        // b) convertir start_hour / end_hour en objets Date
        const start = new Date(event.start_hour);
        const end   = new Date(event.end_hour);
  
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes   = end.getHours()   * 60 + end.getMinutes();

        // console.log(startMinutes,totalScheduledMinutes,  endMinutes, totalScheduledMinutes)
  
        // c) inclusion de l’heure planifiée dans l’intervalle [start, end]
        return totalScheduledMinutes >= startMinutes
            && totalScheduledMinutes <= endMinutes;
      });
    });
  };
  
  const handleSelectTutor = (tutorId: number) => {
    setSelectedTutor(tutorId);
    onSelect(tutorId);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-sm">Recherche des tuteurs disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
        {error}
      </div>
    );
  }


  if (student && availableTutors.length === 0) {
    return (
      <div className="mt-6">
        <UnavailableTutorsListComponent tutors={tutors} student={student}/>
        <p className="mt-3 text-sm text-amber-700">
          Essayez de modifier la date ou les matières sélectionnées.
        </p>
      </div>
    );
  }



  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-medium text-lg">Tuteurs disponibles</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableTutors.map(tutor => (
          <div 
            key={tutor.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTutor === tutor.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleSelectTutor(tutor.id)}
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              
              <div className="flex-1">
                <h4 className="font-medium">{tutor.firstname} {tutor.lastname}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {tutor.school_subjects.join(', ')}
                </p>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Disponibilités:
                  </p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-1">
                    {tutor.events.map((event, index) => (
                      <li key={index}>
                        {event.day}: {formatTime(event.start_hour)} - {formatTime(event.end_hour)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fonction utilitaire pour formater l'heure
const formatTime = (timeString: string) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
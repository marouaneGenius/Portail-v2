import api from '@/api/aixos';
import React, { useEffect, useState } from 'react';
import { UnavailableTutorsListComponent } from './UnavailableTutorsListComponent';
import { getLevelForSubject, hasLevelForSubject } from '../subscriptions/SubscriptionFunctions';
import { formatTime } from '@/services/functions';

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
    centers: any;
  }[];
}

interface TutorListProps {
  values: {
    school_subjects: string[];
    scheduled_at?: string;
  };
  student:any;
  onSelect: (tutorId: number) => void;
  isParentRescheduling?: boolean; // Nouveau prop pour indiquer si c'est une reprogrammation par un parent
}

export const TutorListComponent: React.FC<TutorListProps> = ({ values, onSelect, student, isParentRescheduling = false }) => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [availableTutors, setAvailableTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [tutorStudentCount, setTutorStudentCount] = useState<{[key: string]: number}>({});

  // Fonction pour vérifier le nombre d'étudiants d'un tuteur à un créneau donné
  const checkTutorStudentCount = async (tutorId: number, scheduledAt: string): Promise<number> => {
    try {
      // Appel API pour récupérer le nombre d'étudiants du tuteur à ce créneau
      const response = await api.get(`/api/sessions/tutor/${tutorId}/count`, {
        params: {
          scheduled_at: scheduledAt
        }
      });
      return response.data.student_count || 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du nombre d\'étudiants:', error);
      return 0;
    }
  };

  // Fonction pour vérifier si un tuteur peut être sélectionné (moins de 5 étudiants)
  const canSelectTutor = (tutorId: number): boolean => {
    const key = `${tutorId}-${values.scheduled_at}`;
    const count = tutorStudentCount[key] || 0;
    return count < 5;
  };

  // Fonction pour vérifier si un tuteur est éligible pour la reprogrammation par un parent (≥ 2 élèves)
  const isEligibleForParentReschedule = (tutorId: number): boolean => {
    const key = `${tutorId}-${values.scheduled_at}`;
    const count = tutorStudentCount[key] || 0;
    return count >= 2;
  };

  useEffect(() => {
    api.get(`/api/user/tutors`).then((response) => {
      const filteresTutorsPeStudentCenter = response.data.filter((tutor:any) => {
        // Vérification 1: Le tuteur a des centres, des événements, et le centre correspond
        const hasCenterMatch = tutor.centers && tutor.centers.length !== 0 && tutor.events && tutor.events.length !== 0 && 
          tutor.events.find((event:any) => { 
            if(event.centers && event.centers.name && student.centers && student.centers.name) {
              return event.centers.name === student.centers.name 
            }
            return false;
          });
        
        if (!hasCenterMatch) return false;
        
        // Vérification 2: Le tuteur peut enseigner les matières demandées au niveau de l'étudiant
        if (values.school_subjects && values.school_subjects.length > 0) {
          const hasSubjectAndLevel = hasLevelForSubject(tutor, student.class, values.school_subjects);
          if (!hasSubjectAndLevel) return false;
        }
        
        return true;
      })
      console.log('Filtered Tutors:', response.data, student, values.school_subjects );
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
        const dateFilteredTutors = filterAvailableTutors(subjectsOfTutor);
        
        // Vérifier le nombre d'étudiants pour chaque tuteur
        const studentCountPromises = dateFilteredTutors.map(async (tutor) => {
          const count = values.scheduled_at ? await checkTutorStudentCount(tutor.id, values.scheduled_at) : 0;
          return { tutorId: tutor.id, count };
        });

        const studentCounts = await Promise.all(studentCountPromises);

        // Mettre à jour l'état avec les nombres d'étudiants
        const newTutorStudentCount: {[key: string]: number} = {};
        studentCounts.forEach(({ tutorId, count }) => {
          const key = `${tutorId}-${values.scheduled_at}`;
          newTutorStudentCount[key] = count;
        });
        setTutorStudentCount(newTutorStudentCount);

        // Pour la reprogrammation par un parent, on affiche tous les tuteurs mais on les catégorise
        setAvailableTutors(dateFilteredTutors);
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
    // Le filtrage par matières et niveaux est déjà fait dans le premier useEffect
    // Cette fonction peut maintenant juste retourner la liste complète
    return tutorsList;
  };

  const filterAvailableTutors = (tutorsList: Tutor[]): Tutor[] => {
    if (!values.scheduled_at) {
      return tutorsList;
    }
  
    const scheduledDate = new Date(values.scheduled_at);
    const frenchDays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const dayOfWeek = frenchDays[scheduledDate.getDay()];
    const totalScheduledMinutes = scheduledDate.getHours() * 60 + scheduledDate.getMinutes();

    return tutorsList.filter(tutor => {

      return tutor.events.some(event => {
        if (event.day.toLowerCase() !== dayOfWeek) {
          return false;
        }

        if(student.centers.name  === event.centers.name ) {
          // b) convertir start_hour / end_hour en objets Date
          const start = new Date(event.start_hour);
          const end   = new Date(event.end_hour);
    
          const startMinutes = start.getHours() * 60 + start.getMinutes();
          const endMinutes   = end.getHours()   * 60 + end.getMinutes();
    
          // c) inclusion de l’heure planifiée dans l’intervalle [start, end]
          return totalScheduledMinutes >= startMinutes
              && totalScheduledMinutes <= endMinutes;
        }

      });
    });
  };
  
  const handleSelectTutor = (tutorId: number) => {
    if (!canSelectTutor(tutorId)) {
      alert('Ce tuteur a déjà atteint sa capacité maximale de 5 étudiants pour ce créneau.');
      return;
    }

    if (isParentRescheduling && !isEligibleForParentReschedule(tutorId)) {
      alert('Ce tuteur n\'a pas assez d\'élèves prévus dans ce créneau pour une reprogrammation. Minimum requis : 2 élèves.');
      return;
    }

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

  if (student && availableTutors.length === 0 && tutors.length !== 0) {
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
    <div className="mt-6 space-y-4  bg-white rounded p-3">
      <h3 className="font-medium text-lg">Tuteurs disponibles</h3>
      {isParentRescheduling && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Conditions de reprogrammation</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>Tuteurs sélectionnables :</strong> Ceux ayant au moins 2 élèves prévus dans ce créneau</p>
            <p>• <strong>Tuteurs grisés :</strong> Ne respectent pas les conditions requises</p>
            <p>• <strong>Capacité maximale :</strong> 5 élèves par tuteur et par créneau</p>
          </div>
        </div>
      )}

      {isParentRescheduling && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
            <span>Sélectionnable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200"></div>
            <span>Pas assez d'élèves</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-50 border border-red-200"></div>
            <span>Capacité atteinte</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-1 gap-1 ">
        {availableTutors.map(tutor => {
          const canSelect = canSelectTutor(tutor.id);
          const isEligibleForParent = isEligibleForParentReschedule(tutor.id);
          const studentCount = tutorStudentCount[`${tutor.id}-${values.scheduled_at}`] || 0;


          // Détermine le style en fonction du statut
          let cardStyle = '';
          if (!canSelect) {
            cardStyle = 'bg-red-50 border-red-200 opacity-70 cursor-not-allowed';
          } else if (isParentRescheduling && !isEligibleForParent) {
            cardStyle = 'bg-amber-50 border-amber-200 opacity-70 cursor-not-allowed';
          } else if (selectedTutor === tutor.id) {
            cardStyle = 'border-blue-500 bg-blue-50 cursor-pointer';
          } else {
            cardStyle = 'border-gray-200 hover:border-blue-300 bg-gray-100 cursor-pointer';
          }

          return (
            <div
              key={tutor.id}
              className={`border rounded-lg p-2 w-full transition-all ${cardStyle}`}
              onClick={() => handleSelectTutor(tutor.id)}
            >
            <div className="flex  gap-0">
              <div className="flex-1  w-2/4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{tutor.firstname} {tutor.lastname}</h4>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    studentCount >= 5 
                      ? 'bg-red-200 text-red-800' 
                      : studentCount >= 3 
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-green-200 text-green-800'
                  }`}>
                    {studentCount}/5 élèves
                  </div>
                </div>
                {!canSelect && (
                  <div className="text-xs text-red-600 font-medium mt-1">
                    ⚠️ Capacité maximale atteinte
                  </div>
                )}
                {canSelect && isParentRescheduling && !isEligibleForParent && (
                  <div className="text-xs text-amber-600 font-medium mt-1">
                    ⚠️ Pas assez d'élèves prévus (minimum 2 requis)
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {
                    tutor.school_subjects.map((s, index) => (
                      <span key={index} className='bg-blue-200 m-1 rounded p-1 text-xs'>{s} -
                      {getLevelForSubject (tutor, s)}
                      </span>
                    ))
                  }
                </p>
              </div>

              <div className="  w-2/4">
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  {tutor.events.map((event, index) => {
                   return ( <li className='bg-gray-200 p-1 rounded' key={index}>
                      {event.day}: {formatTime(event.start_hour)} - {formatTime(event.end_hour)} à 
                      <span className={`${student.centers.name === event.centers.name ? 'bg-red-100 ': ''} p-1 rounded ml-1`}>{event.centers.name}</span> 

                    </li>)
                    }
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

// Fonction utilitaire pour formater l'heure


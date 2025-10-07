import React, { useEffect, useState } from 'react';
import { useAuth } from '../Hooks/auth';
import api from '@/api/aixos';
import { getCenters } from '@/api/api';
import { Building, BookOpen, Calendar, Users, MapPin, Phone, Mail, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SchoolSubjects, Days, ClassesOptions, ClassesOptionsLevel } from '@/mocks/mocks';
import { useNavigate } from 'react-router-dom';
import { getLevelOfClass } from '@/components/subscriptions/SubscriptionFunctions';

type Tutor = {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  centers: { id: number; name: string }[];
  school_subjects: string[];
  class: Array<{
    subject: string;
    level: string;
  }>;
  tutor_schedules: Array<{
    id: number;
    day: string;
    start_hour: string;
    end_hour: string;
    centers: { id: number; name: string }[];
  }>;
};

// Fonction pour convertir le nom de classe en niveau numérique
const getNumericLevel = (className: string): number => {
  const classLevel = ClassesOptionsLevel.find(c => c.value === className);
  return classLevel ? parseInt(classLevel.level) : 0;
};

export default function Tutors() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<{ id: number; name: string }[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | ''>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  

  // Charger les centres
  useEffect(() => {
    getCenters().then((centersList) => {
      setCenters(centersList);
    });
  }, []);

  // Charger tous les tuteurs avec toutes leurs informations
  useEffect(() => {
    setLoading(true);
    api.get('/api/user/tutors/complete')
      .then(({ data }) => {
        // Par défaut, ne récupérer que les tuteurs avec des disponibilités
        const tutorsWithSchedules = data.filter((tutor:any) => 
          tutor.tutor_schedules && tutor.tutor_schedules.length > 0
        );
        setTutors(tutorsWithSchedules);
        setFilteredTutors(tutorsWithSchedules);
      })
      .catch(err => console.error('Erreur lors du chargement des tuteurs:', err))
      .finally(() => setLoading(false));
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...tutors];

    // Filtre par centre
    if (selectedCenter) {
      filtered = filtered.filter(tutor => 
        (tutor.centers || []).some(center => center.id === selectedCenter)
      );
    }

    // Filtre par matières et niveau (combiné)
    if (selectedSubjects.length > 0 || selectedLevel) {
      const requiredNumericLevel = selectedLevel ? getNumericLevel(selectedLevel) : 0;
      console.log('Filtrage par matières et niveau:', selectedSubjects, selectedLevel, 'niveau numérique:', requiredNumericLevel);
      
      filtered = filtered.filter(tutor => {
        // Si des matières sont sélectionnées, vérifier que le tuteur les enseigne
        if (selectedSubjects.length > 0) {
          const hasAllSubjects = selectedSubjects.every(subject => 
            (tutor.school_subjects || []).includes(subject)
          );
          if (!hasAllSubjects) return false;
        }

        // Si un niveau est sélectionné, vérifier que le tuteur peut enseigner ce niveau
        if (selectedLevel) {
          // Si des matières spécifiques sont sélectionnées, vérifier le niveau pour ces matières
          if (selectedSubjects.length > 0) {
            const canTeachSelectedSubjectsAtLevel = selectedSubjects.every(selectedSubject => {
              // Trouver la classe du tuteur pour cette matière spécifique
              const tutorClassForSubject = (tutor.class || []).find(tc => tc.subject === selectedSubject);
              if (!tutorClassForSubject) {
                console.log(`Tuteur ${tutor.firstname} n'enseigne pas ${selectedSubject}`);
                return false;
              }
              
              const tutorNumericLevel = parseInt(tutorClassForSubject.level) || 0;
              const canTeach = tutorNumericLevel >= requiredNumericLevel;
              console.log(`Tuteur ${tutor.firstname} - ${selectedSubject}: niveau ${tutorNumericLevel}, requis: ${requiredNumericLevel}, peut enseigner: ${canTeach}`);
              return canTeach;
            });
            return canTeachSelectedSubjectsAtLevel;
          } else {
            // Si aucune matière spécifique, vérifier si le tuteur peut enseigner au niveau général
            const canTeachLevel = (tutor.class || []).some(tutorClass => {
              const tutorNumericLevel = parseInt(tutorClass.level) || 0;
              return tutorNumericLevel >= requiredNumericLevel;
            });
            return canTeachLevel;
          }
        }

        return true;
      });
    }

    // Filtre par jour
    if (selectedDay) {
      filtered = filtered.filter(tutor => 
        (tutor.tutor_schedules || []).some(schedule => schedule.day === selectedDay)
      );
    }

    setFilteredTutors(filtered);
  }, [tutors, selectedCenter, selectedSubjects, selectedDay, selectedLevel]);

  // Gérer la sélection/désélection des matières
  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCenter('');
    setSelectedSubjects([]);
    setSelectedDay('');
    setSelectedLevel('');
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold mb-6 text-mister-anthracite flex items-center gap-3">
        <Users className="w-8 h-8 text-hello-yellow" />
        Planning des Tuteurs
      </h2>

      {/* Filtres */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-fading-grey p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-mister-anthracite mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-hello-yellow" />
          Filtres
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Filtre Centre */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-mister-anthracite flex items-center gap-2">
              <Building className="w-4 h-4 text-hello-yellow" />
              Centre
            </label>
            <select
              className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm"
              value={selectedCenter}
              onChange={e => setSelectedCenter(e.target.value ? +e.target.value : '')}
            >
              <option value="">Tous les centres</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Filtre Matières (Multiple) */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-mister-anthracite flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-hello-yellow" />
              Matières ({selectedSubjects.length} sélectionnée{selectedSubjects.length !== 1 ? 's' : ''})
            </label>
            <div className="max-h-48 overflow-y-auto border-2 border-fading-grey rounded-xl bg-white p-2 space-y-1">
              {SchoolSubjects.map(subject => (
                <label 
                  key={subject.value} 
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject.value)}
                    onChange={() => toggleSubject(subject.value)}
                    className="w-4 h-4 text-hello-yellow border-2 border-fading-grey rounded focus:ring-2 focus:ring-hello-yellow"
                  />
                  <span className="text-sm text-mister-anthracite font-medium">
                    {subject.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtre Jour */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-mister-anthracite flex items-center gap-2">
              <Calendar className="w-4 h-4 text-hello-yellow" />
              Jour
            </label>
            <select
              className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm"
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
            >
              <option value="">Tous les jours</option>
              {Days.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>

          {/* Filtre Niveau */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-mister-anthracite flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Niveau
            </label>
            <select
              className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm"
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value)}
            >
              <option value="">Tous les niveaux</option>
              {ClassesOptions.map(classe => (
                <option key={classe.value} value={classe.value}>{classe.label}</option>
              ))}
            </select>
          </div>

          {/* Bouton Reset */}
          <div className="flex flex-col justify-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-3 bg-crazy-magenta text-white rounded-xl hover:bg-hello-yellow hover:text-mister-anthracite font-semibold transition shadow-sm"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Résumé des filtres actifs */}
        {(selectedCenter || selectedSubjects.length > 0 || selectedDay || selectedLevel) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-mister-anthracite font-medium">Filtres actifs :</span>
            {selectedCenter && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Centre: {centers.find(c => c.id === selectedCenter)?.name}
              </Badge>
            )}
            {selectedSubjects.map(subject => (
              <Badge 
                key={subject} 
                variant="outline" 
                className="bg-green-50 text-green-700 border-green-200 cursor-pointer hover:bg-green-100"
                onClick={() => toggleSubject(subject)}
              >
                {SchoolSubjects.find(s => s.value === subject)?.label} ✕
              </Badge>
            ))}
            {selectedDay && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Jour: {Days.find(d => d.value === selectedDay)?.label}
              </Badge>
            )}
            {selectedLevel && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Niveau: {ClassesOptions.find(c => c.value === selectedLevel)?.label}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Bouton pour ouvrir le modal calendrier */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowWeeklyModal(true)}
          className="px-6 py-3 bg-hello-yellow text-mister-anthracite rounded-xl hover:bg-crazy-magenta hover:text-white font-semibold transition flex items-center gap-2 shadow-lg"
        >
          <Calendar className="w-5 h-5" />
          Vue Calendrier Hebdomadaire
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-fading-grey p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-hello-yellow" />
            <div>
              <p className="text-2xl font-bold text-mister-anthracite">{filteredTutors.length}</p>
              <p className="text-sm text-mister-anthracite/60">Tuteur(s) trouvé(s)</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-fading-grey p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-crazy-magenta" />
            <div>
              <p className="text-2xl font-bold text-mister-anthracite">{centers.length}</p>
              <p className="text-sm text-mister-anthracite/60">Centre(s) total</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-fading-grey p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-mister-anthracite">
                {new Set(filteredTutors.flatMap(t => t.school_subjects || [])).size}
              </p>
              <p className="text-sm text-mister-anthracite/60">Matière(s) enseignée(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tuteurs */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-mister-anthracite">Chargement des tuteurs...</div>
        </div>
      ) : filteredTutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map(tutor => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-fading-grey">
          <Users className="w-16 h-16 text-mister-anthracite/30 mx-auto mb-4" />
          <p className="text-xl text-mister-anthracite/60 mb-2">Aucun tuteur trouvé</p>
          <p className="text-sm text-mister-anthracite/40">
            Essayez de modifier vos critères de recherche ou réinitialisez les filtres.
          </p>
        </div>
      )}

      {/* Modal Calendrier Hebdomadaire */}
      {showWeeklyModal && (
        <WeeklyCalendarModal 
          tutors={filteredTutors}
          selectedCenter={selectedCenter}
          centers={centers}
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
          onClose={() => setShowWeeklyModal(false)}
        />
      )}
    </div>
  );
}

// Interface pour les props du modal calendrier
interface WeeklyCalendarModalProps {
  tutors: Tutor[];
  selectedCenter: number | '';
  centers: { id: number; name: string }[];
  currentWeek: Date;
  setCurrentWeek: (date: Date) => void;
  onClose: () => void;
}

// Composant Modal Calendrier Hebdomadaire
const WeeklyCalendarModal: React.FC<WeeklyCalendarModalProps> = ({ 
  tutors, 
  selectedCenter, 
  centers, 
  currentWeek, 
  setCurrentWeek, 
  onClose 
}) => {
  // Obtenir le début de la semaine (lundi)
  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  // Générer les 7 jours de la semaine
  const getWeekDays = (startDate: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Navigation semaine
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeek(newWeek);
  };

  // Convertir le nom du jour en français
  const getDayName = (date: Date): string => {
    const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return dayNames[date.getDay()];
  };

  // Filtrer les tuteurs par centre si un centre est sélectionné
  const filteredTutors = selectedCenter 
    ? tutors.filter(tutor => 
        (tutor.centers || []).some(center => center.id === selectedCenter)
      )
    : tutors;

  // Obtenir les disponibilités d'un tuteur pour un jour donné
  const getTutorScheduleForDay = (tutor: Tutor, dayName: string) => {
    return (tutor.tutor_schedules || []).filter(schedule => 
      schedule.day.toLowerCase() === dayName.toLowerCase() &&
      (selectedCenter === '' || (schedule.centers || []).some(center => center.id === selectedCenter))
    );
  };

  const startOfWeek = getStartOfWeek(currentWeek);
  const weekDays = getWeekDays(startOfWeek);
  const centerName = selectedCenter ? centers.find(c => c.id === selectedCenter)?.name : 'Tous les centres';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header du modal */}
        <div className="flex justify-between items-center p-6 border-b bg-hello-yellow">
          <div>
            <h2 className="text-2xl font-bold text-mister-anthracite">
              Calendrier Hebdomadaire - {centerName}
            </h2>
            <p className="text-mister-anthracite/70">
              Disponibilités des tuteurs du {startOfWeek.toLocaleDateString('fr-FR')} au {weekDays[6].toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6 text-mister-anthracite" />
          </button>
        </div>

        {/* Navigation de semaine */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <button
            onClick={() => navigateWeek('prev')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Semaine précédente
          </button>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg text-mister-anthracite">
              Semaine du {startOfWeek.toLocaleDateString('fr-FR')}
            </h3>
            <p className="text-sm text-gray-600">{filteredTutors.length} tuteur(s)</p>
          </div>
          
          <button
            onClick={() => navigateWeek('next')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Semaine suivante
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Contenu du calendrier */}
        <div className="p-4 overflow-auto max-h-[70vh]">
          {filteredTutors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">Aucun tuteur disponible</p>
              <p className="text-sm text-gray-400">Pour le centre sélectionné</p>
            </div>
          ) : (
            <div className="space-y-6 ">
              {/* En-tête des jours - sticky */}
              <div className="sticky top-0 z-10 grid grid-cols-8 gap-2 bg-white pb-4">
                <div className="font-semibold text-mister-anthracite p-3 bg-gray-100 rounded-lg shadow-sm">
                  Tuteur
                </div>
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center font-semibold text-mister-anthracite p-3 bg-gray-100 rounded-lg shadow-sm">
                    <div className="text-sm capitalize">{getDayName(day)}</div>
                    <div className="text-xs text-gray-600">{day.getDate()}/{day.getMonth() + 1}</div>
                  </div>
                ))}
              </div>

              {/* Grille des tuteurs et leurs disponibilités */}
              {filteredTutors.map((tutor) => (
                <div key={tutor.id} className="grid grid-cols-8 gap-2 border border-gray-200 rounded-lg overflow-hidden">
                  {/* Colonne tuteur */}
                  <div className="bg-fading-grey/30 p-4 flex items-center">
                    <div>
                      <h4 className="font-semibold text-mister-anthracite text-sm">
                        {tutor.firstname} {tutor.lastname}
                      </h4>
                      <div className="text-xs text-gray-600 mt-1">
                        {(tutor.school_subjects || []).slice(0, 2).join(', ')}
                        {(tutor.school_subjects || []).length > 2 && '...'}
                      </div>
                    </div>
                  </div>

                  {/* Colonnes des jours */}
                  {weekDays.map((day, dayIndex) => {
                    const dayName = getDayName(day);
                    const schedules = getTutorScheduleForDay(tutor, dayName);
                    
                    return (
                      <div key={dayIndex} className="p-2 bg-white min-h-[100px] border-l border-gray-100">
                        {schedules.length > 0 ? (
                          <div className="space-y-1">
                            {schedules.map((schedule, scheduleIndex) => (
                              <div
                                key={scheduleIndex}
                                className="bg-green-100 border border-green-300 rounded p-2 text-xs"
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock className="w-3 h-3 text-green-600" />
                                  <span className="font-medium text-green-800">
                                    {schedule.start_hour} - {schedule.end_hour}
                                  </span>
                                </div>
                                {(schedule.centers || []).length > 0 && (
                                  <div className="space-y-1">
                                    {schedule.centers.map((center) => (
                                      <Badge 
                                        key={center.id} 
                                        variant="outline" 
                                        className="bg-green-50 text-green-700 border-green-200 text-xs"
                                      >
                                        {center.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-gray-400 text-xs italic">Pas disponible</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer avec statistiques */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {filteredTutors.length} tuteur(s) • {centerName}
            </span>
            <span>
              Total: {filteredTutors.reduce((total, tutor) => 
                total + (tutor.tutor_schedules || []).filter(schedule => 
                  selectedCenter === '' || (schedule.centers || []).some(center => center.id === selectedCenter)
                ).length, 0
              )} créneau(x) disponible(s) cette semaine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour une carte tuteur
const TutorCard: React.FC<{ tutor: Tutor }> = ({ tutor }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-fading-grey p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-hello-yellow">
      {/* En-tête avec nom */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-mister-anthracite mb-3">
          {tutor.firstname} {tutor.lastname}
        </h3>
        
        {/* Informations de contact mises en évidence */}
        <div className="bg-fading-grey/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-mister-anthracite">
            <Mail className="w-4 h-4 text-hello-yellow" />
            <span className="font-medium">
              {tutor.email || <span className="italic text-mister-anthracite/50">Email non renseigné</span>}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-mister-anthracite">
            <Phone className="w-4 h-4 text-hello-yellow" />
            <span className="font-medium">
              {tutor.phone || <span className="italic text-mister-anthracite/50">Téléphone non renseigné</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Centres */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-4 h-4 text-hello-yellow" />
          <span className="font-semibold text-mister-anthracite text-sm">Centres</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(tutor.centers || []).map(center => (
            <Badge key={center.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {center.name}
            </Badge>
          ))}
          {(!tutor.centers || tutor.centers.length === 0) && (
            <span className="text-xs text-mister-anthracite/40 italic">Aucun centre assigné</span>
          )}
        </div>
      </div>

      {/* Matières enseignées */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-mister-anthracite text-sm">
            Matières enseignées ({(tutor.school_subjects || []).length})
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(tutor.school_subjects || []).map((subject, index) => {
            // Chercher le niveau correspondant dans la propriété class
            const subjectLevel = (tutor.class || []).find(classItem => classItem.subject === subject);
            
            return (
              <Badge key={`${subject}-${index}`} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                {subject}
                {subjectLevel && (
                  <span className="ml-1 px-1 bg-green-200 rounded text-green-800 font-semibold">
                    {getLevelOfClass(subjectLevel.level)}
                  </span>
                )}
              </Badge>
            );
          })}
          {(!tutor.school_subjects || tutor.school_subjects.length === 0) && (
            <span className="text-xs text-mister-anthracite/40 italic bg-gray-50 rounded px-2 py-1">
              Aucune matière définie
            </span>
          )}
        </div>
      </div>

      {/* Disponibilités détaillées */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-mister-anthracite text-sm">Disponibilités</span>
        </div>
        {(tutor.tutor_schedules || []).length > 0 ? (
          <div className="space-y-2">
            {(tutor.tutor_schedules || []).map(schedule => (
              <div key={schedule.id} className="bg-white/60 border border-purple-200 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-mister-anthracite capitalize text-sm">{schedule.day}</span>
                  <span className="text-sm text-purple-600 font-medium">
                    {schedule.start_hour} - {schedule.end_hour}
                  </span>
                </div>
                {(schedule.centers || []).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {schedule.centers.map(center => (
                      <Badge key={center.id} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        {center.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {tutor.tutor_schedules && tutor.tutor_schedules.length > 4 && (
              <div className="text-xs text-mister-anthracite/50 italic text-center">
                {tutor.tutor_schedules.length} créneaux au total
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-mister-anthracite/40 italic bg-gray-50 rounded-lg p-3 text-center">
            Aucune disponibilité définie
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-fading-grey">
        <button 
          onClick={() => navigate(`/user/${tutor.id}`)}
          className="flex-1 px-3 py-2 bg-hello-yellow text-mister-anthracite rounded-lg hover:bg-crazy-magenta hover:text-white font-semibold transition text-sm">
          Voir détails
        </button>
        <button 
          onClick={() => navigate(`/form/tutorschedule/${tutor.id}`)}
          className="flex-1 px-3 py-2 bg-fading-grey text-mister-anthracite rounded-lg hover:bg-hello-yellow font-semibold transition text-sm">
          Planning
        </button>
      </div>
    </div>
  );
};
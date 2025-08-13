import React, { useEffect, useState } from 'react';
import { useAuth } from '../Hooks/auth';
import api from '@/api/aixos';
import { getCenters } from '@/api/api';
import { Building, BookOpen, Calendar, Users, MapPin, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SchoolSubjects, Days } from '@/mocks/mocks';
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

export default function Tutors() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<{ id: number; name: string }[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [loading, setLoading] = useState(true);
  

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
        console.log('Tutors data:', data);
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

    // Filtre par matière
    if (selectedSubject) {
      filtered = filtered.filter(tutor => 
        (tutor.school_subjects || []).includes(selectedSubject)
      );
    }

    // Filtre par jour
    if (selectedDay) {
      filtered = filtered.filter(tutor => 
        (tutor.tutor_schedules || []).some(schedule => schedule.day === selectedDay)
      );
    }

    setFilteredTutors(filtered);
  }, [tutors, selectedCenter, selectedSubject, selectedDay]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCenter('');
    setSelectedSubject('');
    setSelectedDay('');
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold mb-6 text-mister-anthracite flex items-center gap-3">
        <Users className="w-8 h-8 text-hello-yellow" />
        Planing des Tuteurs
      </h2>

      {/* Filtres */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-fading-grey p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-mister-anthracite mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-hello-yellow" />
          Filtres
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

          {/* Filtre Matière */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-mister-anthracite flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-hello-yellow" />
              Matière
            </label>
            <select
              className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">Toutes les matières</option>
              {SchoolSubjects.map(subject => (
                <option key={subject.value} value={subject.value}>{subject.label}</option>
              ))}
            </select>
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
        {(selectedCenter || selectedSubject || selectedDay) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-mister-anthracite font-medium">Filtres actifs :</span>
            {selectedCenter && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Centre: {centers.find(c => c.id === selectedCenter)?.name}
              </Badge>
            )}
            {selectedSubject && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Matière: {SchoolSubjects.find(s => s.value === selectedSubject)?.label}
              </Badge>
            )}
            {selectedDay && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Jour: {Days.find(d => d.value === selectedDay)?.label}
              </Badge>
            )}
          </div>
        )}
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
    </div>
  );
}

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
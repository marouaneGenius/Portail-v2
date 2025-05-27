import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import api from '../api/aixos';
import { ResourceCalendar } from '../components/TimeLineCalendar';
import moment from 'moment';
import { expandSchedulesToWeeklyEvents, TutorRaw } from '../services/planing-functions';
import { AlertMessage } from '../components/Alert';
import { getCenters } from '../api/api';

export const Planing: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<{ resourceId: string; resourceTitle: string }[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showError, setShowError] = useState(false);
  const [centers, setCenters] = useState<{ id: number; name: string }[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [tutors, setTutors] = useState<TutorRaw[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<TutorRaw[]>('/api/user/tutors'),
      getCenters()
    ])
      .then(([tutorsRes, centersData]) => {
        setTutors(tutorsRes.data);
        setCenters(centersData);
      })
      .catch((e) => {
        console.error(e);
        setShowError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCenter !== null) {
      const filteredTutors = tutors
        .map((tutor) => {
          const filteredEvents = tutor.events.filter((event: any) =>
            event.centers.some((center: any) => center.id === selectedCenter)
          );

          return { ...tutor, events: filteredEvents };
        })
        .filter((tutor) => tutor.events.length > 0);

      setResources(filteredTutors.map((t) => ({
        resourceId: String(t.id),
        resourceTitle: `${t.firstname} ${t.lastname}`,
      })));

      setEvents(expandSchedulesToWeeklyEvents(filteredTutors, moment().year()));
    } else {
      setResources([]);
      setEvents([]);
    }
  }, [selectedCenter, tutors]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <p>Chargement…</p>;
  }

  return (
    <div className="mx-auto py-2 px-4">
      <h1 className="text-3xl font-bold mb-4">Planning annuel des tuteurs</h1>

      <select
        className="mb-4 p-2 border rounded"
        value={selectedCenter || ''}
        onChange={(e) => setSelectedCenter(Number(e.target.value) || null)}
      >
        <option value="">Sélectionner un centre</option>
        {centers.map(center => (
          <option key={center.id} value={center.id}>{center.name}</option>
        ))}
      </select>

      {showError ? (
        <AlertMessage message={'Un problème est survenu lors du chargement des créneaux !'} />
      ) : (
        <ResourceCalendar
          resources={resources}
          events={events}
          onSelectEvent={(evt) =>
            console.log('Clique sur événement', evt.id, 'du tuteur', evt.resourceId)
          }
        />
      )}
    </div>
  );
};

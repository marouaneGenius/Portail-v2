import React, { useEffect, useState } from 'react';
import { Navigate, redirect, useNavigate } from 'react-router-dom';
import { useAuth } from '../Hooks/auth';
import api from '../api/aixos';
import { ResourceCalendar } from '../components/TimeLineCalendar';
import moment from 'moment';
import { expandSchedulesToWeeklyEvents, TutorRaw } from '../services/planing-functions';
import { AlertMessage } from '../components/Alert';
import { getCenters, getUser } from '../api/api';
import { DetailsItemSidebar } from '../components/DetailsItemSideBar';
import { ScheduleArrayField } from '../components/forms/TutorScheduleForm';
import { Days } from '../mocks/mocks';
import { getFrenchDayLabel } from '../services/functions';

export const Planing: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<{ resourceId: string; resourceTitle: string }[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showError, setShowError] = useState(false);
  const [centers, setCenters] = useState<{ id: number; name: string }[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [tutors, setTutors] = useState<TutorRaw[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [UserId, setUserId] = useState();
  const [schedule, setSchedule] = useState<any>();
  const navigate = useNavigate(); 

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

  const loadEvents = () => {
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
  }

  useEffect(() => {
    if (selectedCenter !== null) {
      loadEvents();
    } else {
      setResources([]);
      setEvents([]);
    }
  }, [selectedCenter, tutors]);

  const eventHandler = (event: any) => {
    if (event) {
      const day = getFrenchDayLabel(event.start)
      const userId = event.sourceResource;
      setUserId(userId)
      getUser(userId).then((userData:any) => {
        const currentSchedule = userData.tutor_schedules.find((item:any) => item.day === day)
        setSchedule([{...currentSchedule, id_user: userId}]);
        setSelectedUser(userData);
        setSidebarOpen(true);
      });
    }
  };

  const onChangePlaningForm = (values:any) => {
    const data = values[0];
    if(data ){
      if( !data.id) {
        console.error('ID is required to update the schedule');
        setShowError(true);
        return;
      }
      if (!data.day || !data.start_hour || !data.end_hour) {
        console.error('Day, start hour and end hour are required');
        setShowError(true);
        return;
      }
      setShowError(false);
    // Convert start_hour and end_hour to the correct format if they are Date objects
      api.put(`/api/tutorschedule/${data.id}`, 
        data,
      )
        .then(() => { 
          setSidebarOpen(false);
          setSelectedUser(null);
          setShowError(false);
          api.get<TutorRaw[]>('/api/user/tutors')
            .then((tutorsRes) => {
              setTutors(tutorsRes.data); // Mettre à jour les tuteurs
              loadEvents(); // Recharger les événements
            })
            .catch((error) => {
              console.error('Erreur lors du rechargement des tuteurs :', error);
              setShowError(true);
            });

          }
        )
        .catch((error) => {
          console.error('Erreur lors de la mise à jour du planing :', error);
          setShowError(true);
        }
        );
    }
  }

  const deleteSlot = () => {
    api.delete(`/api/tutorschedule/${schedule[0].id}`)
      .then(() => {
        setSidebarOpen(false);
        setSelectedUser(null);
        setShowError(false);
        api.get<TutorRaw[]>('/api/user/tutors')
          .then((tutorsRes) => {
            setTutors(tutorsRes.data); // Mettre à jour les tuteurs
            loadEvents(); // Recharger les événements
          })
          .catch((error) => {
            console.error('Erreur lors du rechargement des tuteurs :', error);
            setShowError(true);
          });
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression du planing :', error);
        setShowError(true);
      });
  };

  const redirectionToForm = () => {
    if(UserId) {
      navigate(`/form/tutorschedule/${UserId}`);
    } else{
      console.log('error', 'UserId is not defined', UserId, schedule);
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <p>Chargement…</p>;
  }

  return (
    <div className="mx-auto py-2 px-4 relative">
      <h1 className="text-3xl font-bold mb-4">Planning annuel des tuteurs</h1>

      <div className='bg-white p-2 rounded-lg shadow-md flex flex-col md:flex-row gap-2 mb-4'>
        <select
          className="col-span-1 w-2/6 rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border-gray-400 text-gray-500 bg-white"

          value={selectedCenter || ''}
          onChange={(e) => setSelectedCenter(Number(e.target.value) || null)}
        >
          <option value="">Sélectionner un centre</option>
          {centers.map(center => (
            <option key={center.id} value={center.id}>{center.name}</option>
          ))}
        </select>
      </div>
      {showError ? (
        <AlertMessage message={'Un problème est survenu lors du chargement des créneaux !'} />
      ) : (
        <ResourceCalendar
          resources={resources}
          events={events}
          onSelectEvent={eventHandler}
        />
      )}

      {sidebarOpen && selectedUser && (
        <DetailsItemSidebar onClose={() => setSidebarOpen(false)}>
          <div className="p-4">

            <div className='bg-gray-100 p-2 rounded mt-1'>
              <h2 className="text-xl font-bold mb-4">Détails du tuteur</h2>
              <p><strong>Nom:</strong> {selectedUser.firstname} {selectedUser.lastname}</p>
              <p><strong>Id:</strong> {selectedUser.id}</p>

              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Actif:</strong> {selectedUser.is_active ? 'Oui' : 'Non'}</p>
              <p><strong>Rôles:</strong> {selectedUser.roles.join(', ')}</p>
            </div>
          {
            UserId &&
            <div className='bg-gray-100 p-2 rounded mt-4'>
              <div className='bg-white p-2 rounded-lg shadow-md flex w-full gap-2'>
                <button
                  type="button"
                  onClick={deleteSlot}
                  className="col-span-3 w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border-red-400 text-red-500 bg-white"
                >
                  {
                    'Supprimer le creneau'
                  }
                </button>
                <button
                  type="button"
                  onClick={redirectionToForm}
                  className="col-span-3 w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border-blue-400 text-blue-500 bg-white"
                >
                  {
                    'Ajouter des creneaux'
                  }
                </button>
              </div>

              <div className='bg-white p-2 rounded-lg shadow-md mt-4'>
                <ScheduleArrayField
                  dayOptions={Days}
                  initialSchedules={schedule}
                  onChange={onChangePlaningForm}
                  id={UserId}
                />
              </div>
            </div>
          }
          </div>
        </DetailsItemSidebar>
      )}
    </div>
  );
};

// src/components/ResourceCalendar.tsx
import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, View, Views, EventPropGetter } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Initialise Moment pour le français
moment.locale('fr');
const localizer = momentLocalizer(moment);

export interface RbcResource {
  resourceId: string;
  resourceTitle: string;
}

export interface RbcEvent {
  id: string;
  resourceId: string;
  title: string;
  start: Date;
  end: Date;
}

export interface ResourceCalendarProps {
  resources: RbcResource[];
  events: RbcEvent[];
  onSelectEvent?: (event: RbcEvent) => void;
}

// Couleurs à associer à chaque resourceId
const RESOURCE_COLORS: Record<string, string> = {};

// Génère une couleur pastel unique par resourceId
function getColorForResource(id: string): string {
  if (!RESOURCE_COLORS[id]) {
    // Génère une couleur aléatoire pastel
    const hue = Math.floor(Math.random() * 360);
    RESOURCE_COLORS[id] = `hsl(${hue}, 70%, 80%)`;
  }
  return RESOURCE_COLORS[id];
}

export const ResourceCalendar: React.FC<ResourceCalendarProps> = ({
  resources,
  events,
  onSelectEvent,
}) => {
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const handleView = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // eventPropGetter pour colorer selon resourceId
  const eventStyleGetter: EventPropGetter<RbcEvent> = (event) => {
    const bg = getColorForResource(event.resourceId);
    return {
      style: {
        backgroundColor: bg,
        borderRadius: '4px',
        opacity: 0.9,
      },
    };
  };
  return (
    <div className='w-full h-full'>
      <div className="w-full w-4/5 mx-auto p-2 bg-gray-200 rounded">
        <div className="h-[700px] bg-white p-2 rounded border">
          <Calendar<RbcEvent, RbcResource>
            localizer={localizer}
            culture="fr"
            events={events}
            resources={resources}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle"
            startAccessor="start"
            endAccessor="end"

            view={currentView}
            onView={handleView}
            date={currentDate}
            onNavigate={handleNavigate}

            min={new Date(1970, 0, 1, 9, 0, 0)}
            max={new Date(1970, 0, 1, 19, 0, 0)}
            scrollToTime={new Date(1970, 0, 1, 9, 0, 0)}

            selectable
            onSelectEvent={onSelectEvent}
            onSelectSlot={(slot) => console.log(slot)}

            eventPropGetter={eventStyleGetter}

            // composant custom pour l'agenda, afin d'afficher le tuteur
            components={{
              agenda: {
                event: ({ event }: { event: RbcEvent }) => {
                  const res = resources.find(r => r.resourceId === event.resourceId);
                  return (
                    <span>
                      <strong>{res?.resourceTitle}</strong>: {event.title}
                    </span>
                  );
                }
              }
            }}

            style={{ height: '100%', width: '100%' }}
            views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
          />
        </div>
      </div>
    </div>

  );
};

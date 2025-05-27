import React from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
// import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';

export interface Resource {
  id: string;
  title: string;
}

export interface Event {
  id: string;
  resourceId: string;
  title: string;
  start: string;  // ISO date string
  end: string;    // ISO date string
}

export interface PlanningCalendarProps {
  resources: Resource[];
  events: Event[];
  onEventClick?: (eventId: string, resourceId: string) => void;
}

export const PlaningCalendarComponent: React.FC<PlanningCalendarProps> = ({
  resources,
  events,
  onEventClick,
}) => {
  return (
    <FullCalendar
      plugins={[
        resourceTimelinePlugin,
        // interactionPlugin,
        dayGridPlugin,
        // timeGridPlugin,
      ]}
      initialView="resourceTimelineWeek"
      headerToolbar={{
        left: 'today prev,next',
        center: 'title',
        right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth',
      }}
      views={{
        resourceTimelineDay: { buttonText: 'Jour' },
        resourceTimelineWeek: { buttonText: 'Semaine' },
        resourceTimelineMonth: { buttonText: 'Mois' },
      }}
      resourceAreaHeaderContent="Utilisateurs"
      resources={resources}
      events={events}
      selectable={true}
      editable={false}
      slotMinTime="09:00:00"
      slotMaxTime="18:00:00"
      eventClick={(info) => {
        console.log(info)
        info.jsEvent.preventDefault();
        onEventClick?.(info.event.id, info.event.getResources()[0]?.id || '');
      }}
      height="auto"
    />
  );
};

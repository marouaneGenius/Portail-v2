import moment from 'moment';

const DAY_NAME_TO_ISO = {
  lundi:    1,
  mardi:    2,
  mercredi: 3,
  jeudi:    4,
  vendredi: 5,
  samedi:   6,
  dimanche: 7,
} as const;

export type RawSchedule = {
  id: number;
  day: string;
  start_end?: string; // "1970-01-01T10:00:00+00:00"
  end_hour?:  string; // "1970-01-01T18:00:00+00:00"
};

export interface TutorRaw {
  id:        number;
  firstname: string;
  lastname:  string;
  events:    RawSchedule[];
}

/**
 * Génère, pour chaque tuteur, un événement par semaine dans l'année,
 * en calant le start/end sur le bon jour et en corrigeant d'une heure.
 */
export function expandSchedulesToWeeklyEvents(
  tutors: TutorRaw[],
  year = moment().year()
) {
  const weeksInYear = moment().year(year).isoWeeksInYear();
  const allEvents: {
    id: string;
    resourceId: string;
    title: string;
    start: Date;
    end: Date;
  }[] = [];

  tutors.forEach((tutor) => {
    tutor.events.forEach((sched) => {
      const dow = DAY_NAME_TO_ISO[sched.day.toLowerCase() as keyof typeof DAY_NAME_TO_ISO];
      if (!dow) return;

      // on parse en UTC pour éviter le décalage local
      const mStartUtc = sched.start_end ? moment.utc(sched.start_end) : null;
      const mEndUtc   = sched.end_hour  ? moment.utc(sched.end_hour)  : null;
      if (!mStartUtc?.isValid() || !mEndUtc?.isValid()) return;

      // on récupère heure et minute en local, puis on retire 1h manuellement
      const sh = mStartUtc.local().hour() - 1;
      const sm = mStartUtc.local().minute();
      const eh = mEndUtc.local().hour() - 1;
      const em = mEndUtc.local().minute();

      for (let wk = 1; wk <= weeksInYear; wk++) {
        const baseDate = moment()
          .year(year)
          .isoWeek(wk)
          .isoWeekday(dow);

        const start = baseDate
          .clone()
          .hour(sh)
          .minute(sm)
          .toDate();

        const end = baseDate
          .clone()
          .hour(eh)
          .minute(em)
          .toDate();

        allEvents.push({
          id: `${tutor.id}-${sched.id}-${wk}`,
          resourceId: String(tutor.id),
          title: 'Disponible',
          start,
          end,
        });
      }
    });
  });

  return allEvents;
}

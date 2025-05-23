import React, { useState, useMemo } from 'react';
// MUI X Date Pickers imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { TextField } from '@mui/material';
import { AlertMessage } from '../Alert';

export interface Schedule {
  day: string;
  start: Date | null;
  end: Date | null;
}

export interface ScheduleArrayFieldProps {
  /** Valeur initiale du tableau de créneaux */
  initialSchedules?: Schedule[];
  /** Callback appelé à chaque modification */
  onChange?: (schedules: Schedule[]) => void;
  /** Options pour le select des jours */
  dayOptions: { value: string; label: string }[];
}

export const ScheduleArrayField: React.FC<ScheduleArrayFieldProps> = ({
  initialSchedules = [],
  onChange,
  dayOptions,
}) => {
  const [draft, setDraft] = useState<Schedule>({ day: '', start: null, end: null });
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [showError, setShowError] = useState(false);

  const addSlot = () => {
    const { day, start, end } = draft;

    if (!day || !start || !end) {
        setShowError(true)
    } else {
        setShowError(false)
        const updated = [...schedules, draft];
        setSchedules(updated);
        onChange?.(updated);
        setDraft({ day: '', start: null, end: null });
    }
  };

  const removeSlot = (index: number) => {
    const updated = schedules.filter((_, i) => i !== index);
    setSchedules(updated);
    onChange?.(updated);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="w-full">
        <div className="grid grid-cols-3 gap-4 items-end mb-4">
          <div className="col-span-4 p-2 flex flex-col">
            <select
              value={draft.day}
              onChange={(e) => setDraft({ ...draft, day: e.target.value })}
              className="w-full rounded border px-3 py-3 outline-none focus:ring focus:ring-blue-300 border color-border my-2"
            >
              <option value="">Jour…</option>
              {dayOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <div className='flex'>
                <TimePicker
                    label="Heure début"
                    value={draft.start}
                    onChange={(date) => setDraft({ ...draft, start: date })}
                    slotProps={{
                        textField: {
                        className: 'w-full rounded border px-3 py-3 outline-none focus:ring focus:ring-blue-300 border color-border my-2 mt-4',
                        variant: 'outlined',
                        size: 'small',
                        style:{marginTop:10},
                        InputLabelProps: {
                            shrink: true,
                        },
                        },
                    }}
                    minutesStep={15}
                    ampm={false}
                    minTime={new Date(0, 0, 0, 9, 30)}
                    maxTime={new Date(0, 0, 0, 18, 0)}
                />
                <TimePicker
                    label="Heure fin"
                    value={draft.end}
                    onChange={(date) => setDraft({ ...draft, end: date })}
                    slotProps={{
                    textField: {
                        className: 'w-full rounded border px-3 py-3 outline-none focus:ring focus:ring-blue-300 border color-border my-2 mt-4',
                        variant: 'outlined',
                        size: 'small',
                        style:{marginTop:10},
                        InputLabelProps: {
                        shrink: true,
                        },
                    },
                    }}
                    minutesStep={15}
                    ampm={false}
                    minTime={new Date(0, 0, 0, 9, 30)}
                    maxTime={new Date(0, 0, 0, 18, 0)}
                />
            </div>
      
          </div>
          <button
            type="button"
            onClick={addSlot}
            className="col-span-3 w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border-yellow-400 text-yellow-500 bg-white"
          >
            Ajouter un créneau
          </button>
        </div>
        
        { showError &&  <AlertMessage message={'Veuillez remplir tous les champs !'} /> }
        
        <div className="flex">
          <div className="flex flex-wrap gap-2 mb-4">
            {schedules.map((c, i) => (
              <div
                key={i}
                className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
              >
                {`${c.day} ${c.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}-${c.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  className="ml-2 text-indigo-500 hover:text-indigo-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
};

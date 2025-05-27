import React, { useState, useMemo, useEffect } from 'react';
// MUI X Date Pickers imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { TextField } from '@mui/material';
import { AlertMessage } from '../Alert';
import { getCenters } from '../../api/api';
import { FormField } from '../FormGenerator';
import { formatTime } from '../../services/functions';

export interface Schedule {
  day: string;
  start_hour: any | null;
  end_hour: any | null;
  id?: string;
  center: string;
  centers?: any[];
  id_user?: string;
}

export interface ScheduleArrayFieldProps {
  /** Valeur initiale du tableau de créneaux */
  initialSchedules?: Schedule[];
  /** Callback appelé à chaque modification */
  onChange?: (schedules: Schedule[]) => void;
  /** Options pour le select des jours */
  dayOptions: { value: string; label: string }[];
  id?: string;

}

export const ScheduleArrayField: React.FC<ScheduleArrayFieldProps> = ({
  initialSchedules = [],
  onChange,
  dayOptions,
  id
}) => {
  const [draft, setDraft] = useState<Schedule>({ day: '', start_hour: null, end_hour: null, id:id, center: '' });
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showError, setShowError] = useState(false);
  const [centers, setCenters] = useState<any>([]);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);

  const addSlot = () => {
    const { day, start_hour, end_hour, id, center, id_user } = draft;
    if (!day || !start_hour || !end_hour) {
        setShowError(true)
    } else {
      setShowError(false)
      const newSlot = {
        day,
        center,
        start_hour: start_hour instanceof Date
          ? formatTime(start_hour)
          : String(start_hour),
        end_hour:   end_hour   instanceof Date
          ? formatTime(end_hour)
          : String(end_hour),
        id,
        id_user
      };

      if(isUpdate && newSlot) {
        onChange?.([newSlot]);
        setSchedules([newSlot]);
      } else {
        const updated = [...schedules, newSlot];
        setSchedules(updated);
        onChange?.(updated);
        setDraft({ day: '', start_hour: null, end_hour: null, id: id, center: center });
      }
    }
  };

  const removeSlot = (index: number) => {
    const updated = schedules.filter((_, i) => i !== index);
    setSchedules(updated);
    onChange?.(updated);
  };

  useEffect(() => {
    getCenters().then((res) => {
      const centerOptions = res.map((c:any) => ({
        value: String(c.id),
        label: c.name,
      }));
      setCenters(centerOptions)
    })
  }, [])

  useEffect(() => {
    if (initialSchedules && initialSchedules.length > 0 && initialSchedules[0]?.centers) {
      setIsUpdate(true)
      setSchedules(initialSchedules);
      setDraft({
        day: initialSchedules[0].day || '',
        start_hour: initialSchedules[0].start_hour || formatTime(initialSchedules[0].start_hour ) , 
        end_hour: initialSchedules[0].end_hour || formatTime(initialSchedules[0].end_hour ) ,
        id: initialSchedules[0].id || id,
        center: initialSchedules[0]?.centers[0]?.id || '',
        id_user: initialSchedules[0]?.id_user || ''
      });
    }
  }, [initialSchedules]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="w-full">
        <div className="grid grid-cols-3 gap-4 items-end mb-4 ">
          <div className="col-span-4 p-2 flex flex-col">
            <input type='hidden' value={id}/> 
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
                    value={draft.start_hour}
                    onChange={(date) => setDraft({ ...draft, start_hour: date })}
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
                    value={draft.end_hour}
                    onChange={(date) => setDraft({ ...draft, end_hour: date })}
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

            <div>
            <select
              value={draft.center}
              onChange={(e) => setDraft({ ...draft, center: e.target.value })}
              className="w-full rounded border px-3 py-3 outline-none focus:ring focus:ring-blue-300 border color-border my-2"
            >
              <option value="">Centre...</option>
              {centers.map((o:any) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            </div>

            <button
            type="button"
            onClick={addSlot}
            className="col-span-3 w-full rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border-yellow-400 text-yellow-500 bg-white"
          >
            {
              isUpdate ? ' Modifier' : ' Ajouter le créneau'
            }
          </button>
          </div>

        </div>
        
        { showError &&  <AlertMessage message={'Veuillez remplir tous les champs !'} /> }
        
        <div className="flex bg-gray-100 p-4 rounded-lg shadow-md">
          <div className="flex flex-wrap gap-2 mb-4">
            {schedules.map((c, i) => (
              <div
                key={i}
                className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
              >
                {`${c.day} ${c.start_hour}-${c.end_hour}`}

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

import React, { useState, useMemo, useEffect } from 'react';
// MUI X Date Pickers imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { TextField } from '@mui/material';
import { AlertMessage } from '../Alert';
import { getCenters, getUser } from '../../api/api';
import { FormField } from '../FormGenerator';
import { formatTime, scheduleformatTime } from '../../services/functions';
import api from '@/api/aixos';
import { Calendar, MapPin, X } from 'lucide-react';

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
  action:any;
}

export const ScheduleArrayField: React.FC<ScheduleArrayFieldProps> = ({
  initialSchedules = [],
  onChange,
  dayOptions,
  id,
  action
}) => {
  const [draft, setDraft] = useState<Schedule>({ day: '', start_hour: null, end_hour: null, id:id, center: '' });
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showError, setShowError] = useState(false);
  const [centers, setCenters] = useState<any>([]);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [days, setDays] = useState<any>(dayOptions);
  const [scheduls, setScheduls] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState<any>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<any>(null);


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
          ? scheduleformatTime(start_hour)
          : String(start_hour),
        end_hour:   end_hour   instanceof Date
          ? scheduleformatTime(end_hour)
          : String(end_hour),
        id,
        id_user
      };

      console.log(newSlot, isUpdate )

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

  // Fonction pour remplir le formulaire avec les données du créneau sélectionné
  const fillFormWithSchedule = (schedule: any) => {
    setCurrentSchedule(schedule);
    setIsUpdate(true);
    action('update');
    
    // Convertir les heures en objets Date pour les TimePicker
    const startTime = new Date();
    const endTime = new Date();
    
    if (schedule.start_hour) {
      const [startHour, startMin] = schedule.start_hour.split(':');
      startTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
    }
    
    if (schedule.end_hour) {
      const [endHour, endMin] = schedule.end_hour.split(':');
      endTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
    }
    
    setDraft({
      day: schedule.day || '',
      start_hour: startTime,
      end_hour: endTime,
      id: schedule.id || id,
      center: schedule.centers?.[0]?.id?.toString() || '',
      id_user: schedule.id_user || ''
    });
  };

  // Fonction pour supprimer un créneau avec confirmation
  const handleDeleteSchedule = (schedule: any) => {
    setScheduleToDelete(schedule);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    
    try {
      await api.delete(`/api/tutorschedule/${scheduleToDelete.id}`);
      
      // Mettre à jour la liste des créneaux
      const updatedSchedules = scheduls.filter((s: any) => s.id !== scheduleToDelete.id);
      setScheduls(updatedSchedules);

      
      // Réinitialiser les variables de suppression
      setScheduleToDelete(null);
      setShowDeleteConfirm(false);
      
      // Si c'était le créneau sélectionné, le désélectionner
      if (currentSchedule?.id === scheduleToDelete.id) {
        setCurrentSchedule(null);
        setDraft({ day: '', start_hour: null, end_hour: null, id: id, center: '' });
        setIsUpdate(false);
        action('create');
      }
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du créneau');
    }
  };

  const cancelDelete = () => {
    setScheduleToDelete(null);
    setShowDeleteConfirm(false);
  };


  useEffect(() => {
    api.get(`/api/tutorschedule/user/${id}`).then((e) => {
      setScheduls(e.data)
    })
    if(id){
      getUser(id).then((res:any) => {
        const selectedDaysByTutor = res.tutor_schedules.map((schedule:any) => {
          return schedule.day
        })
        const filteredDays = dayOptions.filter((day:any) => !selectedDaysByTutor.includes(day.value));
        setDays(filteredDays)
        if(res.centers.length === 0) {
          getCenters().then((res) => {
            const centerOptions = res.map((c:any) => ({
              value: String(c.id),
              label: c.name,
            }));
            setCenters(centerOptions)
          })
        }else{
          const centerOptions = res.centers.map((c:any) => ({
            value: String(c.id),
            label: c.name,
          }));
          setCenters(centerOptions)
        }
        }
      );
    }

  }, [])

  useEffect(() => {
    if (initialSchedules && initialSchedules.length > 0 && initialSchedules[0]?.centers) {
      setIsUpdate(true)
      action('update')
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

  useEffect(() => {
    if (schedules.length > 0) {
      const filteredDaysArray = schedules.map((schedule) => schedule.day);  
      const filteredDays = days.filter((day:any) => !filteredDaysArray.includes(day.value));
      setDays(filteredDays);
    } 
  }, [schedules]);

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
              {days.map((o:any) => (
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={addSlot}
                className="flex-1 rounded border px-3 py-2 outline-none focus:ring focus:ring-blue-300 border-yellow-400 text-yellow-500 bg-white"
              >
                {isUpdate ? 'Modifier' : 'Ajouter le créneau'}
              </button>
              
              {isUpdate && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ day: '', start_hour: null, end_hour: null, id: id, center: '' });
                    setCurrentSchedule(null);
                    setIsUpdate(false);
                    action('create');
                  }}
                  className="px-3 py-2 rounded border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                  title="Nouveau créneau"
                >
                  Nouveau
                </button>
              )}
            </div>
          </div>

        </div>
        
        { showError &&  <AlertMessage message={'Veuillez remplir tous les champs !'} /> }
        
        <div className="flex ">
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


      {
        scheduls.length !== 0 ?
        <div className="space-y-3 mt-5 bg-gray-100 w-full p-3">
        <p>Tous Mes Créneaux</p>
        {scheduls.map((slot:any, idx) => (
          <div
            key={slot.id}
            className={
              "bg-white rounded-lg shadow-sm border px-4 py-3 flex flex-col gap-1 transition relative " +
              (currentSchedule && currentSchedule.id === slot.id
                ? "border-blue-400 ring-2 ring-blue-200"
                : "border-gray-200")
            }
          >
            {/* Bouton de suppression */}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDeleteSchedule(slot);
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
              title="Supprimer ce créneau"
            >
              <X className="w-3 h-3" />
            </button>
       
   
            {/* Contenu cliquable pour sélectionner/modifier */}
            <div 
              onClick={() => fillFormWithSchedule(slot)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="font-semibold capitalize">{slot.day}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {slot.start_hour} - {slot.end_hour}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                {slot.centers.map((center:any) => (
                  <span
                    key={center.id}
                    className="bg-amber-50 px-2 py-0.5 rounded text-sm font-medium text-amber-700"
                  >
                    {center.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Debug ou affichage du créneau sélectionné */}
        {currentSchedule && (
          <div className="mt-3 text-sm text-blue-600">
            <b>Créneau sélectionné :</b> {currentSchedule.day} {currentSchedule.start_hour} - {currentSchedule.end_hour}
            <div className="mt-1 text-xs text-gray-500">
              Cliquez sur "Modifier" pour sauvegarder les changements
            </div>
          </div>
        )}
      </div>
        :  <p>Vous n'avez pas de créneaux</p>
      }

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Supprimer le créneau</h3>
                <p className="text-sm text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            {scheduleToDelete && (
              <div className="mb-6 p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium capitalize">{scheduleToDelete.day}</span>
                  <span className="text-gray-500">
                    {scheduleToDelete.start_hour} - {scheduleToDelete.end_hour}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  {scheduleToDelete.centers.map((center:any) => (
                    <span key={center.id} className="text-amber-700">
                      {center.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer ce créneau ? Cette action supprimera définitivement le créneau de votre planning.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteSchedule}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </LocalizationProvider>
  );
};

import React, { useEffect, useState } from 'react';
import { HoursOptions } from '../../mocks/mocks';
import { CalendarDays, Clock, PlusCircle, Trash2 } from 'lucide-react';

const SlotSelector = ({ onSelect, form_values }: any) => {
  const [mode, setMode] = useState<string>('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {

    console.log(form_values)
    onSelect({ slots, mode });
  }, [slots, mode]);

  const maxSlots = parseInt(form_values.session_per_week || '0', 10);

  const addSlot = () => {
    if (!day || !hour) return;

    const newSlot = { day, hour };
    if (slots.find(s => s.day === day && s.hour === hour)) {
      setError('Ce créneau existe déjà');
      return;
    }
    if (slots.length >= maxSlots) {
      setError(`Vous ne pouvez pas ajouter plus de ${maxSlots} créneaux`);
      return;
    }
    setSlots(prev => [...prev, newSlot]);
    setDay('');
    setHour('');
    setError('');
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 bg-white/80 rounded-xl shadow-lg p-6 border border-fading-grey max-w-xl mx-auto">
      <div>
        <label className="block mb-2 font-semibold text-mister-anthracite text-lg flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-hello-yellow" />
          Préférences de créneaux
        </label>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'known', label: 'Je connais tous mes créneaux', color: 'bg-hello-yellow text-mister-anthracite border-hello-yellow', icon: <CalendarDays className="w-4 h-4" /> },
            { key: 'unknown', label: 'Créneaux non connus', color: 'bg-crazy-magenta text-white border-crazy-magenta', icon: <Clock className="w-4 h-4" /> },
            { key: 'partial', label: 'Partiellement connus', color: 'bg-blue-500 text-white border-blue-500', icon: <Clock className="w-4 h-4" /> },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition shadow-sm
                ${mode === opt.key
                  ? `${opt.color} shadow`
                  : 'bg-white text-mister-anthracite border-fading-grey hover:bg-hello-yellow/10'}
              `}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {mode !== 'unknown' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-mister-anthracite font-medium mb-1">Jour</label>
              <select
                value={day}
                onChange={e => setDay(e.target.value)}
                className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm"
              >
                <option value="">Sélectionner un jour</option>
                {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-mister-anthracite font-medium mb-1">Heure</label>
              <select
                value={hour}
                onChange={e => setHour(e.target.value)}
                className="w-full rounded-xl border-2 border-fading-grey px-4 py-3 outline-none focus:ring-2 focus:ring-hello-yellow focus:border-hello-yellow bg-white text-mister-anthracite transition shadow-sm"
              >
                <option value="">Sélectionner une heure</option>
                {HoursOptions.map(h => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={addSlot}
            className="mt-4 flex items-center gap-2 bg-green-100 text-green-800 hover:bg-green-200 font-semibold px-5 py-2 rounded-xl shadow transition"
          >
            <PlusCircle className="w-5 h-5" />
            Ajouter ce créneau
          </button>

          <div className="mt-6 space-y-2">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-hello-yellow/10 border border-hello-yellow/40 px-4 py-2 rounded-full shadow-sm"
              >
                <span className="flex items-center gap-2 text-mister-anthracite font-medium">
                  <CalendarDays className="w-4 h-4 text-hello-yellow" />
                  {slot.day} à <Clock className="w-4 h-4 text-blue-500" /> {slot.hour}
                </span>
                <button
                  onClick={() => removeSlot(index)}
                  className="ml-2 text-crazy-magenta hover:text-crazy-magenta/80 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            ))}
          </div>

          {error && <div className="text-crazy-magenta text-sm font-semibold mt-2">{error}</div>}
        </>
      )}
    </div>
  );
};

export default SlotSelector;

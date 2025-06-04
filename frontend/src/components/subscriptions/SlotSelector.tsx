import React, { useEffect, useState } from 'react';
import { HoursOptions } from '../../mocks/mocks';

const SlotSelector = ({ onSelect, form_values }: any) => {
  const [mode, setMode] = useState<string>('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [slots, setSlots] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
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
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Préférences de créneaux</label>
        <div className="flex space-x-2">
          {['known', 'unknown', 'partial'].map(opt => (
            <button
              key={opt}
              onClick={() => setMode(opt)}
              className={`px-3 py-1 border rounded ${mode === opt ? 'bg-blue-500 text-white' : ''}`}
            >
              {opt === 'known' && 'Je connais tous mes créneaux'}
              {opt === 'unknown' && 'Créneaux non connues pour le moment'}
              {opt === 'partial' && 'Créneaux partiellement connus'}
            </button>
          ))}
        </div>
      </div>

      {mode !== 'unknown' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Jour</label>
              <select
                value={day}
                onChange={e => setDay(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Sélectionner un jour</option>
                {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Heure</label>
              <select
                value={hour}
                onChange={e => setHour(e.target.value)}
                className="w-full border rounded px-3 py-2"
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
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            ➕ Ajouter ce créneau
          </button>

          <div className="mt-4 space-y-2">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                <span>📅 {slot.day} à 🕒 {slot.hour}</span>
                <button
                  onClick={() => removeSlot(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ❌ Supprimer
                </button>
              </div>
            ))}
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </>
      )}
    </div>
  );
};

export default SlotSelector;

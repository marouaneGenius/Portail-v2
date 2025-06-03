import React, { useEffect, useState } from 'react';

const weeks = [
  { label: 'Semaine 1 - vacances d\'été (du lundi 7 juillet au vendredi 11 juillet 2025)', value: '2025-07-07' },
  { label: 'Semaine 2 - vacances d\'été (du lundi 14 juillet au vendredi 18 juillet 2025)', value: '2025-07-14' },
  { label: 'Semaine 3 - vacances d\'été (du lundi 21 juillet au vendredi 25 juillet 2025)', value: '2025-07-21' },
  { label: 'Semaine 4 - vacances d\'été (du lundi 28 juillet au vendredi 1 août 2025)', value: '2025-07-28' },
  { label: 'Semaine 5 - vacances d\'été (du lundi 4 août au vendredi 8 août 2025)', value: '2025-08-04' },
  { label: 'Semaine 6 - vacances d\'été (du lundi 11 août au vendredi 15 août 2025)', value: '2025-08-11' },
  { label: 'Semaine 7 - vacances d\'été (du lundi 18 août au vendredi 22 août 2025)', value: '2025-08-18' },
  { label: 'Semaine 8 - vacances d\'été (du lundi 25 août au vendredi 29 août 2025)', value: '2025-08-25' },
];

const VacationWeekSelector = ({ onSelect }:any) => {
  const [weekCount, setWeekCount] = useState(0);
  const [knownWeeks, setKnownWeeks] = useState('');
  const [selectedWeeks, setSelectedWeeks] = useState<any>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const payload = {
      week_count: weekCount,
      known_weeks: knownWeeks,
      selected_weeks: selectedWeeks,
    };
    onSelect(payload);
  }, [weekCount, knownWeeks, selectedWeeks]);

  const handleWeekClick = (val:any) => {
    if (selectedWeeks.includes(val)) {
      setSelectedWeeks(selectedWeeks.filter((w:any) => w !== val));
    } else {
      if (knownWeeks === 'known' && selectedWeeks.length >= weekCount) {
        setError('Vous devez choisir exactement ' + weekCount + ' semaines');
        return;
      }
      if (knownWeeks === 'partial' && selectedWeeks.length >= weekCount - 1) {
        setError('Vous pouvez choisir jusqu\'à ' + (weekCount - 1) + ' semaines');
        return;
      }
      setError('');
      setSelectedWeeks([...selectedWeeks, val]);
    }
  };

  const isFutureWeek = (dateStr:any) => {
    return new Date(dateStr) > new Date();
  };

  return (
    <div className="space-y-4">
      {/* ÉTAPE 1 */}
      <div>
        <label>Nombre de semaines</label>
        <select
          value={weekCount}
          onChange={(e) => {
            setWeekCount(Number(e.target.value));
            setKnownWeeks('');
            setSelectedWeeks([]);
          }}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Choisir</option>
          {[...Array(8)].map((_, i) => (
            <option key={i} value={i + 1}>
              Semaine {i + 1}
            </option>
          ))}
        </select>
      </div>
  
      {/* ÉTAPE 2 */}
      {weekCount > 0 && (
        <div>
          <label>Je connais mes semaines ?</label>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setKnownWeeks('known');
                setSelectedWeeks([]);
                setError('');
              }}
              className={`px-3 py-1 border rounded ${knownWeeks === 'known' ? 'bg-blue-500 text-white' : ''}`}
            >
              Toutes connues
            </button>
            <button
              onClick={() => {
                setKnownWeeks('unknown');
                setSelectedWeeks([]);
                setError('');
              }}
              className={`px-3 py-1 border rounded ${knownWeeks === 'unknown' ? 'bg-blue-500 text-white' : ''}`}
            >
              Inconnues
            </button>
            <button
              onClick={() => {
                setKnownWeeks('partial');
                setSelectedWeeks([]);
                setError('');
              }}
              className={`px-3 py-1 border rounded ${knownWeeks === 'partial' ? 'bg-blue-500 text-white' : ''}`}
            >
              Partiellement
            </button>
          </div>
        </div>
      )}
  
      {/* ÉTAPE 3 */}
      {weekCount > 0 && knownWeeks && knownWeeks !== 'unknown' && (
        <div className="space-y-2">
          <label>Choisissez vos semaines</label>
          {weeks
            .filter((w) => isFutureWeek(w.value))
            .map((w) => (
              <div
                key={w.value}
                className={`cursor-pointer px-3 py-2 border rounded ${
                  selectedWeeks.includes(w.value) ? 'bg-green-300' : ''
                }`}
                onClick={() => handleWeekClick(w.value)}
              >
                {w.label}
              </div>
            ))}
        </div>
      )}
  
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
  
};

export default VacationWeekSelector;

import React, { useEffect, useState } from 'react';
import { CalendarCheck, CalendarX, CalendarDays } from 'lucide-react';

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

const VacationWeekSelector = ({ onSelect }: any) => {
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

  const handleWeekClick = (val: any) => {
    if (selectedWeeks.includes(val)) {
      setSelectedWeeks(selectedWeeks.filter((w: any) => w !== val));
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

  const isFutureWeek = (dateStr: any) => {
    return new Date(dateStr) > new Date();
  };

  return (
    <div className="space-y-8 bg-white/80 rounded-xl shadow-lg p-6 border border-fading-grey max-w-xl mx-auto">
      {/* ÉTAPE 1 */}
      <div>
        <label className="block text-mister-anthracite font-semibold mb-2">
          <CalendarDays className="inline w-5 h-5 mr-2 text-hello-yellow" />
          Nombre de semaines
        </label>
        <select
          value={weekCount}
          onChange={(e) => {
            setWeekCount(Number(e.target.value));
            setKnownWeeks('');
            setSelectedWeeks([]);
          }}
          className="w-full border border-fading-grey rounded-lg px-4 py-3 bg-white text-mister-anthracite focus:ring-hello-yellow focus:border-hello-yellow transition"
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
          <label className="block text-mister-anthracite font-semibold mb-2">
            <CalendarCheck className="inline w-5 h-5 mr-2 text-green-500" />
            Je connais mes semaines ?
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setKnownWeeks('known');
                setSelectedWeeks([]);
                setError('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition font-medium
                ${knownWeeks === 'known'
                  ? 'bg-hello-yellow text-mister-anthracite border-hello-yellow shadow'
                  : 'bg-white text-mister-anthracite border-fading-grey hover:bg-hello-yellow/20'}
              `}
            >
              <CalendarCheck className="w-5 h-5" />
              Toutes connues
            </button>
            <button
              type="button"
              onClick={() => {
                setKnownWeeks('unknown');
                setSelectedWeeks([]);
                setError('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition font-medium
                ${knownWeeks === 'unknown'
                  ? 'bg-crazy-magenta text-white border-crazy-magenta shadow'
                  : 'bg-white text-mister-anthracite border-fading-grey hover:bg-crazy-magenta/10'}
              `}
            >
              <CalendarX className="w-5 h-5" />
              Inconnues
            </button>
            <button
              type="button"
              onClick={() => {
                setKnownWeeks('partial');
                setSelectedWeeks([]);
                setError('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition font-medium
                ${knownWeeks === 'partial'
                  ? 'bg-blue-500 text-white border-blue-500 shadow'
                  : 'bg-white text-mister-anthracite border-fading-grey hover:bg-blue-100'}
              `}
            >
              <CalendarDays className="w-5 h-5" />
              Partiellement
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 3 */}
      {weekCount > 0 && knownWeeks && knownWeeks !== 'unknown' && (
        <div className="space-y-2">
          <label className="block text-mister-anthracite font-semibold mb-2">
            <CalendarDays className="inline w-5 h-5 mr-2 text-hello-yellow" />
            Choisissez vos semaines
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weeks
              .filter((w) => isFutureWeek(w.value))
              .map((w) => (
                <button
                  type="button"
                  key={w.value}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg border-2 transition font-medium
                    ${selectedWeeks.includes(w.value)
                      ? 'bg-green-100 border-green-400 text-green-800 shadow'
                      : 'bg-white border-fading-grey text-mister-anthracite hover:bg-hello-yellow/10'}
                  `}
                  onClick={() => handleWeekClick(w.value)}
                >
                  {w.label}
                </button>
              ))}
          </div>
        </div>
      )}

      {error && <div className="text-crazy-magenta text-sm font-semibold">{error}</div>}
    </div>
  );
};

export default VacationWeekSelector;

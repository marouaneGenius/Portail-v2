import React, { useEffect, useState } from 'react';
import { CalendarCheck, CalendarX, CalendarDays } from 'lucide-react';

const weeks = [
  { label: 'Du 20/10 au 24/10 - Stage de vacances Toussaint', value: '2025-10-20' },
  { label: 'Du 27/10 au 31/10 - Stage de vacances Toussaint', value: '2025-10-27' },
];

const VacationWeekSelector = ({ onSelect }: any) => {
  const [weekCount, setWeekCount] = useState(0);
  const [selectedWeeks, setSelectedWeeks] = useState<any>([]);
  const [schoolSubjects, setSchoolSubjects] = useState<any>([]);
  const [discount, setDiscount] = useState('0');
  const [firstDebitDate, setFirstDebitDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const payload = {
      week_count: weekCount,
      selected_weeks: selectedWeeks,
      school_subjects: schoolSubjects,
      discount: discount,
      first_debit_date: firstDebitDate
    };
    onSelect(payload);
  }, [weekCount, selectedWeeks, schoolSubjects, discount, firstDebitDate]);

  const handleWeekClick = (val: any) => {
    if (selectedWeeks.includes(val)) {
      setSelectedWeeks(selectedWeeks.filter((w: any) => w !== val));
    } else {
      if (selectedWeeks.length >= weekCount) {
        setError(`Vous pouvez choisir au maximum ${weekCount} semaine${weekCount > 1 ? 's' : ''}`);
        return;
      }
      setError('');
      setSelectedWeeks([...selectedWeeks, val]);
    }
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
            setSelectedWeeks([]);
          }}
          className="w-full border border-fading-grey rounded-lg px-4 py-3 bg-white text-mister-anthracite focus:ring-hello-yellow focus:border-hello-yellow transition"
        >
          <option value="">Choisir</option>
          <option value="1">1 semaine (400€)</option>
          <option value="2">2 semaines (600€)</option>
        </select>
      </div>

      {/* ÉTAPE 2 - Sélection complète */}
      {weekCount > 0 && (
        <div className="space-y-4">
          {/* Choisir les semaines */}
          <div>
            <label className="block text-mister-anthracite font-semibold mb-2">
              <CalendarCheck className="inline w-5 h-5 mr-2 text-green-500" />
              Choisir les semaines de stage
            </label>
            <div className="grid grid-cols-1 gap-3">
              {weeks.map((w) => (
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
              <button
                type="button"
                onClick={() => {
                  setSelectedWeeks(['unknown']);
                  setError('');
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition font-medium
                  ${selectedWeeks.includes('unknown')
                    ? 'bg-crazy-magenta text-white border-crazy-magenta shadow'
                    : 'bg-white text-mister-anthracite border-fading-grey hover:bg-crazy-magenta/10'}
                `}
              >
                <CalendarX className="w-5 h-5" />
                Pas encore connues
              </button>
            </div>
          </div>

          {/* Matières */}
          <div>
            <label className="block text-mister-anthracite font-semibold mb-2">
              <CalendarDays className="inline w-5 h-5 mr-2 text-hello-yellow" />
              Matières
            </label>
            <select
              multiple
              value={schoolSubjects}
              className="w-full border border-fading-grey rounded-lg px-4 py-3 bg-white text-mister-anthracite focus:ring-hello-yellow focus:border-hello-yellow transition"
              onChange={(e) => {
                const subjects = Array.from(e.target.selectedOptions, option => option.value);
                setSchoolSubjects(subjects);
              }}
            >
              <option value="maths">Maths</option>
              <option value="français">Français</option>
              <option value="anglais">Anglais</option>
              <option value="physique">Physique</option>
              <option value="svt">SVT</option>
              <option value="ses">SES</option>
              <option value="philosophie">Philosophie</option>
              <option value="espagnol">Espagnol</option>
            </select>
          </div>

          {/* Remise */}
          <div>
            <label className="block text-mister-anthracite font-semibold mb-2">
              Remise
            </label>
            <select
              value={discount}
              className="w-full border border-fading-grey rounded-lg px-4 py-3 bg-white text-mister-anthracite focus:ring-hello-yellow focus:border-hello-yellow transition"
              onChange={(e) => setDiscount(e.target.value)}
            >
              <option value="0">Aucune remise</option>
              <option value="20">Remise de 20%</option>
            </select>
          </div>

          {/* Date de paiement */}
          <div>
            <label className="block text-mister-anthracite font-semibold mb-2">
              Date de paiement
            </label>
            <input
              type="date"
              value={firstDebitDate}
              className="w-full border border-fading-grey rounded-lg px-4 py-3 bg-white text-mister-anthracite focus:ring-hello-yellow focus:border-hello-yellow transition"
              onChange={(e) => setFirstDebitDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {error && <div className="text-crazy-magenta text-sm font-semibold">{error}</div>}
    </div>
  );
};

export default VacationWeekSelector;

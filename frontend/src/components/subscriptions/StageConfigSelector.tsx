import React, { useState, useEffect } from 'react';
import { CalendarDays, CalendarCheck } from 'lucide-react';

const weeks = [
  { value: '2024-10-20', label: 'Du 20/10 au 24/10' },
  { value: '2024-10-27', label: 'Du 27/10 au 31/10' },
  { value: 'unknown', label: 'Pas encore connues' }
];

const StageConfigSelector = ({ onSelect, value }: any) => {
  const [weekCount, setWeekCount] = useState(value?.week_count || '');
  const [selectedWeeks, setSelectedWeeks] = useState(value?.selected_weeks || []);
  const [error, setError] = useState('');

  // Vérifier si la sélection est valide
  const isValidSelection = () => {
    if (!weekCount) return false;
    const expectedWeeks = parseInt(weekCount);
    return selectedWeeks.length === expectedWeeks;
  };

  useEffect(() => {
    const data = {
      week_count: weekCount,
      selected_weeks: selectedWeeks,
      isValid: isValidSelection() // Ajouter un indicateur de validation
    };
    onSelect(data);
  }, [weekCount, selectedWeeks, onSelect]);

  const handleWeekClick = (weekValue: string) => {
    if (!weekCount) {
      setError('Veuillez d\'abord choisir le nombre de semaines');
      return;
    }

    const maxWeeks = parseInt(weekCount);
    
    if (selectedWeeks.includes(weekValue)) {
      setSelectedWeeks(selectedWeeks.filter((w: string) => w !== weekValue));
      setError('');
    } else {
      if (selectedWeeks.length >= maxWeeks) {
        setError(`Vous pouvez choisir au maximum ${maxWeeks} semaine${maxWeeks > 1 ? 's' : ''}`);
        return;
      }
      setError('');
      setSelectedWeeks([...selectedWeeks, weekValue]);
    }
  };

  const getPrice = (count: string) => {
    return count === '1' ? 400 : 600;
  };

  return (
    <div className="space-y-6 bg-white/80 rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Étape 1: Nombre de semaines */}
      <div>
        <label className="block text-gray-700 font-semibold mb-3">
          <CalendarDays className="inline w-5 h-5 mr-2 text-blue-500" />
          Nombre de semaines
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setWeekCount('1');
              setSelectedWeeks([]);
              setError('');
            }}
            className={`p-4 rounded-lg border-2 transition font-medium text-center
              ${weekCount === '1'
                ? 'bg-blue-50 border-blue-400 text-blue-800 shadow'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50'}
            `}
          >
            <div className="text-lg font-bold">1 semaine</div>
            <div className="text-sm text-blue-600 font-semibold">{getPrice('1')}€</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setWeekCount('2');
              setSelectedWeeks([]);
              setError('');
            }}
            className={`p-4 rounded-lg border-2 transition font-medium text-center
              ${weekCount === '2'
                ? 'bg-blue-50 border-blue-400 text-blue-800 shadow'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50'}
            `}
          >
            <div className="text-lg font-bold">2 semaines</div>
            <div className="text-sm text-blue-600 font-semibold">{getPrice('2')}€</div>
          </button>
        </div>
      </div>

      {/* Étape 2: Sélection des semaines */}
      {weekCount && (
        <div>
          <label className="block text-gray-700 font-semibold mb-3">
            <CalendarCheck className="inline w-5 h-5 mr-2 text-green-500" />
            Choisir {weekCount === '1' ? 'la semaine' : 'les semaines'} de stage
            {weekCount === '2' && <span className="text-sm text-gray-500 ml-2">(sélectionnez 2 semaines)</span>}
          </label>
          <div className="space-y-2">
            {weeks.map((week) => (
              <button
                type="button"
                key={week.value}
                onClick={() => handleWeekClick(week.value)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition font-medium
                  ${selectedWeeks.includes(week.value)
                    ? 'bg-green-50 border-green-400 text-green-800 shadow'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-green-50'}
                `}
              >
                {week.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm font-semibold bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Résumé et validation */}
      {weekCount && selectedWeeks.length > 0 && (
        <div className={`p-4 rounded-lg ${isValidSelection() ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
          <h4 className="font-semibold text-gray-700 mb-2">Résumé :</h4>
          <div className="text-sm text-gray-600">
            <div>• {weekCount} semaine{weekCount !== '1' ? 's' : ''} de stage</div>
            <div>• Prix : {getPrice(weekCount)}€</div>
            <div>• Semaines sélectionnées : {selectedWeeks.length}/{weekCount}</div>
          </div>
          
          {!isValidSelection() && (
            <div className="mt-2 text-sm text-orange-700 font-medium">
              ⚠️ Veuillez sélectionner exactement {weekCount} semaine{weekCount !== '1' ? 's' : ''} pour continuer
            </div>
          )}
          
          {isValidSelection() && (
            <div className="mt-2 text-sm text-green-700 font-medium">
              ✅ Sélection valide - Vous pouvez continuer
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StageConfigSelector;
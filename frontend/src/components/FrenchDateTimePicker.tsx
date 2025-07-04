import React from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale/fr';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('fr', fr);

interface FrenchDatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  label?: string;
  className?: string;
}

function FrenchDatePicker({ 
  selectedDate, 
  onDateChange, 
  label,
  className = ''
}: FrenchDatePickerProps) {
  return (
    <div className={`flex flex-col space-y-1 w-full ${className}` }>
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <DatePicker
          selected={selectedDate}
          onChange={onDateChange}
          locale="fr"
          dateFormat="dd/MM/yyyy HH:mm"
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          placeholderText="Sélectionnez une date"
          className={`
            w-full pl-10 pr-3 py-2 border rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500
            focus:border-blue-500 text-gray-700
          `}
          isClearable
          minDate={new Date()}
          calendarClassName="font-sans shadow-lg"
          popperPlacement="bottom-start"
        />
        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      {selectedDate && (
        <div className="text-sm text-gray-500 mt-1">
          Sélection: {selectedDate.toLocaleDateString('fr-FR')} à {selectedDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
        </div>
      )}
    </div>
  );
}

export default FrenchDatePicker;
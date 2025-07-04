import React from "react";

interface SessionScopeRadioProps {
  value: boolean; // true = toutes les séances, false = une seule
  onChange: (newValue: boolean) => void;
  className?: string; // Optionnel, pour custom styling
}

const SessionScopeRadio: React.FC<SessionScopeRadioProps> = ({ value, onChange, className }) => (
  <div className={`space-y-3 ${className ?? ""}`}>
    <label className="flex items-center text-sm">
      <input
        type="radio"
        name="scope"
        value="single"
        checked={!value}
        onChange={() => onChange(false)}
        className="form-radio"
      />
      <span className="ml-2">Uniquement cette séance</span>
    </label>
    <label className="flex items-center text-sm">
      <input
        type="radio"
        name="scope"
        value="all"
        checked={value}
        onChange={() => onChange(true)}
        className="form-radio"
      />
      <span className="ml-2">Toutes les séances de cet étudiant</span>
    </label>
  </div>
);

export default SessionScopeRadio;

// components/Spinner.tsx
import React from 'react';

interface SpinnerProps {
  size?: number;      // largeur/hauteur en pixels
  thickness?: number; // épaisseur de la bordure
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 48,
  thickness = 4,
}) => {
  const border = `${thickness}px`;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderWidth: border,
      }}
      className={`
        border-gray-300 
        border-t-blue-600 
        rounded-full 
        animate-spin
      `}
    />
  );
};

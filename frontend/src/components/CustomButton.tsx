import React, { ReactNode } from 'react';
import { actions } from '../mocks/SchoolSubjects';

interface CustomAlertProps {
  title?: string;
  action?: (item:any) => void;
}

export const CustomButton: React.FC<CustomAlertProps> =  ({title, action}) => {
    return(
        <button
        type="button"
        onClick={action}
        className="
          py-2.5 px-5 me-2 mb-2
          text-sm font-medium text-gray-900
          focus:outline-none bg-white rounded-lg
          border border-green-200
          hover:bg-gray-100 hover:text-blue-700
          focus:z-10 focus:ring-4 focus:ring-gray-100
          dark:focus:ring-gray-700 dark:bg-gray-800
          dark:text-gray-400 dark:border-gray-600
          dark:hover:text-white dark:hover:bg-gray-700
        "
      >
        {title}
      </button>
    )
}

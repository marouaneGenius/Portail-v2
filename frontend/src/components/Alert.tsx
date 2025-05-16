import React, { ReactNode } from 'react';

interface AlertProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  footer?: ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  isOpen,
  title,
  message,
  onClose,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 w-full" 
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full w-2/6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-border border-l-4  rounded-b text-teal-900 px-4 py-3 shadow-md" role="alert">
            <div className="flex">
                <div className="py-1"><svg className="fill-current h-6 w-6 text-color mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
                <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm">{message}</p>
                </div>

            </div>
            {footer && (
          <div className="px-1 py-2 flex justify-end space-x-3  bg-red-400">
            {footer}
          </div>
        )}
        </div>


      </div>
    </div>
  );
};

export default Alert;



interface AlertMessageProps {
  message?: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
}) => {

  return (
    <div className=" space-y-1 bg-gray-100 rounded  bg-red-200 border-2 border-red-400 p-3 rounded flex justify-center align-center col-span-2 mt-3">
    {message}
  </div>
  );
};

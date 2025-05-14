import React, { ReactNode } from 'react';

interface CustomAlertProps {
  title?: string;
  message?: string;
  onClose?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> =  ({title, message, onClose}) => {
    return(
        <div className=" text-center py-4   ">
            <div className="p-2 bg-orange-400 items-center text-gray-100 leading-none lg:rounded-full flex lg:inline-flex w-full" role="alert" onClick={onClose}>
                <span className="flex rounded-full bg-orange-600 uppercase px-2 py-1 text-xs font-bold mr-3">{title}</span>
                <span className="font-semibold mr-2 text-left flex-auto">{message}</span>
                <svg className="fill-current opacity-75 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M12.95 10.707l.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z"/></svg>
            </div>
        </div>
    )
}

export default CustomAlert;
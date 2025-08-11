import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  footer,
}) => {
  if (!isOpen) return null;

  // Le contenu du modal
  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-4">{children}</div>

        {footer && (
          <div className="px-4 py-2 border-t flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Utilise un portal pour rendre le modal dans <body>
  return createPortal(modalContent, document.body);
};

export default Modal;

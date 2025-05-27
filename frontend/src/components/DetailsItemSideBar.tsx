import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  children: ReactNode;
  onClose: () => void;
}

export const DetailsItemSidebar: React.FC<SidebarProps> = ({ children, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50"
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="bg-white w-2/3 md:w-1/2 lg:w-2/5 h-full shadow-lg overflow-y-auto relative"
        >
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-3xl font-bold"
            onClick={onClose}
          >
            &times;
          </button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

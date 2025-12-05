// Popup2.tsx
import React from 'react';

interface Popup2Props {
  onClose: () => void;
}

const Popup2: React.FC<Popup2Props> = ({ onClose }) => {
  return (
    <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg p-6 z-50 min-w-[200px]">
      <div className="flex flex-col items-center gap-4">
        <div className="text-gray-700 font-medium text-center">
          В разработке
        </div>
        
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default Popup2;
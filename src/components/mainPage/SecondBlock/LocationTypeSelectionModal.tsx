import React from 'react';

interface LocationTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentType: 'factory' | 'workshop';
  onSelect: (type: 'workshop' | 'section' | 'station') => void;
  parentName?: string;
}

const LocationTypeSelectionModal: React.FC<LocationTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  parentType,
  onSelect,
  parentName
}) => {
  if (!isOpen) return null;

  const getOptions = () => {
    if (parentType === 'factory') {
      // Завод: только цех и станция
      return [
        { type: 'workshop' as const, label: 'Создать цех' },
        { type: 'station' as const, label: 'Создать станцию' }
      ];
    } else { // workshop
      // Цех: участок и станция
      return [
        { type: 'section' as const, label: 'Создать участок' },
        { type: 'station' as const, label: 'Создать станцию' }
      ];
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const options = getOptions();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Выберите тип</h3>
          {parentName && (
            <p className="text-sm text-gray-600 mt-1">
              Будет создано в: <span className="font-medium">{parentName}</span>
            </p>
          )}
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.type}
                onClick={() => onSelect(option.type)}
                className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className="font-medium text-gray-800">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationTypeSelectionModal;
// StationInfoModal.tsx
import React from 'react';

interface StationDTO {
  uid: string;
  stationName: string;
  modelNumber: string;
  serialNumber: string;
  currentCapacity: number;
}

interface StationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  station?: StationDTO | null;
}

const StationInfoModal: React.FC<StationInfoModalProps> = ({
  isOpen,
  onClose,
  station
}) => {
  if (!isOpen || !station) return null;

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Информация о станции</h3>
          <p className="text-sm text-gray-600 mt-1">UID: {station.uid}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название станции
            </label>
            <div className="text-gray-900 font-medium">{station.stationName}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Модель
              </label>
              <div className="text-gray-900">{station.modelNumber}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Серийный номер
              </label>
              <div className="text-gray-900">{station.serialNumber}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Текущая емкость
            </label>
            <div className="text-gray-900">{station.currentCapacity}</div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationInfoModal;
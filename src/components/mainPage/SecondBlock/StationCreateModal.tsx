import React, { useState } from 'react';

interface StationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stationData: StationFormData) => void;
  parentLocation: string;
}

export interface StationFormData {
  stationName: string;
  modelNumber: string;
  serialNumber: string;
  currentCapacity: string;
  ipAddress: string;
}

const StationCreateModal: React.FC<StationCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentLocation
}) => {
  const [formData, setFormData] = useState<StationFormData>({
    stationName: '',
    modelNumber: '',
    serialNumber: '',
    currentCapacity: '',
    ipAddress: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.stationName.trim()) {
      newErrors.stationName = 'Название станка обязательно';
    }

    if (!formData.modelNumber.trim()) {
      newErrors.modelNumber = 'Номер модели обязателен';
    } else if (!/^\d+$/.test(formData.modelNumber)) {
      newErrors.modelNumber = 'Модель должна быть числом';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Серийный номер обязателен';
    } else if (!/^\d+$/.test(formData.serialNumber)) {
      newErrors.serialNumber = 'Серийный номер должен быть числом';
    }

    if (!formData.currentCapacity.trim()) {
      newErrors.currentCapacity = 'Емкость обязательна';
    } else if (!/^\d+$/.test(formData.currentCapacity)) {
      newErrors.currentCapacity = 'Емкость должна быть числом';
    }

    if (!formData.ipAddress.trim()) {
      newErrors.ipAddress = 'IP адрес обязателен';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ipAddress)) {
      newErrors.ipAddress = 'Введите корректный IP адрес';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      // Сброс формы
      setFormData({
        stationName: '',
        modelNumber: '',
        serialNumber: '',
        currentCapacity: '',
        ipAddress: ''
      });
      setErrors({});
    }
  };

  const handleChange = (field: keyof StationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Заголовок */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Создать станцию</h3>
            <p className="text-sm text-gray-600 mt-1">
              Добавить в: <span className="font-medium">{parentLocation}</span>
            </p>
          </div>

          {/* Поля формы */}
          <div className="p-6 space-y-4">
            {/* Название станка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название станции *
              </label>
              <input
                type="text"
                value={formData.stationName}
                onChange={(e) => handleChange('stationName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.stationName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Введите название станка"
                autoFocus
              />
              {errors.stationName && (
                <div className="mt-1 text-sm text-red-600">{errors.stationName}</div>
              )}
            </div>

            {/* Модель и серийный номер в одну строку */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Модель *
                </label>
                <input
                  type="text"
                  value={formData.modelNumber}
                  onChange={(e) => handleChange('modelNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.modelNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Модель"
                />
                {errors.modelNumber && (
                  <div className="mt-1 text-sm text-red-600">{errors.modelNumber}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Серийный номер *
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.serialNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Серийный номер"
                />
                {errors.serialNumber && (
                  <div className="mt-1 text-sm text-red-600">{errors.serialNumber}</div>
                )}
              </div>
            </div>

            {/* Емкость и IP адрес */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Текущая емкость *
                </label>
                <input
                  type="text"
                  value={formData.currentCapacity}
                  onChange={(e) => handleChange('currentCapacity', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentCapacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Емкость"
                />
                {errors.currentCapacity && (
                  <div className="mt-1 text-sm text-red-600">{errors.currentCapacity}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP адрес *
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => handleChange('ipAddress', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.ipAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="192.168.1.100"
                />
                {errors.ipAddress && (
                  <div className="mt-1 text-sm text-red-600">{errors.ipAddress}</div>
                )}
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Создать станцию
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StationCreateModal;
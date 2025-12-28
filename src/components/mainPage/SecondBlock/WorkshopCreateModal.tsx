import React, { useState } from 'react';

interface WorkshopCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, parentId: number) => void;
  parentName: string;
  parentId: number;
}

const WorkshopCreateModal: React.FC<WorkshopCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentName,
  parentId
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Название цеха обязательно');
      return;
    }

    if (name.trim().length < 2) {
      setError('Название должно быть не менее 2 символов');
      return;
    }

    onSubmit(name.trim(), parentId);
    setName('');
    setError('');
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Создать цех</h3>
            <p className="text-sm text-gray-600 mt-1">
              Будет создан в: <span className="font-medium">{parentName}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ID родителя: {parentId}
            </p>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название цеха
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Введите название цеха"
                autoFocus
              />
              {error && (
                <div className="mt-2 text-sm text-red-600">{error}</div>
              )}
            </div>
          </div>

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
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkshopCreateModal;
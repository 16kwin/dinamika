// NotificationPopup.tsx
import React from 'react';

interface NotificationPopupProps {
  hasNotifications: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  hasNotifications,
  onToggle,
  onClose
}) => {
  return (
    <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg p-4 z-50 min-w-[200px]">
      <div className="flex flex-col gap-3">
        <div className="text-gray-700 font-medium">
          Уведомления: {hasNotifications ? 'Есть' : 'Нет'}
        </div>
        
        <button
          onClick={onToggle}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {hasNotifications ? 'Убрать уведомления' : 'Добавить уведомления'}
        </button>
        
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

export default NotificationPopup;
// src/components/Dashboards/Dashboards.tsx

import React, { useState, useEffect } from 'react';
import ConstantInfo from '../../../info/ConstantInfo';

// DTO для статистики Dashboard
interface DashboardStatsDTO {
  totalStations: number;           // Количество станций
  totalFullness: number;           // Сумма заполненности (fullness) - исправлено
  totalCapacity: number;           // Сумма всех мест в станциях
  totalIssued: number;             // Сумма выданных деталей
  totalIssuedOverNorm: number;     // Сумма выданного сверхнормы
}

const Dashboards: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для получения данных
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(window.config.ip_api + ':' + ConstantInfo.serverPort + ConstantInfo.restApiDashboardStats, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const data: DashboardStatsDTO = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
      setError('Не удалось загрузить данные');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // Опционально: обновляем данные каждые 30 секунд
    const intervalId = setInterval(fetchDashboardStats, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Функция для форматирования больших чисел
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  // Функция для расчета процента заполнения
  const calculateFullnessPercentage = (): string => {
    if (!stats || !stats.totalCapacity || stats.totalCapacity === 0) return '0%';
    
    const totalFullness = stats.totalFullness || 0; // Исправлено на totalFullness
    const percentage = (totalFullness / stats.totalCapacity) * 100;
    return percentage.toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="h-full pl-4">
        <div className="flex gap-[80px] h-full">
          {[...Array(5)].map((_, index) => (
            <div 
              key={`loading-${index}`}
              className="flex-shrink-0 bg-gray-200 rounded flex items-center justify-center"
              style={{ width: '275px', height: '160px' }}
            >
              <span className="text-gray-600 font-medium">Загрузка...</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full pl-4">
        <div className="flex gap-[80px] h-full">
          <div 
            className="flex-shrink-0 bg-gray-200 rounded flex items-center justify-center"
            style={{ width: '275px', height: '160px' }}
          >
            <span className="text-red-600 font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full pl-4">
      <div className="flex gap-[80px] h-full">
        {/* Первый элемент: Количество станций */}
        <div 
          className="flex-shrink-0 bg-white rounded-lg flex flex-col items-center justify-center shadow-md border border-gray-200 p-4"
          style={{ width: '275px', height: '160px' }}
        >
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats ? formatNumber(stats.totalStations) : '0'}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Количество станций
          </div>
        </div>
        
        {/* Второй элемент: Вместимость и заполненность */}
        <div 
          className="flex-shrink-0 bg-white rounded-lg flex flex-col items-center justify-center shadow-md border border-gray-200 p-4"
          style={{ width: '275px', height: '160px' }}
        >
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats ? `${formatNumber(stats.totalFullness || 0)} / ${formatNumber(stats.totalCapacity || 0)}` : '0 / 0'}
          </div>
          <div className="text-lg font-semibold text-gray-800 mb-1">
            {calculateFullnessPercentage()}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Заполнено / Вместимость
          </div>
        </div>
        
        {/* Третий элемент: Выдано деталей */}
        <div 
          className="flex-shrink-0 bg-white rounded-lg flex flex-col items-center justify-center shadow-md border border-gray-200 p-4"
          style={{ width: '275px', height: '160px' }}
        >
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {stats ? formatNumber(stats.totalIssued || 0) : '0'}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Выдано деталей
          </div>
        </div>
        
        {/* Четвертый элемент: Сверх нормы */}
        <div 
          className="flex-shrink-0 bg-white rounded-lg flex flex-col items-center justify-center shadow-md border border-gray-200 p-4"
          style={{ width: '275px', height: '160px' }}
        >
          <div className="text-3xl font-bold text-red-600 mb-2">
            {stats ? formatNumber(stats.totalIssuedOverNorm || 0) : '0'}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            Сверх нормы
          </div>
        </div>
        
        {/* Пятый элемент: В разработке */}
        <div 
          className="flex-shrink-0 bg-gray-100 rounded-lg flex flex-col items-center justify-center shadow-sm border border-gray-300 p-4"
          style={{ width: '275px', height: '160px' }}
        >
          <div className="text-lg font-semibold text-gray-700 mb-1">
            В разработке
          </div>
          <div className="text-sm text-gray-500 text-center">
            Дополнительные метрики
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboards;
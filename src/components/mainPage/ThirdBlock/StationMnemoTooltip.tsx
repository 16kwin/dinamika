import React from 'react';
import type { StationDTO } from '../SecondBlock/SecondBlock';

interface StationMnemoTooltipProps {
  station: StationDTO;
  stationPath: string;
  position: {
    top: number;
    left: number;
  };
  isVisible: boolean;
  onClose: () => void;
}

const StationMnemoTooltip: React.FC<StationMnemoTooltipProps> = ({
  station,
  stationPath,
  position,
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  // Определяем цвет кружка по новой логике
  const getCircleColor = (): string => {
    if (!station.isEnabled) {
      return '#9FA4A2'; // Серый для неработающих станций
    } else if (station.hasErrors) {
      return '#EC221F'; // Красный для станций с ошибками
    } else {
      return '#4CAF50'; // Зеленый для работающих станций без ошибок
    }
  };
  
  const circleColor = getCircleColor();
  
  // Текст для ошибок
  const errorText = station.hasErrors ? 'Есть ошибки' : 'Ошибок нет';
  
  // Рассчитываем заполненность
  const fullnessPercentage = station.capacity && station.capacity > 0 && station.fullness !== null
    ? Math.min(Math.round((station.fullness / station.capacity) * 100), 100)
    : 0;
  
  // Форматируем текст заполненности
  const fullnessText = station.capacity && station.fullness !== null
    ? `Заполнено ${station.fullness}/${station.capacity}`
    : 'Заполнено 0/0';
  
  // Определяем цвет прогресс-бара в зависимости от заполненности
  const getProgressBarColor = (percentage: number) => {
    if (percentage < 30) return '#4CAF50'; // Зеленый для низкой заполненности
    if (percentage < 70) return '#FF9800'; // Оранжевый для средней заполненности
    return '#F44336'; // Красный для высокой заполненности
  };
  
  const progressBarColor = getProgressBarColor(fullnessPercentage);
  const progressBarWidth = Math.min(fullnessPercentage, 100);

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      <div 
        className="fixed z-50 rounded-xl shadow-xl bg-white border border-gray-200 overflow-hidden"
        style={{
          width: '220px',
          height: '200px',
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ШАПКА - весь текст */}
        <div className="relative p-0" style={{ height: '40px' }}>
          {/* Цветной круг в зависимости от статуса */}
          <div 
            className="absolute rounded-full"
            style={{
              width: '11px',
              height: '11px',
              top: '10px',
              left: '10px',
              backgroundColor: circleColor,
            }}
          />
          
          {/* Имя станции */}
          <div 
            className="absolute"
            style={{
              top: '10px',
              left: '25px',
            }}
          >
            <span 
              className="font-medium truncate block"
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '10px',
                lineHeight: '1',
                color: '#000000',
              }}
            >
              {station.stationName}
            </span>
            
            {/* Путь к станции */}
            {stationPath && (
              <div 
                className="truncate mt-[2px]"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '8px',
                  lineHeight: '1',
                  color: '#666666',
                }}
              >
                {stationPath.replace(/→/g, '>')}
              </div>
            )}
          </div>
          
          {/* Информация о модели */}
          <div 
            className="absolute text-right"
            style={{
              top: '14px',
              right: '10px',
            }}
          >
            <div 
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '7px',
                lineHeight: '1.2',
                color: '#666666',
              }}
            >
              <div>Модель:</div>
              <div className="font-medium text-gray-800">
                {station.modelNumber}
              </div>
            </div>
          </div>
          
          {/* Линия-разделитель под шапкой */}
          <div 
            className="absolute"
            style={{
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '190px',
              height: '0.5px',
              backgroundColor: '#989696',
            }}
          />
        </div>
        
        {/* ОСНОВНОЙ КОНТЕНТ - под линией */}
        <div className="h-[160px] flex flex-col">
          {/* Блок с прогрессом */}
          <div className="flex flex-col items-center" style={{ paddingTop: '10px' }}>
            {/* Текст с заполненностью */}
            <div 
              className="text-center mb-2"
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '10px',
                lineHeight: '1',
                color: '#000000',
                fontWeight: 300,
              }}
            >
              {fullnessText}
            </div>
            
            {/* Прогресс-бар */}
            <div className="relative mb-4" style={{ width: '170px', height: '12px' }}>
              {/* Внешний контейнер прогресс-бара */}
              <div 
                className="absolute top-0 left-0 rounded-full"
                style={{
                  width: '170px',
                  height: '12px',
                  backgroundColor: 'rgba(155, 173, 214, 0.35)',
                }}
              />
              
              {/* Цветной прогресс */}
              <div 
                className="absolute top-0 left-0 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: `${progressBarWidth}%`,
                  height: '12px',
                  backgroundColor: progressBarColor,
                  minWidth: '12px', // Минимальная ширина для отображения круга
                }}
              >
                {/* Текст процентов внутри прогресса */}
                {progressBarWidth >= 30 && (
                  <span 
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '8px',
                      fontWeight: 600,
                      color: 'white',
                      whiteSpace: 'nowrap',
                      textShadow: '0px 0px 1px rgba(0,0,0,0.5)',
                    }}
                  >
                    {fullnessPercentage}%
                  </span>
                )}
              </div>
              
              {/* Текст процентов для узкого прогресса */}
              {progressBarWidth < 30 && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <span 
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '8px',
                      fontWeight: 600,
                      color: '#666666',
                      position: 'absolute',
                      zIndex: 2,
                    }}
                  >
                    {fullnessPercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Блок с информацией */}
          <div className="flex-1">
            {/* Текст с ошибками */}
            <div 
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '10px',
                lineHeight: '1',
                color: station.hasErrors ? '#EC221F' : '#000000',
                marginLeft: '25px',
                fontWeight: 300,
              }}
            >
              {errorText}
            </div>
            
            {/* Список с реальными значениями */}
            <div 
              className="flex flex-col"
              style={{
                marginTop: '7px',
                marginLeft: '25px',
              }}
            >
              <div 
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '10px',
                  lineHeight: '1.2',
                  color: '#000000',
                  marginBottom: '7px',
                  fontWeight: 300,
                }}
              >
                Выдано: {station.issued ?? 0}
              </div>
              <div 
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '10px',
                  lineHeight: '1.2',
                  color: '#000000',
                  marginBottom: '7px',
                  fontWeight: 300,
                }}
              >
                Выдано сверхнормы: {station.issuedOverNorm ?? 0}
              </div>
              <div 
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '10px',
                  lineHeight: '1.2',
                  color: '#000000',
                  fontWeight: 300,
                }}
              >
                Готовых деталей: {station.finishedParts ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StationMnemoTooltip;
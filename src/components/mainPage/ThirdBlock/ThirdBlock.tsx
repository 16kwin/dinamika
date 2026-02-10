import React, { useState } from 'react';
import Mnemo from './Mnemo';
import Inter from './Inter';
import StationInfoModal from '../SecondBlock/StationInfoModal';
import type { LocationHierarchyDTO, StationDTO } from '../SecondBlock/SecondBlock';

interface ThirdBlockProps {
  hierarchy: LocationHierarchyDTO | null;
  selectedLocation: LocationHierarchyDTO | null;
  onStationSelect: (station: StationDTO | null) => void;
  onStationHover: (station: StationDTO | null) => void;
  selectedStation: StationDTO | null;
  hoveredStation: StationDTO | null;
}

const ThirdBlock: React.FC<ThirdBlockProps> = ({ 
  hierarchy,
  selectedLocation, 
  onStationSelect,
  onStationHover,
  selectedStation,
  hoveredStation
}) => {
  const [activeTab, setActiveTab] = useState<'mnemonic' | 'interactive'>('mnemonic');
  const [stationInfoModalOpen, setStationInfoModalOpen] = useState(false);
  const [stationForModal, setStationForModal] = useState<StationDTO | null>(null);

  const handleTabClick = (tab: 'mnemonic' | 'interactive') => {
    setActiveTab(tab);
    // Закрываем тултип при переключении вкладок
    onStationSelect(null);
    setStationForModal(null);
  };

  const handleStationSelectFromMnemo = (station: StationDTO) => {
    onStationSelect(station);
    setStationForModal(station);
    setStationInfoModalOpen(true);
  };

  const handleStationSelectFromInter = (station: StationDTO | null) => {
    onStationSelect(station);
    // В интерактивной карте НЕ открываем модальное окно, только передаем станцию
    // для подсветки в дереве
  };

  const closeStationInfoModal = () => {
    setStationInfoModalOpen(false);
    setStationForModal(null);
    onStationSelect(null);
    onStationHover(null);
  };

  return (
    <div className="h-full bg-white rounded-lg border border-gray-300 flex flex-col overflow-hidden">
      {/* Шапка высотой 70.5px */}
      <div className="h-[70.5px] flex items-center relative">
        {/* Цветной блок слева - 23px шириной */}
        <div 
          className="w-[23px] h-full flex-shrink-0"
          style={{ backgroundColor: '#5EE69E' }}
        ></div>
        
        {/* Текст справа от блока с отступом 17px */}
        <div 
          className="flex items-center h-full"
          style={{ marginLeft: '17px' }}
        >
          <span 
            className="font-normal"
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '25px',
              lineHeight: 'normal'
            }}
          >
            Карты станций
          </span>
        </div>
        
        {/* Линия 1px снизу шапки */}
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '1px',
            backgroundColor: '#E5E7EB'
          }}
        ></div>
      </div>

      {/* Основное содержимое */}
      <div className="flex-1 flex flex-col">
        {/* Отступ 30.5px от линии шапки */}
        <div className="h-[30.5px]"></div>

        {/* Контейнер для переключателя по центру */}
        <div className="flex justify-center px-4">
          {/* Переключатель карт */}
          <div className="relative w-[873px] h-[40px]">
            {/* Фон переключателя с оконтовкой 1px - теперь белый */}
            <div 
              className="w-full h-full rounded-full border"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#CCCDCE',
                borderWidth: '1px'
              }}
            >
              {/* Текст слева - Мнемоническая карта */}
              <div 
                className="absolute top-0 left-0 h-full flex items-center justify-center"
                style={{
                  width: '436px',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '25px',
                  lineHeight: '40px',
                  zIndex: 20,
                  color: '#000000',
                  transition: 'color 0.3s ease',
                  pointerEvents: 'none'
                }}
              >
                Мнемоническая карта
              </div>
              
              {/* Текст справа - Интерактивная карта */}
              <div 
                className="absolute top-0 right-0 h-full flex items-center justify-center"
                style={{
                  width: '436px',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '25px',
                  lineHeight: '40px',
                  zIndex: 20,
                  color: '#000000',
                  transition: 'color 0.3s ease',
                  pointerEvents: 'none'
                }}
              >
                Интерактивная карта
              </div>
            </div>

            {/* Переключатель-ползунок (ПОД текстом) */}
            <div 
              className="absolute top-0 h-full rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: '436px',
                backgroundColor: '#E8F0FF',
                zIndex: 15,
                left: activeTab === 'mnemonic' ? '0' : 'calc(100% - 436px)',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onClick={() => handleTabClick(activeTab === 'mnemonic' ? 'interactive' : 'mnemonic')}
            ></div>

            {/* Кликабельные области для переключения */}
            <div 
              className="absolute top-0 left-0 h-full"
              style={{ 
                width: '436px', 
                zIndex: 25,
                cursor: 'pointer' 
              }}
              onClick={() => handleTabClick('mnemonic')}
            ></div>
            
            <div 
              className="absolute top-0 right-0 h-full"
              style={{ 
                width: '436px', 
                zIndex: 25,
                cursor: 'pointer' 
              }}
              onClick={() => handleTabClick('interactive')}
            ></div>
          </div>
        </div>

        {/* Контейнер для контента с отступом снизу 50px */}
        <div className="flex-1 flex flex-col">
          {/* Контентная область - переключается между Mnemo и Inter */}
          <div className="flex-1">
            {activeTab === 'mnemonic' ? (
              <Mnemo 
                hierarchy={hierarchy}
                selectedLocation={selectedLocation}
                onStationClick={handleStationSelectFromMnemo} // Только в мнемокарте открываем модалку
                onStationHover={onStationHover}
                hoveredStation={hoveredStation}
              />
            ) : (
              <Inter 
                selectedLocationId={selectedLocation?.id || null}
                selectedLocationName={selectedLocation?.locationName || null}
                selectedLocationLevel={selectedLocation?.level || null}
                // ДОБАВЛЯЕМ НОВЫЕ ПРОПСЫ:
                onStationHover={onStationHover}
                onStationSelect={handleStationSelectFromInter} // В интерактивной карте НЕ открываем модалку
                hoveredStation={hoveredStation}
                hierarchy={hierarchy}
              />
            )}
          </div>
          
          {/* Отступ 50px снизу для обоих форматов */}
          <div className="h-[50px]"></div>
        </div>
      </div>

      {/* Модальное окно информации о станции (только для мнемокарты) */}
      <StationInfoModal
        isOpen={stationInfoModalOpen}
        onClose={closeStationInfoModal}
        station={stationForModal}
      />
    </div>
  );
};

export default ThirdBlock;
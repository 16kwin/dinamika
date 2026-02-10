import React, { useState } from 'react';
import SecondBlock from './SecondBlock/SecondBlock';
import ThirdBlock from './ThirdBlock/ThirdBlock';
import Dashboards from './Dashboards/Daschboards';
import type { LocationHierarchyDTO, StationDTO } from './SecondBlock/SecondBlock';

const MainPage = () => {
  const [hierarchy, setHierarchy] = useState<LocationHierarchyDTO | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationHierarchyDTO | null>(null);
  const [selectedStation, setSelectedStation] = useState<StationDTO | null>(null);
  const [hoveredStation, setHoveredStation] = useState<StationDTO | null>(null);

  const handleHierarchyUpdate = (newHierarchy: LocationHierarchyDTO | null) => {
    setHierarchy(newHierarchy);
  };

  const handleLocationSelect = (location: LocationHierarchyDTO | null) => {
    setSelectedLocation(location);
  };

  const handleStationSelect = (station: StationDTO | null) => {
    setSelectedStation(station);
  };

  const handleStationHover = (station: StationDTO | null) => {
    setHoveredStation(station);
  };

  return (
    <div className="h-full bg-[#F5F7F9]">
      <div className="grid grid-rows-[4px_40px_20px_150px_60px_1fr_30px] gap-0 h-full pt-4">
        {/* Отступ между 1 и 2 блоком (4px) */}
        <div></div>

        {/* Блок 2 - заголовок */}
        <div className="pl-4">
          <div className="inline-flex items-center gap-2 text-gray-700">
            <span className="font-medium">Главный экран</span>
          </div>
        </div>

        {/* Отступ между 2 и 3 блоком (20px) */}
        <div className="h-[20px]"></div>

        {/* Блок 3 - дашборды */}
        <div className="h-[150px] opacity-100 pr-[30px]">
          <Dashboards />
        </div>

        {/* Отступ после блока 3 (60px) */}
        <div className="h-[60px]"></div>

        {/* Контейнер для блоков 4 и 5 */}
        <div className="flex gap-[30px] pr-[30px] h-full min-h-0">
          {/* Блок 4 (левый) - ширина 500px */}
          <div className="w-[500px] flex-shrink-0">
            <SecondBlock 
              onHierarchyUpdate={handleHierarchyUpdate}
              onLocationSelect={handleLocationSelect}
              onStationSelect={handleStationSelect}
              onStationHover={handleStationHover}
              selectedStation={selectedStation}
              hoveredStation={hoveredStation}
            />
          </div>
          
          {/* Блок 5 (правый) - теперь ThirdBlock */}
          <div className="flex-grow">
            <ThirdBlock 
              hierarchy={hierarchy}
              selectedLocation={selectedLocation}
              onStationSelect={handleStationSelect}
              onStationHover={handleStationHover}
              selectedStation={selectedStation}
              hoveredStation={hoveredStation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { LocationHierarchyDTO, StationDTO } from '../SecondBlock/SecondBlock';
import StationMnemoTooltip from './StationMnemoTooltip';

interface MnemoProps {
  hierarchy: LocationHierarchyDTO | null;
  selectedLocation: LocationHierarchyDTO | null;
  onStationClick: (station: StationDTO) => void;
  onStationHover: (station: StationDTO | null) => void;
  hoveredStation: StationDTO | null;
}

const Mnemo: React.FC<MnemoProps> = ({ 
  hierarchy, 
  selectedLocation, 
  onStationClick,
  onStationHover,
  hoveredStation
}) => {
  const [selectedStationForTooltip, setSelectedStationForTooltip] = useState<StationDTO | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [stationPath, setStationPath] = useState<string>('');
  
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const findStationPath = (stationUid: string): string => {
    if (!hierarchy) return '';
    
    const findPathRecursive = (
      node: LocationHierarchyDTO, 
      path: string[]
    ): string[] | null => {
      const hasStation = (node.stations || []).some(s => s.uid === stationUid);
      
      if (hasStation) {
        if (node.level === 1) {
          return [...path];
        } else {
          return [...path, node.locationName];
        }
      }
      
      for (const child of node.childLocations || []) {
        const childPath = findPathRecursive(child, node.level === 1 ? [] : [...path, node.locationName]);
        if (childPath) {
          return childPath;
        }
      }
      
      return null;
    };
    
    const path = findPathRecursive(hierarchy, []);
    return path ? path.join(' → ') : '';
  };

  const getAllStations = useMemo((): StationDTO[] => {
    if (!hierarchy) return [];

    const collectStations = (node: LocationHierarchyDTO): StationDTO[] => {
      let stations: StationDTO[] = [...(node.stations || [])];
      
      for (const child of node.childLocations || []) {
        stations = stations.concat(collectStations(child));
      }
      
      return stations;
    };

    return collectStations(hierarchy);
  }, [hierarchy]);

  const getStationsForLocation = useMemo((): StationDTO[] => {
    if (!selectedLocation || !hierarchy) return getAllStations;

    const findLocationAndCollectStations = (
      node: LocationHierarchyDTO, 
      targetId: number
    ): StationDTO[] | null => {
      if (node.id === targetId) {
        const collectAllStationsFromNode = (location: LocationHierarchyDTO): StationDTO[] => {
          let stations: StationDTO[] = [...(location.stations || [])];
          
          for (const child of location.childLocations || []) {
            stations = stations.concat(collectAllStationsFromNode(child));
          }
          
          return stations;
        };
        
        return collectAllStationsFromNode(node);
      }
      
      for (const child of node.childLocations || []) {
        const result = findLocationAndCollectStations(child, targetId);
        if (result) {
          return result;
        }
      }
      
      return null;
    };

    const stations = findLocationAndCollectStations(hierarchy, selectedLocation.id);
    return stations || getAllStations;
  }, [hierarchy, selectedLocation, getAllStations]);

  const stations = selectedLocation ? getStationsForLocation : getAllStations;

  const rowsWithIndices: {station: StationDTO, rowIndex: number, colIndex: number}[] = [];
  const rows: StationDTO[][] = [];
  
  for (let i = 0; i < stations.length; i += 10) {
    const rowStations = stations.slice(i, i + 10);
    rows.push(rowStations);
    
    rowStations.forEach((station, colIndex) => {
      rowsWithIndices.push({
        station,
        rowIndex: Math.floor(i / 10),
        colIndex
      });
    });
  }

  const handleStationClick = (station: StationDTO, rowIndex: number, colIndex: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (selectedStationForTooltip?.uid === station.uid) {
      closeTooltip();
      return;
    }
    
    const cellKey = `${rowIndex}-${colIndex}`;
    const cellElement = cellRefs.current.get(cellKey);
    
    if (cellElement) {
      const rect = cellElement.getBoundingClientRect();
      
      let leftPosition: number;
      
      if (colIndex < 5) {
        leftPosition = rect.right + 10;
      } else {
        leftPosition = rect.left - 220 - 10;
      }
      
      const topPosition = rect.bottom + 10;
      
      setTooltipPosition({
        top: topPosition,
        left: leftPosition
      });
      
      const path = findStationPath(station.uid);
      setStationPath(path);
      
      setSelectedStationForTooltip(station);
    }
  };

  const closeTooltip = () => {
    setSelectedStationForTooltip(null);
    setStationPath('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedStationForTooltip) {
        closeTooltip();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedStationForTooltip]);

  const handleCellMouseEnter = (station: StationDTO) => {
    onStationHover?.(station);
  };

  const handleCellMouseLeave = () => {
    onStationHover?.(null);
  };

  // Получаем цвет фона с учетом прозрачности для красного блока
  const getCellBackgroundColor = (station: StationDTO): string => {
    if (!station.isEnabled) {
      return '#9FA4A2'; // Серая для выключенных станций
    } else {
      // Проверяем: fullness (остаток) меньше 10% от capacity (вместимости)
      if (station.capacity !== null && station.fullness !== null && station.capacity > 0) {
        const criticalThreshold = station.capacity * 0.1; // 10% от вместимости
        if (station.fullness < criticalThreshold) {
          // Красный с 60% прозрачности - используем rgba
          return 'rgba(236, 34, 31, 0.6)'; // #EC221F с альфа-каналом 0.6
        }
      }
      return '#72CE9D'; // Зеленая для остатка >= 10% или если данных нет
    }
  };

  const getHoveredCellBackgroundColor = (station: StationDTO): string => {
    if (!station.isEnabled) {
      return '#7A7E7C'; // Темно-серая при наведении
    } else {
      if (station.capacity !== null && station.fullness !== null && station.capacity > 0) {
        const criticalThreshold = station.capacity * 0.1;
        if (station.fullness < criticalThreshold) {
          return '#C11B18'; // Темно-красная при наведении (без прозрачности)
        }
      }
      return '#5AB584'; // Темно-зеленая при наведении
    }
  };

  // Проверяем, является ли блок красным
  const isRedBlock = (station: StationDTO): boolean => {
    if (station.capacity !== null && station.fullness !== null && station.capacity > 0) {
      const criticalThreshold = station.capacity * 0.1;
      return station.fullness < criticalThreshold;
    }
    return false;
  };

  if (!hierarchy) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="h-[30px]"></div>
        <div className="flex-1 flex justify-center px-4">
          <div 
            className="w-full max-w-[968px] border rounded-lg flex flex-col"
            style={{
              borderColor: '#CCCDCE',
              borderWidth: '1px',
              backgroundColor: '#FFFFFF'
            }}
          >
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="text-gray-600 font-medium">
                  Загрузка данных...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col relative" onClick={closeTooltip}>
      <div className="h-[30px]"></div>
      
      <div className="flex-1 flex justify-center px-4">
        <div 
          className="w-full max-w-[968px] border rounded-lg flex flex-col relative"
          style={{
            borderColor: '#CCCDCE',
            borderWidth: '1px',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div className="flex-1 p-6 overflow-auto" onClick={(e) => e.stopPropagation()}>
            {rows.map((row, rowIndex) => (
              <div 
                key={`row-${rowIndex}`} 
                className="flex justify-between mb-6 last:mb-0"
              >
                {row.map((station, colIndex) => {
                  const isHovered = hoveredStation && hoveredStation.uid === station.uid;
                  const isSelectedForTooltip = selectedStationForTooltip?.uid === station.uid;
                  const cellKey = `${rowIndex}-${colIndex}`;
                  const isRed = isRedBlock(station);
                  
                  const baseColor = isRed ? 
                    'rgba(236, 34, 31, 0.6)' : // Красный с 60% прозрачности
                    getCellBackgroundColor(station);
                  
                  const hoverColor = getHoveredCellBackgroundColor(station);
                  
                  return (
                    <div
                      key={station.uid}
                      ref={(el) => {
                        if (el) {
                          cellRefs.current.set(cellKey, el);
                        } else {
                          cellRefs.current.delete(cellKey);
                        }
                      }}
                      className="cursor-pointer transition-all duration-200"
                      onClick={(e) => handleStationClick(station, rowIndex, colIndex, e)}
                      onMouseEnter={() => handleCellMouseEnter(station)}
                      onMouseLeave={handleCellMouseLeave}
                      style={{
                        width: '67px',
                        height: '32px',
                        backgroundColor: isHovered || isSelectedForTooltip ? 
                          (isRed ? '#C11B18' : hoverColor) : baseColor,
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                        zIndex: isHovered || isSelectedForTooltip ? 10 : 1,
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                        position: 'relative',
                      }}
                    >
                      {/* Красный круг с ERR по центру если есть ошибка */}
                      {station.hasErrors && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '30px',
                            height: '30px',
                            backgroundColor: '#CB4C3E',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 20,
                          }}
                        >
                          <span 
                            style={{
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              display: 'block',
                              width: '100%',
                              lineHeight: '30px',
                              height: '30px',
                              margin: 0,
                              padding: 0,
                            }}
                          >
                            ERR
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {row.length < 10 && Array.from({ length: 10 - row.length }).map((_, index) => (
                  <div 
                    key={`empty-${rowIndex}-${index}`}
                    style={{
                      width: '67px',
                      height: '32px',
                    }}
                  />
                ))}
              </div>
            ))}
            
            {stations.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-gray-600 font-medium">
                    Нет станций для отображения
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedStationForTooltip && (
        <StationMnemoTooltip
          station={selectedStationForTooltip}
          stationPath={stationPath}
          position={tooltipPosition}
          isVisible={true}
          onClose={closeTooltip}
        />
      )}
    </div>
  );
};

export default Mnemo;
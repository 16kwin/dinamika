import React, { useState, useMemo, useEffect } from 'react';
import type { LocationHierarchyDTO, StationDTO } from './SecondBlock';
import Block from './Block';
import type { BlockType } from './Block';

interface TreeProps {
  hierarchy: LocationHierarchyDTO | null;
  searchQuery: string;
  onAddButtonClick?: (e: React.MouseEvent, node: LocationHierarchyDTO) => void;
  onStationClick?: (station: StationDTO) => void;
  onStationHover?: (station: StationDTO | null) => void;
  onLocationClick?: (location: LocationHierarchyDTO) => void;
  hoveredStation: StationDTO | null;
}

const Tree: React.FC<TreeProps> = ({ 
  hierarchy, 
  searchQuery, 
  onAddButtonClick, 
  onStationClick,
  onStationHover,
  onLocationClick,
  hoveredStation
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [closingNodes, setClosingNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!hierarchy || !searchQuery.trim()) return;

    const findMatchingNodes = (node: LocationHierarchyDTO, newExpanded: Set<number>): boolean => {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      
      const matchesLocation = node.locationName.toLowerCase().includes(normalizedQuery);
      
      const hasMatchingStations = (node.stations || []).some(station => 
        station.stationName.toLowerCase().includes(normalizedQuery) ||
        station.modelNumber?.toString().toLowerCase().includes(normalizedQuery) ||
        station.serialNumber?.toString().toLowerCase().includes(normalizedQuery)
      );
      
      let childHasMatches = false;
      for (const child of node.childLocations || []) {
        if (findMatchingNodes(child, newExpanded)) {
          childHasMatches = true;
        }
      }
      
      if (matchesLocation || hasMatchingStations || childHasMatches) {
        newExpanded.add(node.id);
        return true;
      }
      
      return false;
    };

    const newExpanded = new Set(expandedNodes);
    findMatchingNodes(hierarchy, newExpanded);
    setExpandedNodes(newExpanded);
  }, [searchQuery, hierarchy]);

  const toggleNode = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    
    if (newExpanded.has(id)) {
      setClosingNodes(prev => new Set(prev).add(id));
      
      setTimeout(() => {
        newExpanded.delete(id);
        setExpandedNodes(newExpanded);
        setClosingNodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 300);
    } else {
      newExpanded.add(id);
      setExpandedNodes(newExpanded);
    }
  };

  const getBlockTypeByLevel = (level: number): BlockType => {
    switch (level) {
      case 1: return 'factory';
      case 2: return 'workshop';
      case 3: return 'section';
      default: return 'factory';
    }
  };

  const filteredHierarchy = useMemo(() => {
    if (!hierarchy || !searchQuery.trim()) {
      return null;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    const filterNode = (node: LocationHierarchyDTO): LocationHierarchyDTO | null => {
      const matchesLocation = node.locationName.toLowerCase().includes(normalizedQuery);
      
      const filteredStations = (node.stations || []).filter(station => 
        station.stationName.toLowerCase().includes(normalizedQuery) ||
        station.modelNumber?.toString().toLowerCase().includes(normalizedQuery) ||
        station.serialNumber?.toString().toLowerCase().includes(normalizedQuery)
      );
      
      const hasMatchingStations = filteredStations.length > 0;
      
      const filteredChildren: LocationHierarchyDTO[] = [];
      for (const child of node.childLocations || []) {
        const filteredChild = filterNode(child);
        if (filteredChild) {
          filteredChildren.push(filteredChild);
        }
      }
      
      const hasMatchingChildren = filteredChildren.length > 0;
      
      if (matchesLocation || hasMatchingStations || hasMatchingChildren) {
        return {
          ...node,
          id: node.id,
          childLocations: filteredChildren,
          stations: filteredStations
        };
      }
      
      return null;
    };
    
    return filterNode(hierarchy);
  }, [hierarchy, searchQuery]);

  const highlightText = (text: string, search: string): React.ReactNode => {
    if (!search.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <span 
              key={i} 
              className="font-medium"
              style={{ 
                backgroundColor: '#3A4D8F',
                color: '#FFFFFF',
                padding: '0 2px',
                borderRadius: '2px'
              }}
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Вычисляем высоту всех детей рекурсивно
  const calculateChildrenHeight = (
    node: LocationHierarchyDTO
  ): number => {
    let totalHeight = 0;
    
    const blockHeight = 45;
    const marginBetween = 25;
    const childLocations = node.childLocations || [];
    const stations = node.stations || [];
    const totalElements = childLocations.length + stations.length;
    
    childLocations.forEach((child, index) => {
      totalHeight += blockHeight;
      
      if (index < childLocations.length - 1 || stations.length > 0) {
        totalHeight += marginBetween;
      }
      
      // Если ребенок развернут - добавляем высоту его детей
      if (expandedNodes.has(child.id)) {
        const childHeight = calculateChildrenHeight(child);
        if (childHeight > 0) {
          totalHeight += 25; // Отступ перед детьми
          totalHeight += childHeight;
        }
      }
    });
    
    stations.forEach((_, index) => {
      totalHeight += blockHeight;
      if (index < stations.length - 1) {
        totalHeight += marginBetween;
      }
    });
    
    return totalHeight;
  };

  // Вычисляем высоту с учетом развернутых элементов (кроме последнего)
  const calculateVerticalLineHeight = (
    childLocations: LocationHierarchyDTO[], 
    stations: StationDTO[]
  ): number => {
    let totalHeight = 0;
    
    const blockHeight = 45;
    const marginBetween = 25;
    const totalElements = childLocations.length + stations.length;
    
    // Обрабатываем дочерние локации (кроме последней)
    for (let i = 0; i < childLocations.length; i++) {
      const child = childLocations[i];
      const isLastElement = i === childLocations.length - 1 && stations.length === 0;
      
      totalHeight += blockHeight;
      
      // Отступ между элементами (кроме последнего)
      if (i < childLocations.length - 1 || stations.length > 0) {
        totalHeight += marginBetween;
      }
      
      // Если элемент развернут И он НЕ последний - учитываем его детей
      if (expandedNodes.has(child.id) && !isLastElement) {
        const childHeight = calculateChildrenHeight(child);
        if (childHeight > 0) {
          totalHeight += 25; // Отступ перед детьми
          totalHeight += childHeight;
        }
      }
    }
    
    // Обрабатываем станции (все кроме последней)
    for (let i = 0; i < stations.length; i++) {
      const isLastElement = i === stations.length - 1;
      
      totalHeight += blockHeight;
      
      // Отступ между элементами (кроме последнего)
      if (i < stations.length - 1) {
        totalHeight += marginBetween;
      }
      
      // Станции не имеют детей, поэтому ничего не добавляем
    }
    
    return totalHeight;
  };

  const handleStationHover = (station: StationDTO | null) => {
    if (onStationHover) {
      onStationHover(station);
    }
  };

  const renderNode = (node: LocationHierarchyDTO, depth: number = 0, showHorizontalLine: boolean = false) => {
    const isExpanded = expandedNodes.has(node.id);
    const isClosing = closingNodes.has(node.id);
    const childLocations = node.childLocations || [];
    const stations = node.stations || [];
    const totalChildren = childLocations.length + stations.length;
    const hasChildrenOrStations = totalChildren > 0;

    const blockType = getBlockTypeByLevel(node.level);
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const isLocationMatch = node.locationName.toLowerCase().includes(normalizedQuery);
    const hasStationMatches = (node.stations || []).some(station => 
      station.stationName.toLowerCase().includes(normalizedQuery) ||
      station.modelNumber?.toString().toLowerCase().includes(normalizedQuery) ||
      station.serialNumber?.toString().toLowerCase().includes(normalizedQuery)
    );
    
    const blockStyle: React.CSSProperties = {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)'
    };

    // Вычисляем высоту вертикальной линии (учитываем развернутые элементы, кроме последнего)
    const verticalLineHeight = calculateVerticalLineHeight(childLocations, stations);

    return (
      <div key={node.id} style={{ position: 'relative', marginBottom: '25px' }}>
        
        <Block 
          node={node}
          blockType={blockType}
          isExpanded={isExpanded}
          hasChildren={hasChildrenOrStations}
          onClick={() => {
            if (hasChildrenOrStations) {
              toggleNode(node.id);
            }
            if (onLocationClick) {
              onLocationClick(node);
            }
          }}
          showHorizontalLine={showHorizontalLine}
          onAddButtonClick={onAddButtonClick}
          onStationClick={onStationClick}
          searchQuery={searchQuery}
          isSearchMatch={isLocationMatch || hasStationMatches}
          blockStyle={blockStyle}
          highlightText={highlightText}
        />

        {(isExpanded || isClosing) && hasChildrenOrStations && (
          <div 
            style={{ 
              position: 'relative',
              marginTop: '25px',
              marginLeft: '50px',
              animation: isClosing ? 'slideUp 0.3s ease-out forwards' : 'slideDown 0.3s ease-out forwards',
            }}
          >
            
            {/* Вертикальная линия - учитывает развернутые элементы, кроме последнего */}
            <div style={{
              position: 'absolute',
              top: '-54px',
              left: '-25px',
              height: `calc(${verticalLineHeight}px + 34px)`, // +54px чтобы закрыть отступ сверху
              width: '1px',
              backgroundColor: '#3E4E77',
              zIndex: 1
            }} />
            
            <div style={{ position: 'relative' }}>
              {childLocations.map((child, index) => {
                const isLastChild = index === childLocations.length - 1 && stations.length === 0;
                
                return (
                  <div 
                    key={`loc-${child.id}`}
                    style={{
                      position: 'relative',
                      marginBottom: isLastChild ? '0px' : '25px',
                      animation: isClosing 
                        ? `fadeOutDown 0.3s ease-out ${index * 0.05}s forwards`
                        : `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                      opacity: isClosing ? 1 : 0,
                    }}
                  >
                    {renderNode(child, depth + 1, true)}
                  </div>
                );
              })}

              {stations.map((station, index) => {
                const isStationMatch = 
                  station.stationName.toLowerCase().includes(normalizedQuery) ||
                  station.modelNumber?.toString().toLowerCase().includes(normalizedQuery) ||
                  station.serialNumber?.toString().toLowerCase().includes(normalizedQuery);
                
                const stationBlockStyle: React.CSSProperties = {
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)'
                };
                
                const isLastStation = index === stations.length - 1;
                const childIndex = childLocations.length + index;
                const isHovered = hoveredStation && hoveredStation.uid === station.uid;
                
                return (
                  <div 
                    key={`stat-${station.uid}`}
                    style={{
                      position: 'relative',
                      marginBottom: isLastStation ? '0px' : '25px',
                      animation: isClosing 
                        ? `fadeOutDown 0.3s ease-out ${childIndex * 0.05}s forwards`
                        : `fadeInUp 0.3s ease-out ${childIndex * 0.05}s forwards`,
                      opacity: isClosing ? 1 : 0,
                    }}
                  >
                    <Block 
                      node={station}
                      blockType="station"
                      isStation={true}
                      showHorizontalLine={true}
                      onStationClick={onStationClick}
                      onMouseEnter={() => handleStationHover(station)}
                      onMouseLeave={() => handleStationHover(null)}
                      searchQuery={searchQuery}
                      isSearchMatch={isStationMatch}
                      isHovered={isHovered}
                      blockStyle={stationBlockStyle}
                      highlightText={highlightText}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!hierarchy) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Нет данных для отображения
      </div>
    );
  }

  const displayHierarchy = searchQuery.trim() && filteredHierarchy 
    ? filteredHierarchy
    : hierarchy;

  if (!displayHierarchy) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        По запросу "{searchQuery}" ничего не найдено
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '19px 0 0 42px',
      backgroundColor: '#FFFFFF',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(5px);
          }
        }
      `}</style>
      
      {renderNode(displayHierarchy, 0, false)}
      
      {searchQuery.trim() && (
        <div className="mt-4 text-sm text-gray-500 px-2">
          Поиск: "{searchQuery}" • Показаны только совпадающие элементы и их родители
        </div>
      )}
    </div>
  );
};

export default Tree;
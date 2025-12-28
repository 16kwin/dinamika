import React, { useState, useMemo, useEffect } from 'react';
import type { LocationHierarchyDTO, StationDTO } from './SecondBlock';
import Block from './Block';
import type { BlockType } from './Block';

interface TreeProps {
  hierarchy: LocationHierarchyDTO | null;
  searchQuery: string;
  onAddButtonClick?: (e: React.MouseEvent, node: LocationHierarchyDTO) => void;
  onStationClick?: (station: StationDTO) => void;
}

const Tree: React.FC<TreeProps> = ({ hierarchy, searchQuery, onAddButtonClick, onStationClick }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Автоматически разворачиваем узлы при поиске
  useEffect(() => {
    if (!hierarchy || !searchQuery.trim()) return;

    const findMatchingNodes = (node: LocationHierarchyDTO, newExpanded: Set<number>): boolean => {
      const normalizedQuery = searchQuery.toLowerCase().trim();
      
      // Проверяем совпадение в текущей ноде
      const matchesLocation = node.locationName.toLowerCase().includes(normalizedQuery);
      
      // Проверяем станции в этой ноде
      const hasMatchingStations = (node.stations || []).some(station => 
        station.stationName.toLowerCase().includes(normalizedQuery) ||
        station.modelNumber?.toString().toLowerCase().includes(normalizedQuery) ||
        station.serialNumber?.toString().toLowerCase().includes(normalizedQuery)
      );
      
      // Рекурсивно проверяем детей
      let childHasMatches = false;
      for (const child of node.childLocations || []) {
        if (findMatchingNodes(child, newExpanded)) {
          childHasMatches = true;
        }
      }
      
      // Если нода или её дети/станции совпадают - разворачиваем эту ноду
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
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const getBlockTypeByLevel = (level: number): BlockType => {
    switch (level) {
      case 1: return 'factory';
      case 2: return 'workshop';
      case 3: return 'section';
      default: return 'factory';
    }
  };

  // Функция для фильтрации дерева - показывает только совпадающие элементы и их родителей
  const filteredHierarchy = useMemo(() => {
    if (!hierarchy || !searchQuery.trim()) {
      return hierarchy;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    const filterNode = (node: LocationHierarchyDTO, isRoot: boolean = false): LocationHierarchyDTO | null => {
      // Для корневого узла - всегда показываем (даже без совпадений)
      if (isRoot) {
        const filteredChildren: LocationHierarchyDTO[] = [];
        for (const child of node.childLocations || []) {
          const filteredChild = filterNode(child, false);
          if (filteredChild) {
            filteredChildren.push(filteredChild);
          }
        }
        
        // Фильтруем станции в корневом узле
        const filteredStations = (node.stations || []).filter(station => 
          station.stationName.toLowerCase().includes(normalizedQuery) ||
          station.modelNumber?.toString().toLowerCase().includes(normalizedQuery) ||
          station.serialNumber?.toString().toLowerCase().includes(normalizedQuery)
        );
        
        return {
          ...node,
          childLocations: filteredChildren,
          stations: filteredStations
        };
      }
      
      // Для не-корневых узлов
      const matchesLocation = node.locationName.toLowerCase().includes(normalizedQuery);
      
      // Фильтруем станции в этой ноде
      const filteredStations = (node.stations || []).filter(station => 
        station.stationName.toLowerCase().includes(normalizedQuery) ||
        station.modelNumber?.toString().toLowerCase().includes(normalizedQuery) ||
        station.serialNumber?.toString().toLowerCase().includes(normalizedQuery)
      );
      
      const hasMatchingStations = filteredStations.length > 0;
      
      // Рекурсивно фильтруем дочерние локации
      const filteredChildren: LocationHierarchyDTO[] = [];
      for (const child of node.childLocations || []) {
        const filteredChild = filterNode(child, false);
        if (filteredChild) {
          filteredChildren.push(filteredChild);
        }
      }
      
      const hasMatchingChildren = filteredChildren.length > 0;
      
      // Сохраняем ноду если:
      // 1. Совпадает название локации
      // 2. Есть совпадающие станции
      // 3. Есть совпадающие дочерние локации
      if (matchesLocation || hasMatchingStations || hasMatchingChildren) {
        return {
          ...node,
          childLocations: filteredChildren,
          stations: filteredStations
        };
      }
      
      return null;
    };
    
    // Начинаем с корня
    return filterNode(hierarchy, true);
  }, [hierarchy, searchQuery]);

  // Функция для подсветки текста темно-синим цветом
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
                backgroundColor: '#3A4D8F', // Темно-синий цвет для подсветки
                color: '#FFFFFF', // Белый текст для контраста
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

  const renderNode = (node: LocationHierarchyDTO, depth: number = 0, showHorizontalLine: boolean = false) => {
    const isExpanded = expandedNodes.has(node.id);
    const childLocations = node.childLocations || [];
    const stations = node.stations || [];
    const totalChildren = childLocations.length + stations.length;
    const hasChildrenOrStations = totalChildren > 0;

    const blockType = getBlockTypeByLevel(node.level);
    
    // Проверяем совпадение для этой ноды
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const isLocationMatch = node.locationName.toLowerCase().includes(normalizedQuery);
    const hasStationMatches = (node.stations || []).some(station => 
      station.stationName.toLowerCase().includes(normalizedQuery) ||
      station.modelNumber?.toString().toLowerCase().includes(normalizedQuery) ||
      station.serialNumber?.toString().toLowerCase().includes(normalizedQuery)
    );
    
    // Определяем стиль для блока
    const blockStyle: React.CSSProperties = {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)'
    };

    return (
      <div key={node.id} style={{ position: 'relative', marginBottom: '25px' }}>
        
        <Block 
          node={node}
          blockType={blockType}
          isExpanded={isExpanded}
          hasChildren={hasChildrenOrStations}
          onClick={() => {
            hasChildrenOrStations && toggleNode(node.id);
          }}
          showHorizontalLine={showHorizontalLine}
          onAddButtonClick={onAddButtonClick}
          onStationClick={onStationClick}
          searchQuery={searchQuery}
          isSearchMatch={isLocationMatch || hasStationMatches}
          blockStyle={blockStyle}
          highlightText={highlightText}
        />

        {isExpanded && hasChildrenOrStations && (
          <div style={{ 
            position: 'relative',
            marginTop: '25px',
            marginLeft: '50px',
          }}>
            
            <div style={{
                position: 'absolute',
                top: '-54px',
                left: '-25px',
                bottom: '21px',
                width: '1px',
                backgroundColor: '#3E4E77',
                zIndex: 1
            }} />

            <div style={{ position: 'relative' }}>
              {childLocations.map((child, index) => (
                <div 
                  key={`loc-${child.id}`}
                  style={{
                      position: 'relative',
                      marginBottom: '25px',
                  }}
                >
                  {renderNode(child, depth + 1, true)}
                </div>
              ))}

              {stations.map((station, index) => {
                const isStationMatch = 
                  station.stationName.toLowerCase().includes(normalizedQuery) ||
                  station.modelNumber?.toString().toLowerCase().includes(normalizedQuery) ||
                  station.serialNumber?.toString().toLowerCase().includes(normalizedQuery);
                
                const stationBlockStyle: React.CSSProperties = {
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)'
                };
                
                return (
                  <div 
                    key={`stat-${station.uid}`}
                    style={{
                        position: 'relative',
                        marginBottom: index === stations.length - 1 ? '0px' : '25px',
                    }}
                  >
                    <Block 
                      node={station}
                      blockType="station"
                      isStation={true}
                      showHorizontalLine={true}
                      onStationClick={onStationClick}
                      searchQuery={searchQuery}
                      isSearchMatch={isStationMatch}
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

  const displayHierarchy = filteredHierarchy || hierarchy;

  return (
    <div style={{ 
      padding: '19px 0 0 42px',
      backgroundColor: '#FFFFFF',
      overflow: 'hidden'
    }}>
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
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { LocationHierarchyDTO, StationDTO } from './SecondBlock';
import Block from './Block';
import type { BlockType } from './Block';
import { useDrag } from '../../../contexts/DragContext';
import { useCustomDrag } from '../../../contexts/CustomDragContext';

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
  const [draggedStationId, setDraggedStationId] = useState<number | null>(null);
  const { setDragData, clearDragData } = useDrag();
  const { startDrag, isDragging } = useCustomDrag();
  const stationRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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

  useEffect(() => {
    if (!isDragging) {
      setDraggedStationId(null);
    }
  }, [isDragging]);

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
      
      if (expandedNodes.has(child.id)) {
        const childHeight = calculateChildrenHeight(child);
        if (childHeight > 0) {
          totalHeight += 25;
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

  const calculateVerticalLineHeight = (
    childLocations: LocationHierarchyDTO[], 
    stations: StationDTO[]
  ): number => {
    let totalHeight = 0;
    
    const blockHeight = 45;
    const marginBetween = 25;
    const totalElements = childLocations.length + stations.length;
    
    for (let i = 0; i < childLocations.length; i++) {
      const child = childLocations[i];
      const isLastElement = i === childLocations.length - 1 && stations.length === 0;
      
      totalHeight += blockHeight;
      
      if (i < childLocations.length - 1 || stations.length > 0) {
        totalHeight += marginBetween;
      }
      
      if (expandedNodes.has(child.id) && !isLastElement) {
        const childHeight = calculateChildrenHeight(child);
        if (childHeight > 0) {
          totalHeight += 25;
          totalHeight += childHeight;
        }
      }
    }
    
    for (let i = 0; i < stations.length; i++) {
      const isLastElement = i === stations.length - 1;
      
      totalHeight += blockHeight;
      
      if (i < stations.length - 1) {
        totalHeight += marginBetween;
      }
    }
    
    return totalHeight;
  };

  const handleStationHover = (station: StationDTO | null) => {
    if (onStationHover) {
      onStationHover(station);
    }
  };

  const handleStationCustomDragStart = (station: StationDTO, e: React.MouseEvent) => {
    console.log('🎯 Начало кастомного перетаскивания станции из дерева:', {
      id: station.uid,
      name: station.stationName,
      clientX: e.clientX,
      clientY: e.clientY
    });
    
    e.preventDefault();
    e.stopPropagation();
    
    setDraggedStationId(station.uid);
    
    const data = {
      stationId: station.uid,
      stationName: station.stationName || `Станция ${station.uid}`,
      source: 'tree' as const,
    };
    
    setDragData(data);
    (window as any).__dinamikaDragData = {
      data,
      timestamp: Date.now()
    };
    
    startDrag(data, e);
    
    console.log('✅ Кастомный drag запущен');
  };

  const handleStationDragStart = (e: React.DragEvent, station: StationDTO) => {
    console.log('🚀 Начало стандартного перетаскивания станции из дерева');
    
    e.preventDefault();
    e.stopPropagation();
    
    const transparentImage = new Image();
    transparentImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(transparentImage, 0, 0);
    
    const data = {
      stationId: station.uid,
      stationName: station.stationName || `Станция ${station.uid}`,
      source: 'tree' as const,
    };
    
    try {
      const jsonData = JSON.stringify(data);
      e.dataTransfer.setData('text/plain', jsonData);
      e.dataTransfer.setData('application/x-dinamika-drag', jsonData);
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      console.error('❌ Ошибка установки данных:', err);
    }
  };

  const handleStationDragEnd = (e: React.DragEvent) => {
    console.log('🏁 Стандартное перетаскивание из дерева завершено');
    
    if (e.dataTransfer.dropEffect !== 'move') {
      setDraggedStationId(null);
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
            
            <div style={{
              position: 'absolute',
              top: '-54px',
              left: '-25px',
              height: `calc(${verticalLineHeight}px + 34px)`,
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
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                  ...(draggedStationId === station.uid ? {
                    opacity: 0.3,
                    transform: 'scale(0.95)',
                    transition: 'opacity 0.2s, transform 0.2s',
                  } : {})
                };
                
                const isLastStation = index === stations.length - 1;
                const childIndex = childLocations.length + index;
                const isHovered = hoveredStation && hoveredStation.uid === station.uid;
                
                return (
                  <div 
                    key={`stat-${station.uid}`}
                    ref={(el) => {
                      if (el) {
                        stationRefs.current.set(station.uid, el);
                      } else {
                        stationRefs.current.delete(station.uid);
                      }
                    }}
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
                      draggable={true}
                      onDragStart={(e) => handleStationDragStart(e, station)}
                      onDragEnd={handleStationDragEnd}
                      onCustomDragStart={(e) => handleStationCustomDragStart(station, e)}
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
import React from 'react';
import type { LocationHierarchyDTO, StationDTO } from './SecondBlock';
import AddButton from './AddButton';

// Импорт иконок
import IMG1 from '../../../assets/Menu/IMG1.svg';
import IMG2 from '../../../assets/Menu/IMG2.svg';
import IMG3 from '../../../assets/Menu/IMG3.svg';
import IMG4 from '../../../assets/Menu/IMG4.svg';

export type BlockType = 'factory' | 'workshop' | 'section' | 'station';

export interface BlockProps {
  node: LocationHierarchyDTO | StationDTO;
  blockType: BlockType;
  isExpanded?: boolean;
  hasChildren?: boolean;
  level?: number;
  onClick?: () => void;
  isStation?: boolean;
  showHorizontalLine?: boolean;
  onAddButtonClick?: (e: React.MouseEvent, node: LocationHierarchyDTO | StationDTO) => void;
  onStationClick?: (station: StationDTO) => void;
  searchQuery?: string;
  isSearchMatch?: boolean;
  blockStyle?: React.CSSProperties;
  highlightText?: (text: string, search: string) => React.ReactNode;
}

const Block: React.FC<BlockProps> = ({ 
  node, 
  blockType,
  isExpanded = false, 
  hasChildren = false,
  level = 0,
  onClick,
  isStation = false,
  showHorizontalLine = false,
  onAddButtonClick,
  onStationClick,
  searchQuery = '',
  isSearchMatch = false,
  blockStyle = {},
  highlightText
}) => {
  const calculateWidth = () => {
    switch (blockType) {
      case 'factory': return 376;
      case 'workshop': return 326;
      case 'section': return 276;
      case 'station': return 226;
      default: return 376;
    }
  };

  const getIconConfig = () => {
    switch (blockType) {
      case 'factory': 
        return { src: IMG1, width: 39, height: 39, showBorder: true };
      case 'workshop': 
        return { src: IMG2, width: 36, height: 33, showBorder: true };
      case 'section': 
        return { src: IMG3, width: 39, height: 39, showBorder: false };
      case 'station': 
        return { src: IMG4, width: 21, height: 31, showBorder: true };
      default: 
        return { src: IMG1, width: 39, height: 39, showBorder: true };
    }
  };

  const width = calculateWidth();
  const iconConfig = getIconConfig();

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddButtonClick) {
      onAddButtonClick(e, node);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isStation && onStationClick) {
      onStationClick(node as StationDTO);
    } else if (!isStation && onClick) {
      onClick();
    }
  };

  // Функция для подсветки текста темно-синим цветом
  const defaultHighlightText = (text: string, search: string): React.ReactNode => {
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

  const renderHighlightedText = highlightText || defaultHighlightText;

  // Безопасное получение строковых значений для станций
  const getStationText = (station: StationDTO, field: keyof StationDTO): string => {
    const value = station[field];
    return value !== undefined && value !== null ? String(value) : '';
  };

  // Определяем цвет фона в зависимости от поиска
  const getBackgroundColor = () => {
    if (searchQuery.trim()) {
      // Если есть поисковый запрос - светло-синий фон #C2D5FF
      return '#C2D5FF';
    }
    // Если нет поиска - белый фон
    return '#FFFFFF';
  };

  return (
    <div className="relative">
      {showHorizontalLine && (
        <>
          <div 
            className="absolute top-6 z-10"
            style={{
              left: '-25px',
              width: '40px',
              height: '1px',
              backgroundColor: '#3E4E77'
            }}
          />
          <div 
            className="absolute z-30 flex items-center justify-center"
            style={{
              left: '-4px',
              top: '20.5px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF'
            }}
          >
            <div 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#D9D9D9'
              }}
            />
          </div>
        </>
      )}
      
      <div
        onClick={handleClick}
        className="text-gray-800 rounded-lg shadow-md flex items-center relative z-20 font-roboto font-light hover:shadow-lg transition-shadow"
        style={{
          width: `${width}px`,
          height: '45px',
          cursor: 'pointer',
          marginRight: '80px',
          paddingLeft: '51px',
          paddingRight: '25px',
          fontSize: '17px',
          ...blockStyle,
          backgroundColor: getBackgroundColor(),
        }}
      >
        <div 
          className="absolute left-[7px] top-[3px] flex items-center justify-center"
          style={{
            width: '39px',
            height: '39px',
            borderRadius: iconConfig.showBorder ? '50%' : '0',
            border: iconConfig.showBorder ? '1px solid #C2D5FF' : 'none',
            backgroundColor: 'transparent'
          }}
        >
          <img 
            src={iconConfig.src} 
            alt={blockType}
            style={{
              width: `${iconConfig.width}px`,
              height: `${iconConfig.height}px`,
              objectFit: 'contain'
            }}
          />
        </div>
        
        {isStation ? (
          <div className="w-full">
            <div className="font-light text-sm leading-[15px] truncate" style={{ fontSize: '17px' }}>
              {renderHighlightedText(getStationText(node as StationDTO, 'stationName'), searchQuery)}
            </div>
            <div className="text-xs text-gray-600 leading-[15px] truncate">
              {renderHighlightedText(getStationText(node as StationDTO, 'modelNumber'), searchQuery)} • 
              {' '}
              {renderHighlightedText(getStationText(node as StationDTO, 'serialNumber'), searchQuery)}
            </div>
          </div>
        ) : (
          <div className="font-light leading-[45px] truncate w-full" style={{ fontSize: '17px' }}>
            {renderHighlightedText((node as LocationHierarchyDTO).locationName, searchQuery)}
          </div>
        )}

        {!isStation && (
          <AddButton 
            onClick={handleAddClick}
            type={blockType as 'factory' | 'workshop' | 'section'}
          />
        )}
      </div>
    </div>
  );
};

export default Block;
import React, { useState, useRef, useEffect } from 'react';
import LupaIcon from '../../../assets/Menu/lupa.svg';
import CloseIcon from '../../../assets/Menu/IMG6.svg';

interface SearchTreeProps {
  onSearch: (query: string) => void;
}

const SearchTree: React.FC<SearchTreeProps> = ({ onSearch }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      setSearchText('');
      onSearch('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchText('');
    onSearch('');
  };

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [isSearchActive]);

  return (
    <div 
      className="flex h-[72px] items-center relative overflow-hidden"
      style={{ backgroundColor: '#FFFFFF' }} // Весь блок теперь белый
    >
      {/* Синий блок шириной 23px */}
      <div 
        className="h-full flex-shrink-0" 
        style={{ 
          width: '23px', 
          backgroundColor: '#8EBDF3' 
        }} 
      />
      
      {/* Текст "Структура станций" - теперь цвет #5D5757 */}
      <div 
        className={`flex items-center transition-all duration-300 ml-[17px] ${
          isSearchActive ? 'opacity-0 translate-x-[-20px]' : 'opacity-100 translate-x-0'
        }`}
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: '25px',
          color: '#5D5757', // Серый цвет текста
          lineHeight: '1',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        Структура станций
      </div>
      
      {/* Окошко поиска - серенькое */}
      <div 
        className={`absolute flex items-center rounded-full px-4 overflow-hidden transition-all duration-300 ease-out ${
          isSearchActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          height: '40px',
          backgroundColor: '#F5F5F5', // Серый фон
          left: '40px', // 23px синий блок + 17px отступ
          right: '14px',
          top: '50%',
          transform: isSearchActive 
            ? 'translateY(-50%) scaleX(1)' 
            : 'translateY(-50%) scaleX(0)',
          transformOrigin: 'right center',
          width: 'calc(100% - 40px - 14px)',
        }}
      >
        <input
          ref={searchInputRef}
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Поиск по названию, модели, серийному номеру..."
          className="w-full bg-transparent border-none outline-none placeholder-gray-500 pr-20 min-w-0 transition-opacity duration-150"
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: '14px',
            color: '#5D5757', // Серый текст в поле ввода
            opacity: isSearchActive ? 1 : 0,
          }}
        />
      </div>
      
      {/* Иконка */}
      <div 
        className="absolute right-[23px] flex items-center justify-center cursor-pointer z-20 transition-transform duration-300 hover:scale-110"
        onClick={handleIconClick}
        title={isSearchActive ? "Закрыть поиск" : "Открыть поиск"}
        style={{
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        {isSearchActive ? (
          <img 
            src={CloseIcon} 
            alt="Закрыть поиск" 
            className="w-[25px] h-[25px]" 
          />
        ) : (
          <img 
            src={CloseIcon} 
            alt="Открыть поиск" 
            className="w-[25px] h-[25px]" 
          />
        )}
      </div>
    </div>
  );
};

export default SearchTree;
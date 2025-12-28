// SearchTree.tsx (обновляем для лучшего UX)
import React, { useState } from 'react';
import IMG6 from '../../../assets/Menu/IMG6.svg';

interface SearchTreeProps {
  onSearch: (query: string) => void;
}

const SearchTree: React.FC<SearchTreeProps> = ({ onSearch }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleIconClick = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      setSearchText(''); // Сброс текста поиска при активации
      onSearch(''); // Сброс поиска
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch(value); // Передаем значение поиска в родительский компонент
  };

  const handleClearSearch = () => {
    setSearchText('');
    onSearch('');
  };

  return (
    <div className="flex h-[72px] items-center relative">
      {/* Желтый блок - точно 23x72px */}
      <div 
        className="w-[23px] h-[72px] flex-shrink-0"
        style={{ backgroundColor: '#FFF200' }}
      />
      
      {/* Отступ 17px */}
      <div className="w-[17px] flex-shrink-0" />
      
      {/* Текст "Структура станций" - скрывается при активации поиска */}
      {!isSearchActive && (
        <div 
          className="flex items-center"
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: '25px',
            color: 'rgba(93, 87, 87, 0.64)',
            lineHeight: '1',
            fontWeight: 600,
          }}
        >
          Структура станций
        </div>
      )}
      
      {/* Окошко поиска - появляется при активации */}
      {isSearchActive && (
        <div 
          className="absolute flex items-center bg-gray-100 rounded-full px-4 animate-[fadeIn_0.3s_ease-out]"
          style={{
            height: '40px',
            // Отступ слева: 23px от желтого блока
            left: 'calc(17px + 23px)',
            // Отступ справа: 23px от правого края
            right: '14px',
          }}
        >
          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Поиск по названию, модели, серийному номеру..."
            className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 pr-20"
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '14px',
            }}
            autoFocus
          />
          
          {/* Кнопка очистки */}
          {searchText && (
            <button
              onClick={handleClearSearch}
              className="absolute right-10 text-gray-400 hover:text-gray-600"
              title="Очистить поиск"
            >
              ✕
            </button>
          )}
        </div>
      )}
      
      {/* Иконка IMG6 - всегда поверх всего */}
      <div 
        className="absolute right-[23px] flex items-center justify-center cursor-pointer z-20"
        onClick={handleIconClick}
        title={isSearchActive ? "Закрыть поиск" : "Открыть поиск"}
      >
        <img 
          src={IMG6} 
          alt="Иконка поиска" 
          className="w-[25px] h-[25px]" 
        />
      </div>
    </div>
  );
};

export default SearchTree;
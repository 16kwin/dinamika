import React from 'react';

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  isExpanded: boolean;
  isActive: boolean;
  isBlue: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  icon, 
  text, 
  isExpanded, 
  isActive,
  isBlue, 
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <div 
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Кнопка когда активна */}
      {isActive && (
        <button
          onClick={onClick}
          className={`
            absolute
            flex
            items-center
            transition-all
            duration-300
            cursor-pointer
            overflow-hidden
            h-[60px]
            bg-[#F5F7F9]
            ${isExpanded ? 'rounded-l-[15px]' : 'rounded-[15px]'}
            hover:transform
            hover:translate-y-[-2px]
            z-10
          `}
          style={{
            width: isExpanded ? 'calc(100% - 15px)' : '60px',
            marginLeft: isExpanded ? '15px' : '15px',
            marginRight: isExpanded ? '0' : '15px'
          }}
        >
          {/* Иконка */}
          <div className="flex items-center justify-center flex-shrink-0 w-[60px] h-[60px]">
            {icon}
          </div>

          {/* Текст */}
          <div className={`
            transition-all
            duration-300
            overflow-hidden
            whitespace-nowrap
            ${isExpanded ? 'opacity-100 w-auto pr-4' : 'opacity-0 w-0'}
            text-[#3E4E77] font-medium
          `}>
            {text}
          </div>

          {/* Эффект вырезанной кнопки - правые полукруги */}
          {isExpanded && (
            <>
              <div className="absolute top-[-20px] right-0 w-[20px] h-[20px] bg-[#3E4E77] rounded-br-full"></div>
              <div className="absolute bottom-[-20px] right-0 w-[20px] h-[20px] bg-[#3E4E77] rounded-tr-full"></div>
            </>
          )}
        </button>
      )}

      {/* Кнопка когда голубая */}
      {!isActive && isBlue && (
        <button
          onClick={onClick}
          className={`
            absolute
            flex
            items-center
            transition-all
            duration-300
            cursor-pointer
            overflow-hidden
            h-[60px]
            bg-[#C0C0D0]
            ${isExpanded ? 'rounded-l-[15px]' : 'rounded-[15px]'}
            hover:transform
            hover:translate-y-[-2px]
            z-10
          `}
          style={{
            width: isExpanded ? 'calc(100% - 15px)' : '60px',
            marginLeft: isExpanded ? '15px' : '15px',
            marginRight: isExpanded ? '0' : '15px'
          }}
        >
          {/* Иконка */}
          <div className="flex items-center justify-center flex-shrink-0 w-[60px] h-[60px]">
            {icon}
          </div>

          {/* Текст */}
          <div className={`
            transition-all
            duration-300
            overflow-hidden
            whitespace-nowrap
            ${isExpanded ? 'opacity-100 w-auto pr-4' : 'opacity-0 w-0'}
            text-[#3E4E77] font-medium
          `}>
            {text}
          </div>

          {/* Эффект вырезанной кнопки - правые полукруги */}
          {isExpanded && (
            <>
              <div className="absolute top-[-20px] right-0 w-[20px] h-[20px] bg-[#3E4E77] rounded-br-full"></div>
              <div className="absolute bottom-[-20px] right-0 w-[20px] h-[20px] bg-[#3E4E77] rounded-tr-full"></div>
            </>
          )}
        </button>
      )}

      {/* Кнопка когда неактивна и не голубая */}
      <button
        onClick={onClick}
        className={`
          relative
          flex
          items-center
          transition-all
          duration-300
          cursor-pointer
          overflow-hidden
          h-[60px]
          bg-transparent
          hover:transform
          hover:translate-y-[-2px]
          ${isActive || isBlue ? 'opacity-0' : 'opacity-100'}
        `}
        style={{
          width: isExpanded ? 'calc(100% - 15px)' : '60px',
          marginLeft: isExpanded ? '15px' : '15px',
          marginRight: isExpanded ? '0' : '15px'
        }}
      >
        {/* Иконка */}
        <div className="flex items-center justify-center flex-shrink-0 w-[60px] h-[60px]">
          {icon}
        </div>

        {/* Текст */}
        <div className={`
          transition-all
          duration-300
          overflow-hidden
          whitespace-nowrap
          ${isExpanded ? 'opacity-100 w-auto pr-4' : 'opacity-0 w-0'}
          text-white
        `}>
          {text}
        </div>
      </button>
    </div>
  );
};

export default MenuItem;
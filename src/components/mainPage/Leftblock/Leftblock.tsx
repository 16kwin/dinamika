import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuItem from './MenuItem';
import Logo from './Logo';

// Импорт всех иконок
import FirstIcon from '../../../assets/Menu/first.svg';
import FirstIcon2 from '../../../assets/Menu/first2.svg';
import SecondIcon from '../../../assets/Menu/second.svg';
import SecondIcon2 from '../../../assets/Menu/second2.svg';
import ThirdIcon from '../../../assets/Menu/third.svg';
import ThirdIcon2 from '../../../assets/Menu/third2.svg';
import FourIcon from '../../../assets/Menu/four.svg';
import FourIcon2 from '../../../assets/Menu/four2.svg';
import FiveIcon from '../../../assets/Menu/five.svg';
import FiveIcon2 from '../../../assets/Menu/five5.svg';
import SixIcon from '../../../assets/Menu/six.svg';
import SixIcon2 from '../../../assets/Menu/six2.svg';
import SevenIcon from '../../../assets/Menu/seven.svg';
import SevenIcon2 from '../../../assets/Menu/seven2.svg';

interface LeftBlockProps {
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const LeftBlock: React.FC<LeftBlockProps> = ({ isExpanded, onMouseEnter, onMouseLeave }) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string>('item1');

  // Массив кнопок с иконками, размерами и путями
  const menuItems = [
    { 
      id: 'item1', 
      text: 'Главная',
      activeIcon: FirstIcon,
      inactiveIcon: FirstIcon2,
      width: 36,
      height: 36,
      className: 'w-9 h-9',
      path: '/main'
    },
    { 
      id: 'item2', 
      text: 'Станции',
      activeIcon: SecondIcon,
      inactiveIcon: SecondIcon2,
      width: 30,
      height: 40,
      className: 'w-[30px] h-[40px]',
      path: '/stations'
    },
    { 
      id: 'item3', 
      text: 'Справочники',
      activeIcon: ThirdIcon,
      inactiveIcon: ThirdIcon2,
      width: 36,
      height: 36,
      className: 'w-9 h-9',
      path: '/references'
    },
    { 
      id: 'item4', 
      text: 'Документы',
      activeIcon: FourIcon,
      inactiveIcon: FourIcon2,
      width: 30,
      height: 40,
      className: 'w-[30px] h-[40px]',
      path: '/documents'
    },
    { 
      id: 'item5', 
      text: 'Отчеты',
      activeIcon: FiveIcon,
      inactiveIcon: FiveIcon2,
      width: 30,
      height: 40,
      className: 'w-[30px] h-[40px]',
      path: '/reports'
    },
    { 
      id: 'item6', 
      text: 'Аналитика',
      activeIcon: SixIcon,
      inactiveIcon: SixIcon2,
      width: 40,
      height: 32,
      className: 'w-[40px] h-[32px]',
      path: '/analytics'
    },
    { 
      id: 'item7', 
      text: 'Настройки',
      activeIcon: SevenIcon,
      inactiveIcon: SevenIcon2,
      width: 36,
      height: 36,
      className: 'w-9 h-9',
      path: '/settings'
    },
    { 
      id: 'item8', 
      text: 'Аккаунт',
      activeIcon: undefined,
      inactiveIcon: undefined,
      width: 36,
      height: 36,
      className: 'w-9 h-9',
      path: '/account'
    }
  ];

  // Обработчик клика по кнопке меню
  const handleMenuItemClick = (itemId: string, path: string) => {
    setActiveItem(itemId);
    navigate(path);
  };

  // Компонент иконки для MenuItem
  const MenuIcon = ({ itemId, isActive }: { itemId: string, isActive: boolean }) => {
    const item = menuItems.find(item => item.id === itemId);
    
    if (!item) return null;
    
    // Для последней кнопки - кружочек
    if (itemId === 'item8') {
      return (
        <div className="w-6 h-6 rounded-full bg-current"></div>
      );
    }
    
    // Для остальных кнопок - SVG иконки
    const iconSrc = isActive ? item.activeIcon : item.inactiveIcon;
    
    if (!iconSrc) return null;
    
    return (
      <img 
        src={iconSrc} 
        alt="icon" 
        className={item.className}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    );
  };

  return (
    <div 
      className={`h-[calc(100%-30px)] absolute left-[15px] top-[15px] z-10 transition-all duration-300 rounded-[5px] bg-[#3E4E77] flex flex-col ${
        isExpanded ? 'w-[290px]' : 'w-[110px]'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 1. Логотип */}
      <Logo isExpanded={isExpanded} />

      {/* 2. Значок 1 (отдельный) */}
      <div className="pt-[20px]">
        <MenuItem
          icon={<MenuIcon itemId="item1" isActive={activeItem === 'item1'} />}
          text={menuItems[0].text}
          isExpanded={isExpanded}
          isActive={activeItem === 'item1'}
          onClick={() => handleMenuItemClick('item1', menuItems[0].path)}
        />
      </div>

      {/* 3. Первая линия → Рабочий блок */}
      <div className={`${isExpanded ? 'pl-[25px] pr-4' : 'pl-[25px] pr-[25px]'} ${
        isExpanded ? 'pt-[8px]' : 'pt-[20px]'
      }`}>
        <div className="flex items-center">
          <div className={`h-px flex-grow bg-[#4A5D8A] ${
            isExpanded ? 'hidden' : 'block'
          }`} style={{ height: '2px' }}></div>
          <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap h-[16px] ${
            isExpanded ? 'opacity-100 w-auto text-gray-300 text-xs font-medium' : 'opacity-0 w-0'
          }`}>
            Рабочий блок
          </div>
        </div>
      </div>

      {/* 4. Три значка (группа 1) */}
      <div className={`flex flex-col ${
        isExpanded ? '' : 'pt-[15px]'
      }`}>
        {menuItems.slice(1, 4).map((item) => (
          <div key={item.id} className="py-[2px]">
            <MenuItem
              icon={<MenuIcon itemId={item.id} isActive={activeItem === item.id} />}
              text={item.text}
              isExpanded={isExpanded}
              isActive={activeItem === item.id}
              onClick={() => handleMenuItemClick(item.id, item.path)}
            />
          </div>
        ))}
      </div>

      {/* 5. Вторая линия → Аналитический блок */}
      <div className={`${isExpanded ? 'pl-[25px] pr-4' : 'pl-[25px] pr-[25px]'} pt-[10px] pb-[4px]`}>
        <div className="flex items-center">
          <div className={`h-px flex-grow bg-[#4A5D8A] ${
            isExpanded ? 'hidden' : 'block'
          }`} style={{ height: '2px' }}></div>
          <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap h-[16px] ${
            isExpanded ? 'opacity-100 w-auto text-gray-300 text-xs font-medium' : 'opacity-0 w-0'
          }`}>
            Аналитический блок
          </div>
        </div>
      </div>

      {/* 6. Два значка (группа 2) */}
      <div className={`flex flex-col ${
        isExpanded ? '' : 'pt-[15px]'
      }`}>
        {menuItems.slice(4, 6).map((item) => (
          <div key={item.id} className="py-[2px]">
            <MenuItem
              icon={<MenuIcon itemId={item.id} isActive={activeItem === item.id} />}
              text={item.text}
              isExpanded={isExpanded}
              isActive={activeItem === item.id}
              onClick={() => handleMenuItemClick(item.id, item.path)}
            />
          </div>
        ))}
      </div>

      {/* 7. Пропуск (отступ) */}
      <div className="flex-grow"></div>

      {/* 8. Значок 3 (отдельный) */}
      <div className="py-[2px]">
        <MenuItem
          icon={<MenuIcon itemId="item7" isActive={activeItem === 'item7'} />}
          text={menuItems[6].text}
          isExpanded={isExpanded}
          isActive={activeItem === 'item7'}
          onClick={() => handleMenuItemClick('item7', menuItems[6].path)}
        />
      </div>

      {/* 9. Третья линия → остается линией (без текста) */}
      <div className={`${isExpanded ? 'pl-[25px] pr-4' : 'pl-[25px] pr-[25px]'} pt-[10px] pb-[4px]`}>
        <div className="flex items-center">
          <div className="h-px flex-grow bg-[#4A5D8A]" style={{ height: '2px' }}></div>
          {/* Нет текста для третьей линии */}
          <div className="opacity-0 w-0"></div>
        </div>
      </div>

      {/* 10. Значок 4 (отдельный, внизу) */}
      <div className={`py-[2px] mb-2 ${
        isExpanded ? '' : 'pt-[15px]'
      }`}>
        <MenuItem
          icon={<MenuIcon itemId="item8" isActive={activeItem === 'item8'} />}
          text={menuItems[7].text}
          isExpanded={isExpanded}
          isActive={activeItem === 'item8'}
          onClick={() => handleMenuItemClick('item8', menuItems[7].path)}
        />
      </div>
    </div>
  );
};

export default LeftBlock;
import React, { useState, useEffect } from 'react';
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  // Обработчики наведения
  const handleMouseEnter = (itemId: string) => {
    setHoveredItem(itemId);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Сбрасываем hoveredItem при сворачивании
  useEffect(() => {
    if (!isExpanded) {
      setHoveredItem(null);
    }
  }, [isExpanded]);

  // Компонент иконки для MenuItem
  const MenuIcon = ({ itemId, isActive, isBlue }: { itemId: string, isActive: boolean, isBlue: boolean }) => {
    const item = menuItems.find(item => item.id === itemId);
    
    if (!item) return null;
    
    // Для последней кнопки - кружочек
    if (itemId === 'item8') {
      return (
        <div className="w-6 h-6 rounded-full bg-current"></div>
      );
    }
    
    // Для остальных кнопок - SVG иконки
    let iconSrc;
    if (isActive) {
      iconSrc = item.activeIcon; // Белая иконка для активной кнопки
    } else if (isBlue) {
      iconSrc = item.activeIcon; // Белая иконка для голубой кнопки
    } else {
      iconSrc = item.inactiveIcon; // Цветная иконка для неактивной
    }
    
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

  // Определяем, должна ли кнопка быть белой (активной)
  const shouldBeWhite = (itemId: string) => {
    return activeItem === itemId;
  };

  // Определяем, должна ли кнопка быть голубой
  const shouldBeBlue = (itemId: string) => {
    // Кнопка голубая если:
    // 1. Она наведена
    // 2. И она не активна
    // 3. И бокс развернут
    if (!isExpanded) return false;
    return hoveredItem === itemId && activeItem !== itemId;
  };

  return (
    <div 
      className={`h-[calc(100%-30px)] absolute left-[15px] top-[15px] z-10 transition-all duration-300 rounded-[25px] bg-[#3E4E77] flex flex-col overflow-hidden ${
        isExpanded ? 'w-[270px]' : 'w-[90px]'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 1. Логотип */}
      <div>
        <Logo 
          isExpanded={isExpanded}
          onClick={() => handleMenuItemClick('item1', '/main')}
          onMouseEnter={() => handleMouseEnter('item1')}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* 2. Отступ от логотипа до первой кнопки - 60px */}
      <div className="h-[40px]"></div>

      {/* 3. Первая кнопка - высота 60px */}
      <div className="h-[60px]">
        <MenuItem
          icon={<MenuIcon itemId="item1" isActive={shouldBeWhite('item1')} isBlue={shouldBeBlue('item1')} />}
          text={menuItems[0].text}
          isExpanded={isExpanded}
          isActive={shouldBeWhite('item1')}
          isBlue={shouldBeBlue('item1')}
          onClick={() => handleMenuItemClick('item1', menuItems[0].path)}
          onMouseEnter={() => handleMouseEnter('item1')}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* 4. От первой кнопки до линии - 51px */}
      <div className={isExpanded ? 'h-[43px]' : 'h-[51px]'}></div>

      {/* 5. Первая линия/текст */}
      <div>
        {isExpanded ? (
          // Текст "Рабочий блок" при развернутом состоянии
          <div className="h-[25px] pl-5 flex items-center">
            <div className="text-gray-300 text-xs font-medium whitespace-nowrap">
              Рабочий блок
            </div>
          </div>
        ) : (
          // Линия при свернутом состоянии
          <div className="h-[4px] ">
            <div className="h-full bg-[#4A5D8A]"></div>
          </div>
        )}
      </div>

      {/* 6. Отступ после первой линии/текста */}
      <div className={isExpanded ? 'h-[17px]' : 'h-[30px]'}></div>

      {/* 7. Три значка (группа 1) - каждый 60px высота, между ними 12px */}
      <div className="flex flex-col">
        {menuItems.slice(1, 4).map((item, index) => (
          <React.Fragment key={item.id}>
            {/* Кнопка */}
            <div className="h-[60px]">
              <MenuItem
                icon={<MenuIcon itemId={item.id} isActive={shouldBeWhite(item.id)} isBlue={shouldBeBlue(item.id)} />}
                text={item.text}
                isExpanded={isExpanded}
                isActive={shouldBeWhite(item.id)}
                isBlue={shouldBeBlue(item.id)}
                onClick={() => handleMenuItemClick(item.id, item.path)}
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
              />
            </div>
            {/* Отступ между кнопками (кроме последней) */}
            {index < 2 && <div className="h-[12px]"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* 8. От последней кнопки группы до второй линии/текста */}
      <div className={isExpanded ? 'h-[22px]' : 'h-[30px]'}></div>

      {/* 9. Вторая линия/текст */}
      <div >
        {isExpanded ? (
          // Текст "Аналитический блок" при развернутом состоянии
          <div className="h-[25px] pl-5 flex items-center">
            <div className="text-gray-300 text-xs font-medium whitespace-nowrap">
              Аналитический блок
            </div>
          </div>
        ) : (
          // Линия при свернутом состоянии
          <div className="h-[4px]">
            <div className="h-full bg-[#4A5D8A]"></div>
          </div>
        )}
      </div>

      {/* 10. Отступ после второй линии/текста */}
      <div className={isExpanded ? 'h-[17px]' : 'h-[30px]'}></div>

      {/* 11. Два значка (группа 2) - каждый 60px высота, между ними 12px */}
      <div className="flex flex-col">
        {menuItems.slice(4, 6).map((item, index) => (
          <React.Fragment key={item.id}>
            {/* Кнопка */}
            <div className="h-[60px]">
              <MenuItem
                icon={<MenuIcon itemId={item.id} isActive={shouldBeWhite(item.id)} isBlue={shouldBeBlue(item.id)} />}
                text={item.text}
                isExpanded={isExpanded}
                isActive={shouldBeWhite(item.id)}
                isBlue={shouldBeBlue(item.id)}
                onClick={() => handleMenuItemClick(item.id, item.path)}
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
              />
            </div>
            {/* Отступ между кнопками (кроме последней) */}
            {index < 1 && <div className="h-[12px]"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* 12. Пропуск (отступ) до нижних кнопок */}
      <div className="flex-grow"></div>

      {/* 13. Отступ от низа до кнопки настроек - 5px */}
      <div className="h-[5px]"></div>

      {/* 14. Значок настройки - высота 60px */}
      <div className="h-[60px]">
        <MenuItem
          icon={<MenuIcon itemId="item7" isActive={shouldBeWhite('item7')} isBlue={shouldBeBlue('item7')} />}
          text={menuItems[6].text}
          isExpanded={isExpanded}
          isActive={shouldBeWhite('item7')}
          isBlue={shouldBeBlue('item7')}
          onClick={() => handleMenuItemClick('item7', menuItems[6].path)}
          onMouseEnter={() => handleMouseEnter('item7')}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* 15. От кнопки настроек до линии - 10px */}
      <div className="h-[10px]"></div>

      {/* 16. Третья линия - высота 4px */}
      <div className={`h-[4px] `}>
        <div className="h-full bg-[#4A5D8A]"></div>
      </div>

      {/* 17. От линии до кнопки аккаунта - 5px */}
      <div className="h-[5px]"></div>

      {/* 18. Значок аккаунта - высота 60px */}
      <div className="h-[60px]">
        <MenuItem
          icon={<MenuIcon itemId="item8" isActive={shouldBeWhite('item8')} isBlue={shouldBeBlue('item8')} />}
          text={menuItems[7].text}
          isExpanded={isExpanded}
          isActive={shouldBeWhite('item8')}
          isBlue={shouldBeBlue('item8')}
          onClick={() => handleMenuItemClick('item8', menuItems[7].path)}
          onMouseEnter={() => handleMouseEnter('item8')}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      <div className="h-[5px]"></div>
    </div>
  );
};

export default LeftBlock;
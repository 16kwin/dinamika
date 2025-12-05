// FirstBlock.tsx
import React from 'react';
import FirstIcon from './FirstIcon';
import SecondIcon from './SecondIcon';
import ThirdIcon from './ThirdIcon';

const FirstBlock: React.FC = () => {
  return (
    <div className="relative w-full h-[70px]">
      {/* Основной серый фон блока */}
      <div className="absolute inset-0 bg-[#F5F7F9]"></div>
      
      {/* Контейнер для трех правых блоков */}
      <div className="absolute right-0 top-0 flex items-start">
        {/* Третий блок (самый левый) */}
        <ThirdIcon />
        
        {/* Отступ 3px между блоками */}
        <div className="w-[20px]"></div>
        
        {/* Первый блок */}
        <FirstIcon />
        
        {/* Отступ 3px между блоками */}
        <div className="w-[3px]"></div>
        
        {/* Второй блок */}
        <SecondIcon />
      </div>
    </div>
  );
};

export default FirstBlock;
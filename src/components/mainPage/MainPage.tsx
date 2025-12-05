// MainPage.tsx
import React from 'react';
import FirstBlock from './FirstBlock/FirstBlock';

const MainPage = () => {
  return (
    <div className="h-full bg-[#F5F7F9]">
      {/* Правая часть */}
      <div className="grid grid-rows-[70px_4px_40px_20px_150px_60px_1fr] gap-0 h-full">
        {/* Блок 1 (верхний) - БЕЗ отступа справа */}
        <FirstBlock />

        {/* Отступ между 1 и 2 блоком (4px) */}
        <div></div>

        {/* Блок 2 - с отступом справа 30px */}
        <div className="bg-gray-200 pr-[30px] rounded flex items-center justify-center">
          <span className="text-gray-600 font-medium">В разработке</span>
        </div>

        {/* Отступ между 2 и 3 блоком (20px) */}
        <div></div>

        {/* Блок 3 - с отступом справа 30px */}
        <div className="bg-gray-200 pr-[30px] rounded flex items-center justify-center">
          <span className="text-gray-600 font-medium">В разработке</span>
        </div>

        {/* Отступ после блока 3 (60px) */}
        <div></div>

        {/* Контейнер для блоков 4 и 5 - с отступом справа 30px */}
        <div className="flex gap-[30px] pr-[30px]">
          {/* Блок 4 (левый) - ширина 500px */}
          <div className="w-[500px] bg-gray-200 mb-[30px] rounded flex-shrink-0 flex items-center justify-center">
            <span className="text-gray-600 font-medium">В разработке</span>
          </div>
          
          {/* Блок 5 (правый) - занимает оставшееся пространство */}
          <div className="flex-grow bg-gray-200 mb-[30px] rounded flex items-center justify-center">
            <span className="text-gray-600 font-medium">В разработке</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
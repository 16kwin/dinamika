import React, { useState } from 'react';
import SecondBlock from './SecondBlock/SecondBlock';

const MainPage = () => {
  const [isBlock3Visible, setIsBlock3Visible] = useState(true);

  const toggleBlock3 = () => {
    setIsBlock3Visible(!isBlock3Visible);
  };

  return (
    <div className="h-full bg-[#F5F7F9]">
      <div className={`grid ${isBlock3Visible ? 'grid-rows-[4px_40px_20px_150px_60px_1fr_30px]' : 'grid-rows-[4px_40px_0px_0px_0px_1fr_30px]'} gap-0 h-full pt-4 transition-all duration-300`}>
        {/* Отступ между 1 и 2 блоком (4px) */}
        <div></div>

        {/* Блок 2 - кнопка-текст */}
        <div className="pl-4">
          <div 
            className="inline-flex items-center gap-2 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
            onClick={toggleBlock3}
          >
            <span className="font-medium">Показатели</span>
            <span className="transition-transform duration-300">
              {isBlock3Visible ? '▼' : '▲'}
            </span>
          </div>
        </div>

        {/* Отступ между 2 и 3 блоком (20px) */}
        <div className={`overflow-hidden transition-all duration-300 ${isBlock3Visible ? 'h-[20px]' : 'h-0'}`}></div>

        {/* Блок 3 */}
        <div className={`overflow-hidden transition-all duration-300 ${isBlock3Visible ? 'h-[150px] opacity-100 pr-[30px]' : 'h-0 opacity-0 pr-[30px]'}`}>
          <div className="bg-gray-200 rounded flex items-center justify-center h-full">
            <span className="text-gray-600 font-medium">В разработке</span>
          </div>
        </div>

        {/* Отступ после блока 3 (60px) */}
        <div className={`overflow-hidden transition-all duration-300 ${isBlock3Visible ? 'h-[60px]' : 'h-0'}`}></div>

        {/* Контейнер для блоков 4 и 5 */}
        <div className="flex gap-[30px] pr-[30px] h-full min-h-0">
          {/* Блок 4 (левый) - ширина 500px */}
          <div className="w-[500px] flex-shrink-0">
            <SecondBlock />
          </div>
          
          {/* Блок 5 (правый) - занимает оставшееся пространство */}
          <div className="flex-grow bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-600 font-medium">В разработке</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
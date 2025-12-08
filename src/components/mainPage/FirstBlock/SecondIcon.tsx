// SecondIcon.tsx
import React, { useState } from 'react';
import Image4 from '../../../assets/Menu/image4.svg';

const SecondIcon: React.FC = () => {
  const [isToggled, setIsToggled] = useState<boolean>(false);

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  return (
    <div 
      className="w-[111px] h-[60px] relative"
      style={{ backgroundColor: '#3E4E77' }}
    >
      {/* Иконка */}
      <div
        className="absolute"
        style={{
          left: '19px',
          top: '14px',
          width: '31px',
          height: '30px'
        }}
      >
        <img 
          src={Image4} 
          alt="icon"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Переключатель */}
      <button
        onClick={handleToggle}
        className="absolute cursor-pointer focus:outline-none transition-all duration-300"
        style={{
          right: '12px',
          top: '21px',
          width: '38px',
          height: '16px',
          backgroundColor: '#F5F7F9',
          borderRadius: '8px'
        }}
      >
        {/* Круг-переключатель */}
        <div
          className="absolute top-0 transition-all duration-300"
          style={{
            left: isToggled ? 'calc(38px - 16px)' : '0',
            width: '16px',
            height: '16px',
            backgroundColor: '#8E8A8A',
            borderRadius: '8px'
          }}
        />
      </button>
    </div>
  );
};

export default SecondIcon;
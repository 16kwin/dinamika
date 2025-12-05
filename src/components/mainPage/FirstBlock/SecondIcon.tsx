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
      className="w-[130px] h-[70px] rounded-bl-[25px] relative"
      style={{ backgroundColor: '#3E4E77' }}
    >
      {/* Иконка */}
      <div
        className="absolute"
        style={{
          left: '22px',
          top: '16px',
          width: '36px',
          height: '34px'
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
          right: '14px',
          top: '25px',
          width: '45px',
          height: '19px',
          backgroundColor: '#F5F7F9',
          borderRadius: '9.5px'
        }}
      >
        {/* Круг-переключатель */}
        <div
          className="absolute top-0 transition-all duration-300"
          style={{
            left: isToggled ? 'calc(45px - 19px)' : '0',
            width: '19px',
            height: '19px',
            backgroundColor: '#8E8A8A',
            borderRadius: '9.5px'
          }}
        />
      </button>
    </div>
  );
};

export default SecondIcon;
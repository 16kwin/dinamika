// ThirdIcon.tsx
import React from 'react';
import Image5 from '../../../assets/Menu/image5.svg';
const ThirdIcon: React.FC = () => {
  return (
    <div 
      className="absolute"
      style={{
        width: '305px',
        height: '40px',
        top: '13px',
        right: '310px', // сохраняем отступ от правого края// скругление только снизу
      }}
    > <img 
          src={Image5} 
          alt="icon"
          className="w-full h-full object-contain"
        /></div>
  );
};

export default ThirdIcon;
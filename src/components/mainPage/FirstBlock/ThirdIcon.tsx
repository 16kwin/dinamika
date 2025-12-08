// ThirdIcon.tsx
import React from 'react';
import Image5 from '../../../assets/Menu/image.svg';
const ThirdIcon: React.FC = () => {
  return (
    <div 
      className="absolute"
      style={{
        width: '260px',
        height: '34px',
        top: '11px',
        right: '264px', // сохраняем отступ от правого края// скругление только снизу
      }}
    > <img 
          src={Image5} 
          alt="icon"
          className="w-full h-full object-contain"
        /></div>
  );
};

export default ThirdIcon;
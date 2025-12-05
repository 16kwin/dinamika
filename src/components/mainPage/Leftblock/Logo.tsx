import React from 'react';
import LogoIcon from '../../../assets/Menu/logo.png';

interface LogoProps {
  isExpanded: boolean;
}

const Logo: React.FC<LogoProps> = ({ isExpanded }) => {
  return (
    <div className={`pt-[60px] ${isExpanded ? 'pl-[25px] pr-4' : 'pl-[25px] pr-[25px]'} pb-4`}>
      <div className="flex items-end h-[52px]">
        <div className="flex items-center justify-center flex-shrink-0">
          <img src={LogoIcon} alt="Logo" className="w-[60px] h-[52px]" />
        </div>
        
        <div className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
        }`}>
          <div className="flex flex-col w-[168px]">
            {/* Верхняя строка: ДИНАМИКА */}
            <div 
              className="text-white font-black mb-[2px]"
              style={{ 
                fontFamily: 'Roboto, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
                letterSpacing: '0.18em',
                width: '168px',
                whiteSpace: 'nowrap'
              }}
            >
              ДИНАМИКА
            </div>
            
            {/* Нижняя строка: ПРОМЫШЛЕННЫЕ СИСТЕМЫ */}
            <div 
              className="text-white font-black"
              style={{ 
                fontFamily: 'Roboto, sans-serif',
                fontSize: '9px',
                lineHeight: '12px',
                letterSpacing: '0em',
                width: '168px',
                whiteSpace: 'nowrap'
              }}
            >
              ПРОМЫШЛЕННЫЕ СИСТЕМЫ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logo;
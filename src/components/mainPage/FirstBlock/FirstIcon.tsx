// FirstIcon.tsx
import React, { useState } from 'react';
import NotificationPopup from './NotificationPopup';
import Popup2 from './Popup2'; // Новый попап
import Image1 from '../../../assets/Menu/image1.svg';
import Image2 from '../../../assets/Menu/image2.svg';
import Image3 from '../../../assets/Menu/image3.svg';

const FirstIcon: React.FC = () => {
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);
  const [showPopup1, setShowPopup1] = useState<boolean>(false);
  const [showPopup2, setShowPopup2] = useState<boolean>(false);

  const handleIcon1Click = () => {
    setShowPopup1(!showPopup1);
    setShowPopup2(false);
  };

  const handleIcon2Click = () => {
    setShowPopup2(!showPopup2);
    setShowPopup1(false);
  };

  const handleToggleNotifications = () => {
    setHasNotifications(!hasNotifications);
    setShowPopup1(false);
  };

  return (
    <div 
      className="w-[157px] h-[70px] rounded-b-[25px] relative"
      style={{ backgroundColor: '#3E4E77' }}
    >
      {/* Первая кнопка с иконкой (уведомления) */}
      <button
        onClick={handleIcon1Click}
        className="absolute cursor-pointer focus:outline-none"
        style={{
          left: '28px',
          top: '17px',
          width: '30px',
          height: '36px'
        }}
      >
        <img 
          src={hasNotifications ? Image1 : Image2} 
          alt="notifications"
          className="w-full h-full object-contain"
        />
      </button>

      {/* Вторая кнопка с иконкой */}
      <button
        onClick={handleIcon2Click}
        className="absolute cursor-pointer focus:outline-none"
        style={{
          left: '93px', // 28px + 30px + 35px
          top: '16px',
          width: '36px',
          height: '36px'
        }}
      >
        <img 
          src={Image3} 
          alt="menu"
          className="w-full h-full object-contain"
        />
      </button>

      {/* Попап 1 (уведомления) */}
      {showPopup1 && (
        <NotificationPopup
          hasNotifications={hasNotifications}
          onToggle={handleToggleNotifications}
          onClose={() => setShowPopup1(false)}
        />
      )}

      {/* Попап 2 */}
      {showPopup2 && (
        <Popup2 onClose={() => setShowPopup2(false)} />
      )}
    </div>
  );
};

export default FirstIcon;
import React from 'react';
import IMG5 from '../../../assets/Menu/IMG5.svg';

interface AddButtonProps {
  onClick: (e: React.MouseEvent) => void;
  type: 'factory' | 'workshop' | 'section';
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, type }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-[15px] flex items-center justify-center hover:opacity-80 transition-opacity"
      style={{
        width: '20px',
        height: '20px',
        marginTop: '13px',
        marginBottom: '12px'
      }}
      title={`Добавить в ${type === 'factory' ? 'завод' : type === 'workshop' ? 'цех' : 'участок'}`}
    >
      <img 
        src={IMG5} 
        alt="Добавить" 
        className="w-[20px] h-[20px]" 
      />
    </button>
  );
};

export default AddButton;
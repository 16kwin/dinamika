// src/contexts/DragContext.tsx
import React, { createContext, useContext, useState} from 'react';
import type {ReactNode} from 'react'

export type DragData = {
  stationId: number;
  stationName: string;
  source: 'tree' | 'photo';
  originalX?: number;
  originalY?: number;
};

interface DragContextType {
  dragData: DragData | null;
  setDragData: (data: DragData | null) => void;
  clearDragData: () => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export const DragProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dragData, setDragData] = useState<DragData | null>(null);

  const clearDragData = () => {
    console.log('🧹 Drag данные очищены (контекст)');
    setDragData(null);
  };

  return (
    <DragContext.Provider value={{ dragData, setDragData, clearDragData }}>
      {children}
    </DragContext.Provider>
  );
};

export const useDrag = (): DragContextType => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDrag must be used within DragProvider');
  }
  return context;
};
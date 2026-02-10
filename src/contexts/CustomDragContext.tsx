// src/contexts/CustomDragContext.tsx
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

type CustomDragData = {
  stationId: number;
  stationName: string;
  source: 'tree' | 'photo';
  elementRect?: DOMRect;
};

type CustomDragContextType = {
  isDragging: boolean;
  dragData: CustomDragData | null;
  startDrag: (data: CustomDragData, e: React.MouseEvent) => void;
  endDrag: () => void;
  cleanup: () => void;
  isOverDropZone: boolean;
  dropPosition: { x: number; y: number } | null;
  setOverDropZone: (isOver: boolean) => void;
  setDropPosition: (pos: { x: number; y: number } | null) => void;
  registerDropHandler: (handler: (data: CustomDragData, x: number, y: number) => Promise<void>) => void;
};

const CustomDragContext = createContext<CustomDragContextType | undefined>(undefined);

export const useCustomDrag = () => {
  const context = useContext(CustomDragContext);
  if (!context) {
    throw new Error('useCustomDrag must be used within CustomDragProvider');
  }
  return context;
};

interface CustomDragProviderProps {
  children: React.ReactNode;
}

export const CustomDragProvider: React.FC<CustomDragProviderProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState<CustomDragData | null>(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);
  
  const ghostImageRef = useRef<HTMLImageElement | null>(null);
  const dropHandlerRef = useRef<((data: CustomDragData, x: number, y: number) => Promise<void>) | null>(null);

  // Путь к иконке станции
  const stationIconPath = '/src/assets/Menu/IMG4.svg';

  const setOverDropZone = (isOver: boolean) => {
    setIsOverDropZone(isOver);
  };

  const registerDropHandler = (handler: (data: CustomDragData, x: number, y: number) => Promise<void>) => {
    dropHandlerRef.current = handler;
  };

  const cleanup = () => {
    if (ghostImageRef.current && document.body.contains(ghostImageRef.current)) {
      document.body.removeChild(ghostImageRef.current);
      ghostImageRef.current = null;
    }
    setIsDragging(false);
    setDragData(null);
    setIsOverDropZone(false);
    setDropPosition(null);
  };

  const startDrag = (data: CustomDragData, e: React.MouseEvent) => {
    console.log('🎯 Кастомный drag начат:', data);
    
    cleanup();
    
    // Создаем ghost элемент - ПРОСТУЮ ИКОНКУ, как при перетаскивании с фото
    const ghost = document.createElement('img');
    ghost.src = stationIconPath;
    ghost.className = 'custom-drag-ghost';
    
    // Стиль как при стандартном drag с фото
    ghost.style.cssText = `
      position: fixed !important;
      width: 21px !important;
      height: 31px !important;
      pointer-events: none !important;
      z-index: 999999 !important;
      left: ${e.clientX}px !important;
      top: ${e.clientY}px !important;
      opacity: 0.7 !important;
      cursor: grabbing !important;
      transition: none !important;
      filter: none !important;
      border: none !important;
      background: none !important;
      box-shadow: none !important;
      transform: translate(-50%, -50%) !important;
    `;
    
    document.body.appendChild(ghost);
    ghostImageRef.current = ghost;
    
    setIsDragging(true);
    setDragData(data);
    
    // Глобальные обработчики для отслеживания мыши
    const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
      if (ghostImageRef.current) {
        const x = moveEvent.clientX;
        const y = moveEvent.clientY;
        
        // Обновляем позицию ghost
        ghostImageRef.current.style.left = `${x}px`;
        ghostImageRef.current.style.top = `${y}px`;
        
        // Проверяем, находимся ли над drop зоной
        const dropZones = document.querySelectorAll('[data-drop-zone="true"]');
        let isOverAnyZone = false;
        
        dropZones.forEach((zone) => {
          const rect = zone.getBoundingClientRect();
          const isOver = x >= rect.left && x <= rect.right && 
                        y >= rect.top && y <= rect.bottom;
          
          if (isOver) {
            isOverAnyZone = true;
            const relativeX = x - rect.left;
            const relativeY = y - rect.top;
            setDropPosition({ x: relativeX, y: relativeY });
            
            // Добавляем визуальную обратную связь для drop зоны
            zone.classList.add('drag-over');
          } else {
            zone.classList.remove('drag-over');
          }
        });
        
        setIsOverDropZone(isOverAnyZone);
        if (!isOverAnyZone) {
          setDropPosition(null);
        }
      }
    };

    const handleGlobalMouseUp = async (upEvent: MouseEvent) => {
      console.log('🏁 Кастомный drag завершен (mouseup)');
      
      // Если есть drop зона и мы над ней
      if (isOverDropZone && dropPosition && dragData && dropHandlerRef.current) {
        try {
          console.log('📍 Выполняем drop:', { dragData, dropPosition });
          await dropHandlerRef.current(dragData, dropPosition.x, dropPosition.y);
        } catch (error) {
          console.error('❌ Ошибка при drop:', error);
        }
      }
      
      // Убираем классы с drop зон
      document.querySelectorAll('[data-drop-zone="true"]').forEach(zone => {
        zone.classList.remove('drag-over');
      });
      
      // Удаляем обработчики
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      
      // Очищаем ghost
      setTimeout(() => {
        cleanup();
      }, 50);
    };

    // Добавляем обработчики
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp, { once: true });
  };

  const endDrag = () => {
    console.log('🏁 Кастомный drag завершен (вызов endDrag)');
    cleanup();
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return (
    <CustomDragContext.Provider
      value={{
        isDragging,
        dragData,
        startDrag,
        endDrag,
        cleanup,
        isOverDropZone,
        dropPosition,
        setOverDropZone,
        setDropPosition,
        registerDropHandler
      }}
    >
      {children}
      <style>{`
        .drag-over {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -2px;
          background-color: rgba(59, 130, 246, 0.05) !important;
        }
      `}</style>
    </CustomDragContext.Provider>
  );
};
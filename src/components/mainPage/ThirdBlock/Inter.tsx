import React, { useState, useEffect, useRef, useCallback } from 'react';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import type { AxiosError } from 'axios';
import type { LocationHierarchyDTO, StationDTO } from '../SecondBlock/SecondBlock';
import StationMnemoTooltip from './StationMnemoTooltip';
import { useDrag } from '../../../contexts/DragContext';
import { useCustomDrag } from '../../../contexts/CustomDragContext';

// Импорт иконок
import stationIcon from '../../../assets/Menu/IMG4.svg';
import IMG7 from '../../../assets/Menu/IMG7.svg';
import IMG8 from '../../../assets/Menu/IMG8.svg';
import IMG9 from '../../../assets/Menu/IMG9.svg';

type StationPositionDTO = {
  stationId: number;
  locationId: number;
  coordX: number;
  coordY: number;
};

type LocationPhotoDTO = {
  photoFileName: string | null;
  photoFilePath: string | null;
  photoFileExtension: string | null;
  photoUrl: string | null;
  stations: StationPositionDTO[] | null;
};

type DragData = {
  stationId: number;
  stationName: string;
  source: 'tree' | 'photo';
  originalX?: number;
  originalY?: number;
};

interface InterProps {
  selectedLocationId: number | null;
  selectedLocationName: string | null;
  selectedLocationLevel: number | null;
  onStationHover?: (station: StationDTO | null) => void;
  onStationSelect?: (station: StationDTO | null) => void;
  hoveredStation?: StationDTO | null;
  hierarchy?: LocationHierarchyDTO | null;
}

const Inter: React.FC<InterProps> = ({ 
  selectedLocationId, 
  selectedLocationName,
  selectedLocationLevel,
  onStationHover,
  onStationSelect,
  hoveredStation,
  hierarchy
}) => {
  const [photoInfo, setPhotoInfo] = useState<LocationPhotoDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoDimensions, setPhotoDimensions] = useState({ width: 0, height: 0 });
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragData, setDragData] = useState<DragData | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{x: number, y: number} | null>(null);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [customDropPosition, setCustomDropPosition] = useState<{x: number, y: number} | null>(null);
  const [isCustomDraggingOver, setIsCustomDraggingOver] = useState(false);
  
  const [selectedStationForTooltip, setSelectedStationForTooltip] = useState<StationDTO | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [stationPath, setStationPath] = useState<string>('');
  const [stationInfoModalOpen, setStationInfoModalOpen] = useState(false);
  const [stationsOnCurrentPhoto, setStationsOnCurrentPhoto] = useState<Set<number>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const stationRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const { dragData: contextDragData, clearDragData } = useDrag();
  const { isDragging: isCustomDragging, dragData: customDragData, endDrag } = useCustomDrag();

  // Эффект для обработки кастомного drag-and-drop
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isCustomDragging && customDragData) {
        // Проверяем, находимся ли мы над контейнером фото
        const container = photoContainerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const x = e.clientX;
          const y = e.clientY;
          const isOverContainer = x >= rect.left && x <= rect.right && 
                                 y >= rect.top && y <= rect.bottom;
          
          if (isOverContainer) {
            setIsCustomDraggingOver(true);
            const relativeX = x - rect.left;
            const relativeY = y - rect.top;
            setCustomDropPosition({
              x: Math.max(0, Math.min(relativeX, rect.width)),
              y: Math.max(0, Math.min(relativeY, rect.height))
            });
          } else {
            setIsCustomDraggingOver(false);
            setCustomDropPosition(null);
          }
        }
      }
    };

    const handleGlobalMouseUp = async (e: MouseEvent) => {
      if (isCustomDragging && customDragData && selectedLocationId) {
        console.log('🎯 Кастомный drop событие мыши:', { 
          customDragData, 
          selectedLocationId,
          clientX: e.clientX,
          clientY: e.clientY
        });
        
        const container = photoContainerRef.current;
        if (container && isCustomDraggingOver && customDropPosition) {
          const x = customDropPosition.x;
          const y = customDropPosition.y;
          
          await handleCustomDrop(customDragData, x, y);
        }
        
        // Завершаем drag
        endDrag();
        setIsCustomDraggingOver(false);
        setCustomDropPosition(null);
      }
    };

    if (isCustomDragging) {
      console.log('🔄 Кастомный drag активен, добавляем глобальные обработчики');
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isCustomDragging, customDragData, customDropPosition, selectedLocationId, isCustomDraggingOver]);

  const getLocationPhoto = async (locationId: number): Promise<LocationPhotoDTO | null> => {
    try {
      const response = await AxiosService.get(ConstantInfo.restApiGetLocationPhoto(locationId));
      
      if (response.status === 204 || response.status === 404) {
        return null;
      }
      
      return response.data;
      
    } catch (err) {
      const axiosError = err as AxiosError;
      
      if (axiosError.response?.status === 204 || axiosError.response?.status === 404) {
        return null;
      }
      
      console.error('Ошибка при получении фото локации:', axiosError);
      return null;
    }
  };

  const uploadLocationPhoto = async (locationId: number, file: File): Promise<LocationPhotoDTO> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await AxiosService.post(
        ConstantInfo.restApiUploadLocationPhoto(locationId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        }
      );
      
      return response.data;
      
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Ошибка при загрузке фото:', axiosError);
      throw axiosError;
    }
  };

  const deleteLocationPhoto = async (locationId: number): Promise<void> => {
    try {
      await AxiosService.delete(ConstantInfo.restApiDeleteLocationPhoto(locationId));
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Ошибка при удалении фото:', axiosError);
      throw axiosError;
    }
  };

  const downloadLocationPhoto = async () => {
    if (!photoInfo?.photoUrl) {
      setError('Нет фото для скачивания');
      return;
    }
    
    try {
      const response = await fetch(photoInfo.photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photoInfo.photoFileName || 'location_photo';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Ошибка при скачивании фото:', err);
      setError('Ошибка при скачивании фото');
    }
  };

  const saveStationPosition = async (stationId: number, locationId: number, coordX: number, coordY: number) => {
    try {
      console.log('💾 Сохранение позиции станции на бэкенд:', {
        stationId,
        locationId,
        coordX,
        coordY
      });
      
      const payload = {
        stationId: stationId,
        locationId: locationId,
        coordX: Math.round(coordX),
        coordY: Math.round(coordY)
      };
      
      const response = await AxiosService.post(ConstantInfo.restApiCreateOrUpdateStationPosition, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Позиция сохранена на бэкенд:', response.data);
      return response.data;
      
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('❌ Ошибка при сохранении позиции на бэкенд:', axiosError);
      
      if (axiosError.response?.data) {
        throw new Error(axiosError.response.data.message || 'Ошибка при сохранении позиции');
      }
      throw axiosError;
    }
  };

  const deleteStationPosition = async (stationId: number, locationId: number) => {
    try {
      console.log('🗑️ Удаление позиции с бэкенда:', { stationId, locationId });
      await AxiosService.delete(ConstantInfo.restApiDeleteStationPosition(stationId, locationId));
      console.log(`✅ Позиция станции ${stationId} на локации ${locationId} удалена с бэкенда`);
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Ошибка при удалении позиции станции:', axiosError);
      throw axiosError;
    }
  };

  const getFullPhotoUrl = (photoDTO: LocationPhotoDTO): string | null => {
    if (!photoDTO.photoFileName || !photoDTO.photoFilePath) {
      return null;
    }
    
    return ConstantInfo.getLocationPhotoUrl(photoDTO.photoFilePath, photoDTO.photoFileName);
  };

  useEffect(() => {
    if (selectedLocationId) {
      loadPhotoInfo(selectedLocationId);
      setShowEditOptions(false);
    } else {
      setPhotoInfo(null);
      setDragData(null);
      setGhostPosition(null);
      setSelectedStationForTooltip(null);
      setError(null);
      setStationsOnCurrentPhoto(new Set());
      setShowEditOptions(false);
      setIsCustomDraggingOver(false);
      setCustomDropPosition(null);
    }
  }, [selectedLocationId]);

  const loadPhotoInfo = async (locationId: number) => {
    setLoading(true);
    setError(null);
    try {
      const photo = await getLocationPhoto(locationId);
      setPhotoInfo(photo);
      
      if (photo?.stations) {
        const stationIds = new Set(photo.stations.map(s => s.stationId));
        setStationsOnCurrentPhoto(stationIds);
        console.log('📸 Загружены станции на фото:', Array.from(stationIds));
      } else {
        setStationsOnCurrentPhoto(new Set());
      }
    } catch (err) {
      console.error('Ошибка при загрузке информации:', err);
      setError('Ошибка загрузки информации о фото');
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setPhotoDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    console.log('📐 Размеры фото:', img.naturalWidth, 'x', img.naturalHeight);
  };

  const getStationPositionStyle = (station: StationPositionDTO): React.CSSProperties => {
    if (photoDimensions.width === 0 || photoDimensions.height === 0) {
      return { display: 'none' };
    }

    const containerWidth = 1050;
    const containerHeight = 436;

    const scaleX = containerWidth / photoDimensions.width;
    const scaleY = containerHeight / photoDimensions.height;

    const x = (station.coordX * scaleX) - 10.5;
    const y = (station.coordY * scaleY) - 15.5;

    return {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: '21px',
      height: '31px',
      cursor: 'pointer',
      zIndex: 10,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      userSelect: 'none',
      pointerEvents: 'auto'
    };
  };

  const isStationAlreadyOnThisPhoto = (stationId: number): boolean => {
    return stationsOnCurrentPhoto.has(stationId);
  };

  const getStationById = (stationId: number): StationDTO | null => {
    if (!hierarchy) {
      return null;
    }
    
    const findStationRecursive = (node: LocationHierarchyDTO): StationDTO | null => {
      if (node.stations) {
        for (const station of node.stations) {
          if (station.uid && station.uid === stationId) {
            return station;
          }
        }
      }
      
      if (node.childLocations) {
        for (const child of node.childLocations) {
          const found = findStationRecursive(child);
          if (found) return found;
        }
      }
      
      return null;
    };
    
    return findStationRecursive(hierarchy);
  };

  const findStationPath = (stationId: number): string => {
    if (!hierarchy) return '';
    
    const findPathRecursive = (
      node: LocationHierarchyDTO, 
      path: string[]
    ): string[] | null => {
      const hasStation = (node.stations || []).some(s => s.uid === stationId);
      
      if (hasStation) {
        if (node.level === 1) {
          return [...path];
        } else {
          return [...path, node.locationName];
        }
      }
      
      for (const child of node.childLocations || []) {
        const childPath = findPathRecursive(child, node.level === 1 ? [] : [...path, node.locationName]);
        if (childPath) {
          return childPath;
        }
      }
      
      return null;
    };
    
    const path = findPathRecursive(hierarchy, []);
    return path ? path.join(' → ') : '';
  };

  const handleStationClick = (station: StationPositionDTO, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const stationData = getStationById(station.stationId);
    if (!stationData) return;
    
    if (selectedStationForTooltip?.uid === stationData.uid) {
      closeTooltip();
      return;
    }
    
    const stationElement = stationRefs.current.get(station.stationId);
    if (stationElement) {
      const rect = stationElement.getBoundingClientRect();
      const containerRect = photoContainerRef.current?.getBoundingClientRect();
      
      if (containerRect) {
        const leftPosition = rect.left + rect.width / 2;
        const topPosition = rect.bottom + 10;
        
        setTooltipPosition({
          top: topPosition,
          left: leftPosition
        });
        
        const path = findStationPath(stationData.uid);
        setStationPath(path);
        
        setSelectedStationForTooltip(stationData);
        
        if (onStationSelect) {
          onStationSelect(stationData);
        }
      }
    }
  };

  const handleStationMouseEnter = (station: StationPositionDTO) => {
    const stationData = getStationById(station.stationId);
    if (stationData && onStationHover) {
      onStationHover(stationData);
    }
  };

  const handleStationMouseLeave = () => {
    if (onStationHover) {
      onStationHover(null);
    }
  };

  const closeTooltip = () => {
    setSelectedStationForTooltip(null);
    setStationPath('');
    if (onStationSelect) {
      onStationSelect(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedStationForTooltip) {
        const tooltipElement = document.querySelector('.station-tooltip');
        const stationElements = Array.from(stationRefs.current.values());
        
        const isClickInsideTooltip = tooltipElement?.contains(event.target as Node);
        const isClickInsideStation = stationElements.some(el => 
          el.contains(event.target as Node)
        );
        
        if (!isClickInsideTooltip && !isClickInsideStation) {
          closeTooltip();
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedStationForTooltip]);

  const isStationHovered = (station: StationPositionDTO): boolean => {
    if (!hoveredStation) return false;
    
    const stationData = getStationById(station.stationId);
    if (!stationData) return false;
    
    return (stationData.uid === hoveredStation.uid);
  };

  const getHoveredStationStyle = (): React.CSSProperties => {
    return {
      transform: 'translateY(-8px) scale(1.15)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      zIndex: 15,
      filter: 'drop-shadow(0 4px 8px rgba(255, 165, 0, 0.3))'
    };
  };

  const getSelectedStationStyle = (): React.CSSProperties => {
    return {
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
      zIndex: 12
    };
  };

  const handleStationDragStart = (e: React.DragEvent<HTMLDivElement>, station: StationPositionDTO, stationName: string) => {
    const data: DragData = {
      stationId: station.stationId,
      stationName: stationName,
      source: 'photo',
      originalX: station.coordX,
      originalY: station.coordY
    };
    
    console.log('📤 Начало перетаскивания с фото:', data);
    
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
    
    const dragImage = new Image();
    dragImage.src = stationIcon;
    e.dataTransfer.setDragImage(dragImage, 15, 15);
    
    setDragData(data);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = photoContainerRef.current?.getBoundingClientRect();
    if (containerRect) {
      const x = rect.left + rect.width / 2 - containerRect.left;
      const y = rect.top + rect.height / 2 - containerRect.top;
      setGhostPosition({ x, y });
    }
  };

  const handlePhotoDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    
    const rect = photoContainerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setGhostPosition({ x, y });
    }
  };

  const handlePhotoDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handlePhotoDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const calculateOriginalCoordinates = (x: number, y: number): { coordX: number, coordY: number } => {
    let coordX = Math.round(x);
    let coordY = Math.round(y);
    
    if (photoDimensions.width > 0 && photoDimensions.height > 0) {
      const scaleX = photoDimensions.width / 1050;
      const scaleY = photoDimensions.height / 436;
      
      coordX = Math.round(x * scaleX);
      coordY = Math.round(y * scaleY);
      
      console.log('📐 Преобразованные координаты:', {
        containerX: x,
        containerY: y,
        originalX: coordX,
        originalY: coordY,
        scaleX,
        scaleY,
        photoWidth: photoDimensions.width,
        photoHeight: photoDimensions.height
      });
    } else {
      console.log('⚠️ Размеры фото не известны, используем координаты контейнера');
    }
    
    return { coordX, coordY };
  };

  const handlePhotoDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    console.log('🎯 Событие drop начато');
    console.log('🔍 Проверяем данные из DragContext:', contextDragData);
    console.log('🔍 Проверяем window данные:', (window as any).__dinamikaDragData);
    
    if (!selectedLocationId) {
      console.error('❌ Нет выбранной локации');
      setError('Выберите локацию перед добавлением станций');
      resetDragState();
      clearDragData();
      if ((window as any).__dinamikaDragData) {
        delete (window as any).__dinamikaDragData;
      }
      return;
    }
    
    try {
      let dragData: DragData | null = null;
      
      console.log('📋 Доступные типы в dataTransfer:', Array.from(e.dataTransfer.types));
      
      // ПРИОРИТЕТ 1: Ищем JSON данные в dataTransfer
      for (const type of e.dataTransfer.types) {
        try {
          const dataStr = e.dataTransfer.getData(type);
          console.log(`  Тип "${type}":`, dataStr ? dataStr.substring(0, 200) : '(пусто)');
          
          if (dataStr && dataStr.trim() !== '') {
            // Пропускаем URL и HTML
            if (dataStr.startsWith('http') || dataStr.startsWith('data:') || dataStr.startsWith('<')) {
              continue;
            }
            
            // Пробуем распарсить как JSON
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed && parsed.stationId && parsed.source) {
                dragData = parsed;
                console.log(`✅ НАЙДЕНО: JSON данные в типе "${type}":`, dragData);
                break;
              }
            } catch (jsonErr) {
              // Не JSON, пропускаем
            }
          }
        } catch (err) {
          console.warn(`  Ошибка чтения типа "${type}":`, err);
        }
      }
      
      // ПРИОРИТЕТ 2: Данные из window (fallback от Tree)
      if (!dragData && (window as any).__dinamikaDragData) {
        const windowData = (window as any).__dinamikaDragData;
        const timeDiff = Date.now() - windowData.timestamp;
        
        if (timeDiff < 10000) {
          dragData = windowData.data;
          console.log('✅ НАЙДЕНО: Данные из window:', dragData);
        } else {
          console.log('❌ Данные в window устарели');
          delete (window as any).__dinamikaDragData;
        }
      }
      
      // ПРИОРИТЕТ 3: Данные из контекста
      if (!dragData && contextDragData) {
        dragData = contextDragData;
        console.log('✅ НАЙДЕНО: Данные из контекста:', dragData);
      }
      
      if (!dragData) {
        console.error('❌ Не удалось получить данные перетаскивания');
        console.log('ℹ️ Полная отладка:');
        console.log('- DragContext:', contextDragData);
        console.log('- Window:', (window as any).__dinamikaDragData);
        console.log('- Типы данных:');
        
        for (const type of e.dataTransfer.types) {
          try {
            const data = e.dataTransfer.getData(type);
            console.log(`  "${type}":`, data);
          } catch (err) {
            console.log(`  "${type}": (ошибка чтения)`);
          }
        }
        
        setError('Не удалось получить данные станции. Попробуйте еще раз.');
        resetDragState();
        clearDragData();
        if ((window as any).__dinamikaDragData) {
          delete (window as any).__dinamikaDragData;
        }
        return;
      }
      
      console.log('📦 Обработка данных:', dragData);
      
      const rect = photoContainerRef.current?.getBoundingClientRect();
      if (!rect) {
        console.error('❌ Не удалось получить размеры контейнера');
        setError('Ошибка при определении позиции');
        resetDragState();
        clearDragData();
        if ((window as any).__dinamikaDragData) {
          delete (window as any).__dinamikaDragData;
        }
        return;
      }
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const isInsideContainer = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      console.log('📍 Координаты мыши:', { 
        x, 
        y, 
        isInsideContainer,
        rectWidth: rect.width,
        rectHeight: rect.height
      });
      
      if (dragData.source === 'photo' && !isInsideContainer) {
        console.log('🗑️ Удаление станции с фото');
        try {
          await deleteStationPosition(dragData.stationId, selectedLocationId);
          setError(null);
          console.log('✅ Станция удалена успешно');
        } catch (deleteError) {
          console.error('❌ Ошибка при удалении станции:', deleteError);
          setError('Ошибка при удалении станции с фото');
        }
      } else if (isInsideContainer) {
        if (dragData.source === 'tree' && isStationAlreadyOnThisPhoto(dragData.stationId)) {
          console.log('⚠️ Станция уже есть на фото');
          setError(`Станция "${dragData.stationName}" уже добавлена на эту фотографию`);
          resetDragState();
          clearDragData();
          if ((window as any).__dinamikaDragData) {
            delete (window as any).__dinamikaDragData;
          }
          return;
        }
        
        const { coordX, coordY } = calculateOriginalCoordinates(x, y);
        
        console.log('💾 Сохранение позиции:', { 
          stationId: dragData.stationId, 
          locationId: selectedLocationId,
          coordX, 
          coordY,
          source: dragData.source
        });
        
        try {
          await saveStationPosition(dragData.stationId, selectedLocationId, coordX, coordY);
          setError(null);
          console.log('✅ Позиция сохранена успешно');
        } catch (saveError: any) {
          console.error('❌ Ошибка при сохранении позиции:', saveError);
          setError(saveError.message || 'Ошибка при сохранении позиции станции');
        }
      } else {
        console.log('⚠️ Drop вне контейнера');
      }
      
      await refreshPhotoData();
      
    } catch (err: any) {
      console.error('❌ Неожиданная ошибка:', err);
      setError(err.message || 'Неизвестная ошибка');
    } finally {
      console.log('🏁 Завершение обработки drop');
      resetDragState();
      clearDragData();
      if ((window as any).__dinamikaDragData) {
        delete (window as any).__dinamikaDragData;
      }
    }
  };

  const handleCustomDrop = async (dragData: any, x: number, y: number) => {
    console.log('🎯 Обработка кастомного drop:', { dragData, x, y });
    
    if (!selectedLocationId) {
      console.error('❌ Нет выбранной локации для кастомного drop');
      setError('Выберите локацию перед добавлением станций');
      return;
    }
    
    try {
      if (isStationAlreadyOnThisPhoto(dragData.stationId)) {
        console.log('⚠️ Станция уже есть на фото (кастомный drop)');
        setError(`Станция "${dragData.stationName}" уже добавлена на эту фотографию`);
        return;
      }
      
      const { coordX, coordY } = calculateOriginalCoordinates(x, y);
      
      console.log('💾 Сохранение позиции (кастомный drop):', { 
        stationId: dragData.stationId, 
        locationId: selectedLocationId,
        coordX, 
        coordY
      });
      
      try {
        await saveStationPosition(dragData.stationId, selectedLocationId, coordX, coordY);
        setError(null);
        console.log('✅ Позиция сохранена успешно (кастомный drop)');
      } catch (saveError: any) {
        console.error('❌ Ошибка при сохранении позиции (кастомный drop):', saveError);
        setError(saveError.message || 'Ошибка при сохранении позиции станции');
      }
      
      await refreshPhotoData();
      
    } catch (err: any) {
      console.error('❌ Неожиданная ошибка при кастомном drop:', err);
      setError(err.message || 'Неизвестная ошибка');
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('🏁 Перетаскивание завершено');
    
    const dragDataFromContext = contextDragData;
    if (dragDataFromContext?.source === 'photo') {
      const rect = photoContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const isInsideContainer = mouseX >= rect.left && mouseX <= rect.right && 
                                 mouseY >= rect.top && mouseY <= rect.bottom;
        
        if (!isInsideContainer && selectedLocationId) {
          console.log('🏁 Перетаскивание закончилось вне контейнера - удаляем станцию');
          deleteStationPosition(dragDataFromContext.stationId, selectedLocationId)
            .then(() => {
              console.log('✅ Станция удалена после перетаскивания');
              refreshPhotoData();
            })
            .catch(err => {
              console.error('❌ Ошибка при удалении станции после перетаскивания:', err);
            });
        }
      }
    }
    
    resetDragState();
    clearDragData();
    if ((window as any).__dinamikaDragData) {
      delete (window as any).__dinamikaDragData;
    }
  };

  const resetDragState = () => {
    setDragData(null);
    setGhostPosition(null);
    setIsDragOver(false);
  };

  const refreshPhotoData = async () => {
    if (selectedLocationId) {
      console.log('🔄 Обновление данных фото...');
      try {
        const updatedPhoto = await getLocationPhoto(selectedLocationId);
        setPhotoInfo(updatedPhoto);
        
        if (updatedPhoto?.stations) {
          const stationIds = new Set(updatedPhoto.stations.map(s => s.stationId));
          setStationsOnCurrentPhoto(stationIds);
          console.log('✅ Данные фото обновлены, станций:', stationIds.size);
        } else {
          setStationsOnCurrentPhoto(new Set());
          console.log('✅ Данные фото обновлены, станций нет');
        }
      } catch (error) {
        console.error('❌ Ошибка при обновлении данных фото:', error);
      }
    }
  };

  const getStationName = (stationId: number): string => {
    const stationData = getStationById(stationId);
    if (stationData) {
      return stationData.stationName || `Станция ${stationId}`;
    }
    return `Станция ${stationId}`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedLocationId) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Недопустимый формат файла. Разрешены: JPEG, PNG, WebP, GIF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер: 10MB');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedPhoto = await uploadLocationPhoto(selectedLocationId, file);
      setPhotoInfo(uploadedPhoto);
      
      if (uploadedPhoto?.stations) {
        const stationIds = new Set(uploadedPhoto.stations.map(s => s.stationId));
        setStationsOnCurrentPhoto(stationIds);
      } else {
        setStationsOnCurrentPhoto(new Set());
      }
      
      setError(null);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err: any) {
      const axiosError = err as AxiosError;
      let errorMsg = 'Ошибка при загрузке фото';
      
      if (axiosError.response?.status === 403) {
        errorMsg = 'Доступ запрещен. Проверьте авторизацию.';
      } else if (axiosError.response?.status === 404) {
        errorMsg = 'Эндпоинт не найден.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
      setShowEditOptions(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!selectedLocationId || !photoInfo) return;
    
    if (!window.confirm('Удалить фото этой локации?')) return;
    
    setLoading(true);
    try {
      await deleteLocationPhoto(selectedLocationId);
      setPhotoInfo(null);
      setStationsOnCurrentPhoto(new Set());
      setError(null);
      setShowEditOptions(false);
    } catch (err: any) {
      setError('Ошибка при удалении фото');
    } finally {
      setLoading(false);
    }
  };

  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleToggleEditOptions = () => {
    if (hasPhoto) {
      setShowEditOptions(!showEditOptions);
    } else {
      handleChooseFile();
    }
  };

  const handleReplacePhoto = () => {
    handleChooseFile();
    setShowEditOptions(false);
  };

  const handleOpenStationModal = () => {
    if (selectedStationForTooltip) {
      setStationInfoModalOpen(true);
    }
  };

  const handleCloseStationModal = () => {
    setStationInfoModalOpen(false);
    closeTooltip();
  };

  const photoUrl = photoInfo ? getFullPhotoUrl(photoInfo) : null;
  const hasPhoto = !!photoInfo?.photoFileName;
  const hasStations = photoInfo?.stations && photoInfo.stations.length > 0;

  const getLevelText = (level: number | null): string => {
    switch (level) {
      case 1: return 'Завод';
      case 2: return 'Цех';
      case 3: return 'Участок';
      default: return 'Локация';
    }
  };

  if (!selectedLocationId) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-gray-600 font-medium">
            Интерактивная карта
          </span>
          <p className="text-gray-500 text-sm mt-2">
            Выберите локацию для отображения фото и станций
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative" onClick={closeTooltip}>
      <div className="h-full flex flex-col">
        <div className="h-[30px]"></div>
        
        <div className="flex justify-between items-center px-[60px]">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {selectedLocationName || 'Локация'}
            </h2>
            <p className="text-gray-600">
              {getLevelText(selectedLocationLevel)} • ID: {selectedLocationId}
              {hasStations && ` • Станций: ${photoInfo!.stations!.length}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleChooseFile}
              disabled={loading}
              className="p-1 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Загрузить фото"
            >
              <img 
                src={IMG7} 
                alt="Загрузить"
                width={32}
                height={31}
                className="object-contain"
              />
            </button>
            
            {hasPhoto && (
              <div className="relative">
                <button
                  onClick={handleToggleEditOptions}
                  disabled={loading}
                  className="p-1 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Удалить или заменить фото"
                >
                  <img 
                    src={IMG8} 
                    alt="Удалить/Заменить"
                    width={35}
                    height={34}
                    className="object-contain"
                  />
                </button>
                
                {showEditOptions && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[140px]">
                    <button
                      onClick={handleReplacePhoto}
                      disabled={loading}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center"
                    >
                      <span className="mr-2">🔄</span>
                      Заменить фото
                    </button>
                    
                    <button
                      onClick={handleDeletePhoto}
                      disabled={loading}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center border-t border-gray-200"
                    >
                      <span className="mr-2">🗑️</span>
                      Удалить фото
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {hasPhoto && (
              <button
                onClick={downloadLocationPhoto}
                disabled={loading || !hasPhoto}
                className="p-1 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Скачать фото"
              >
                <img 
                  src={IMG9} 
                  alt="Скачать"
                  width={29}
                  height={31}
                  className="object-contain"
                />
              </button>
            )}
          </div>
        </div>
        
        <div className="h-[20px]"></div>
        
        {error && (
          <div className="mx-[60px] mb-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
              <button 
                onClick={() => setError(null)}
                className="float-right text-sm text-red-600 hover:text-red-800 mt-1"
              >
                Скрыть
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-1 flex flex-col items-center">
          <div 
            ref={photoContainerRef}
            className={`w-[1050px] h-[436px] border-2 rounded-lg overflow-hidden relative ${
              isDragOver || isCustomDraggingOver
                ? 'border-blue-500 bg-blue-50 border-solid' 
                : 'border-gray-300 bg-gray-50 border-dashed'
            }`}
            onDragOver={handlePhotoDragOver}
            onDragEnter={handlePhotoDragEnter}
            onDragLeave={handlePhotoDragLeave}
            onDrop={handlePhotoDrop}
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                {uploadProgress > 0 && (
                  <div className="mt-4 w-64">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">Загрузка: {uploadProgress}%</p>
                  </div>
                )}
              </div>
            ) : hasPhoto && photoUrl ? (
              <>
                <div className="w-full h-full relative">
                  <img
                    src={photoUrl}
                    alt={`Фото ${selectedLocationName}`}
                    className="w-full h-full object-contain"
                    onLoad={handleImageLoad}
                    onError={(e) => {
                      console.error('Ошибка загрузки изображения:', photoUrl);
                      e.currentTarget.src = 'https://via.placeholder.com/1050x436?text=Ошибка+загрузки+фото';
                    }}
                  />
                </div>
                
                {/* Индикатор кастомного drop - ПРЕДПРОСМОТР ИКОНКИ СТАНЦИИ */}
                {isCustomDraggingOver && customDropPosition && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: `${customDropPosition.x - 10.5}px`,
                      top: `${customDropPosition.y - 15.5}px`,
                      width: '21px',
                      height: '31px',
                      zIndex: 25,
                      pointerEvents: 'none',
                      opacity: 0.6,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  >
                    <img 
                      src={stationIcon}
                      alt="Предпросмотр станции"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                )}
                
                {hasStations && photoDimensions.width > 0 && photoInfo!.stations!.map((station) => {
                  const isHovered = isStationHovered(station);
                  const isSelected = selectedStationForTooltip?.uid === station.stationId;
                  
                  const baseStyle = getStationPositionStyle(station);
                  const hoverStyle = isHovered ? getHoveredStationStyle() : {};
                  const selectedStyle = isSelected ? getSelectedStationStyle() : {};
                  
                  return (
                    <div
                      key={`station-${station.stationId}-${station.locationId}`}
                      ref={(el) => {
                        if (el) {
                          stationRefs.current.set(station.stationId, el);
                        } else {
                          stationRefs.current.delete(station.stationId);
                        }
                      }}
                      style={{
                        ...baseStyle,
                        ...(isHovered ? hoverStyle : {}),
                        ...(isSelected ? selectedStyle : {}),
                      }}
                      draggable={true}
                      onDragStart={(e) => handleStationDragStart(e, station, getStationName(station.stationId))}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleStationClick(station, e)}
                      onMouseEnter={() => handleStationMouseEnter(station)}
                      onMouseLeave={handleStationMouseLeave}
                      className="station-icon"
                      title={`${getStationName(station.stationId)}\nПеретащите за пределы фото для удаления`}
                    >
                      <img 
                        src={stationIcon} 
                        alt="Станция" 
                        className="w-full h-full"
                        draggable="false"
                      />
                    </div>
                  );
                })}
                
                {ghostPosition && (
                  <div 
                    style={{
                      position: 'absolute',
                      left: `${ghostPosition.x - 10.5}px`,
                      top: `${ghostPosition.y - 15.5}px`,
                      width: '21px',
                      height: '31px',
                      opacity: 0.6,
                      zIndex: 20,
                      pointerEvents: 'none',
                      transform: 'scale(1.1)'
                    }}
                  >
                    <img 
                      src={stationIcon} 
                      alt="Перетаскиваемая станция" 
                      className="w-full h-full"
                      draggable="false"
                    />
                  </div>
                )}
                
                {hasStations && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Станций: {photoInfo!.stations!.length}
                  </div>
                )}
                
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {isCustomDragging ? '💡 Отпустите кнопку мыши для добавления станции' : '💡 Перетащите станцию за пределы фото для удаления'}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-32 h-32 flex items-center justify-center mb-4">
                  <svg 
                    className="w-16 h-16 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-center max-w-md">
                  Нет фото для {getLevelText(selectedLocationLevel).toLowerCase()}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Загрузите фото для отображения на карте и станций
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  <strong>Подсказка:</strong> {isCustomDragging ? 'Перетащите станцию с дерева сюда' : 'Перетащите станции из дерева на фото'}
                </p>
              </div>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />
        </div>
        
        <div className="h-[50px]"></div>
      </div>

      {selectedStationForTooltip && (
        <StationMnemoTooltip
          station={selectedStationForTooltip}
          stationPath={stationPath}
          position={tooltipPosition}
          isVisible={true}
          onClose={closeTooltip}
          onClick={handleOpenStationModal}
        />
      )}
    </div>
  );
};

export default Inter;
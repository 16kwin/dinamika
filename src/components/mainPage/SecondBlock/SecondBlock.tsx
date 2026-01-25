import React, { useEffect, useState } from 'react';
import AxiosService from '../../../services/AxiosService';
import ConstantInfo from '../../../info/ConstantInfo';
import type { AxiosError } from 'axios';
import Tree from './Tree';
import SearchTree from './SearchTree';
import LocationTypeSelectionModal from './LocationTypeSelectionModal';
import WorkshopCreateModal from './WorkshopCreateModal';
import SectionCreateModal from './SectionCreateModal';
import StationCreateModal from './StationCreateModal';
import StationInfoModal from './StationInfoModal';
import type { StationFormData } from './StationCreateModal';

export interface StationDTO {
  uid: string;
  stationName: string;
  modelNumber: string;
  serialNumber: string;
  currentCapacity: number;
  // Новые поля
  isEnabled: boolean;
  capacity: number | null;
  fullness: number | null;
  hasErrors: boolean;
  issued: number | null;
  issuedOverNorm: number | null;
  finishedParts: number | null;
}

export interface LocationHierarchyDTO {
  id: number;
  locationName: string;
  level: number;
  childLocations: LocationHierarchyDTO[];
  stations: StationDTO[];
}

interface CreateLocationDTO {
  name: string;
  level: number;
  parentId?: number;
}

interface CreateStationDTO {
  stationName: string;
  modelNumber: string;
  serialNumber: string;
  currentCapacity: string;
  ipAddress: string;
  // Новые поля
  isEnabled: boolean;
  capacity: string;
  fullness: string;
  hasErrors: boolean;
  issued: string;
  issuedOverNorm: string;
  finishedParts: string;
  level1FactoryId?: number;
  level2ObjectId?: number;
  level3ZoneId?: number;
}

interface SecondBlockProps {
  onHierarchyUpdate: (hierarchy: LocationHierarchyDTO | null) => void;
  onLocationSelect: (location: LocationHierarchyDTO | null) => void;
  onStationSelect: (station: StationDTO | null) => void;
  onStationHover: (station: StationDTO | null) => void;
  selectedStation: StationDTO | null;
  hoveredStation: StationDTO | null;
}

const SecondBlock: React.FC<SecondBlockProps> = ({ 
  onHierarchyUpdate,
  onLocationSelect, 
  onStationSelect,
  onStationHover,
  selectedStation,
  hoveredStation 
}) => {
  const [hierarchy, setHierarchy] = useState<LocationHierarchyDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [typeSelectionModalOpen, setTypeSelectionModalOpen] = useState(false);
  const [workshopModalOpen, setWorkshopModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [stationModalOpen, setStationModalOpen] = useState(false);
  const [stationInfoModalOpen, setStationInfoModalOpen] = useState(false);
  
  const [selectedNode, setSelectedNode] = useState<LocationHierarchyDTO | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<'factory' | 'workshop' | null>(null);
  const [currentSelectedLocation, setCurrentSelectedLocation] = useState<LocationHierarchyDTO | null>(null);

  const addWorkshopToHierarchy = (
    hierarchy: LocationHierarchyDTO | null,
    parentId: number,
    newWorkshop: { id: number; name: string; level: number }
  ): LocationHierarchyDTO | null => {
    if (!hierarchy) return null;
    
    const addWorkshopRecursive = (node: LocationHierarchyDTO): LocationHierarchyDTO => {
      if (node.id === parentId) {
        return {
          ...node,
          childLocations: [
            ...(node.childLocations || []),
            {
              id: newWorkshop.id,
              locationName: newWorkshop.name,
              level: newWorkshop.level,
              childLocations: [],
              stations: []
            }
          ]
        };
      }
      
      return {
        ...node,
        childLocations: (node.childLocations || []).map(child => 
          addWorkshopRecursive(child)
        )
      };
    };
    
    return addWorkshopRecursive(hierarchy);
  };

  const addSectionToHierarchy = (
    hierarchy: LocationHierarchyDTO | null,
    parentId: number,
    newSection: { id: number; name: string; level: number }
  ): LocationHierarchyDTO | null => {
    if (!hierarchy) return null;
    
    const addSectionRecursive = (node: LocationHierarchyDTO): LocationHierarchyDTO => {
      if (node.id === parentId) {
        return {
          ...node,
          childLocations: [
            ...(node.childLocations || []),
            {
              id: newSection.id,
              locationName: newSection.name,
              level: newSection.level,
              childLocations: [],
              stations: []
            }
          ]
        };
      }
      
      return {
        ...node,
        childLocations: (node.childLocations || []).map(child => 
          addSectionRecursive(child)
        )
      };
    };
    
    return addSectionRecursive(hierarchy);
  };

  const addStationToHierarchy = (
    hierarchy: LocationHierarchyDTO | null,
    parentId: number,
    newStation: StationDTO
  ): LocationHierarchyDTO | null => {
    if (!hierarchy) return null;
    
    const addStationRecursive = (node: LocationHierarchyDTO): LocationHierarchyDTO => {
      if (node.id === parentId) {
        return {
          ...node,
          stations: [...(node.stations || []), newStation]
        };
      }
      
      return {
        ...node,
        childLocations: (node.childLocations || []).map(child => 
          addStationRecursive(child)
        )
      };
    };
    
    return addStationRecursive(hierarchy);
  };

  const findFactoryInHierarchy = (
    currentNode: LocationHierarchyDTO,
    targetId: number
  ): LocationHierarchyDTO | null => {
    if (currentNode.level === 1) {
      const isTargetInSubtree = checkIfNodeInSubtree(currentNode, targetId);
      if (isTargetInSubtree) {
        return currentNode;
      }
    }
    
    for (const child of currentNode.childLocations || []) {
      const factory = findFactoryInHierarchy(child, targetId);
      if (factory) {
        return factory;
      }
    }
    
    return null;
  };

  const checkIfNodeInSubtree = (
    root: LocationHierarchyDTO,
    targetId: number
  ): boolean => {
    if (root.id === targetId) {
      return true;
    }
    
    for (const child of root.childLocations || []) {
      if (checkIfNodeInSubtree(child, targetId)) {
        return true;
      }
    }
    
    return false;
  };

  const findWorkshopForSection = (
    root: LocationHierarchyDTO,
    sectionId: number
  ): LocationHierarchyDTO | null => {
    const findSectionAndParent = (
      node: LocationHierarchyDTO,
      parent: LocationHierarchyDTO | null
    ): { section: LocationHierarchyDTO | null, parent: LocationHierarchyDTO | null } => {
      if (node.id === sectionId) {
        return { section: node, parent };
      }
      
      for (const child of node.childLocations || []) {
        const result = findSectionAndParent(child, node);
        if (result.section) {
          return result;
        }
      }
      
      return { section: null, parent: null };
    };
    
    const result = findSectionAndParent(root, null);
    if (result.parent && result.parent.level === 2) {
      return result.parent;
    }
    
    return null;
  };

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AxiosService.get(ConstantInfo.restApiLocationHierarchy);
      
      let hierarchyData: LocationHierarchyDTO | null = null;
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        hierarchyData = response.data[0];
      } else if (response.data) {
        hierarchyData = response.data;
      }
      
      setHierarchy(hierarchyData);
      onHierarchyUpdate(hierarchyData);
      
      if (!hierarchyData) {
        setError('Нет данных для отображения');
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = axiosError.response?.data 
        ? `Ошибка: ${JSON.stringify(axiosError.response.data)}`
        : `Ошибка соединения: ${axiosError.message}`;
      
      setError(errorMessage);
      console.error('Ошибка загрузки:', err);
      onHierarchyUpdate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const handleRefresh = () => {
    fetchHierarchy();
  };

  const handleAddButtonClick = (e: React.MouseEvent, node: LocationHierarchyDTO | StationDTO) => {
    e.stopPropagation();
    
    if ('locationName' in node) {
      const locationNode = node as LocationHierarchyDTO;
      
      if (locationNode.level === 1) {
        setSelectedNode(locationNode);
        setSelectedNodeType('factory');
        setTypeSelectionModalOpen(true);
      } else if (locationNode.level === 2) {
        setSelectedNode(locationNode);
        setSelectedNodeType('workshop');
        setTypeSelectionModalOpen(true);
      } else if (locationNode.level === 3) {
        setSelectedNode(locationNode);
        setStationModalOpen(true);
      }
    }
  };

  const handleLocationClick = (location: LocationHierarchyDTO) => {
    setCurrentSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleStationClick = (station: StationDTO) => {
    onStationSelect(station);
    setStationInfoModalOpen(true);
  };

  const handleStationHover = (station: StationDTO | null) => {
    onStationHover(station);
  };

  const handleTypeSelect = (type: 'workshop' | 'section' | 'station') => {
    setTypeSelectionModalOpen(false);
    
    if (type === 'workshop') {
      setWorkshopModalOpen(true);
    } else if (type === 'section') {
      setSectionModalOpen(true);
    } else if (type === 'station') {
      setStationModalOpen(true);
    }
  };

  const handleCreateWorkshop = async (name: string, parentId: number) => {
    try {
      const createLocationDTO: CreateLocationDTO = {
        name: name,
        level: 2,
        parentId: parentId
      };

      const response = await AxiosService.post(ConstantInfo.restApiCreateLocation, createLocationDTO);
      
      if (response.data && response.data.id) {
        const newWorkshop = {
          id: response.data.id,
          name: response.data.locationName || name,
          level: 2
        };
        
        const updatedHierarchy = addWorkshopToHierarchy(hierarchy, parentId, newWorkshop);
        setHierarchy(updatedHierarchy);
        if (updatedHierarchy) {
          onHierarchyUpdate(updatedHierarchy);
        }
      } else {
        await fetchHierarchy();
      }
      
      setWorkshopModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = axiosError.response?.data 
        ? `Ошибка: ${JSON.stringify(axiosError.response.data)}`
        : `Ошибка создания: ${axiosError.message}`;
      
      alert(`Ошибка создания цеха: ${errorMessage}`);
      console.error('Ошибка создания цеха:', err);
    }
  };

  const handleCreateSection = async (name: string, parentId: number) => {
    try {
      const createLocationDTO: CreateLocationDTO = {
        name: name,
        level: 3,
        parentId: parentId
      };

      const response = await AxiosService.post(ConstantInfo.restApiCreateLocation, createLocationDTO);
      
      if (response.data && response.data.id) {
        const newSection = {
          id: response.data.id,
          name: response.data.locationName || name,
          level: 3
        };
        
        const updatedHierarchy = addSectionToHierarchy(hierarchy, parentId, newSection);
        setHierarchy(updatedHierarchy);
        if (updatedHierarchy) {
          onHierarchyUpdate(updatedHierarchy);
        }
      } else {
        await fetchHierarchy();
      }
      
      setSectionModalOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = axiosError.response?.data 
        ? `Ошибка: ${JSON.stringify(axiosError.response.data)}`
        : `Ошибка создания: ${axiosError.message}`;
      
      alert(`Ошибка создания участка: ${errorMessage}`);
      console.error('Ошибка создания участка:', err);
    }
  };

  const handleCreateStation = async (stationData: StationFormData) => {
    if (!selectedNode || !hierarchy) return;

    try {
      let level1FactoryId: number;
      let level2ObjectId: number | undefined;
      let level3ZoneId: number | undefined;

      if (selectedNode.level === 1) {
        level1FactoryId = selectedNode.id;
      } else if (selectedNode.level === 2) {
        const factory = findFactoryInHierarchy(hierarchy, selectedNode.id);
        if (!factory) {
          throw new Error('Не удалось найти завод для цеха');
        }
        level1FactoryId = factory.id;
        level2ObjectId = selectedNode.id;
      } else if (selectedNode.level === 3) {
        const factory = findFactoryInHierarchy(hierarchy, selectedNode.id);
        if (!factory) {
          throw new Error('Не удалось найти завод для участка');
        }
        
        const workshop = findWorkshopForSection(hierarchy, selectedNode.id);
        if (!workshop) {
          throw new Error('Не удалось найти цех для участка');
        }
        
        level1FactoryId = factory.id;
        level2ObjectId = workshop.id;
        level3ZoneId = selectedNode.id;
      } else {
        throw new Error('Неизвестный уровень локации');
      }

      const createStationDTO: CreateStationDTO = {
        stationName: stationData.stationName,
        modelNumber: stationData.modelNumber,
        serialNumber: stationData.serialNumber,
        currentCapacity: stationData.currentCapacity,
        ipAddress: stationData.ipAddress,
        // Новые поля
        isEnabled: stationData.isEnabled,
        capacity: stationData.capacity,
        fullness: stationData.fullness,
        hasErrors: stationData.hasErrors,
        issued: stationData.issued,
        issuedOverNorm: stationData.issuedOverNorm,
        finishedParts: stationData.finishedParts,
        level1FactoryId: level1FactoryId,
        level2ObjectId: level2ObjectId,
        level3ZoneId: level3ZoneId
      };

      const response = await AxiosService.post(ConstantInfo.restApiCreateStation, createStationDTO);
      
      if (response.data && response.data.uid) {
        const newStation: StationDTO = {
          uid: response.data.uid,
          stationName: response.data.stationName || stationData.stationName,
          modelNumber: response.data.modelNumber || stationData.modelNumber,
          serialNumber: response.data.serialNumber || stationData.serialNumber,
          currentCapacity: response.data.currentCapacity || parseInt(stationData.currentCapacity),
          // Новые поля
          isEnabled: response.data.isEnabled !== undefined ? response.data.isEnabled : stationData.isEnabled,
          capacity: response.data.capacity !== undefined ? response.data.capacity : 
                   (stationData.capacity ? parseInt(stationData.capacity) : null),
          fullness: response.data.fullness !== undefined ? response.data.fullness : 
                   (stationData.fullness ? parseInt(stationData.fullness) : null),
          hasErrors: response.data.hasErrors !== undefined ? response.data.hasErrors : stationData.hasErrors,
          issued: response.data.issued !== undefined ? response.data.issued : 
                 (stationData.issued ? parseInt(stationData.issued) : null),
          issuedOverNorm: response.data.issuedOverNorm !== undefined ? response.data.issuedOverNorm : 
                         (stationData.issuedOverNorm ? parseInt(stationData.issuedOverNorm) : null),
          finishedParts: response.data.finishedParts !== undefined ? response.data.finishedParts : 
                        (stationData.finishedParts ? parseInt(stationData.finishedParts) : null)
        };
        
        const parentId = level3ZoneId || level2ObjectId || level1FactoryId;
        const updatedHierarchy = addStationToHierarchy(hierarchy, parentId, newStation);
        setHierarchy(updatedHierarchy);
        if (updatedHierarchy) {
          onHierarchyUpdate(updatedHierarchy);
        }
      } else {
        await fetchHierarchy();
      }
      
      setStationModalOpen(false);
    } catch (err: any) {
      const errorMessage = err.message || (err.response?.data ? JSON.stringify(err.response.data) : 'Неизвестная ошибка');
      alert(`Ошибка создания станции: ${errorMessage}`);
      console.error('Ошибка создания станции:', err);
    }
  };

  const closeAllModals = () => {
    setTypeSelectionModalOpen(false);
    setWorkshopModalOpen(false);
    setSectionModalOpen(false);
    setStationModalOpen(false);
    setStationInfoModalOpen(false);
    setSelectedNode(null);
    setSelectedNodeType(null);
  };

  const closeStationInfoModal = () => {
    setStationInfoModalOpen(false);
    onStationSelect(null);
    onStationHover(null);
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white flex justify-center items-center text-gray-600">
        Загрузка данных...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-white p-5 flex flex-col justify-center items-center text-center">
        <div className="text-red-500 mb-5 text-sm">{error}</div>
        <button 
          className="px-5 py-2.5 bg-blue-500 text-white border-none rounded cursor-pointer text-sm hover:bg-blue-600 transition-colors"
          onClick={handleRefresh}
        >
          Повторить загрузку
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col">
      <div className="h-[72px]">
        <SearchTree onSearch={setSearchQuery} />
      </div>
      
      <div className="relative">
        <div 
          className="w-full h-[1.5px]"
          style={{
            backgroundColor: 'rgba(62, 78, 119, 0.64)',
          }}
        />
        <div className="w-full h-[2px] bg-gradient-to-b from-gray-200/50 to-transparent"></div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Tree 
          hierarchy={hierarchy}
          searchQuery={searchQuery}
          onAddButtonClick={handleAddButtonClick}
          onStationClick={handleStationClick}
          onStationHover={handleStationHover}
          onLocationClick={handleLocationClick}
          hoveredStation={hoveredStation}
        />
      </div>

      <LocationTypeSelectionModal
        isOpen={typeSelectionModalOpen}
        onClose={closeAllModals}
        parentType={selectedNodeType || 'factory'}
        onSelect={handleTypeSelect}
        parentName={selectedNode?.locationName}
      />

      {selectedNode && selectedNode.level !== 3 && (
        <WorkshopCreateModal
          isOpen={workshopModalOpen}
          onClose={closeAllModals}
          onSubmit={handleCreateWorkshop}
          parentName={selectedNode.locationName}
          parentId={selectedNode.id}
        />
      )}

      {selectedNode && selectedNode.level === 2 && (
        <SectionCreateModal
          isOpen={sectionModalOpen}
          onClose={closeAllModals}
          onSubmit={handleCreateSection}
          parentName={selectedNode.locationName}
          parentId={selectedNode.id}
        />
      )}

      {selectedNode && (
        <StationCreateModal
          isOpen={stationModalOpen}
          onClose={closeAllModals}
          onSubmit={handleCreateStation}
          parentLocation={selectedNode.locationName}
        />
      )}

      <StationInfoModal
        isOpen={stationInfoModalOpen}
        onClose={closeStationInfoModal}
        station={selectedStation}
      />
    </div>
  );
};

export default SecondBlock;
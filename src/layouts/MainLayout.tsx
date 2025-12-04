import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import LeftBlock from '../components/mainPage/Leftblock/Leftblock';

const MainLayout = () => {
  const { isAuth, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuth) {
      navigate('/login');
    }
  }, [isAuth, isLoading, navigate]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuth) return null;

  return (
    <div className="w-full h-dvh relative bg-[#F5F7F9]">
      {/* Левая колонка */}
      <LeftBlock
        isExpanded={isSidebarExpanded}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      />

      {/* Правая часть - фиксированный отступ */}
      <div className="h-full absolute left-[140px] right-0 top-0 bottom-0 overflow-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './services/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import { DragProvider } from './contexts/DragContext';
import { CustomDragProvider } from './contexts/CustomDragContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <DragProvider>
          <CustomDragProvider>
            <App />
          </CustomDragProvider>
        </DragProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
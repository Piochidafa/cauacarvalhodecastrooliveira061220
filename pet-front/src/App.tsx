import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Menubar } from 'primereact/menubar';
import { ProgressSpinner } from 'primereact/progressspinner';
import Login from './pages/Login/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ArtistList from './components/ArtistList';
import ArtistDetail from './components/ArtistDetail';
import ArtistForm from './components/ArtistForm';
import AlbumForm from './components/AlbumForm';

// Lazy loading para páginas menos frequentes
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const TestRefresh = lazy(() => import('./pages/TestRefresh/TestRefresh'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

function LoadingFallback() {
  return (
    <div className="flex justify-content-center p-5">
      <ProgressSpinner />
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

  useEffect(() => {
    // Verificar mudanças no localStorage
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('accessToken'));
    };

    // Listener customizado para mudanças de autenticação
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('accessToken'));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('focus', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('focus', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Artistas',
      icon: 'pi pi-fw pi-list',
      command: () => navigate('/artista'),
    },
    {
      label: 'Dashboard',
      icon: 'pi pi-fw pi-chart-bar',
      command: () => navigate('/dashboard'),
    },

  ];

  return (
    <div className="layout">
      <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            success: {
              style: {
                background: '#10b981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
          }}
        />
        <Menubar
         style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
         model={menuItems} 
         start={<Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>SoundBoard</Link>}
         end={
           <>
             {isAuthenticated ? (
               <button 
                 onClick={handleLogout}
                 style={{
                   background: 'none',
                   border: 'none',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem',
                   color: '#666',
                   fontSize: '1rem',
                   padding: '0 1rem'
                 }}
               >
                 <i className="pi pi-fw pi-sign-out"></i>
                 Logout
               </button>
             ) : (
               <button 
                 onClick={() => navigate('/login')}
                 style={{
                   background: 'none',
                   border: 'none',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem',
                   color: '#666',
                   fontSize: '1rem',
                   padding: '0 1rem'
                 }}
               >
                 <i className="pi pi-fw pi-sign-in"></i>
                 Login
               </button>
             )}
           </>
         }
        />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ArtistList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artista"
              element={<Navigate to="/" replace />}
            />
            <Route
              path="/artista/:id"
              element={
                <ProtectedRoute>
                  <ArtistDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artista/novo"
              element={
                <ProtectedRoute>
                  <ArtistForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/artista/:id/editar"
              element={
                <ProtectedRoute>
                  <ArtistForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/album/novo"
              element={
                <ProtectedRoute>
                  <AlbumForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/album/:id"
              element={
                <ProtectedRoute>
                  <AlbumForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-refresh"
              element={
                <ProtectedRoute>
                  <TestRefresh />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
          </Routes>
        </Suspense>
      </div>
    );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;


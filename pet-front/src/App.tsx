import { lazy, Suspense, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import ProtectedRoute from './components/ProtectedRoute';
import { authFacade } from './services/facades/authFacade';

// Lazy loading
const Login = lazy(() => import('./pages/Login/Login'));
const ArtistList = lazy(() => import('./components/ArtistList'));
const ArtistDetail = lazy(() => import('./components/ArtistDetail'));
const ArtistForm = lazy(() => import('./components/ArtistForm'));
const AlbumForm = lazy(() => import('./components/AlbumForm'));
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
  const lastNotifiedExpiryRef = useRef<number | null>(null);

  const computeExpiry = useCallback(() => {
    const raw = localStorage.getItem('accessTokenExpiresAt');
    if (!raw) {
      return;
    }

    const expiresAt = Number(raw);
    if (!Number.isFinite(expiresAt)) {
      return;
    }

    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) {
      return;
    }

    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
    const shouldNotify = remainingMs <= 60 * 1000;

    if (shouldNotify && lastNotifiedExpiryRef.current !== expiresAt) {
      lastNotifiedExpiryRef.current = expiresAt;
      toast.custom((t) => (
        <div
          style={{
            background: '#fff7ed',
            color: '#9a3412',
            border: '1px solid #fed7aa',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <span>Sessão expira em {remainingMinutes} min.</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleRefreshSession();
            }}
            style={{
              background: '#f97316',
              color: '#fff',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Renovar agora
          </button>
        </div>
      ), { duration: 3000 });
    }
  }, []);

  useEffect(() => {
    computeExpiry();
    const intervalId = window.setInterval(computeExpiry, 30000);
    window.addEventListener('authChange', computeExpiry);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('authChange', computeExpiry);
    };
  }, [computeExpiry]);

  const handleRefreshSession = async () => {
    try {
      await authFacade.refreshToken();
      window.dispatchEvent(new Event('authChange'));
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
    }
  };

  return (
    <div className="layout flex flex-column">
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


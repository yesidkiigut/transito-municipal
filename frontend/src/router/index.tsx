import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Layout } from '@/shared/components/Layout';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CiudadanosPage } from '@/features/ciudadanos/CiudadanosPage';
import { VehiculosPage } from '@/features/vehiculos/VehiculosPage';
import { LicenciasPage } from '@/features/licencias/LicenciasPage';
import { ComparendosPage } from '@/features/comparendos/ComparendosPage';
import { TramitesPage } from '@/features/tramites/TramitesPage';
import { AgendaPage } from '@/features/agenda/AgendaPage';
import { ReportesPage } from '@/features/reportes/ReportesPage';
import { ImpuestosPage } from '@/features/impuestos/ImpuestosPage';
import { PreinscripcionPage } from '@/features/preinscripcion/PreinscripcionPage';
import { RodamientoPage } from '@/features/rodamiento/RodamientoPage';
import { BrandingPage } from '@/features/branding/BrandingPage';
import { PortalPagosPage } from '@/features/pagos/PortalPagosPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  if (user?.rol !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/impuestos"
        element={
          <ProtectedRoute>
            <ImpuestosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/preinscripcion"
        element={
          <ProtectedRoute>
            <PreinscripcionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rodamiento"
        element={
          <ProtectedRoute>
            <RodamientoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ciudadanos"
        element={
          <ProtectedRoute>
            <CiudadanosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehiculos"
        element={
          <ProtectedRoute>
            <VehiculosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/licencias"
        element={
          <ProtectedRoute>
            <LicenciasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comparendos"
        element={
          <ProtectedRoute>
            <ComparendosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tramites"
        element={
          <ProtectedRoute>
            <TramitesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <AgendaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reportes"
        element={
          <ProtectedRoute>
            <AdminOnlyRoute>
              <ReportesPage />
            </AdminOnlyRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/branding"
        element={
          <ProtectedRoute>
            <AdminOnlyRoute>
              <BrandingPage />
            </AdminOnlyRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pagos"
        element={
          <ProtectedRoute>
            <PortalPagosPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function PrivateRoute({ children, adminOnly = false }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-gray-700">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.roles.includes('admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50">
        <div className="rounded-lg bg-white p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600">Доступ запрещён</h2>
          <p className="mt-4 text-gray-700">Требуется роль администратора</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
          >
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import "./../App.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (location.pathname === '/login') {
    return null;
  }

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="navbar bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Левая часть — основные ссылки */}
        <div className="flex items-center space-x-14">
          <Link 
            to="/" 
            className={`text-xl font-bold transition flex items-center gap-2 ${
              isActive('/') && location.pathname === '/' ? 'text-yellow-300' : 'hover:text-blue-200'
            }`}
          >
            🏠 Главная
          </Link>
          
          <Link 
            to="/staff" 
            className={`hover:text-blue-200 transition flex items-center gap-2 ${
              isActive('/staff') ? 'text-yellow-300 font-semibold' : ''
            }`}
          >
            👨‍⚕️👩‍⚕️ Сотрудники
          </Link>

          <Link 
            to="/mes" 
            className={`hover:text-blue-200 transition flex items-center gap-2 ${
              isActive('/mes') ? 'text-yellow-300 font-semibold' : ''
            }`}
          >
            📚 МЭСы
          </Link>

          <Link 
            to="/history" 
            className={`hover:text-blue-200 transition flex items-center gap-2 ${
              isActive('/history') ? 'text-yellow-300 font-semibold' : ''
            }`}
          >
            📄 Создание новой истории
          </Link>

          {/* Только для админа — тоже с эмодзи */}
          {user?.roles?.includes('admin') && (
            <Link 
              to="/create-user" 
              className={`hover:text-blue-200 transition flex items-center gap-2 ${
                isActive('/create-user') ? 'text-yellow-300 font-semibold' : ''
              }`}
            >
              👤➕ Создать пользователя
            </Link>
          )}
        </div>

        {/* Правая часть — пользователь */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">
              Привет, <strong>{user.username}</strong>
              {user.roles?.includes('admin') && (
                <span className="ml-2 px-2 py-1 bg-yellow-600 rounded text-xs">ADMIN</span>
              )}
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition font-medium flex items-center gap-2"
            >
              🚪 Выйти
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition font-medium flex items-center gap-2"
          >
            🔑 Войти
          </Link>
        )}
      </div>
    </nav>
  );
}

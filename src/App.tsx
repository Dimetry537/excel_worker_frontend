import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Staff from "./pages/Staff";
import History from "./pages/History";
import Mes from "./pages/Mes";
import Login from "./pages/Login";
// import CreateUser from "./pages/CreateUser"; // ← Если будет страница создания пользователя
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "@/hooks/useAuth";
import "./App.css";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl">Загрузка приложения...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Публичный маршрут — логин */}
        <Route path="/login" element={<Login />} />

        {/* Защищённые маршруты — только для авторизованных */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <PrivateRoute>
              <Staff />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />
        <Route
          path="/mes"
          element={
            <PrivateRoute>
              <Mes />
            </PrivateRoute>
          }
        />

        {/* Только админ — создание пользователя */}
        {/* <Route
          path="/create-user"
          element={
            <PrivateRoute adminOnly>
              <CreateUser />
            </PrivateRoute>
          }
        /> */}

        {/* Редирект на главную или логин */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

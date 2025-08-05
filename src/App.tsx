import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Staff from "./pages/Staff";
import History from "./pages/History";
import Navbar from "./components/Navbar";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}
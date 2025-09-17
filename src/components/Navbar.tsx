import { Link } from "react-router-dom";
import "./../App.css"

export default function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/">🏠 Главная</Link>
            <Link to="/staff">👨‍⚕️👩‍⚕️ Сотрудники</Link>
            <Link to="/mes">📚 МЭСы</Link>
            <Link to="/history">📄 История</Link>
        </nav>
    );
}

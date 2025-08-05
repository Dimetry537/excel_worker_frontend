import "../App.css";

export default function Home() {
    return (
        <div className="container">
            <h1>Добро пожаловать в систему Excel Worker</h1>
            <p>Выберите раздел из меню выше:</p>
            <ul>
                <li>Управление врачами, медсёстрами и тарифами (ЦАХ)</li>
                <li>Сохранение медицинской истории пациента</li>
            </ul>
        </div>
    );
}

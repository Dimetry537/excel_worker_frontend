import "../App.css"
import MedicalHistoryForm from "../components/MedicalHistoryForm";

export default function History() {
    return (
        <div className="container">
            <h1>Медицинская история</h1>
            <p>Здесь можно сохранить историю пациента</p>
            <MedicalHistoryForm />
        </div>
    );
}

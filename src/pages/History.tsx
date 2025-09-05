import "../App.css"
import MedicalHistoryForm from "../components/MedicalHistoryForm";

export default function History() {
    return (
        <div className="container">
            <h1 className="text-3xl font-bold mb-8 text-center">Медицинская история</h1>
            <p className="text-3xl font-bold mb-8 text-center">Здесь можно сохранить историю пациента</p>
            <MedicalHistoryForm />
        </div>
    );
}

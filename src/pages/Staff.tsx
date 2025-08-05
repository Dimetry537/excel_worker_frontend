import "../App.css";
import DoctorForm from "../components/DoctorForm";

export default function Staff() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Сотрудники</h1>
            <DoctorForm />
        </div>
    );
}
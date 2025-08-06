import "../App.css";
import CaxCodeForm from "../components/CaxCodesForm";
import DoctorForm from "../components/DoctorForm";
import NurseForm from "../components/NurseForm";

export default function Staff() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Сотрудники</h1>
            <DoctorForm />
            <NurseForm />
            <CaxCodeForm />
        </div>
    );
}

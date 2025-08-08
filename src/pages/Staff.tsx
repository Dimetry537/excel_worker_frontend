import "../App.css";
import CaxCodeForm from "../components/CaxCodesForm";
import DoctorForm from "../components/DoctorForm";
import NurseForm from "../components/NurseForm";

export default function Staff() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Сотрудники</h1>
      <div className="flex flex-col md:flex-row gap-10 justify-center">
        <div className="w-full md:w-1/3">
          <DoctorForm />
        </div>
        <div className="w-full md:w-1/3">
          <NurseForm />
        </div>
        <div className="w-full md:w-1/3">
          <CaxCodeForm />
        </div>
      </div>
    </div>
  );
}

import "../App.css";
import DoctorForm from "../components/DoctorForm";
import NurseForm from "../components/NurseForm";

export default function Staff() {
  return (
    <div>
      <h1>Сотрудники</h1>
      <div>
        <div>
          <DoctorForm />
        </div>
        <div>
          <NurseForm />
        </div>
      </div>
    </div>
  );
}

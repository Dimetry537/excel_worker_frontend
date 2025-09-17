import "../App.css";
import CaxCodeForm from "../components/CaxCodesForm";

export default function Staff() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Сотрудники</h1>
      <div className="flex justify-start gap-10">
        <div className="w-auto">
          <CaxCodeForm />
        </div>
      </div>
    </div>
  );
}

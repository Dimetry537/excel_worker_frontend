import MedicalHistoryForm from "../components/MedicalHistoryForm";

export default function History() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-4">Медицинская история</h1>
      <p className="text-xl text-center text-gray-600 mb-10">
        Создание новой истории болезни пациента
      </p>
      <MedicalHistoryForm onSuccess={() => alert("История успешно создана!")} />
    </div>
  );
}

import MedicalHistoryForm from "@/components/MedicalHistoryForm";

export default function CreateHistory() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-4">Медицинская история</h1>
      <MedicalHistoryForm onSuccess={() => alert("История успешно создана!")} />
    </div>
  );
}

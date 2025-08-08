import { useState, useEffect } from "react";
import {
  createMedicalHistory,
  getCaxCodes,
  getDoctors,
  getNurses,
} from "../api/medicalHistory";
import type { MedicalHistoryCreate } from "../api/medicalHistory";

export default function MedicalHistoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState<MedicalHistoryCreate>({
    admission_date: "",
    discharge_date: "",
    full_name: "",
    birth_date: "",
    address: "",
    diagnosis: "",
    icd10_code: "",
    cax_code_id: 0,
    doctor_id: 0,
    nurse_id: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [caxCodes, setCaxCodes] = useState<{ id: number; cax_name: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: number; full_name: string }[]>([]);
  const [nurses, setNurses] = useState<{ id: number; full_name: string }[]>([]);

  useEffect(() => {
    getCaxCodes().then(setCaxCodes);
    getDoctors().then(setDoctors);
    getNurses().then(setNurses);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createMedicalHistory({
        ...form,
        cax_code_id: Number(form.cax_code_id),
        doctor_id: Number(form.doctor_id),
        nurse_id: Number(form.nurse_id),
      });
      setForm({
        admission_date: "",
        discharge_date: "",
        full_name: "",
        birth_date: "",
        address: "",
        diagnosis: "",
        icd10_code: "",
        cax_code_id: 0,
        doctor_id: 0,
        nurse_id: 0,
      });
      if (onSuccess) onSuccess();
      alert("История успешно сохранена");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50">
      <form className="w-full max-w-md bg-white p-6 rounded-xl shadow" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4 text-blue-800">Добавить историю болезни</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-3">
        <label className="block mb-1">ФИО пациента</label>
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Дата рождения</label>
        <input
          type="date"
          name="birth_date"
          value={form.birth_date}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Адрес</label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Диагноз</label>
        <input
          name="diagnosis"
          value={form.diagnosis}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Код МКБ-10</label>
        <input
          name="icd10_code"
          value={form.icd10_code}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Дата поступления</label>
        <input
          type="date"
          name="admission_date"
          value={form.admission_date}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Дата выписки</label>
        <input
          type="date"
          name="discharge_date"
          value={form.discharge_date || ""}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-3">
        <label className="block mb-1">Код ЦАХ</label>
        <select
          name="cax_code_id"
          value={form.cax_code_id}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value={0}>Выберите код</option>
          {caxCodes.map(cax => (
            <option key={cax.id} value={cax.id}>
              {cax.cax_name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Врач</label>
        <select
          name="doctor_id"
          value={form.doctor_id}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value={0}>Выберите врача</option>
          {doctors.map(doc => (
            <option key={doc.id} value={doc.id}>
              {doc.full_name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Медсестра</label>
        <select
          name="nurse_id"
          value={form.nurse_id}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value={0}>Выберите медсестру</option>
          {nurses.map(nurse => (
            <option key={nurse.id} value={nurse.id}>
              {nurse.full_name}
            </option>
          ))}
        </select>
      </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}

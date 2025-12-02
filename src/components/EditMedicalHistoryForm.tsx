import { useState } from "react";
import { updateMedicalHistory } from "@/api/medicalHistory";
import { getCaxCodes } from "@/api/caxCodes";
import { getDoctors } from "@/api/doctors";
import { getNurses } from "@/api/nurses";
import type { MedicalHistoryRead } from "@/types/entities/medicalHistory";
import type { CaxCode } from "@/types/entities/caxCode";
import type { Personal } from "@/types/entities/personal";
import { toast } from "sonner";

interface Props {
  history: MedicalHistoryRead;
  onSuccess: () => void;
  onClose: () => void;
}

export default function EditMedicalHistoryForm({ history, onSuccess, onClose }: Props) {
  const [caxCodes, setCaxCodes] = useState<CaxCode[]>([]);
  const [doctors, setDoctors] = useState<Personal[]>([]);
  const [nurses, setNurses] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    diagnosis: history.diagnosis,
    icd10_code: history.icd10_code,
    cax_code_id: history.cax_code?.id || 0,
    doctor_id: history.doctor?.id || 0,
    nurse_id: history.nurse?.id || 0,
    discharge_date: history.discharge_date || "",
  });

  // Загружаем справочники один раз
  useState(() => {
    Promise.all([getCaxCodes(), getDoctors(), getNurses()])
      .then(([cax, docs, nurs]) => {
        setCaxCodes(cax);
        setDoctors(docs);
        setNurses(nurs);
      })
      .catch(() => toast.error("Ошибка загрузки справочников"));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateMedicalHistory(history.id, {
        diagnosis: form.diagnosis,
        icd10_code: form.icd10_code,
        cax_code_id: form.cax_code_id,
        doctor_id: form.doctor_id,
        nurse_id: form.nurse_id,
        discharge_date: form.discharge_date || null,
      });
      toast.success("История обновлена");
      onSuccess();
      onClose();
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6">Редактировать историю № {history.history_number}</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium">Диагноз *</label>
            <input
              type="text"
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">МКБ-10 *</label>
            <input
              type="text"
              value={form.icd10_code}
              onChange={(e) => setForm({ ...form, icd10_code: e.target.value })}
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium">ЦАХ-код</label>
              <select
                value={form.cax_code_id}
                onChange={(e) => setForm({ ...form, cax_code_id: Number(e.target.value) })}
                className="w-full border rounded px-4 py-2"
              >
                <option value={0}>—</option>
                {caxCodes.map(c => (
                  <option key={c.id} value={c.id}>{c.cax_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium">Врач</label>
              <select
                value={form.doctor_id}
                onChange={(e) => setForm({ ...form, doctor_id: Number(e.target.value) })}
                className="w-full border rounded px-4 py-2"
              >
                <option value={0}>—</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium">Медсестра</label>
              <select
                value={form.nurse_id}
                onChange={(e) => setForm({ ...form, nurse_id: Number(e.target.value) })}
                className="w-full border rounded px-4 py-2"
              >
                <option value={0}>—</option>
                {nurses.map(n => (
                  <option key={n.id} value={n.id}>{n.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium">Дата выписки</label>
            <input
              type="date"
              value={form.discharge_date}
              onChange={(e) => setForm({ ...form, discharge_date: e.target.value })}
              className="w-full border rounded px-4 py-2"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium disabled:opacity-50"
            >
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded font-medium"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
